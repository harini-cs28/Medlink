import React, { useState } from 'react';
import { Building2, Plus, CheckCircle, Clock, MapPin, Layers, Phone, ShieldCheck } from 'lucide-react';

export const PharmacyManagement: React.FC = () => {
  const pharmacies = [
    {
      id: 1,
      name: 'Main Central Inpatient Pharmacy',
      type: 'Core Inpatient Hub',
      manager: 'Marcus Vance, PharmD',
      pharmacistsCount: 8,
      stockCount: '1,280 SKUs',
      capacity: '92% Active Capacity',
      status: 'OPERATIONAL',
      location: 'Ground Floor, Building A',
      phone: '+1 (555) 019-2831',
    },
    {
      id: 2,
      name: 'Emergency Satellite Unit',
      type: 'Trauma Dispensary',
      manager: 'Julian Hayes, RPh',
      pharmacistsCount: 4,
      stockCount: '340 SKUs',
      capacity: '78% Active Capacity',
      status: 'OPERATIONAL',
      location: 'Level 1, Emergency Wing',
      phone: '+1 (555) 019-2834',
    },
    {
      id: 3,
      name: 'Outpatient Clinical Dispensary',
      type: 'Retail / Prescription',
      manager: 'Elena Rostova, RPh',
      pharmacistsCount: 6,
      stockCount: '890 SKUs',
      capacity: '85% Active Capacity',
      status: 'OPERATIONAL',
      location: 'North Plaza Clinic Suite',
      phone: '+1 (555) 019-2839',
    },
    {
      id: 4,
      name: 'Surgical Satellite Pharmacy',
      type: 'Perioperative Reserve',
      manager: 'Dr. Clara Sterling, MD',
      pharmacistsCount: 3,
      stockCount: '210 SKUs',
      capacity: '64% Active Capacity',
      status: 'OPERATIONAL',
      location: 'Level 3, Surgical Theatre',
      phone: '+1 (555) 019-2840',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#172321]/8 pb-5">
        <div>
          <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-widest block">
            Infrastructure Governance
          </span>
          <h1 className="font-instrument text-3xl sm:text-4xl text-[#172321] font-normal">
            Hospital <span className="italic text-[#087F73]">Pharmacy Locations</span>
          </h1>
          <p className="text-xs text-[#667572] mt-0.5">
            Physical pharmacy locations, vault capacities, assigned managers, and cold-chain compliance.
          </p>
        </div>

        <button
          onClick={() => alert('New Pharmacy Unit configuration modal triggered.')}
          className="px-4 py-2.5 bg-[#087F73] hover:bg-[#06655C] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Pharmacy Unit</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pharmacies.map((p) => (
          <div
            key={p.id}
            className="p-6 bg-white border border-[#172321]/10 rounded-3xl space-y-4 hover:border-[#087F73] transition-all shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#087F73]/10 text-[10px] font-bold text-[#087F73] uppercase tracking-wider">
                  {p.type}
                </span>
                <h3 className="font-instrument text-2xl text-[#172321] mt-1">{p.name}</h3>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-[#3FA66B]/10 text-[#3FA66B] text-[10px] font-bold uppercase">
                {p.status}
              </span>
            </div>

            <div className="space-y-2 text-xs border-y border-[#172321]/6 py-3">
              <div className="flex items-center justify-between text-[#667572]">
                <span>Assigned Manager:</span>
                <span className="font-semibold text-[#172321]">{p.manager}</span>
              </div>
              <div className="flex items-center justify-between text-[#667572]">
                <span>Location:</span>
                <span className="font-medium text-[#172321]">{p.location}</span>
              </div>
              <div className="flex items-center justify-between text-[#667572]">
                <span>Active Vault SKUs:</span>
                <span className="font-semibold text-[#172321]">{p.stockCount}</span>
              </div>
              <div className="flex items-center justify-between text-[#667572]">
                <span>Vault Capacity:</span>
                <span className="font-medium text-[#087F73]">{p.capacity}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#667572] flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#087F73]" />
                {p.phone}
              </span>
              <button
                onClick={() => alert(`Opening inspection console for ${p.name}`)}
                className="text-xs font-semibold text-[#087F73] hover:underline"
              >
                Inspect Unit &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PharmacyManagement;
