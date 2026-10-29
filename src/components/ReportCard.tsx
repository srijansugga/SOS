import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  UserCheck,
  AlertOctagon,
  ArrowRight,
  Terminal,
} from 'lucide-react';
import { GuardianResponse, UrgencyLevel } from '../types.ts';

interface ReportCardProps {
  response: GuardianResponse;
  onSelectContact?: (name: string) => void;
  onOpenAudit?: (toolRecord: any) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  response,
  onSelectContact,
  onOpenAudit,
}) => {
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const getUrgencyBadge = (level: UrgencyLevel) => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
          dot: 'bg-rose-500 animate-ping',
          icon: AlertOctagon,
          title: 'CRITICAL THREAT / DISPATCH',
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
          dot: 'bg-amber-400 animate-pulse',
          icon: ShieldAlert,
          title: 'HIGH ELEVATION / STANDBY',
        };
      case 'MODERATE':
        return {
          bg: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
          dot: 'bg-yellow-400',
          icon: AlertTriangle,
          title: 'MODERATE CAUTION / MONITOR',
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
          dot: 'bg-emerald-400',
          icon: CheckCircle2,
          title: 'LOW URGENCY / SYSTEM TEST',
        };
    }
  };

  const urgencyStyle = getUrgencyBadge(response.assessedUrgency.level);
  const UrgencyIcon = urgencyStyle.icon;

  const handleCopyReport = () => {
    const textToCopy = `### 1. Assessed Urgency
**${response.assessedUrgency.level}** — ${response.assessedUrgency.rationale}

---

### 2. Recommended Immediate Action
${response.recommendedImmediateAction}

---

### 3. Selected Contact & Reason for Selection
* **Primary Contact:** ${response.selectedContact.primaryContact || 'None Configured'}
* **Reason:** ${response.selectedContact.reason}

---

### 4. Tool Actions & Actual Results
* **Action:** \`${response.toolExecution.actionInvocation}\`
* **Result:** ${response.toolExecution.resultSummary}

---

### 5. Remaining Actions You Must Perform
${response.remainingActions.map((a) => `* ${a}`).join('\n')}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article aria-label="Guardian Safety Protocol Assessment" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl shadow-black/40 text-slate-200 space-y-5">
      {/* Header with Title and Copy */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            PocketGuardian Protocol Assessment
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">
            {new Date(response.timestamp).toLocaleTimeString()}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleCopyReport}
            aria-label="Copy markdown protocol report"
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Report'}</span>
          </button>
        </div>
      </div>

      {/* 1. Assessed Urgency */}
      <section aria-labelledby="section-urgency" className="space-y-1.5">
        <h3 id="section-urgency" className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[11px] text-cyan-400 font-bold">1</span>
          Assessed Urgency
        </h3>
        <div className={`p-3 rounded-xl border flex items-start space-x-3 ${urgencyStyle.bg}`}>
          <div className="mt-0.5 relative">
            <UrgencyIcon className="w-5 h-5 shrink-0" />
            <span className={`w-2 h-2 rounded-full absolute -top-1 -right-1 ${urgencyStyle.dot}`} />
          </div>
          <div>
            <div className="font-bold text-sm tracking-wide">
              {response.assessedUrgency.level} — <span className="font-normal">{response.assessedUrgency.rationale}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Recommended Immediate Action */}
      <section aria-labelledby="section-action" className="space-y-1.5">
        <h3 id="section-action" className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[11px] text-cyan-400 font-bold">2</span>
          Recommended Immediate Action
        </h3>
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm leading-relaxed text-slate-100 flex items-start space-x-2.5">
          <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
          <span>{response.recommendedImmediateAction}</span>
        </div>
      </section>

      {/* 3. Selected Contact & Reason for Selection */}
      <section aria-labelledby="section-contact" className="space-y-2">
        <h3 id="section-contact" className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[11px] text-cyan-400 font-bold">3</span>
          Selected Contact & Reason for Selection
        </h3>
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block">Primary Escalation Target</span>
                <span className="text-sm font-bold text-white">
                  {response.selectedContact.primaryContact ? (
                    <span className="text-cyan-300 font-semibold text-base">{response.selectedContact.primaryContact}</span>
                  ) : (
                    <span className="text-rose-400 italic">None Configured (0 Contacts in Database)</span>
                  )}
                </span>
              </div>
            </div>

            {response.selectedContact.primaryContact && (
              <div className="flex items-center space-x-2">
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Priority 1: Verified
                </span>
              </div>
            )}
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Reason for Selection:
            </span>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {response.selectedContact.reason}
            </p>
          </div>

          {response.selectedContact.escalationChain.length > 0 && (
            <div className="pt-2 text-xs text-slate-400 flex items-center space-x-1 flex-wrap gap-1">
              <span className="font-semibold text-slate-500 uppercase tracking-wide">Escalation Priority Order:</span>
              {response.selectedContact.escalationChain.map((item, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Tool Actions & Actual Results */}
      <section aria-labelledby="section-tools" className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 id="section-tools" className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[11px] text-cyan-400 font-bold">4</span>
            Tool Actions & Actual Results
          </h3>
          <button
            type="button"
            onClick={() => setShowRawJson(!showRawJson)}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
          >
            <Terminal className="w-3 h-3" />
            <span>{showRawJson ? 'Hide JSON Trace' : 'View Raw Execution Trace'}</span>
            {showRawJson ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
          <div className="flex items-center space-x-2 text-cyan-300">
            <span className="text-slate-500 font-bold">$ tool_invoked:</span>
            <code className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
              {response.toolExecution.actionInvocation}
            </code>
          </div>

          <div className="text-slate-300 pl-4 border-l-2 border-cyan-500/40 space-y-1">
            <div className="text-slate-400 font-sans text-xs font-semibold">
              Execution Outcome:
            </div>
            <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200 leading-relaxed">
              {response.toolExecution.resultSummary}
            </pre>
          </div>

          {/* Raw JSON Trace drawer */}
          {showRawJson && (
            <div className="mt-3 pt-3 border-t border-slate-800">
              <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
                <span>Raw Tool Telemetry & Data Payload:</span>
                <span className="text-emerald-400">status: {response.toolExecution.toolRecord.status}</span>
              </div>
              <pre className="p-2.5 rounded bg-slate-900/90 text-emerald-400 text-[11px] overflow-x-auto max-h-48 border border-slate-800">
                {JSON.stringify(response.toolExecution.toolRecord, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </section>

      {/* 5. Remaining Actions You Must Perform */}
      <section aria-labelledby="section-remaining" className="space-y-2">
        <h3 id="section-remaining" className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[11px] text-cyan-400 font-bold">5</span>
          Remaining Actions You Must Perform
        </h3>
        <div className="space-y-1.5">
          {response.remainingActions.map((action, idx) => {
            const isDone = completedSteps[idx];
            return (
              <label
                key={idx}
                className={`p-3 rounded-xl border flex items-start space-x-3 transition-colors cursor-pointer ${
                  isDone
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-400'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!isDone}
                  onChange={() => toggleStep(idx)}
                  className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400 h-4 w-4 bg-slate-900 cursor-pointer"
                />
                <span className={`text-xs sm:text-sm leading-relaxed ${isDone ? 'line-through text-slate-500' : ''}`}>
                  {action}
                </span>
              </label>
            );
          })}
        </div>
      </section>
    </article>
  );
};
