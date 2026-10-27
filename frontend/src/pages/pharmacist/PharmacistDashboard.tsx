import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { pharmacyStore, MedicineItem, BatchItem, SystemAlert, DispenseTransaction } from "../../services/pharmacyStore";
import apiService from "../../services/api";
import {
  Search,
  ArrowRight,
  Pill,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ShieldCheck,
  Package,
  Calendar,
  X,
  RefreshCw,
  Wifi,
  WifiOff,
  History,
  AlertCircle,
  FileText,
  Activity,
  Send,
  Building,
} from "lucide-react";

interface BackendTransaction {
  id: number;
  medicine_id: number;
  batch_id?: number;
  transaction_type: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  transaction_date?: string;
}

export const PharmacistDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [transactions, setTransactions] = useState<DispenseTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Dispensing Modal State
  const [dispenseMed, setDispenseMed] = useState<MedicineItem | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [dispenseQuantity, setDispenseQuantity] = useState<number>(30);
  const [dispensePatientId, setDispensePatientId] = useState<string>("PT-88410");
  const [dispenseDepartment, setDispenseDepartment] = useState<string>("Outpatient Dispensing");
  const [isSubmittingDispense, setIsSubmittingDispense] = useState(false);
  const [dispenseError, setDispenseError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch real data from FastAPI & PostgreSQL
  const loadDashboardData = useCallback(async () => {
    setRefreshing(true);
    try {
      // 1. Check backend health via dashboard endpoint
      const dashData = await apiService.getDashboardData();
      if (dashData) {
        setBackendOnline(true);
      }

      // 2. Fetch real transactions from backend
      try {
        const backendTxs: BackendTransaction[] = await apiService.getTransactions({ limit: 20 });
        if (backendTxs && backendTxs.length > 0) {
          // Sync with local store display format
          const formattedTxs: DispenseTransaction[] = backendTxs
            .filter((tx) => tx.transaction_type === "DISPENSE" || tx.transaction_type === "SALE")
            .map((tx) => ({
              id: `tx-${tx.id}`,
              transactionId: `TX-2026-${String(tx.id).padStart(4, "0")}`,
              medicineId: `med-${tx.medicine_id}`,
              medicineName: tx.notes?.split("-")[0]?.trim() || `Medicine #${tx.medicine_id}`,
              batchId: `bth-${tx.batch_id || 1}`,
              batchNumber: `BTH-${String(tx.batch_id || 1).padStart(4, "0")}`,
              quantity: tx.quantity,
              dispensedBy: user?.fullName || "Elena Rostova, RPh",
              patientId: tx.notes?.includes("PT-") ? tx.notes.split("PT-")[1]?.split(" ")[0] ? `PT-${tx.notes.split("PT-")[1].split(" ")[0]}` : "PT-88410" : "PT-88410",
              department: "Outpatient Dispensing",
              timestamp: tx.transaction_date ? new Date(tx.transaction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
              status: "COMPLETED",
            }));
          if (formattedTxs.length > 0) {
            setTransactions(formattedTxs);
          } else {
            setTransactions(pharmacyStore.getTransactions());
          }
        } else {
          setTransactions(pharmacyStore.getTransactions());
        }
      } catch (err) {
        console.warn("Backend transactions query fallback to store", err);
        setTransactions(pharmacyStore.getTransactions());
      }

      // 3. Sync catalog medicines
      setMedicines(pharmacyStore.getMedicines());
      setAlerts(pharmacyStore.getAlerts());
      setLastRefreshed(new Date());
    } catch (e) {
      console.warn("Backend connection check failed, using active local sync", e);
      setBackendOnline(false);
      setMedicines(pharmacyStore.getMedicines());
      setTransactions(pharmacyStore.getTransactions());
      setAlerts(pharmacyStore.getAlerts());
      setLastRefreshed(new Date());
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
    const unsub = pharmacyStore.subscribe(() => {
      setMedicines(pharmacyStore.getMedicines());
      setAlerts(pharmacyStore.getAlerts());
    });
    return unsub;
  }, [loadDashboardData]);

  // Search results
  const searchResults = searchQuery.trim()
    ? medicines.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.atcCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.batches.some((b) => b.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  // Metrics derivation
  const totalStockItems = medicines.length;
  const lowStockItems = medicines.filter((m) => m.totalStock <= m.reorderLevel);
  const criticallyLowItems = medicines.filter((m) => m.totalStock <= m.reorderLevel * 0.4);
  const outOfStockItems = medicines.filter((m) => m.totalStock === 0);
  const healthyStockItems = medicines.filter((m) => m.totalStock > m.reorderLevel);

  // Expiring batches calculation (<90 days)
  const expiringBatches: { batch: BatchItem; medicine: MedicineItem }[] = [];
  medicines.forEach((med) => {
    med.batches.forEach((b) => {
      if (b.currentStock > 0 && b.daysToExpiry <= 90) {
        expiringBatches.push({ batch: b, medicine: med });
      }
    });
  });
  expiringBatches.sort((a, b) => a.batch.daysToExpiry - b.batch.daysToExpiry);

  // Today's dispensing count
  const todayDispensesCount = transactions.filter(
    (t) => t.status === "COMPLETED" && (t.timestamp.includes("Today") || t.timestamp.includes("Just now") || t.timestamp.includes(":"))
  ).length;

  // Open Dispense Modal
  const handleOpenDispense = (med: MedicineItem, preselectedBatchId?: string) => {
    setDispenseMed(med);
    setDispenseError(null);
    const fefoBatch = preselectedBatchId
      ? med.batches.find((b) => b.id === preselectedBatchId)
      : med.batches.find((b) => b.isFefoFirst && b.currentStock > 0) || med.batches[0];

    setSelectedBatchId(fefoBatch?.id || "");
    setDispenseQuantity(Math.min(30, fefoBatch?.currentStock || 1));
  };

  // Submit Dispense
  const handleConfirmDispense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispenseMed || !selectedBatchId) return;

    const currentBatch = dispenseMed.batches.find((b) => b.id === selectedBatchId);
    if (!currentBatch) {
      setDispenseError("Selected batch not found.");
      return;
    }

    if (dispenseQuantity <= 0) {
      setDispenseError("Quantity must be greater than zero.");
      return;
    }

    if (dispenseQuantity > currentBatch.currentStock) {
      setDispenseError(`Insufficient stock. Only ${currentBatch.currentStock} units available.`);
      return;
    }

    setIsSubmittingDispense(true);
    setDispenseError(null);

    try {
      // 1. Submit transaction to FastAPI backend
      const medNumericId = parseInt(dispenseMed.id.replace("med-", "")) || 1;
      const batchNumericId = parseInt(currentBatch.id.replace("bth-", "")) || 1;

      try {
        await apiService.createTransaction({
          medicine_id: medNumericId,
          batch_id: batchNumericId,
          transaction_type: "DISPENSE",
          quantity: Number(dispenseQuantity),
          unit_price: currentBatch.unitCost || 0.12,
          notes: `${dispenseMed.name} - ${dispenseDepartment} - ${dispensePatientId} (${user?.fullName || "Elena Rostova, RPh"})`,
        });
      } catch (apiErr) {
        console.warn("Backend createTransaction warning (synced locally):", apiErr);
      }

      // 2. Update reactive local pharmacyStore
      const res = pharmacyStore.dispenseMedicine({
        medicineId: dispenseMed.id,
        batchId: selectedBatchId,
        quantity: Number(dispenseQuantity),
        dispensedBy: user?.fullName || "Elena Rostova, RPh",
        patientId: dispensePatientId,
        department: dispenseDepartment,
      });

      if (res.success) {
        showToast(`Dispensed ${dispenseQuantity} units of ${dispenseMed.name} (Batch ${currentBatch.batchNumber})`);
        setDispenseMed(null);
        // Refresh local views
        setMedicines(pharmacyStore.getMedicines());
        setTransactions(pharmacyStore.getTransactions());
      } else {
        setDispenseError(res.message);
      }
    } catch (err: any) {
      setDispenseError(err?.message || "Failed to process dispensing transaction.");
    } finally {
      setIsSubmittingDispense(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-[#087F73] text-white text-xs font-semibold shadow-xl flex items-center gap-3 animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          1. HEADER: PHARMACIST OVERVIEW & HEALTHCARE IDENTITY
          ========================================================================= */}
      <div className="bg-white border border-[#DCE5E1] rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-[#E5F3EE] text-[11px] font-bold text-[#087F73] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#087F73] animate-pulse" />
                Pharmacist Workspace
              </span>
              <span className="text-xs text-[#667572] flex items-center gap-1 font-medium">
                <Building className="w-3.5 h-3.5 text-[#087F73]" />
                {(user as any)?.assignedPharmacy || (user?.hospitalId ? `Hospital Pharmacy (Unit #${user.hospitalId})` : "Main Hospital Central Dispensary (Unit 01)")}
              </span>
            </div>

            <h1 className="font-instrument text-3xl sm:text-4xl text-[#172321] tracking-tight">
              Pharmacist Overview
            </h1>
            <p className="text-xs sm:text-sm text-[#667572] max-w-2xl">
              Daily dispensing execution, real-time shelf stock balances, automated FEFO expiry enforcement, and prioritized medicine safety.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live Backend Connection Indicator */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#F7F8F4] border border-[#DCE5E1] text-[11px] text-[#667572]">
              {backendOnline === true ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-[#087F73]" />
                  <span className="font-medium text-[#172321]">FastAPI + PostgreSQL Online</span>
                </>
              ) : backendOnline === false ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-[#E9A23B]" />
                  <span className="font-medium text-[#E9A23B]">Store Cache Active</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-[#667572] animate-spin" />
                  <span>Connecting...</span>
                </>
              )}
            </div>

            {/* Refresh Action */}
            <button
              onClick={loadDashboardData}
              disabled={refreshing}
              className="px-4 py-2 rounded-2xl bg-white border border-[#DCE5E1] hover:border-[#087F73] text-xs font-semibold text-[#172321] hover:bg-[#E5F3EE]/40 transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#087F73] ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>

            {lastRefreshed && (
              <span className="text-[10px] text-[#667572] hidden sm:inline">
                Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. KPI CARDS (BALANCED PHARMACY OVERVIEW)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock Items */}
        <div
          onClick={() => navigate("/pharmacist/stock")}
          className="bg-white border border-[#DCE5E1] hover:border-[#087F73] p-5 rounded-3xl transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-[#667572] uppercase tracking-wider">
              Catalog Items
            </span>
            <div className="w-9 h-9 rounded-2xl bg-[#E5F3EE] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Pill className="w-4 h-4 text-[#087F73]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#172321]">{totalStockItems}</span>
            <span className="text-xs text-[#667572]">active medicines</span>
          </div>
          <p className="text-[11px] text-[#087F73] font-medium mt-2 flex items-center gap-1 group-hover:underline">
            View full stock balances &rarr;
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => navigate("/pharmacist/alerts")}
          className={`bg-white border p-5 rounded-3xl transition-all shadow-xs cursor-pointer group ${
            lowStockItems.length > 0 ? "border-[#E56B6F]/40 bg-[#FCEBEC]/20" : "border-[#DCE5E1] hover:border-[#087F73]"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-[#E56B6F] uppercase tracking-wider">
              Low Stock Warnings
            </span>
            <div className="w-9 h-9 rounded-2xl bg-[#FCEBEC] flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4 text-[#E56B6F]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#E56B6F]">{lowStockItems.length}</span>
            <span className="text-xs text-[#667572]">at or below reorder</span>
          </div>
          <p className="text-[11px] text-[#E56B6F] font-medium mt-2 flex items-center gap-1 group-hover:underline">
            Review reorder status &rarr;
          </p>
        </div>

        {/* Expiring Batches */}
        <div
          onClick={() => navigate("/pharmacist/batches")}
          className={`bg-white border p-5 rounded-3xl transition-all shadow-xs cursor-pointer group ${
            expiringBatches.length > 0 ? "border-[#E9A23B]/40 bg-[#FFF0D9]/20" : "border-[#DCE5E1] hover:border-[#087F73]"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-[#E9A23B] uppercase tracking-wider">
              Expiring Batches
            </span>
            <div className="w-9 h-9 rounded-2xl bg-[#FFF0D9] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4 text-[#E9A23B]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#E9A23B]">{expiringBatches.length}</span>
            <span className="text-xs text-[#667572]">lots within 90 days</span>
          </div>
          <p className="text-[11px] text-[#E9A23B] font-medium mt-2 flex items-center gap-1 group-hover:underline">
            Inspect FEFO queue &rarr;
          </p>
        </div>

        {/* Today's Dispensing Activity */}
        <div
          onClick={() => navigate("/pharmacist/history")}
          className="bg-white border border-[#DCE5E1] hover:border-[#087F73] p-5 rounded-3xl transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-[#087F73] uppercase tracking-wider">
              Today's Dispenses
            </span>
            <div className="w-9 h-9 rounded-2xl bg-[#E5F3EE] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4 text-[#087F73]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#172321]">{todayDispensesCount}</span>
            <span className="text-xs text-[#667572]">transactions recorded</span>
          </div>
          <p className="text-[11px] text-[#087F73] font-medium mt-2 flex items-center gap-1 group-hover:underline">
            View transaction log &rarr;
          </p>
        </div>
      </div>

      {/* =========================================================================
          3. MEDICINE SEARCH & DISPENSING ENTRY (FOCAL INTERACTION)
          ========================================================================= */}
      <section className="bg-white border border-[#DCE5E1] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="max-w-2xl">
          <span className="text-[11px] font-bold text-[#087F73] uppercase tracking-wider block">
            Clinical Lookup & Dispense
          </span>
          <h2 className="font-instrument text-2xl sm:text-3xl text-[#172321] mt-1">
            Medicine Search & Stock Availability
          </h2>
          <p className="text-xs text-[#667572] mt-1">
            Search by medicine name, generic title, ATC therapeutic classification, or batch number to inspect vault reserves and trigger automated FEFO dispensing.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-3xl">
          <div className="relative flex items-center rounded-2xl bg-[#F7F8F4] border-2 border-[#DCE5E1] hover:border-[#087F73] focus-within:border-[#087F73] focus-within:bg-white transition-all shadow-xs">
            <Search className="w-5 h-5 text-[#667572] absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medicine, ATC code, or batch lot (e.g. Paracetamol, N02BE, BTH-2401)..."
              className="w-full h-14 pl-12 pr-28 text-sm sm:text-base bg-transparent text-[#172321] placeholder-[#667572]/60 focus:outline-none rounded-2xl"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#667572] hover:text-[#172321] hover:bg-white transition-colors"
              >
                Clear
              </button>
            ) : (
              <span className="absolute right-3 px-2.5 py-1 rounded-xl bg-white border border-[#DCE5E1] text-[10px] font-bold text-[#667572] uppercase tracking-wider hidden sm:inline">
                Instant Lookup
              </span>
            )}
          </div>
        </div>

        {/* Search Results Display */}
        {searchQuery.trim() !== "" && (
          <div className="space-y-4 pt-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#667572]">
                Found {searchResults.length} medicine{searchResults.length === 1 ? "" : "s"}
              </span>
              <span className="text-xs text-[#087F73] font-semibold">Automated FEFO Priority</span>
            </div>

            {searchResults.length === 0 ? (
              <div className="p-8 text-center bg-[#F7F8F4] rounded-2xl border border-[#DCE5E1] space-y-2">
                <Pill className="w-8 h-8 text-[#667572]/40 mx-auto" />
                <p className="text-sm font-semibold text-[#172321]">
                  No medicines found matching &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="text-xs text-[#667572]">
                  Try searching for Paracetamol, Amoxicillin, Ibuprofen, Cefixime, or Salbutamol.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((med) => {
                  const isLow = med.totalStock <= med.reorderLevel;
                  const isOut = med.totalStock === 0;

                  return (
                    <div
                      key={med.id}
                      className="p-5 sm:p-6 rounded-2xl border border-[#DCE5E1] hover:border-[#087F73] bg-[#F7F8F4] transition-all space-y-4 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#DCE5E1]">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-wider">
                              {med.category}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#DCE5E1]/60 text-[#172321] font-mono font-semibold">
                              ATC: {med.atcCode}
                            </span>
                            {isOut ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FCEBEC] text-[#E56B6F] font-bold uppercase">
                                Out of Stock
                              </span>
                            ) : isLow ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FFF0D9] text-[#E9A23B] font-bold uppercase">
                                Low Stock
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#E5F3EE] text-[#087F73] font-bold uppercase">
                                Healthy Stock
                              </span>
                            )}
                          </div>

                          <h3 className="font-instrument text-2xl text-[#172321] mt-1">{med.name}</h3>
                          <p className="text-xs text-[#667572]">
                            {med.genericName} &bull; {med.dosageForm} &bull; Safety Reorder Threshold: {med.reorderLevel} units
                          </p>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <span className="text-[10px] uppercase font-bold text-[#667572] block">Available Total Stock</span>
                          <span className="font-bold text-2xl text-[#172321]">{med.totalStock}</span>
                          <span className="text-xs text-[#667572] ml-1">units</span>
                        </div>
                      </div>

                      {/* Batches with FEFO highlight */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#667572] block">
                          Vault Batches (Earliest Expiry First)
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {med.batches.map((batch) => (
                            <div
                              key={batch.id}
                              className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 text-xs transition-all ${
                                batch.isFefoFirst
                                  ? "bg-white border-[#087F73] ring-1 ring-[#087F73]/30"
                                  : "bg-white border-[#DCE5E1]"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-xs text-[#172321]">{batch.batchNumber}</span>
                                    {batch.isFefoFirst && (
                                      <span className="px-1.5 py-0.5 rounded-md bg-[#087F73] text-white text-[8.5px] font-bold uppercase">
                                        DISPENSE FIRST (FEFO)
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-[#667572] mt-0.5">
                                    Expires: <span className="font-semibold text-[#172321]">{batch.expiryDate}</span> ({batch.daysToExpiry}d left)
                                  </p>
                                </div>
                                <span className="font-bold text-sm text-[#172321] shrink-0">{batch.currentStock} units</span>
                              </div>

                              <button
                                onClick={() => handleOpenDispense(med, batch.id)}
                                disabled={batch.currentStock <= 0}
                                className={`w-full py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                  batch.isFefoFirst
                                    ? "bg-[#087F73] hover:bg-[#06655C] text-white shadow-xs"
                                    : "bg-[#F7F8F4] hover:bg-[#E5F3EE] text-[#172321] border border-[#DCE5E1]"
                                }`}
                              >
                                <span>{batch.currentStock <= 0 ? "Depleted" : "Select for Dispense"}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* =========================================================================
          4. STOCK HEALTH BREAKDOWN & NEAR-EXPIRY MONITORING
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Health Status */}
        <section className="bg-white border border-[#DCE5E1] rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE5E1]">
            <div>
              <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-wider block">
                Inventory Safeguards
              </span>
              <h2 className="font-instrument text-2xl text-[#172321]">Stock Health & Reorder Status</h2>
            </div>
            <button
              onClick={() => navigate("/pharmacist/stock")}
              className="text-xs text-[#087F73] font-semibold hover:underline"
            >
              View All Stock &rarr;
            </button>
          </div>

          {/* Health Category Indicators */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-2xl bg-[#E5F3EE] border border-[#087F73]/20 text-center">
              <span className="text-[10px] font-bold text-[#087F73] uppercase block">Healthy</span>
              <span className="text-xl font-bold text-[#087F73]">{healthyStockItems.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#FFF0D9] border border-[#E9A23B]/20 text-center">
              <span className="text-[10px] font-bold text-[#E9A23B] uppercase block">Low Stock</span>
              <span className="text-xl font-bold text-[#E9A23B]">{lowStockItems.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#FCEBEC] border border-[#E56B6F]/20 text-center">
              <span className="text-[10px] font-bold text-[#E56B6F] uppercase block">Out of Stock</span>
              <span className="text-xl font-bold text-[#E56B6F]">{outOfStockItems.length}</span>
            </div>
          </div>

          {/* Low Stock Items List */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#667572] block">
              Items Requiring Attention
            </span>

            {lowStockItems.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#E5F3EE]/40 border border-[#087F73]/20 text-xs text-[#087F73] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#087F73] shrink-0" />
                <span>All medicine reserves are currently above their clinical reorder thresholds.</span>
              </div>
            ) : (
              lowStockItems.slice(0, 4).map((med) => (
                <div
                  key={med.id}
                  className="p-3.5 rounded-2xl bg-[#F7F8F4] border border-[#DCE5E1] flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-semibold text-[#172321]">{med.name}</p>
                    <p className="text-[11px] text-[#667572]">
                      Reserve: <span className="font-bold text-[#E56B6F]">{med.totalStock} units</span> &bull; Reorder Level: {med.reorderLevel} units
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenDispense(med)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#DCE5E1] hover:border-[#087F73] text-[11px] font-semibold text-[#087F73] hover:bg-[#E5F3EE] transition-colors"
                  >
                    Dispense
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Batch Expiry Monitoring (FEFO) */}
        <section className="bg-white border border-[#DCE5E1] rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE5E1]">
            <div>
              <span className="text-[10px] font-bold text-[#E9A23B] uppercase tracking-wider block">
                FEFO Shelf-Life Queue
              </span>
              <h2 className="font-instrument text-2xl text-[#172321]">Expiring Batch Telemetry</h2>
            </div>
            <button
              onClick={() => navigate("/pharmacist/batches")}
              className="text-xs text-[#087F73] font-semibold hover:underline"
            >
              Batch Directory &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {expiringBatches.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#E5F3EE]/40 border border-[#087F73]/20 text-xs text-[#087F73] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#087F73] shrink-0" />
                <span>No active batches are expiring within the 90-day warning horizon.</span>
              </div>
            ) : (
              expiringBatches.slice(0, 4).map(({ batch, medicine }) => {
                const isCritical = batch.daysToExpiry <= 30;
                const isWarning = batch.daysToExpiry <= 60;

                return (
                  <div
                    key={batch.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-all ${
                      isCritical
                        ? "bg-[#FCEBEC]/40 border-[#E56B6F]/30"
                        : isWarning
                        ? "bg-[#FFF0D9]/40 border-[#E9A23B]/30"
                        : "bg-[#F7F8F4] border-[#DCE5E1]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#172321]">{batch.batchNumber}</span>
                        <span className="text-[11px] text-[#667572]">({medicine.name})</span>
                      </div>
                      <p className="text-[11px] text-[#667572] mt-0.5">
                        Expiry: <span className="font-semibold text-[#172321]">{batch.expiryDate}</span> &bull; Stock: {batch.currentStock} units
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          isCritical
                            ? "bg-[#E56B6F] text-white"
                            : isWarning
                            ? "bg-[#E9A23B] text-white"
                            : "bg-[#087F73] text-white"
                        }`}
                      >
                        {batch.daysToExpiry}d left
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* =========================================================================
          5. RECENT DISPENSING ACTIVITY & TRANSACTIONS FEED
          ========================================================================= */}
      <section className="bg-white border border-[#DCE5E1] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DCE5E1]">
          <div>
            <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-wider block">
              Audit & Telemetry Log
            </span>
            <h2 className="font-instrument text-2xl text-[#172321]">Recent Dispensing Transactions</h2>
          </div>
          <button
            onClick={() => navigate("/pharmacist/history")}
            className="text-xs text-[#087F73] font-semibold hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Full Dispense History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center bg-[#F7F8F4] rounded-2xl border border-[#DCE5E1] space-y-1">
            <History className="w-7 h-7 text-[#667572]/40 mx-auto" />
            <p className="text-xs font-semibold text-[#172321]">No dispensing transactions recorded today.</p>
            <p className="text-[11px] text-[#667572]">Executed fulfillments will appear here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DCE5E1] text-[10px] font-bold uppercase tracking-wider text-[#667572]">
                  <th className="pb-3 pr-4">Transaction ID</th>
                  <th className="pb-3 pr-4">Medicine & Batch</th>
                  <th className="pb-3 pr-4">Qty</th>
                  <th className="pb-3 pr-4">Prescription / Unit</th>
                  <th className="pb-3 pr-4">Dispensed By</th>
                  <th className="pb-3 pr-4">Timestamp</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE5E1]/60">
                {transactions.slice(0, 6).map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#F7F8F4] transition-colors">
                    <td className="py-3 pr-4 font-mono font-semibold text-[#172321]">{tx.transactionId}</td>
                    <td className="py-3 pr-4">
                      <span className="font-semibold text-[#172321] block">{tx.medicineName}</span>
                      <span className="font-mono text-[10px] text-[#667572]">{tx.batchNumber}</span>
                    </td>
                    <td className="py-3 pr-4 font-bold text-[#172321]">{tx.quantity}</td>
                    <td className="py-3 pr-4 text-[#667572]">
                      <span className="block font-medium text-[#172321]">{tx.patientId || "Outpatient"}</span>
                      <span className="text-[10px]">{tx.department || "General"}</span>
                    </td>
                    <td className="py-3 pr-4 text-[#667572]">{tx.dispensedBy}</td>
                    <td className="py-3 pr-4 text-[#667572] font-mono text-[11px]">{tx.timestamp}</td>
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E5F3EE] text-[#087F73] text-[10px] font-bold uppercase">
                        <CheckCircle2 className="w-3 h-3" />
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* =========================================================================
          6. QUICK ACTION SHORTCUTS (ACCESSIBLE CLINICAL FEATURES)
          ========================================================================= */}
      <section className="bg-white border border-[#DCE5E1] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="font-instrument text-2xl text-[#172321]">Pharmacist Quick Shortcuts</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Search Medicines", icon: Search, to: "/pharmacist/search", desc: "Instant Catalog" },
            { label: "Dispense Station", icon: Pill, to: "/pharmacist/dispense", desc: "Patient Fulfill" },
            { label: "Batch & Expiry", icon: Calendar, to: "/pharmacist/batches", desc: "FEFO Shelf Life" },
            { label: "Stock Lookup", icon: Package, to: "/pharmacist/stock", desc: "Shelf Balances" },
            { label: "Clinical Alerts", icon: AlertTriangle, to: "/pharmacist/alerts", desc: "Shortage & Risks" },
            { label: "Dispense History", icon: History, to: "/pharmacist/history", desc: "Audit Archive" },
          ].map(({ label, icon: Icon, to, desc }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-[#DCE5E1] hover:border-[#087F73] hover:bg-[#E5F3EE]/30 transition-all text-center group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#E5F3EE] flex items-center justify-center group-hover:bg-[#087F73]/20 transition-colors">
                <Icon className="w-4 h-4 text-[#087F73]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#172321]">{label}</p>
                <p className="text-[10px] text-[#667572]">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* =========================================================================
          7. CLINICAL DISPENSING MODAL
          ========================================================================= */}
      {dispenseMed && (
        <div className="fixed inset-0 bg-[#172321]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleConfirmDispense}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[#DCE5E1]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE5E1]">
              <div>
                <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-wider block">
                  Outpatient Dispensing Station
                </span>
                <h3 className="font-instrument text-2xl text-[#172321]">{dispenseMed.name}</h3>
                <p className="text-xs text-[#667572]">{dispenseMed.genericName} &bull; Total Available: {dispenseMed.totalStock} units</p>
              </div>
              <button
                type="button"
                onClick={() => setDispenseMed(null)}
                className="p-1.5 rounded-xl border border-[#DCE5E1] text-[#667572] hover:bg-[#F7F8F4] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {dispenseError && (
              <div className="p-3 rounded-xl bg-[#FCEBEC] border border-[#E56B6F]/30 text-xs text-[#E56B6F] font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{dispenseError}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* Batch Selection with FEFO Priority */}
              <div>
                <label className="block font-semibold text-[#172321] mb-1.5">
                  Select Dispensing Lot (FEFO Prioritized):
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {dispenseMed.batches.map((b) => (
                    <label
                      key={b.id}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedBatchId === b.id
                          ? "border-[#087F73] bg-[#E5F3EE]/40 ring-1 ring-[#087F73]"
                          : "border-[#DCE5E1] hover:bg-[#F7F8F4]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="dispenseBatch"
                          checked={selectedBatchId === b.id}
                          onChange={() => {
                            setSelectedBatchId(b.id);
                            setDispenseQuantity(Math.min(dispenseQuantity, b.currentStock));
                          }}
                          className="accent-[#087F73]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#172321]">{b.batchNumber}</span>
                            {b.isFefoFirst && (
                              <span className="px-1.5 py-0.5 rounded-md bg-[#087F73] text-white text-[8.5px] font-bold uppercase">
                                FEFO FIRST
                              </span>
                            )}
                          </div>
                          <span className="text-[#667572] text-[11px]">Expires: {b.expiryDate} ({b.daysToExpiry}d)</span>
                        </div>
                      </div>
                      <span className="font-bold text-[#172321]">{b.currentStock} avail</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block font-semibold text-[#172321] mb-1">
                  Quantity to Dispense (Units):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={dispenseMed.batches.find((b) => b.id === selectedBatchId)?.currentStock || 100}
                    value={dispenseQuantity}
                    onChange={(e) => setDispenseQuantity(Number(e.target.value))}
                    className="w-full h-11 px-4 rounded-xl border border-[#DCE5E1] bg-[#F7F8F4] text-sm font-bold text-[#172321] focus:outline-none focus:border-[#087F73]"
                    required
                  />
                  <div className="flex gap-1 shrink-0">
                    {[10, 20, 30, 50].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDispenseQuantity(preset)}
                        className="px-2.5 py-2 rounded-xl bg-[#F7F8F4] border border-[#DCE5E1] hover:bg-[#087F73] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prescription & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#172321] mb-1">Prescription / Patient ID</label>
                  <input
                    type="text"
                    value={dispensePatientId}
                    onChange={(e) => setDispensePatientId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#DCE5E1] bg-[#F7F8F4] text-[#172321] focus:outline-none focus:border-[#087F73]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#172321] mb-1">Dispensary Unit</label>
                  <input
                    type="text"
                    value={dispenseDepartment}
                    onChange={(e) => setDispenseDepartment(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#DCE5E1] bg-[#F7F8F4] text-[#172321] focus:outline-none focus:border-[#087F73]"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#DCE5E1] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setDispenseMed(null)}
                className="px-4 py-2 text-xs font-semibold text-[#667572] hover:text-[#172321] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingDispense || (dispenseMed.batches.find((b) => b.id === selectedBatchId)?.currentStock || 0) <= 0}
                className="px-6 py-3 bg-[#087F73] hover:bg-[#06655C] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isSubmittingDispense ? "Processing..." : "Confirm Dispense &rarr;"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PharmacistDashboard;
