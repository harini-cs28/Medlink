import React, { useState, useEffect } from 'react';
import { pharmacyStore, MedicineItem, BatchItem } from '../../services/pharmacyStore';
import { useAuth } from '../../hooks/useAuth';
import { Pill, CheckCircle2, ArrowRight, ShieldCheck, User, Building, QrCode } from 'lucide-react';

export const PharmacistDispense: React.FC = () => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [selectedMedId, setSelectedMedId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(30);
  const [patientId, setPatientId] = useState<string>('PT-88492');
  const [department, setDepartment] = useState<string>('Outpatient Dispensing Desk');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const list = pharmacyStore.getMedicines();
    setMedicines(list);
    if (list.length > 0 && !selectedMedId) {
      setSelectedMedId(list[0].id);
      const fefoBatch = list[0].batches.find((b) => b.isFefoFirst && b.currentStock > 0) || list[0].batches[0];
      setSelectedBatchId(fefoBatch?.id || '');
    }
  }, []);

  const currentMed = medicines.find((m) => m.id === selectedMedId);

  const handleMedChange = (medId: string) => {
    setSelectedMedId(medId);
    const med = medicines.find((m) => m.id === medId);
    if (med && med.batches.length > 0) {
      const fefoBatch = med.batches.find((b) => b.isFefoFirst && b.currentStock > 0) || med.batches[0];
      setSelectedBatchId(fefoBatch?.id || '');
      setQuantity(Math.min(30, fefoBatch?.currentStock || 1));
    }
  };

  const handleDispense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedId || !selectedBatchId) return;

    const res = pharmacyStore.dispenseMedicine({
      medicineId: selectedMedId,
      batchId: selectedBatchId,
      quantity: Number(quantity),
      dispensedBy: user?.fullName || 'Elena Rostova, RPh',
      patientId,
      department,
    });

    if (res.success) {
      setSuccessMessage(res.message);
      // Refresh local list
      setMedicines(pharmacyStore.getMedicines());
      setTimeout(() => setSuccessMessage(null), 5000);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div className="border-b border-[#172321]/8 pb-5">
        <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-widest block">
          Fast Dispense Engine
        </span>
        <h1 className="font-instrument text-3xl sm:text-4xl text-[#172321] font-normal">
          Prescription & Inpatient <span className="italic text-[#087F73]">Dispense Station</span>
        </h1>
        <p className="text-xs text-[#667572] mt-0.5">
          Execute dispensing orders with automated First-Expire, First-Out (FEFO) safety routing.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-[#3FA66B]/15 border border-[#3FA66B]/30 text-[#2D7A4F] text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#3FA66B] shrink-0" />
            <span className="text-sm">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-xs text-[#2D7A4F] hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleDispense} className="bg-white border border-[#172321]/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Medicine Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#172321] uppercase tracking-wider">
              1. Select Medicine
            </label>
            <select
              value={selectedMedId}
              onChange={(e) => handleMedChange(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl border border-[#172321]/15 bg-[#F7F8F4] text-sm font-semibold text-[#172321] focus:outline-none focus:border-[#087F73]"
            >
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} &bull; Total Stock: {m.totalStock} units
                </option>
              ))}
            </select>
          </div>

          {/* Patient ID */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#172321] uppercase tracking-wider">
              2. Patient / Prescription Reference
            </label>
            <input
              type="text"
              required
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl border border-[#172321]/15 bg-[#F7F8F4] text-sm font-semibold text-[#172321] focus:outline-none focus:border-[#087F73]"
            />
          </div>
        </div>

        {/* FEFO Batch Selection */}
        {currentMed && (
          <div className="space-y-3 pt-2 border-t border-[#172321]/6">
            <label className="block text-xs font-bold text-[#172321] uppercase tracking-wider">
              3. FEFO Batch Allocation (Select Batch to Dispense From)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentMed.batches.map((b) => (
                <label
                  key={b.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedBatchId === b.id
                      ? 'border-[#087F73] bg-[#087F73]/5 ring-2 ring-[#087F73]/20 shadow-xs'
                      : 'border-[#172321]/10 bg-[#F7F8F4] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="dispenseBatchSelect"
                      checked={selectedBatchId === b.id}
                      onChange={() => setSelectedBatchId(b.id)}
                      className="accent-[#087F73]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#172321]">{b.batchNumber}</span>
                        {b.isFefoFirst && (
                          <span className="px-2 py-0.5 rounded-full bg-[#087F73] text-white text-[8.5px] font-bold uppercase">
                            FEFO First
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#667572] mt-0.5 block">
                        Expires: {b.expiryDate} ({b.daysToExpiry}d remaining)
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-[#172321]">{b.currentStock} avail</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Quantity and Dispensary unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-[#172321]/6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#172321] uppercase tracking-wider">
              4. Quantity to Dispense
            </label>
            <input
              type="number"
              min={1}
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full h-12 px-4 rounded-2xl border border-[#172321]/15 bg-[#F7F8F4] text-base font-bold text-[#172321] focus:outline-none focus:border-[#087F73]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#172321] uppercase tracking-wider">
              5. Dispensing Destination Unit
            </label>
            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl border border-[#172321]/15 bg-[#F7F8F4] text-sm font-semibold text-[#172321] focus:outline-none focus:border-[#087F73]"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-[#172321]/8 flex items-center justify-between">
          <span className="text-xs text-[#667572]">
            Dispensed by: <strong className="text-[#172321]">{user?.fullName || 'Elena Rostova, RPh'}</strong>
          </span>

          <button
            type="submit"
            className="px-8 py-3.5 bg-[#087F73] hover:bg-[#06655C] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>CONFIRM DISPENSE &rarr;</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PharmacistDispense;
