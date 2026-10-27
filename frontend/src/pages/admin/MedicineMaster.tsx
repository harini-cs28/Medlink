import React, { useState } from 'react';
import { Pill, Plus, Search, Filter, ShieldCheck, Download, AlertTriangle } from 'lucide-react';
import { pharmacyStore } from '../../services/pharmacyStore';

export const MedicineMaster: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const medicines = pharmacyStore.getMedicines();

  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.atcCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || m.category.includes(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#172321]/8 pb-5">
        <div>
          <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-widest block">
            Formulary Catalog
          </span>
          <h1 className="font-instrument text-3xl sm:text-4xl text-[#172321] font-normal">
            Medicine <span className="italic text-[#087F73]">Master Catalog</span>
          </h1>
          <p className="text-xs text-[#667572] mt-0.5">
            Verified pharmaceutical formulary, WHO ATC classifications, and hospital safety thresholds.
          </p>
        </div>

        <button
          onClick={() => alert('Add Medicine Formulary modal triggered.')}
          className="px-4 py-2.5 bg-[#087F73] hover:bg-[#06655C] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Catalog Item</span>
        </button>
      </div>

      <div className="bg-white border border-[#172321]/10 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#667572] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by generic, brand or ATC code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#F7F8F4] border border-[#172321]/10 rounded-xl text-[#172321] placeholder-[#667572]/70 focus:outline-none focus:border-[#087F73]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {['ALL', 'Analgesics', 'Antibiotics', 'NSAIDs', 'Antidiabetic'].map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  categoryFilter === c
                    ? 'bg-[#172321] text-white font-semibold'
                    : 'bg-[#F7F8F4] text-[#667572] hover:text-[#172321]'
                }`}
              >
                {c === 'ALL' ? 'All Classes' : c}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#172321]/10 text-[#667572]">
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Medicine / Formula</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">ATC Code</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Therapeutic Class</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Dosage Form</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Safety Buffer</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172321]/6">
              {filteredMedicines.map((m) => (
                <tr key={m.id} className="hover:bg-[#F7F8F4]/80 transition-colors">
                  <td className="py-4">
                    <div>
                      <p className="font-semibold text-[#172321] text-sm">{m.name}</p>
                      <p className="text-[11px] text-[#667572]">{m.genericName} &bull; {m.brandName}</p>
                    </div>
                  </td>
                  <td className="py-4 font-mono font-bold text-[#087F73] text-xs">{m.atcCode}</td>
                  <td className="py-4 text-[#172321] font-medium">{m.category}</td>
                  <td className="py-4 text-[#667572]">{m.dosageForm}</td>
                  <td className="py-4">
                    <span className="font-semibold text-[#172321]">{m.reorderLevel} units</span>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => alert(`Editing catalog parameters for ${m.name}`)}
                      className="px-2.5 py-1 rounded-lg border border-[#172321]/10 text-[#172321] hover:bg-white text-[11px] font-medium"
                    >
                      Edit Thresholds
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MedicineMaster;
