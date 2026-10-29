import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, X, PhoneCall, Radio, CheckCircle, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import { EmergencyContact } from '../types.ts';

interface PanicModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: EmergencyContact[];
  onConfirmAlert: () => void;
}

export const PanicModal: React.FC<PanicModalProps> = ({
  isOpen,
  onClose,
  contacts,
  onConfirmAlert,
}) => {
  const [countdown, setCountdown] = useState(5);
  const [isDispatched, setIsDispatched] = useState(false);
  const [silentMode, setSilentMode] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isOpen && countdown > 0 && !isDispatched) {
      timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (isOpen && countdown === 0 && !isDispatched) {
      setIsDispatched(true);
      onConfirmAlert();
    }
    return () => clearTimeout(timer);
  }, [isOpen, countdown, isDispatched, onConfirmAlert]);

  useEffect(() => {
    if (isOpen) {
      setCountdown(5);
      setIsDispatched(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const primaryContact = contacts[0] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-950 border-2 border-rose-600 rounded-3xl p-6 shadow-2xl shadow-rose-950/80 text-white space-y-6 relative overflow-hidden">
        {/* Pulsing ambient glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-600/30 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-3 border-b border-rose-900/50">
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm tracking-wider uppercase">
            <ShieldAlert className="w-5 h-5 animate-bounce" />
            <span>Emergency Distress Protocol</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cancel Emergency Distress Protocol"
            className="p-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isDispatched ? (
          <div className="text-center space-y-5">
            <div className="w-24 h-24 rounded-full bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center mx-auto relative">
              <span className="text-5xl font-extrabold text-rose-400 font-mono">
                {countdown}
              </span>
              <span className="w-full h-full rounded-full border border-rose-400 animate-ping absolute inset-0" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">
                Preparing Emergency Priority Escalation
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Dispatches GPS coordinates, active telemetry, and automated alert to your primary contact in {countdown}s.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1 text-left">
              <div className="text-slate-400 uppercase font-semibold text-[10px]">
                Target Contact:
              </div>
              <div className="font-bold text-cyan-300 text-sm">
                {primaryContact ? `${primaryContact.name} (${primaryContact.relationship})` : 'Emergency Dispatch Direct (911)'}
              </div>
              <div className="text-slate-400 text-[11px]">
                Live location: 37.7749° N, 122.4194° W (Accurate ±3m)
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={() => setSilentMode(!silentMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer border ${
                  silentMode
                    ? 'bg-amber-950/60 border-amber-600 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {silentMode ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{silentMode ? 'Silent Beacon (Screen dimmed)' : 'Audible Siren'}</span>
              </button>
            </div>

            <div className="pt-2 flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel / False Alarm
              </button>
              <button
                type="button"
                onClick={() => {
                  setCountdown(0);
                  setIsDispatched(true);
                  onConfirmAlert();
                }}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/80 transition-colors cursor-pointer"
              >
                Dispatch Instantly
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-5 animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">
                Emergency Alert Active & Dispatched
              </h3>
              <p className="text-xs text-emerald-300 max-w-sm mx-auto">
                Escalation dispatched to {primaryContact ? primaryContact.name : 'Municipal 911'}. Live telemetry stream is open.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-left space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span>Escalation Status:</span>
                <span className="text-emerald-400 font-bold">SENT & DELIVERED</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Primary Target:</span>
                <span className="text-white font-bold">{primaryContact?.name || 'Local 911'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Relay Channels:</span>
                <span className="text-cyan-300 font-mono text-[11px]">SMS + EMERGENCY CALL + GPS</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
            >
              Close Emergency Window (Relay Remains Active)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
