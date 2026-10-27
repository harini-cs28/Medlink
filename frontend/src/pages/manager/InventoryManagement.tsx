import React, { useState, useEffect } from 'react';
import { pharmacyStore, MedicineItem, BatchItem } from '../../services/pharmacyStore';
import { Package, Plus, Search, Filter, Layers, Calendar, CheckCircle2, AlertTriangle, ShieldCheck, X } from 'lucide-react';

export const InventoryManagement: React.FC = () => {
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedMedBatches, setSelectedMedBatches] = useState<MedicineItem | null>(null);
  const [isRestockOpen, setIsRestockOpen] = useState(false);

  // New batch form state
  const [restockMedId, setRestockMedId] = useState('');
  const [newBatchNumber, setNewBatchNumber] = useState('');
  const [newQuantity, setNewQuantity] = useState(100);
  const [newExpiry, setNewExpiry] = useState('2027-12-31');
  const [newCost, setNewCost] = useState(0.25);
  const [newSupplier, setNewSupplier] = useState('Apex Pharma Ltd');

  useEffect(() => {
    setMedicines(pharmacyStore.getMedicines());
    const unsub = pharmacyStore.subscribe(() => {
      setMedicines(pharmacyStore.getMedicines());
    });
    return unsub;
  }, []);

  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.atcCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || m.category.includes(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockMedId || !newBatchNumber) return;

    pharmacyStore.restockMedicine({
      medicineId: restockMedId,
      batchNumber: newBatchNumber,
      quantity: Number(newQuantity),
      expiryDate: newExpiry,
      unitCost: Number(newCost),
      supplierName: newSupplier,
    });

    setIsRestockOpen(false);
    alert(`Batch ${newBatchNumber} successfully received and stocked.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#172321]/8 pb-5">
        <div>
          <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-widest block">
            Stock Management
          </span>
          <h1 className="font-instrument text-3xl sm:text-4xl text-[#172321] font-normal">
            Medicine <span className="italic text-[#087F73]">Inventory & Batches</span>
          </h1>
          <p className="text-xs text-[#667572] mt-0.5">
            Live on-hand physical stock, FEFO batch prioritization, and safety reorder thresholds.
          </p>
        </div>

        <button
          onClick={() => {
            setRestockMedId(medicines[0]?.id || '');
            setIsRestockOpen(true);
          }}
          className="px-4 py-2.5 bg-[#087F73] hover:bg-[#06655C] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Receive & Add Batch</span>
        </button>
      </div>

      {/* Main Table View */}
      <div className="bg-white border border-[#172321]/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#667572] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search medicine or ATC code..."
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
                {c === 'ALL' ? 'All Formularies' : c}
              </button>
            ))}
          </div>
        </div>

        {/* The Inventory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#172321]/10 text-[#667572]">
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Medicine Name</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Category</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">On-Hand Stock</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Active Batches</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Earliest Expiry (FEFO)</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Safety Status</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172321]/6">
              {filteredMedicines.map((med) => {
                const earliestBatch = med.batches[0];
                const isLow = med.totalStock <= med.reorderLevel;
                return (
                  <tr key={med.id} className="hover:bg-[#F7F8F4]/80 transition-colors">
                    <td className="py-4">
                      <div>
                        <p className="font-semibold text-[#172321] text-sm">{med.name}</p>
                        <p className="text-[11px] text-[#667572]">{med.genericName} &bull; {med.dosageForm}</p>
                      </div>
                    </td>
                    <td className="py-4 text-[#172321] font-medium">{med.category}</td>
                    <td className="py-4">
                      <span className="font-bold text-sm text-[#172321]">{med.totalStock}</span>
                      <span className="text-[#667572] text-[11px] ml-1">units</span>
                    </td>
                    <td className="py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F7F8F4] border border-[#172321]/10 text-xs font-semibold text-[#172321]">
                        {med.batches.length} batch{med.batches.length > 1 ? 'es' : ''}
                      </span>
                    </td>
                    <td className="py-4">
                      {earliestBatch ? (
                        <div>
                          <p className="font-semibold text-[#172321]">{earliestBatch.batchNumber}</p>
                          <p className={`text-[11px] font-medium ${
                            earliestBatch.daysToExpiry < 45 ? 'text-[#E56B6F]' : 'text-[#667572]'
                          }`}>
                            {earliestBatch.expiryDate} ({earliestBatch.daysToExpiry}d)
                          </p>
                        </div>
                      ) : (
                        <span className="text-[#667572]">No batches</span>
                      )}
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isLow ? 'bg-[#E56B6F]/10 text-[#E56B6F]' : 'bg-[#3FA66B]/10 text-[#3FA66B]'
                        }`}
                      >
                        {isLow ? 'Below Safety Buffer' : 'Buffer Adequate'}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => setSelectedMedBatches(med)}
                        className="px-3 py-1.5 rounded-xl border border-[#087F73] text-[#087F73] hover:bg-[#087F73]/5 text-xs font-semibold"
                      >
                        Inspect Batches
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Breakdown Modal */}
      {selectedMedBatches && (
        <div className="fixed inset-0 bg-[#172321]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#172321]/10">
            <div className="flex items-center justify-between pb-3 border-b border-[#172321]/8">
              <div>
                <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-wider block">
                  FEFO Batch Breakdown
                </span>
                <h3 className="font-instrument text-2xl text-[#172321]">{selectedMedBatches.name}</h3>
              </div>
              <button
                onClick={() => setSelectedMedBatches(null)}
                className="p-1.5 rounded-xl border border-[#172321]/10 text-[#667572] hover:text-[#172321]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedMedBatches.batches.map((b, idx) => (
                <div
                  key={b.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${
                    b.isFefoFirst
                      ? 'bg-[#087F73]/5 border-[#087F73] ring-1 ring-[#087F73]/20'
                      : 'bg-[#F7F8F4] border-[#172321]/8'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#172321]">{b.batchNumber}</span>
                      {b.isFefoFirst && (
                        <span className="px-2 py-0.5 rounded-full bg-[#087F73] text-white text-[9px] font-bold uppercase tracking-wider">
                          DISPENSE FIRST (FEFO)
                        </span>
                      )}
                    </div>
                    <p className="text-[#667572]">Supplier: {b.supplierName} &bull; Unit Cost: ${b.unitCost.toFixed(2)}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-sm text-[#172321]">{b.currentStock} units</p>
                    <p className="text-[11px] text-[#667572]">Expires: {b.expiryDate} ({b.daysToExpiry} days)</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#172321]/8 flex justify-end">
              <button
                onClick={() => setSelectedMedBatches(null)}
                className="px-5 py-2.5 bg-[#172321] text-white text-xs font-semibold rounded-xl"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restock Batch Modal */}
      {isRestockOpen && (
        <div className="fixed inset-0 bg-[#172321]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleRestockSubmit}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[#172321]/10"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#172321]/8">
              <h3 className="font-instrument text-2xl text-[#172321]">Receive Medicine Batch</h3>
              <button
                type="button"
                onClick={() => setIsRestockOpen(false)}
                className="p-1.5 rounded-xl border border-[#172321]/10 text-[#667572]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#172321] mb-1">Select Medicine</label>
                <select
                  value={restockMedId}
                  onChange={(e) => setRestockMedId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#172321]/15 bg-[#F7F8F4] text-[#172321]"
                >
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.genericName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#172321] mb-1">Batch / Lot Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BTH-2026-99"
                  value={newBatchNumber}
                  onChange={(e) => setNewBatchNumber(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#172321]/15 bg-[#F7F8F4] text-[#172321]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#172321] mb-1">Quantity (Units)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl border border-[#172321]/15 bg-[#F7F8F4] text-[#172321]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#172321] mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#172321]/15 bg-[#F7F8F4] text-[#172321]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#172321] mb-1">Supplier Partner</label>
                <input
                  type="text"
                  required
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#172321]/15 bg-[#F7F8F4] text-[#172321]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#172321]/8 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRestockOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#667572]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#087F73] hover:bg-[#06655C] text-white text-xs font-semibold rounded-xl"
              >
                Confirm Stock Intake
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
