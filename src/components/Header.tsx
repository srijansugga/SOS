import React from 'react';
import { Shield, ShieldAlert, Wifi, BatteryCharging, MapPin, Radio, BellRing, Compass, Users, Clock, Terminal } from 'lucide-react';
import { ActiveTab } from '../types.ts';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenPanic: () => void;
  contactsCount: number;
  panicArmed: boolean;
  timerActive: boolean;
  remainingSeconds: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenPanic,
  contactsCount,
  panicArmed,
  timerActive,
  remainingSeconds,
}) => {
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Telemetry Strip */}
      <div className="hidden sm:flex items-center justify-between px-4 sm:px-6 py-1.5 text-xs text-slate-400 bg-slate-900/60 border-b border-slate-800/80">
        <div className="flex items-center space-x-4">
          <span className="flex items-center text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
            PROTECTION ARMED (256-BIT SECURE)
          </span>
          <span className="flex items-center text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 mr-1" />
            GPS: 37.7749° N, 122.4194° W (Accurate ±3m)
          </span>
          <span className="flex items-center text-slate-400">
            <Radio className="w-3.5 h-3.5 text-purple-400 mr-1" />
            Escalation Relay: Active
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center text-slate-400">
            <Wifi className="w-3.5 h-3.5 text-blue-400 mr-1" />
            5G Ultra
          </span>
          <span className="flex items-center text-slate-400">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 mr-1" />
            94%
          </span>
          {timerActive && (
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[11px] border border-amber-500/30 animate-pulse">
              ⏱ Walk Timer: {formatTimer(remainingSeconds)}
            </span>
          )}
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-950/50 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                PocketGuardian <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">AI</span>
              </h1>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 hidden xs:inline-flex">
                v2.6 Core
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Intelligent Personal Safety, Contact Priority Escalation & Autonomous Guardian
            </p>
          </div>
        </div>

        {/* SOS Panic Trigger Button */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onOpenPanic}
            aria-label="Activate Emergency SOS Panic Mode"
            className="group relative flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-rose-950/60 border border-rose-500/50 transition-all cursor-pointer shrink-0"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping absolute -top-1 -right-1" />
            <ShieldAlert className="w-4 h-4 text-white group-hover:rotate-12 transition-transform shrink-0" />
            <span className="hidden sm:inline">EMERGENCY SOS</span>
            <span className="sm:hidden font-bold">SOS</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav aria-label="Main Navigation" className="flex items-center px-4 sm:px-6 space-x-1 sm:space-x-2 border-t border-slate-800/80 overflow-x-auto scrollbar-none py-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('console')}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center space-x-1.5 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'console'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <BellRing className="w-3.5 h-3.5" />
          <span>Guardian AI Console</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contacts')}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center space-x-1.5 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'contacts'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Emergency Contacts ({contactsCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('radar')}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center space-x-1.5 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'radar'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Safe Zones Radar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('timer')}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center space-x-1.5 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'timer'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Safety Walk Timer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center space-x-1.5 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Tool Execution Audit</span>
        </button>
      </nav>
    </header>
  );
};
