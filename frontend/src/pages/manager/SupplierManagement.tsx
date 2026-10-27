import React from 'react';
import { Truck, Plus, Phone, Mail, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const SupplierManagement: React.FC = () => {
  const suppliers = [
    {
      id: 1,
      name: 'Apex Pharma Ltd',
      reliabilityScore: '98.4%',
      avgLeadTime: '48 hours',
      activeOrders: 2,
      categoriesSupplied: 'Analgesics, Injectable Ceftriaxone',
      contactPerson: 'David Chen',
      email: 'orders@apexpharma.com',
      status: 'VERIFIED_PARTNER',
    },
    {
      id: 2,
      name: 'MedPharm Global',
      reliabilityScore: '92.1%',
      avgLeadTime: '72 hours',
      activeOrders: 1,
      categoriesSupplied: 'Antibiotics (Amoxicillin, Cefixime)',
      contactPerson: 'Claire Bennett',
      email: 'logistics@medpharm.com',
      status: 'VERIFIED_PARTNER',
    },
    {
      id: 3,
      name: 'Novis Health Solutions',
      reliabilityScore: '96.8%',
      avgLeadTime: '24 hours',
      activeOrders: 0,
      categoriesSupplied: 'Antidiabetic, NSAIDs (Metformin, Ibuprofen)',
      contactPerson: 'Siddharth Rao',
      email: 'supply@novishealth.com',
      status: 'VERIFIED_PARTNER',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#172321]/8 pb-5">
        <div>
          <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-widest block">
            Vendor Ecosystem
          </span>
          <h1 className="font-instrument text-3xl sm:text-4xl text-[#172321] font-normal">
            Supplier Directory & <span className="italic text-[#087F73]">Lead-Time Telemetry</span>
          </h1>
          <p className="text-xs text-[#667572] mt-0.5">
            Monitor supplier fulfillment reliability scores, standard lead times, and active procurements.
          </p>
        </div>

        <button
          onClick={() => alert('New Supplier Onboarding modal opened.')}
          className="px-4 py-2.5 bg-[#087F73] hover:bg-[#06655C] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard Supplier</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {suppliers.map((s) => (
          <div
            key={s.id}
            className="p-6 bg-white border border-[#172321]/10 rounded-3xl space-y-4 hover:border-[#087F73] transition-all shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded-md bg-[#087F73]/10 text-[#087F73] text-[9.5px] font-bold uppercase tracking-wider">
                  {s.status.replace('_', ' ')}
                </span>
                <h3 className="font-instrument text-2xl text-[#172321] mt-1">{s.name}</h3>
              </div>
            </div>

            <div className="space-y-2 text-xs border-y border-[#172321]/6 py-3 text-[#667572]">
              <div className="flex items-center justify-between">
                <span>Reliability Score:</span>
                <span className="font-bold text-[#087F73]">{s.reliabilityScore}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Average Lead Time:</span>
                <span className="font-semibold text-[#172321]">{s.avgLeadTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Active POs:</span>
                <span className="font-medium text-[#172321]">{s.activeOrders} in pipeline</span>
              </div>
              <div className="pt-1 text-[11px]">
                <span className="block text-[#667572]">Supplied Formularies:</span>
                <span className="font-medium text-[#172321]">{s.categoriesSupplied}</span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-xs text-[#667572]">
              <span>Rep: {s.contactPerson}</span>
              <button
                onClick={() => alert(`Initiating direct dispatch request to ${s.email}`)}
                className="text-xs font-semibold text-[#087F73] hover:underline"
              >
                Send Request &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupplierManagement;
