import React, { useState, useEffect } from 'react';
import {
  INITIAL_CONTACTS,
  INITIAL_SAFE_ZONES,
  executeGuardianPrompt,
  EmergencyContact,
  SafeZone,
  ToolExecutionRecord,
} from './utils/guardianCore.ts';
import { ActiveTab, ChatMessage } from './types.ts';
import { Header } from './components/Header.tsx';
import { GuardianConsole } from './components/GuardianConsole.tsx';
import { ContactMatrix } from './components/ContactMatrix.tsx';
import { SafeZonesRadar } from './components/SafeZonesRadar.tsx';
import { SafetyWalkTimer } from './components/SafetyWalkTimer.tsx';
import { ToolAuditView } from './components/ToolAuditView.tsx';
import { PanicModal } from './components/PanicModal.tsx';

const DEFAULT_TEST_PROMPT =
  'I want to test PocketGuardian AI. Retrieve my emergency contacts in priority order, using the get_emergency_contacts tool with limit 3. Show me the returned contacts and explain which contact should be approached first. Do not invent contacts if the tool returns no data.';

export default function App() {
  const [contacts, setContacts] = useState<EmergencyContact[]>(INITIAL_CONTACTS);
  const [safeZones] = useState<SafeZone[]>(INITIAL_SAFE_ZONES);
  const [activeTab, setActiveTab] = useState<ActiveTab>('console');
  const [isPanicOpen, setIsPanicOpen] = useState(false);
  const [panicArmed, setPanicArmed] = useState(false);

  // Safety Walk Timer State
  const [timerActive, setTimerActive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(900); // 15 mins default

  // Pre-seed conversation with the user's exact test prompt and model response
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const initialResponse = executeGuardianPrompt(DEFAULT_TEST_PROMPT, INITIAL_CONTACTS, INITIAL_SAFE_ZONES);
    return [
      {
        id: 'msg-init-user',
        sender: 'user',
        timestamp: new Date().toISOString(),
        text: DEFAULT_TEST_PROMPT,
      },
      {
        id: 'msg-init-guardian',
        sender: 'guardian',
        timestamp: new Date().toISOString(),
        response: initialResponse,
      },
    ];
  });

  // Tool execution audit log
  const [auditRecords, setAuditRecords] = useState<ToolExecutionRecord[]>(() => {
    const initialResp = executeGuardianPrompt(DEFAULT_TEST_PROMPT, INITIAL_CONTACTS, INITIAL_SAFE_ZONES);
    return [initialResp.toolExecution.toolRecord];
  });

  // Track timer countdown
  useEffect(() => {
    let interval: any;
    if (timerActive && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerActive && remainingSeconds === 0) {
      setTimerActive(false);
      // Auto-escalate to primary contact
      const triggerResp = executeGuardianPrompt('Emergency: Safety walk timer expired without user check-in!', contacts, safeZones);
      setMessages((prev) => [
        ...prev,
        {
          id: 'timer-alert-' + Date.now(),
          sender: 'guardian',
          timestamp: new Date().toISOString(),
          response: triggerResp,
        },
      ]);
      setAuditRecords((prev) => [triggerResp.toolExecution.toolRecord, ...prev]);
      setActiveTab('console');
    }
    return () => clearInterval(interval);
  }, [timerActive, remainingSeconds, contacts, safeZones]);

  // Handle new prompt execution logging into audit records
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.sender === 'guardian' && lastMsg.response) {
      const record = lastMsg.response.toolExecution.toolRecord;
      setAuditRecords((prev) => {
        // Prevent duplicate appending by timestamp + toolName
        if (prev.some((r) => r.timestamp === record.timestamp && r.toolName === record.toolName)) {
          return prev;
        }
        return [record, ...prev];
      });
    }
  }, [messages]);

  const handleStartTimer = (durationMinutes: number, _destination: string) => {
    setRemainingSeconds(durationMinutes * 60);
    setTimerActive(true);
  };

  const handleStopTimer = () => {
    setTimerActive(false);
  };

  const handleTriggerEscalationNow = () => {
    setIsPanicOpen(true);
  };

  const handleConfirmAlert = () => {
    setPanicArmed(true);
    const panicResp = executeGuardianPrompt('trigger_panic_alert for acute safety threat', contacts, safeZones);
    setMessages((prev) => [
      ...prev,
      {
        id: 'msg-panic-' + Date.now(),
        sender: 'user',
        timestamp: new Date().toISOString(),
        text: 'EMERGENCY PANIC SOS BUTTON ACTIVATED',
      },
      {
        id: 'msg-panic-resp-' + Date.now(),
        sender: 'guardian',
        timestamp: new Date().toISOString(),
        response: panicResp,
      },
    ]);
    setAuditRecords((prev) => [panicResp.toolExecution.toolRecord, ...prev]);
  };

  const handleOpenAuditRecord = (record: ToolExecutionRecord) => {
    setAuditRecords((prev) => [record, ...prev]);
    setActiveTab('audit');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* App Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPanic={() => setIsPanicOpen(true)}
        contactsCount={contacts.length}
        panicArmed={panicArmed}
        timerActive={timerActive}
        remainingSeconds={remainingSeconds}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
        {activeTab === 'console' && (
          <GuardianConsole
            contacts={contacts}
            safeZones={safeZones}
            messages={messages}
            setMessages={setMessages}
            onOpenAudit={handleOpenAuditRecord}
            onNavigateToContacts={() => setActiveTab('contacts')}
          />
        )}

        {activeTab === 'contacts' && (
          <ContactMatrix
            contacts={contacts}
            setContacts={setContacts}
            onRunTestWithContacts={() => {
              setActiveTab('console');
            }}
          />
        )}

        {activeTab === 'radar' && (
          <SafeZonesRadar
            safeZones={safeZones}
            onTestSafeZoneQuery={() => {
              const query = 'Locate nearest safe havens with get_safe_zones';
              const response = executeGuardianPrompt(query, contacts, safeZones);
              setMessages((prev) => [
                ...prev,
                {
                  id: 'msg-u-' + Date.now(),
                  sender: 'user',
                  timestamp: new Date().toISOString(),
                  text: query,
                },
                {
                  id: 'msg-g-' + Date.now(),
                  sender: 'guardian',
                  timestamp: new Date().toISOString(),
                  response,
                },
              ]);
              setActiveTab('console');
            }}
          />
        )}

        {activeTab === 'timer' && (
          <SafetyWalkTimer
            contacts={contacts}
            timerActive={timerActive}
            remainingSeconds={remainingSeconds}
            onStartTimer={handleStartTimer}
            onStopTimer={handleStopTimer}
            onTriggerEscalationNow={handleTriggerEscalationNow}
          />
        )}

        {activeTab === 'audit' && (
          <ToolAuditView
            records={auditRecords}
            onTriggerTestTool={() => {
              const resp = executeGuardianPrompt('Retrieve emergency contacts with limit 3', contacts, safeZones);
              setAuditRecords((prev) => [resp.toolExecution.toolRecord, ...prev]);
            }}
          />
        )}
      </main>

      {/* Emergency Distress Modal */}
      <PanicModal
        isOpen={isPanicOpen}
        onClose={() => setIsPanicOpen(false)}
        contacts={contacts}
        onConfirmAlert={handleConfirmAlert}
      />
    </div>
  );
}
