import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { pharmacyStore, MedicineItem } from '../../services/pharmacyStore';
import { Search, Pill, ArrowRight, CheckCircle2, QrCode } from 'lucide-react';

export const MedicineSearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [selectedMed, setSelectedMed] = useState<MedicineItem | null>(null);

  useEffect(() => {
    setMedicines(pharmacyStore.getMedicines());
    const unsub = pharmacyStore.subscribe(() => {
      setMedicines(pharmacyStore.getMedicines());
    });
    return unsub;
  }, []);

  const filtered = query.trim()
    ? medicines.filter(
        (m) =>
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.genericName.toLowerCase().includes(query.toLowerCase()) ||
          m.atcCode.toLowerCase().includes(query.toLowerCase()) ||
          m.batches.some((b) => b.batchNumber.toLowerCase().includes(query.toLowerCase()))
      )
    : medicines;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-[#172321]/8 pb-5">
        <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-widest block">
          Formulary Lookup
        </span>
        <h1 className="font-instrument text-3xl sm:text-4xl text-[#172321] font-normal">
          Medicine & <span className="italic text-[#087F73]">Batch Catalog Search</span>
        </h1>
        <p className="text-xs text-[#667572] mt-0.5">
          Fast search by brand name, active molecule, WHO ATC code or batch lot identifier.
        </p>
      </div>

      {/* Big Search Input */}
      <div className="relative max-w-2xl">
        <Search className="w-5 h-5 text-[#667572] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by medicine, active ingredient or batch number..."
          className="w-full h-14 pl-12 pr-4 bg-white border-2 border-[#172321]/15 rounded-2xl text-sm text-[#172321] placeholder-[#667572]/70 focus:outline-none focus:border-[#087F73] shadow-xs"
          autoFocus
        />
      </div>

      {/* Results List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="p-6 rounded-3xl bg-white border border-[#172321]/10 hover:border-[#087F73] transition-all space-y-4 shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-wider block">
                  {m.category} &bull; {m.atcCode}
                </span>
                <h3 className="font-instrument text-2xl text-[#172321] mt-0.5">{m.name}</h3>
                <p className="text-xs text-[#667572]">{m.genericName} &bull; {m.dosageForm}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#667572] block">Total Stock</span>
                <span className="font-bold text-xl text-[#172321]">{m.totalStock}</span>
                <span className="text-[11px] text-[#667572] ml-1">units</span>
              </div>
            </div>

            {/* FEFO Batches List */}
            <div className="space-y-2 pt-2 border-t border-[#172321]/6">
              <span className="text-[10px] uppercase font-bold text-[#667572]">
                Batches in Vault ({m.batches.length})
              </span>
              {m.batches.map((b) => (
                <div
                  key={b.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    b.isFefoFirst ? 'bg-[#087F73]/5 border-[#087F73]' : 'bg-[#F7F8F4] border-[#172321]/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#172321]">{b.batchNumber}</span>
                    {b.isFefoFirst && (
                      <span className="px-1.5 py-0.5 rounded-md bg-[#087F73] text-white text-[8.5px] font-bold uppercase">
                        FEFO Priority
                      </span>
                    )}
                  </div>
                  <span className="text-[#667572] text-[11px]">
                    Expires: {b.expiryDate} &bull; <strong className="text-[#172321]">{b.currentStock} units</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicineSearch;
