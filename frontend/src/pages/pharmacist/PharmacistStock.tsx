import React, { useState, useEffect } from 'react';
import { pharmacyStore, MedicineItem } from '../../services/pharmacyStore';
import { Search, Package, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export const PharmacistStock: React.FC = () => {
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setMedicines(pharmacyStore.getMedicines());
    const unsub = pharmacyStore.subscribe(() => {
      setMedicines(pharmacyStore.getMedicines());
    });
    return unsub;
  }, []);

  const filtered = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-[#172321]/8 pb-5">
        <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-widest block">
          Shelf Balances
        </span>
        <h1 className="font-instrument text-3xl sm:text-4xl text-[#172321] font-normal">
          Dispensing Rack & <span className="italic text-[#087F73]">Stock Lookup</span>
        </h1>
        <p className="text-xs text-[#667572] mt-0.5">
          Live physical unit counts across Inpatient Dispensary and Outpatient pharmacy racks.
        </p>
      </div>

      <div className="bg-white border border-[#172321]/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-[#667572] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search stock..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#F7F8F4] border border-[#172321]/10 rounded-xl text-[#172321] placeholder-[#667572]/70 focus:outline-none focus:border-[#087F73]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#172321]/10 text-[#667572]">
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Medicine</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Dosage Form</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Total On-Hand Units</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Safety Threshold</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider text-right">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172321]/6">
              {filtered.map((m) => {
                const isLow = m.totalStock <= m.reorderLevel;
                return (
                  <tr key={m.id} className="hover:bg-[#F7F8F4]/80 transition-colors">
                    <td className="py-4 font-semibold text-[#172321] text-sm">{m.name}</td>
                    <td className="py-4 text-[#667572]">{m.dosageForm}</td>
                    <td className="py-4 font-bold text-sm text-[#172321]">{m.totalStock} units</td>
                    <td className="py-4 text-[#667572]">{m.reorderLevel} units</td>
                    <td className="py-4 text-right">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isLow ? 'bg-[#E56B6F]/10 text-[#E56B6F]' : 'bg-[#3FA66B]/10 text-[#3FA66B]'
                        }`}
                      >
                        {isLow ? 'LOW STOCK' : 'IN STOCK'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PharmacistStock;
