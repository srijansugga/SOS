import React, { useState } from 'react';
import { Terminal, Copy, Check, Filter, CheckCircle2, AlertTriangle, Shield, Cpu } from 'lucide-react';
import { ToolExecutionRecord } from '../types.ts';

interface ToolAuditViewProps {
  records: ToolExecutionRecord[];
  onTriggerTestTool: () => void;
}

export const ToolAuditView: React.FC<ToolAuditViewProps> = ({
  records,
  onTriggerTestTool,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedToolFilter, setSelectedToolFilter] = useState<string>('all');

  const filteredRecords = selectedToolFilter === 'all'
    ? records
    : records.filter((r) => r.toolName === selectedToolFilter);

  const handleCopy = (id: string, record: ToolExecutionRecord) => {
    navigator.clipboard.writeText(JSON.stringify(record, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            Guardian Tool Execution Audit & Telemetry
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Inspection logs for autonomous tool dispatching (e.g. `get_emergency_contacts`, `trigger_panic_alert`).
          </p>
        </div>

        <button
          type="button"
          onClick={onTriggerTestTool}
          className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <Cpu className="w-4 h-4" />
          <span>Execute get_emergency_contacts(limit=3)</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center space-x-2 text-xs">
        <span className="text-slate-400 flex items-center gap-1 font-semibold">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </span>
        {['all', 'get_emergency_contacts', 'trigger_panic_alert', 'get_safe_zones'].map((tool) => (
          <button
            key={tool}
            type="button"
            onClick={() => setSelectedToolFilter(tool)}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors cursor-pointer ${
              selectedToolFilter === tool
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tool}
          </button>
        ))}
      </div>

      {/* Record list */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 text-xs">
            No execution logs match filter. Trigger a query from the AI Guardian Console!
          </div>
        ) : (
          filteredRecords.map((record, idx) => {
            const key = `${record.timestamp}-${idx}`;
            const isSuccess = record.status === 'success';

            return (
              <div
                key={key}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="font-bold text-white text-sm">{record.toolName}</span>
                    <span className="text-slate-500 text-[11px]">
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isSuccess
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {record.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(key, record)}
                      aria-label="Copy tool execution JSON"
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    >
                      {copiedId === key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">
                      Input Parameters:
                    </span>
                    <pre className="p-2.5 rounded-lg bg-slate-900 text-cyan-300 text-[11px] border border-slate-800">
                      {JSON.stringify(record.parameters, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">
                      Raw Output Payloads:
                    </span>
                    <pre className="p-2.5 rounded-lg bg-slate-900 text-emerald-300 text-[11px] border border-slate-800 max-h-48 overflow-y-auto">
                      {JSON.stringify(record.rawOutput, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
