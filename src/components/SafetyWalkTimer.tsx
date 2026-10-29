import React, { useState } from 'react';
import { Clock, ShieldAlert, CheckCircle2, Play, Square, MapPin, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';
import { EmergencyContact } from '../types.ts';

interface SafetyWalkTimerProps {
  contacts: EmergencyContact[];
  timerActive: boolean;
  remainingSeconds: number;
  onStartTimer: (durationMinutes: number, destination: string) => void;
  onStopTimer: () => void;
  onTriggerEscalationNow: () => void;
}

export const SafetyWalkTimer: React.FC<SafetyWalkTimerProps> = ({
  contacts,
  timerActive,
  remainingSeconds,
  onStartTimer,
  onStopTimer,
  onTriggerEscalationNow,
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState(15);
  const [destination, setDestination] = useState('Home / Dormitory');

  const primaryContact = contacts[0] || null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Overview Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          Autonomous Safety Check-In & Escort Timer
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Set an anticipated travel duration. If you do not verify your safe arrival before expiry, PocketGuardian automatically broadcasts distress signals to your primary contact.
        </p>
      </div>

      {/* Timer Display */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
        <div className="relative">
          <div
            className={`w-48 h-48 rounded-full border-4 flex flex-col items-center justify-center ${
              timerActive
                ? remainingSeconds < 60
                  ? 'border-rose-500 bg-rose-950/20 animate-pulse'
                  : 'border-cyan-500 bg-cyan-950/20'
                : 'border-slate-800 bg-slate-900/40'
            }`}
          >
            <span className="text-4xl font-mono font-bold text-white tracking-wider">
              {timerActive ? formatTime(remainingSeconds) : `${selectedMinutes}:00`}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mt-1">
              {timerActive ? 'Escrow Countdown' : 'Standby Duration'}
            </span>
          </div>

          {timerActive && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 animate-ping" />
          )}
        </div>

        {/* Primary Contact Notice */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center space-x-2.5 max-w-md">
          <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            {primaryContact ? (
              <span>
                Escalation Target: <strong>{primaryContact.name}</strong> ({primaryContact.phone}) will be alerted automatically if timer expires.
              </span>
            ) : (
              <span className="text-rose-400">
                Warning: No primary contact configured! Configure one in the contacts tab.
              </span>
            )}
          </div>
        </div>

        {/* Destination & Quick Presets */}
        {!timerActive ? (
          <div className="w-full max-w-md space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1 text-left">
                Intended Destination
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Home, Library, Subway Station"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1 text-left">
                Select Safety Duration
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 30].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setSelectedMinutes(mins)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedMinutes === mins
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onStartTimer(selectedMinutes, destination)}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-lg shadow-emerald-950/40"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Arm Safety Walk Timer</span>
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-2 pt-2">
            <button
              type="button"
              onClick={onStopTimer}
              className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-lg shadow-cyan-950/40"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I Arrived Safely (Cancel Timer)</span>
            </button>

            <button
              type="button"
              onClick={onTriggerEscalationNow}
              className="w-full py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/60 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Escalate Immediately to {primaryContact?.name || 'Emergency Services'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
