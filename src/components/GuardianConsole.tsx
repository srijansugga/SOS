import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Shield,
  HelpCircle,
  RotateCcw,
  Sliders,
  CheckCircle,
  Database,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { ChatMessage, EmergencyContact, SafeZone } from '../types.ts';
import { ReportCard } from './ReportCard.tsx';
import { executeGuardianPrompt } from '../utils/guardianCore.ts';

interface GuardianConsoleProps {
  contacts: EmergencyContact[];
  safeZones: SafeZone[];
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onOpenAudit: (record: any) => void;
  onNavigateToContacts: () => void;
}

export const GuardianConsole: React.FC<GuardianConsoleProps> = ({
  contacts,
  safeZones,
  messages,
  setMessages,
  onOpenAudit,
  onNavigateToContacts,
}) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const exactTestPrompt =
    'I want to test PocketGuardian AI. Retrieve my emergency contacts in priority order, using the get_emergency_contacts tool with limit 3. Show me the returned contacts and explain which contact should be approached first. Do not invent contacts if the tool returns no data.';

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: 'msg-u-' + Date.now(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    // Simulate real-time Guardian evaluation & tool dispatch
    setTimeout(() => {
      const response = executeGuardianPrompt(query, contacts, safeZones);
      const botMsg: ChatMessage = {
        id: 'msg-g-' + Date.now(),
        sender: 'guardian',
        timestamp: new Date().toISOString(),
        response,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsProcessing(false);
    }, 450);
  };

  const handleResetConversation = () => {
    const initialResp = executeGuardianPrompt(exactTestPrompt, contacts, safeZones);
    setMessages([
      {
        id: 'init-u1',
        sender: 'user',
        timestamp: new Date().toISOString(),
        text: exactTestPrompt,
      },
      {
        id: 'init-g1',
        sender: 'guardian',
        timestamp: new Date().toISOString(),
        response: initialResp,
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto space-y-4">
      {/* Database Context Ribbon */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">Escalation DB Status:</span>
          {contacts.length > 0 ? (
            <span className="font-semibold text-emerald-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {contacts.length} Contact{contacts.length > 1 ? 's' : ''} Configured (Primary: {contacts[0].name})
            </span>
          ) : (
            <span className="font-semibold text-rose-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              0 Contacts (Zero-Fabrication Mode Active)
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onNavigateToContacts}
            className="text-cyan-400 hover:text-cyan-300 underline font-medium cursor-pointer"
          >
            Manage Escalation List &rarr;
          </button>
          <button
            type="button"
            onClick={handleResetConversation}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            title="Reset test session to default prompt"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Test</span>
          </button>
        </div>
      </div>

      {/* Preset Test Scenarios */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Quick Safety Test Scenarios</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleSend(exactTestPrompt)}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 text-cyan-200 border border-cyan-700/60 text-xs font-medium flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Test: Retrieve Emergency Contacts (limit 3)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSend('Retrieve my emergency contacts in priority order with limit 1')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <span>Top 1 Primary Contact Only</span>
          </button>

          <button
            type="button"
            onClick={() => handleSend('Locate nearest safe havens with get_safe_zones')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <span>Scan 24/7 Safe Zones</span>
          </button>

          <button
            type="button"
            onClick={() => handleSend('Someone is following me down a dark street, what should I do?')}
            className="px-3 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 text-amber-200 border border-amber-800/60 text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Test High Threat Escalation</span>
          </button>
        </div>
      </div>

      {/* Message Feed */}
      <div className="space-y-4 min-h-[380px]">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-2">
            {msg.sender === 'user' ? (
              <div className="flex items-start space-x-3 justify-end">
                <div className="max-w-2xl bg-cyan-950/70 border border-cyan-800/70 text-slate-100 rounded-2xl rounded-tr-sm p-4 text-sm leading-relaxed shadow-md">
                  <div className="flex items-center space-x-1.5 text-cyan-400 text-xs font-semibold uppercase mb-1">
                    <User className="w-3.5 h-3.5" />
                    <span>User Verification Query</span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="w-full">
                  {msg.response ? (
                    <ReportCard
                      response={msg.response}
                      onOpenAudit={onOpenAudit}
                    />
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200">
                      {msg.text}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center space-x-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-mono text-cyan-400">
                Executing tool: get_emergency_contacts(limit=3)...
              </div>
              <div className="text-xs text-slate-400">
                Evaluating urgency levels, verifying priority order & formulating 5-point safety protocol...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="sticky bottom-4 z-20 pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative bg-slate-950/95 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl p-2 flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a test command (e.g. get_emergency_contacts limit 3 or threat simulation)..."
            aria-label="Ask Guardian AI or run tool test"
            className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            aria-label="Send query to Guardian AI"
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white font-medium text-xs sm:text-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <span>Execute</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <p className="text-[11px] text-center text-slate-500 mt-1.5">
          PocketGuardian AI operates with strict contact precedence and zero-fabrication protocol.
        </p>
      </div>
    </div>
  );
};
