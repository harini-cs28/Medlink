import React, { useState } from 'react';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { GlassCard } from '../../components/ui/GlassCard';
import { ShoppingBag, CheckCircle, Search, Pill, ShieldCheck, ArrowRight } from 'lucide-react';

export const SalesEntry: React.FC = () => {
  const [patientId, setPatientId] = useState('');
  const [medicine, setMedicine] = useState('Amoxicillin 500mg (Batch #AMX-2024-12)');
  const [quantity, setQuantity] = useState(10);
  const [success, setSuccess] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleDispense = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setPatientId('');
      setQuantity(10);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#F7F9F8] text-[#1E293B] flex">
      <Sidebar activeTab="inventory" setActiveTab={() => {}} isOpenMobile={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar activeTab="Record Sales & Dispense" onOpenMobileSidebar={() => setIsMobileOpen(true)} />
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[#123047]">Point-of-Care Medicine Dispensation</h2>
            <p className="text-xs text-[#64748B]">Dispense prescribed drugs with automatic FEFO batch allocation and instant ledger logging</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="p-6 md:col-span-2">
              <h3 className="text-sm font-bold text-[#123047] mb-4">Dispensation Entry Form</h3>

              {success && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dispense transaction recorded successfully! Stock deducted via FEFO engine.</span>
                </div>
              )}

              <form onSubmit={handleDispense} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Patient Hospital MRN / ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MRN-948210"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Medicine & FEFO Assigned Batch</label>
                  <select
                    value={medicine}
                    onChange={(e) => setMedicine(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#0F766E]"
                  >
                    <option value="Atorvastatin 20mg (Batch #AT-2024-09 - Expires in 28d)">Atorvastatin 20mg (Batch #AT-2024-09 - FEFO Primary)</option>
                    <option value="Amoxicillin 500mg (Batch #AMX-2024-12 - Expires in 65d)">Amoxicillin 500mg (Batch #AMX-2024-12 - FEFO Primary)</option>
                    <option value="Paracetamol 650mg (Batch #PCM-2025-01 - Expires in 300d)">Paracetamol 650mg (Batch #PCM-2025-01)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Quantity to Dispense (Units)</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#0F766E]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Confirm Dispensation & Deduct Stock</span>
                </button>
              </form>
            </GlassCard>

            <GlassCard className="p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#123047] mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                  FEFO Safety Verification
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  MedPredict automatically binds each dispensed pill to the nearest expiring batch in accordance with hospital inventory safety standards.
                </p>
                <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-900 space-y-1">
                  <div className="font-bold">Inventory Flow Equation:</div>
                  <div className="font-mono text-[11px] text-[#0F766E]">current_stock = previous_stock - quantity_sold</div>
                </div>
              </div>
            </GlassCard>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SalesEntry;
