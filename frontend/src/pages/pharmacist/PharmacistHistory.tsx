import React, { useState, useEffect } from 'react';
import { pharmacyStore, DispenseTransaction } from '../../services/pharmacyStore';
import { History, CheckCircle2, Clock, Pill, User, Building } from 'lucide-react';

export const PharmacistHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<DispenseTransaction[]>([]);

  useEffect(() => {
    setTransactions(pharmacyStore.getTransactions());
    const unsub = pharmacyStore.subscribe(() => {
      setTransactions(pharmacyStore.getTransactions());
    });
    return unsub;
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-[#172321]/8 pb-5">
        <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-widest block">
          Medical Audit Log
        </span>
        <h1 className="font-instrument text-3xl sm:text-4xl text-[#172321] font-normal">
          Dispensing Transaction <span className="italic text-[#087F73]">Ledger</span>
        </h1>
        <p className="text-xs text-[#667572] mt-0.5">
          Permanent chronological log of all executed medicine dispensing transactions.
        </p>
      </div>

      <div className="bg-white border border-[#172321]/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#172321]/10 text-[#667572]">
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Transaction ID</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Medicine</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Batch Used</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Quantity Dispensed</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Patient Ref</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Dispensed By</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172321]/6">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#F7F8F4]/80 transition-colors">
                  <td className="py-4 font-mono font-bold text-[#087F73] text-xs">{tx.transactionId}</td>
                  <td className="py-4 font-semibold text-[#172321] text-sm">{tx.medicineName}</td>
                  <td className="py-4 font-mono text-[#172321]">{tx.batchNumber}</td>
                  <td className="py-4 font-bold text-[#172321]">{tx.quantity} units</td>
                  <td className="py-4 text-[#667572]">{tx.patientId}</td>
                  <td className="py-4 text-[#172321]">{tx.dispensedBy}</td>
                  <td className="py-4 text-right text-[#667572]">{tx.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PharmacistHistory;
