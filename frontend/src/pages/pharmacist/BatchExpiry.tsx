import React, { useState, useEffect } from 'react';
import { pharmacyStore, MedicineItem, BatchItem } from '../../services/pharmacyStore';
import { Calendar, CheckCircle2, AlertTriangle, Clock, Layers } from 'lucide-react';

export const BatchExpiry: React.FC = () => {
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);

  useEffect(() => {
    setMedicines(pharmacyStore.getMedicines());
    const unsub = pharmacyStore.subscribe(() => {
      setMedicines(pharmacyStore.getMedicines());
    });
    return unsub;
  }, []);

  // Collect all batches across medicines
  const allBatches: (BatchItem & { category: string })[] = [];
  medicines.forEach((m) => {
    m.batches.forEach((b) => {
      allBatches.push({ ...b, category: m.category });
    });
  });

  // Sort by expiry date ascending
  allBatches.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-[#172321]/8 pb-5">
        <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-widest block">
          Shelf-Life Management
        </span>
        <h1 className="font-instrument text-3xl sm:text-4xl text-[#172321] font-normal">
          Batch Expiry & <span className="italic text-[#087F73]">FEFO Timeline</span>
        </h1>
        <p className="text-xs text-[#667572] mt-0.5">
          Real-time days-to-expiry tracking and strict First-Expire First-Out clinical rotation.
        </p>
      </div>

      <div className="bg-white border border-[#172321]/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#172321]/10 text-[#667572]">
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Batch Number</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Medicine Name</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Current Quantity</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Expiry Date</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Days Remaining</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider text-right">FEFO Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172321]/6">
              {allBatches.map((b) => {
                const isUrgent = b.daysToExpiry < 45;
                const isWarning = b.daysToExpiry >= 45 && b.daysToExpiry < 90;
                return (
                  <tr key={b.id} className="hover:bg-[#F7F8F4]/80 transition-colors">
                    <td className="py-4 font-mono font-bold text-[#172321] text-sm">{b.batchNumber}</td>
                    <td className="py-4 font-semibold text-[#172321]">{b.medicineName}</td>
                    <td className="py-4 font-bold text-[#172321]">{b.currentStock} units</td>
                    <td className="py-4 text-[#172321]">{b.expiryDate}</td>
                    <td className="py-4">
                      <span
                        className={`font-mono font-bold ${
                          isUrgent ? 'text-[#E56B6F]' : isWarning ? 'text-[#E9A23B]' : 'text-[#087F73]'
                        }`}
                      >
                        {b.daysToExpiry} days
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      {b.isFefoFirst ? (
                        <span className="px-2.5 py-1 rounded-full bg-[#087F73] text-white text-[9px] font-bold uppercase tracking-wider">
                          DISPENSE FIRST
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-[#F7F8F4] text-[#667572] text-[9.5px] font-medium">
                          Secondary Lot
                        </span>
                      )}
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

export default BatchExpiry;
