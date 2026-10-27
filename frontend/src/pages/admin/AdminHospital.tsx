import React, { useState } from 'react';
import { Building2, Bed, AlertTriangle, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';

export const AdminHospital: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState<string>('emergency');

  const departments = [
    {
      id: 'emergency',
      name: 'Emergency & Trauma Department',
      beds: '48 Beds (94% Occupied)',
      headDoctor: 'Dr. Robert Vance, MD',
      riskLevel: 'HIGH',
      stockStatus: 'Critical Buffer Alert',
      criticalShortages: ['Paracetamol 500mg (1.2 days left)', 'Ceftriaxone 1g (2.1 days left)', 'Morphine Sulfate 10mg'],
      lastRequisition: '150 units - 3 hours ago',
    },
    {
      id: 'icu',
      name: 'Intensive Care Unit (ICU)',
      beds: '32 Beds (82% Occupied)',
      headDoctor: 'Dr. Clara Sterling, MD',
      riskLevel: 'OPTIMAL',
      stockStatus: 'Stable 14-Day Reserve',
      criticalShortages: ['None (All Vital Reserves Optimal)'],
      lastRequisition: '80 units - Yesterday',
    },
    {
      id: 'general',
      name: 'General Inpatient Medicine',
      beds: '180 Beds (88% Occupied)',
      headDoctor: 'Dr. Neil Henderson, MD',
      riskLevel: 'WARNING',
      stockStatus: 'Batch Expiry Risk Detected',
      criticalShortages: ['Amoxicillin 500mg (Batch BTH-AMX-89 expires in 38d)'],
      lastRequisition: '240 units - 8 hours ago',
    },
    {
      id: 'surgery',
      name: 'Surgical & Perioperative Suite',
      beds: '24 Operation Theatres',
      headDoctor: 'Dr. Evelyn Zhang, FACS',
      riskLevel: 'OPTIMAL',
      stockStatus: 'Stable Pre-Op Buffer',
      criticalShortages: ['None'],
      lastRequisition: '110 units - 1 day ago',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-[#172321]/8 pb-5">
        <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-widest block">
          Hospital Ecosystem
        </span>
        <h1 className="font-instrument text-3xl sm:text-4xl text-[#172321] font-normal">
          Hospital Network & <span className="italic text-[#087F73]">Department Telemetry</span>
        </h1>
        <p className="text-xs text-[#667572] mt-1">
          Real-time inventory consumption, bed occupancy, and inter-ward medicine distribution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Department Selection List */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#667572] px-1">
            Clinical Units ({departments.length})
          </h2>

          <div className="space-y-2.5">
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept.id)}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${
                  selectedDept === dept.id
                    ? 'bg-white border-[#087F73] ring-2 ring-[#087F73]/10 shadow-sm'
                    : 'bg-white/60 hover:bg-white border-[#172321]/10 text-[#172321]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-instrument text-lg text-[#172321]">{dept.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      dept.riskLevel === 'HIGH'
                        ? 'bg-[#E56B6F]/10 text-[#E56B6F]'
                        : dept.riskLevel === 'WARNING'
                        ? 'bg-[#E9A23B]/10 text-[#E9A23B]'
                        : 'bg-[#087F73]/10 text-[#087F73]'
                    }`}
                  >
                    {dept.riskLevel}
                  </span>
                </div>
                <p className="text-xs text-[#667572] mt-1">{dept.beds}</p>
                <div className="flex items-center justify-between text-[11px] text-[#667572] pt-2 border-t border-[#172321]/5 mt-2">
                  <span>Lead: {dept.headDoctor}</span>
                  <span className="text-[#087F73] font-medium">Inspect &rarr;</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Department Live Inspection View */}
        <div className="lg:col-span-7 bg-white border border-[#172321]/10 rounded-3xl p-6 sm:p-8 space-y-6">
          {(() => {
            const current = departments.find((d) => d.id === selectedDept) || departments[0];
            return (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-[#172321]/8">
                  <div>
                    <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-wider block">
                      Ward Telemetry Details
                    </span>
                    <h2 className="font-instrument text-2xl text-[#172321]">{current.name}</h2>
                  </div>
                  <span className="text-xs text-[#667572]">{current.beds}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#F7F8F4] border border-[#172321]/5">
                    <span className="text-[10px] uppercase font-bold text-[#667572] block">Current Status</span>
                    <span className="text-sm font-semibold text-[#172321] mt-0.5 block">{current.stockStatus}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F7F8F4] border border-[#172321]/5">
                    <span className="text-[10px] uppercase font-bold text-[#667572] block">Clinical Lead</span>
                    <span className="text-sm font-semibold text-[#172321] mt-0.5 block">{current.headDoctor}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-[#172321] uppercase tracking-wider">
                    Critical Medicine Telemetry & Risks
                  </h3>
                  <div className="space-y-2">
                    {current.criticalShortages.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white border border-[#172321]/10 flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-[#172321]">{item}</span>
                        <span className="text-[11px] text-[#E56B6F] font-semibold">Priority Monitor</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#172321]/8 flex items-center justify-between">
                  <div className="text-xs text-[#667572]">
                    <span>Last Inpatient Stock Transfer: {current.lastRequisition}</span>
                  </div>
                  <button
                    onClick={() => alert(`Requisition dispatched for ${current.name}`)}
                    className="px-4 py-2 rounded-xl bg-[#087F73] hover:bg-[#06655C] text-white text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    Authorize Rebalance
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default AdminHospital;
