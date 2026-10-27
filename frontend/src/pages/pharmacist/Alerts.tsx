import React, { useState, useEffect } from 'react';
import { pharmacyStore, SystemAlert } from '../../services/pharmacyStore';
import { Bell, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);

  useEffect(() => {
    setAlerts(pharmacyStore.getAlerts());
    const unsub = pharmacyStore.subscribe(() => {
      setAlerts(pharmacyStore.getAlerts());
    });
    return unsub;
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div className="border-b border-[#172321]/8 pb-5">
        <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-widest block">
          Clinical Stream
        </span>
        <h1 className="font-instrument text-3xl sm:text-4xl text-[#172321] font-normal">
          Pharmacist <span className="italic text-[#087F73]">Alerts & Advisories</span>
        </h1>
        <p className="text-xs text-[#667572] mt-0.5">
          Live stream of batch expiry warnings, emergency requisitions, and inventory safety alerts.
        </p>
      </div>

      <div className="bg-white border border-[#172321]/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Timeline Alerts Stream */}
        <div className="relative pl-6 space-y-7">
          <div className="absolute left-[9px] top-2 bottom-2 w-[1.5px] bg-[#172321]/15" />

          {alerts.map((alt) => (
            <div key={alt.id} className="relative group">
              <div
                className={`absolute -left-[24px] top-1 w-3.5 h-3.5 rounded-full bg-white ring-3 shadow-xs ${
                  alt.severity === 'HIGH'
                    ? 'ring-[#E56B6F]'
                    : alt.severity === 'WARNING'
                    ? 'ring-[#E9A23B]'
                    : 'ring-[#087F73]'
                }`}
              />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold uppercase tracking-wide ${
                      alt.severity === 'HIGH'
                        ? 'text-[#E56B6F]'
                        : alt.severity === 'WARNING'
                        ? 'text-[#E9A23B]'
                        : 'text-[#087F73]'
                    }`}
                  >
                    ● {alt.title}
                  </span>
                  <span className="text-[10px] text-[#667572]">{alt.timestamp}</span>
                </div>
                <p className="text-xs text-[#172321] font-medium leading-relaxed">{alt.description}</p>
                {alt.department && (
                  <p className="text-[11px] text-[#667572]">Unit: {alt.department}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Alerts;
