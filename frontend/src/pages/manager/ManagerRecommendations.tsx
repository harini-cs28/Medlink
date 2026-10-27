import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lightbulb,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ShoppingCart,
  Calendar,
  AlertTriangle,
  TrendingDown,
  Package,
} from 'lucide-react';
import { pharmacyStore, MedicineItem } from '../../services/pharmacyStore';

interface InventoryRecommendation {
  id: string;
  medicine: string;
  scenario: string;
  explanation: string;
  actionTitle: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  impact: string;
  type: 'REORDER' | 'EXPIRY' | 'HOLD';
  reorderQuantity?: number;
}

export const ManagerRecommendations: React.FC = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [executedIds, setExecutedIds] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    setMedicines(pharmacyStore.getMedicines());
    const unsub = pharmacyStore.subscribe(() => {
      setMedicines(pharmacyStore.getMedicines());
    });
    return unsub;
  }, []);

  // Compute recommendations dynamically from real inventory and batch metrics
  const recommendations: InventoryRecommendation[] = [];

  medicines.forEach((med) => {
    // 1. Low stock / Shortage prevention
    if (med.totalStock <= med.reorderLevel) {
      const daysCover = (med.totalStock / Math.max(1, med.dailyDemand)).toFixed(1);
      const reorderQty = Math.max(100, med.reorderLevel * 2 - med.totalStock);
      recommendations.push({
        id: `rec-reorder-${med.id}`,
        medicine: med.name,
        scenario: `Stockout Risk &bull; ${daysCover} days cover remaining`,
        explanation: `Current stock (${med.totalStock} units) has breached the minimum safety threshold (${med.reorderLevel} units) with daily burn velocity of ${med.dailyDemand} units/day.`,
        actionTitle: `Issue Purchase Order for ${reorderQty} units`,
        urgency: 'HIGH',
        impact: `Prevents hospital-wide stockout in ${daysCover} days`,
        type: 'REORDER',
        reorderQuantity: reorderQty,
      });
    }

    // 2. Batch Expiry & Waste Reduction
    med.batches.forEach((b) => {
      if (b.currentStock > 0 && b.daysToExpiry <= 90) {
        const valueAtRisk = (b.currentStock * (b.unitCost || 0.15)).toFixed(2);
        recommendations.push({
          id: `rec-exp-${b.id}`,
          medicine: `${med.name} (Batch ${b.batchNumber})`,
          scenario: `FEFO Priority &bull; ${b.daysToExpiry} days shelf life left`,
          explanation: `Batch ${b.batchNumber} contains ${b.currentStock} units expiring on ${b.expiryDate}. Requires immediate FEFO priority routing in dispensary.`,
          actionTitle: 'Enforce Outpatient FEFO Dispense Priority',
          urgency: b.daysToExpiry <= 30 ? 'HIGH' : 'MEDIUM',
          impact: `Prevents $${valueAtRisk} in expired drug write-off`,
          type: 'EXPIRY',
        });
      }
    });

    // 3. Excess Stock Holding
    if (med.totalStock > med.reorderLevel * 3) {
      recommendations.push({
        id: `rec-hold-${med.id}`,
        medicine: med.name,
        scenario: 'Excess Stock Buffer Detected',
        explanation: `Current in-house inventory of ${med.totalStock} units is 3x higher than required clinical reorder levels (${med.reorderLevel} units).`,
        actionTitle: 'Pause Scheduled Purchase Orders',
        urgency: 'LOW',
        impact: 'Optimizes working capital and prevents warehouse overfill',
        type: 'HOLD',
      });
    }
  });

  const handleExecute = (rec: InventoryRecommendation) => {
    setExecutedIds((prev) => [...prev, rec.id]);

    if (rec.type === 'REORDER') {
      showToast(`Navigating to Purchase Management for ${rec.medicine}...`);
      setTimeout(() => navigate('/manager/purchases'), 700);
    } else if (rec.type === 'EXPIRY') {
      showToast(`Navigating to Inventory Management to review batch ${rec.medicine}...`);
      setTimeout(() => navigate('/manager/inventory'), 700);
    } else {
      showToast(`Applied optimization decision for ${rec.medicine}`);
    }
  };

  const handleApplyAll = () => {
    const allIds = recommendations.map((r) => r.id);
    setExecutedIds(allIds);
    showToast('Applied all optimization actions to procurement and dispensary queues.');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl bg-[#087F73] text-white text-xs font-semibold shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#172321]/8 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-[#087F73]" />
            <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-widest block">
              Proactive Optimization Engine
            </span>
          </div>
          <h1 className="font-instrument text-3xl sm:text-4xl text-[#172321] font-normal">
            Intelligent <span className="italic text-[#087F73]">Recommendations Feed</span>
          </h1>
          <p className="text-xs text-[#667572] mt-0.5">
            Prescriptive analytical decisions combining FEFO shelf-life, demand velocity, and supplier reliability.
          </p>
        </div>

        <button
          onClick={handleApplyAll}
          className="px-4 py-2.5 bg-[#087F73] hover:bg-[#06655C] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Apply All Recommendations</span>
        </button>
      </div>

      {/* RECOMMENDATIONS CARDS */}
      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#172321]/10 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#087F73] mx-auto" />
            <h3 className="font-instrument text-2xl text-[#172321]">All Inventory Parameters Optimal</h3>
            <p className="text-xs text-[#667572]">No immediate stockout or batch expiry risks detected in current inventory.</p>
          </div>
        ) : (
          recommendations.map((rec) => {
            const isExecuted = executedIds.includes(rec.id);
            return (
              <div
                key={rec.id}
                className={`p-6 sm:p-7 rounded-3xl bg-white border transition-all ${
                  isExecuted ? 'border-[#3FA66B]/50 bg-[#3FA66B]/5' : 'border-[#172321]/10 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3 border-b border-[#172321]/6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider ${
                          rec.urgency === 'HIGH'
                            ? 'bg-[#E56B6F]/10 text-[#E56B6F]'
                            : rec.urgency === 'MEDIUM'
                            ? 'bg-[#E9A23B]/10 text-[#E9A23B]'
                            : 'bg-[#087F73]/10 text-[#087F73]'
                        }`}
                      >
                        {rec.urgency} Priority
                      </span>
                      <span
                        className="text-xs text-[#667572] font-mono"
                        dangerouslySetInnerHTML={{ __html: rec.scenario }}
                      />
                    </div>
                    <h3 className="font-instrument text-2xl text-[#172321]">{rec.medicine}</h3>
                  </div>

                  {isExecuted ? (
                    <span className="px-3 py-1.5 rounded-xl bg-[#3FA66B]/10 text-[#3FA66B] text-xs font-bold flex items-center gap-1.5 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Applied to Pipeline</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleExecute(rec)}
                      className="px-4 py-2 rounded-xl bg-[#087F73] hover:bg-[#06655C] text-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                    >
                      <span>{rec.type === 'REORDER' ? 'Create Reorder PO' : 'Execute Decision'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="pt-3 space-y-2 text-xs">
                  <p className="text-[#172321] font-medium leading-relaxed">{rec.explanation}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[#667572] pt-2 border-t border-[#172321]/5 gap-2">
                    <span className="font-semibold text-[#087F73]">&rarr; {rec.actionTitle}</span>
                    <span className="text-[11px]">Impact: {rec.impact}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ManagerRecommendations;
