import React, { useState } from 'react';
import { Compass, Shield, Building2, Cross, Bus, MapPin, Navigation, Phone, ExternalLink, ShieldCheck } from 'lucide-react';
import { SafeZone } from '../types.ts';

interface SafeZonesRadarProps {
  safeZones: SafeZone[];
  onTestSafeZoneQuery: () => void;
}

export const SafeZonesRadar: React.FC<SafeZonesRadarProps> = ({
  safeZones,
  onTestSafeZoneQuery,
}) => {
  const [selectedZone, setSelectedZone] = useState<SafeZone>(safeZones[0]);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  const getZoneIcon = (type: SafeZone['type']) => {
    switch (type) {
      case 'police':
        return Shield;
      case 'hospital':
        return Cross;
      case 'transit':
        return Bus;
      case 'campus':
      default:
        return Building2;
    }
  };

  const handleStartNav = (zone: SafeZone) => {
    setNavigatingTo(zone.name);
    setTimeout(() => {
      setNavigatingTo(null);
    }, 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {navigatingTo && (
        <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <Navigation className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>Simulating turn-by-turn safe navigation to <strong>{navigatingTo}</strong></span>
          </div>
          <span className="text-[10px] font-bold text-cyan-400">WAYPOINT ACTIVE</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            24/7 Safe Havens & Proximity Radar
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Vetted safe havens with active physical security, CCTV, and immediate sanctuary access.
          </p>
        </div>

        <button
          type="button"
          onClick={onTestSafeZoneQuery}
          className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <Compass className="w-4 h-4" />
          <span>Ask Guardian for Nearest Safe Zone</span>
        </button>
      </div>

      {/* Radar Map & Cards layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Radar Visualizer Mock */}
        <div className="md:col-span-1 p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[260px]">
          {/* Radar concentric circles */}
          <div className="w-44 h-44 rounded-full border border-cyan-800/40 relative flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border border-cyan-700/30 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border border-cyan-600/30 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/80 animate-ping" />
              </div>
            </div>
            {/* Blips */}
            <div className="absolute top-6 left-12 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Police (0.4 mi)" />
            <div className="absolute bottom-10 right-8 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" title="Hospital (0.8 mi)" />
            <div className="absolute top-16 right-6 w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" title="Transit (1.1 mi)" />
          </div>

          <div className="mt-4">
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">
              Radar Sweep: Active
            </span>
            <span className="text-xs text-slate-400">
              4 Safe Havens within 2.0 mi radius
            </span>
          </div>
        </div>

        {/* List of Safe Havens */}
        <div className="md:col-span-2 space-y-3">
          {safeZones.map((zone) => {
            const ZoneIcon = getZoneIcon(zone.type);
            const isSelected = selectedZone.id === zone.id;

            return (
              <div
                key={zone.id}
                onClick={() => setSelectedZone(zone)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/80 shadow-lg shadow-cyan-950/20'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                      <ZoneIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-white">{zone.name}</h3>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                          {zone.distanceMiles} mi
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {zone.address}
                      </p>
                      <div className="flex items-center space-x-2 mt-2 text-[11px]">
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          24/7 Staffed Security
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {zone.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartNav(zone);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center space-x-1 shrink-0 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Navigate</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
