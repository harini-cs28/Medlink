import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { pharmacyStore, MedicineItem, BatchItem, SystemAlert } from "../../services/pharmacyStore";
import apiService from "../../services/api";
import {
  RefreshCw, Package, AlertTriangle, ShoppingCart, ArrowRight,
  CheckCircle2, Truck, FileText, Sparkles, Lightbulb, LayoutDashboard,
  Wifi, WifiOff, Activity, Calendar,
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface DemandPoint { date: string; historicalDemand: number; forecastDemand?: number; }
interface ShortageRecord { id: string; drugName: string; status: string; reason: string; therapeuticCategory: string; riskLevel: string; }
interface Recommendation { id: string; drugOrCategory: string; type: string; urgency: string; rationale: string; suggestedAction: string; dataSource: string; }

const PENDING_STATUSES = ["ORDERED", "IN_TRANSIT"];
const INITIAL_ORDERS = [
  { id: "po-1", poNumber: "PO-2026-891", supplier: "Apex Pharma Ltd", status: "IN_TRANSIT", expectedDelivery: "Tomorrow, 10:00 AM" },
  { id: "po-2", poNumber: "PO-2026-890", supplier: "MedPharm Global", status: "ORDERED", expectedDelivery: "Oct 11, 2026" },
  { id: "po-3", poNumber: "PO-2026-888", supplier: "Novis Health", status: "STOCKED", expectedDelivery: "Oct 04, 2026" },
];

const exClass = (d: number) => d <= 30 ? "text-[#E56B6F] bg-[#FCEBEC]" : d <= 60 ? "text-[#E9A23B] bg-[#FFF0D9]" : "text-[#087F73] bg-[#E5F3EE]";
const exLabel = (d: number) => d <= 30 ? "Critical" : d <= 60 ? "Warning" : "Safe";
const uBorder = (u: string) => u === "HIGH" ? "border-[#E56B6F]/20 bg-[#FCEBEC]/40" : u === "MEDIUM" ? "border-[#E9A23B]/20 bg-[#FFF0D9]/40" : "border-[#087F73]/20 bg-[#E5F3EE]/40";
const aColors = (s: string) => s === "HIGH" ? { dot: "bg-[#E56B6F]", card: "border-[#E56B6F]/20 bg-[#FCEBEC]/40" } : s === "WARNING" ? { dot: "bg-[#E9A23B]", card: "border-[#E9A23B]/20 bg-[#FFF0D9]/40" } : { dot: "bg-[#087F73]", card: "border-[#087F73]/20 bg-[#E5F3EE]/40" };
const oBadge = (s: string) => s === "IN_TRANSIT" ? "bg-[#E9A23B]/10 text-[#E9A23B]" : s === "STOCKED" ? "bg-[#3FA66B]/10 text-[#3FA66B]" : s === "RECEIVED" ? "bg-[#087F73]/10 text-[#087F73]" : "bg-[#9B8AFB]/10 text-[#9B8AFB]";
const rBadge = (r: string) => r === "CRITICAL" ? "bg-[#FCEBEC] text-[#E56B6F]" : r === "HIGH" ? "bg-[#FFF0D9] text-[#E9A23B]" : "bg-[#E5F3EE] text-[#087F73]";
const uBadge = (u: string) => u === "HIGH" ? "bg-[#E56B6F]/20 text-[#E56B6F]" : u === "MEDIUM" ? "bg-[#E9A23B]/20 text-[#E9A23B]" : "bg-[#087F73]/10 text-[#087F73]";
const sRiskBadge = (r: string) => r === "HIGH" ? "bg-[#FCEBEC] text-[#E56B6F]" : r === "MEDIUM" ? "bg-[#FFF0D9] text-[#E9A23B]" : "bg-[#E5F3EE] text-[#087F73]";
const eRiskBadge = (r: string) => r === "HIGH" ? "bg-[#FCEBEC] text-[#E56B6F]" : r === "MEDIUM" ? "bg-[#FFF0D9] text-[#E9A23B]" : "bg-[#E5F3EE] text-[#087F73]";

const ATC: Record<string, string> = {
  M01AB: "Diclofenac", M01AE: "Ibuprofen", N02BA: "Aspirin", N02BE: "Paracetamol",
  N05B: "Anxiolytics", N05C: "Hypnotics", R03: "Airway/Asthma", R06: "Antihistamines",
};

export const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [demandData, setDemandData] = useState<DemandPoint[]>([]);
  const [demandAtc, setDemandAtc] = useState("N02BE");
  const [demandMeta, setDemandMeta] = useState<{ totalVolume?: number; avgDaily?: number; growthPercent?: number } | null>(null);
  const [shortages, setShortages] = useState<ShortageRecord[]>([]);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [loadingDemand, setLoadingDemand] = useState(false);
  const [loadingShortages, setLoadingShortages] = useState(false);
  const [loadingRec, setLoadingRec] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 4000); };

  const totalItems = medicines.length;
  const lowStock = medicines.filter(m => m.totalStock <= m.reorderLevel);
  const batches: Array<BatchItem & { medicineName: string }> = medicines.flatMap(m => m.batches.map(b => ({ ...b, medicineName: m.name })));
  const expiring = batches.filter(b => b.daysToExpiry <= 60 && b.currentStock > 0);
  const pendingOrders = INITIAL_ORDERS.filter(o => PENDING_STATUSES.includes(o.status));
  const buckets = {
    healthy: medicines.filter(m => m.totalStock > m.reorderLevel * 1.5).length,
    low: medicines.filter(m => m.totalStock > m.reorderLevel && m.totalStock <= m.reorderLevel * 1.5).length,
    critical: medicines.filter(m => m.totalStock > 0 && m.totalStock <= m.reorderLevel).length,
    out: medicines.filter(m => m.totalStock === 0).length,
  };
  const totalBuckets = Object.values(buckets).reduce((a, b) => a + b, 0);

  useEffect(() => {
    setMedicines(pharmacyStore.getMedicines());
    setAlerts(pharmacyStore.getAlerts());
    const unsub = pharmacyStore.subscribe(() => {
      setMedicines(pharmacyStore.getMedicines());
      setAlerts(pharmacyStore.getAlerts());
    });
    return unsub;
  }, []);

  const fetchDemand = useCallback(async (atc: string) => {
    setLoadingDemand(true);
    try {
      const r = await apiService.getDemandData(atc, "30D");
      setDemandData(r.dataPoints || []);
      setDemandMeta({ totalVolume: r.totalVolume, avgDaily: r.avgDaily, growthPercent: r.growthPercent });
      setBackendOnline(true);
    } catch {
      setBackendOnline(p => p === null ? false : p);
    } finally { setLoadingDemand(false); }
  }, []);

  const fetchShortages = useCallback(async () => {
    setLoadingShortages(true);
    try {
      const r = await apiService.getShortages({ limit: 5 });
      const backendRecords = r.records || [];
      // Merge with latest custom prediction telemetry
      const localPredsRaw = localStorage.getItem('medlink_latest_predictions');
      if (localPredsRaw) {
        try {
          const localPreds = JSON.parse(localPredsRaw);
          const formattedLocal: ShortageRecord[] = localPreds.map((p: any) => ({
            id: p.id,
            drugName: p.drugName,
            status: p.shortageRisk === 'CRITICAL' || p.shortageRisk === 'HIGH' ? 'Predicted Shortage' : 'Monitored',
            reason: `ML Predicted ${p.shortageRisk} risk (${(p.shortageProb * 100).toFixed(0)}%). Projected runout: ${p.runoutDays} days.`,
            therapeuticCategory: 'Custom Prediction',
            riskLevel: p.shortageRisk,
          }));
          setShortages([...formattedLocal, ...backendRecords].slice(0, 7));
          return;
        } catch {}
      }
      setShortages(backendRecords);
    } catch {} finally {
      setLoadingShortages(false);
    }
  }, []);

  const fetchRecs = useCallback(async () => {
    setLoadingRec(true);
    try {
      const r = await apiService.getRecommendations();
      setRecs(Array.isArray(r) ? r : (r as any).recommendations || []);
    } catch {} finally {
      setLoadingRec(false);
    }
  }, []);

  useEffect(() => {
    fetchDemand(demandAtc);
    fetchShortages();
    fetchRecs();
    setMedicines(pharmacyStore.getMedicines());
    setAlerts(pharmacyStore.getAlerts());
    setLastRefreshed(new Date());

    const unsub = pharmacyStore.subscribe(() => {
      setMedicines(pharmacyStore.getMedicines());
      setAlerts(pharmacyStore.getAlerts());
      fetchShortages();
    });
    return unsub;
  }, []); // eslint-disable-line
  useEffect(() => { fetchDemand(demandAtc); }, [demandAtc, fetchDemand]);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await Promise.allSettled([fetchDemand(demandAtc), fetchShortages(), fetchRecs()]);
      setMedicines(pharmacyStore.getMedicines());
      setAlerts(pharmacyStore.getAlerts());
      setLastRefreshed(new Date());
      showToast("Dashboard refreshed.");
    } finally { setRefreshing(false); }
  };

  const sortedAlerts = [...alerts]
    .filter(a => !a.isResolved)
    .sort((a, b) => { const o: Record<string, number> = { HIGH: 0, WARNING: 1, NORMAL: 2 }; return (o[a.severity] ?? 2) - (o[b.severity] ?? 2); })
    .slice(0, 6);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl bg-[#087F73] text-white text-xs font-semibold shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /><span>{toast}</span>
        </div>
      )}

      {/* HEADER */}
      <section className="border-b border-[#172321]/8 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#087F73]/10 text-[11px] font-semibold text-[#087F73] uppercase tracking-wider">
              <LayoutDashboard className="w-3 h-3" /><span>Pharmacy Operations</span>
            </div>
            <h1 className="font-instrument text-4xl sm:text-5xl font-normal text-[#172321] tracking-tight">
              Pharmacy <span className="italic text-[#087F73]">Overview</span>
            </h1>
            <p className="text-sm text-[#667572] max-w-2xl">
              Inventory health, shortage risk, batch expiry, and purchase orders{user?.fullName ? ` \u2014 ${user.fullName}` : ""}.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <button onClick={handleRefresh} disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${refreshing ? "border-[#087F73]/20 text-[#087F73]/50 cursor-not-allowed" : "border-[#087F73]/30 text-[#087F73] hover:bg-[#E5F3EE] cursor-pointer"}`}>
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "Refreshing\u2026" : "Refresh"}</span>
            </button>
            <div className={`flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full border ${backendOnline === true ? "bg-[#E5F3EE] text-[#087F73] border-[#087F73]/20" : backendOnline === false ? "bg-[#FFF0D9] text-[#E9A23B] border-[#E9A23B]/20" : "bg-[#F7F8F4] text-[#667572] border-[#172321]/10"}`}>
              {backendOnline === true ? (<><Wifi className="w-3 h-3" /><span>Connected</span></>) : backendOnline === false ? (<><WifiOff className="w-3 h-3" /><span>Offline</span></>) : (<><Activity className="w-3 h-3" /><span>Connecting\u2026</span></>)}
            </div>
            {lastRefreshed && <span className="text-[10px] text-[#667572]">Updated {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}
          </div>
        </div>
      </section>

      {/* KPI CARDS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => navigate("/manager/inventory")} className="bg-white border border-[#172321]/10 rounded-2xl p-5 text-left hover:border-[#087F73]/40 hover:shadow-sm transition-all group space-y-3">
          <div className="flex items-center justify-between"><span className="text-[10px] font-bold text-[#667572] uppercase tracking-wider">Total Stock Items</span><Package className="w-4 h-4 text-[#087F73]" /></div>
          <div><p className="font-instrument text-4xl text-[#172321]">{totalItems}</p><p className="text-[11px] text-[#667572] mt-0.5">Medicines in formulary</p></div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-[#087F73]"><span>View Inventory</span><ArrowRight className="w-3 h-3" /></div>
        </button>
        <button onClick={() => navigate("/manager/inventory")} className={`bg-white border rounded-2xl p-5 text-left hover:shadow-sm transition-all group space-y-3 ${lowStock.length > 0 ? "border-[#E9A23B]/30" : "border-[#172321]/10"}`}>
          <div className="flex items-center justify-between"><span className="text-[10px] font-bold text-[#667572] uppercase tracking-wider">Low Stock</span><AlertTriangle className={`w-4 h-4 ${lowStock.length > 0 ? "text-[#E9A23B]" : "text-[#667572]"}`} /></div>
          <div><p className={`font-instrument text-4xl ${lowStock.length > 0 ? "text-[#E9A23B]" : "text-[#172321]"}`}>{lowStock.length}</p><p className="text-[11px] text-[#667572] mt-0.5">{lowStock.length > 0 ? lowStock.slice(0, 2).map(m => m.name.split(" ")[0]).join(", ") : "All adequately stocked"}</p></div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-[#087F73]"><span>Review Stock</span><ArrowRight className="w-3 h-3" /></div>
        </button>
        <button onClick={() => navigate("/manager/inventory")} className={`bg-white border rounded-2xl p-5 text-left hover:shadow-sm transition-all group space-y-3 ${expiring.length > 0 ? "border-[#E56B6F]/30" : "border-[#172321]/10"}`}>
          <div className="flex items-center justify-between"><span className="text-[10px] font-bold text-[#667572] uppercase tracking-wider">Expiring Batches</span><Calendar className={`w-4 h-4 ${expiring.length > 0 ? "text-[#E56B6F]" : "text-[#667572]"}`} /></div>
          <div><p className={`font-instrument text-4xl ${expiring.length > 0 ? "text-[#E56B6F]" : "text-[#172321]"}`}>{expiring.length}</p><p className="text-[11px] text-[#667572] mt-0.5">{expiring.length > 0 ? "Within 60 days \u2014 FEFO review needed" : "No batches expiring soon"}</p></div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-[#087F73]"><span>View Batches</span><ArrowRight className="w-3 h-3" /></div>
        </button>
        <button onClick={() => navigate("/manager/purchases")} className="bg-white border border-[#172321]/10 rounded-2xl p-5 text-left hover:border-[#087F73]/40 hover:shadow-sm transition-all group space-y-3">
          <div className="flex items-center justify-between"><span className="text-[10px] font-bold text-[#667572] uppercase tracking-wider">Pending Orders</span><ShoppingCart className="w-4 h-4 text-[#087F73]" /></div>
          <div><p className="font-instrument text-4xl text-[#172321]">{pendingOrders.length}</p><p className="text-[11px] text-[#667572] mt-0.5">Active purchase orders</p></div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-[#087F73]"><span>View Orders</span><ArrowRight className="w-3 h-3" /></div>
        </button>
      </section>

      {/* INVENTORY HEALTH + EXPIRY RISK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-[#172321]/10 rounded-3xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div><span className="text-[10px] font-bold text-[#087F73] uppercase tracking-wider block">Stock Health</span><h2 className="font-instrument text-2xl text-[#172321]">Inventory Health</h2></div>
            <button onClick={() => navigate("/manager/inventory")} className="text-xs font-semibold text-[#087F73] hover:underline flex items-center gap-1"><span>View All</span><ArrowRight className="w-3.5 h-3.5" /></button>
          </div>
          {medicines.length === 0 ? <p className="text-xs text-[#667572] py-4 text-center">No inventory data.</p> : (
            <div className="space-y-4">
              {[
                { label: "Healthy Stock", count: buckets.healthy, color: "bg-[#087F73]", tc: "text-[#087F73]" },
                { label: "Low (near reorder)", count: buckets.low, color: "bg-[#E9A23B]", tc: "text-[#E9A23B]" },
                { label: "Critical (below reorder)", count: buckets.critical, color: "bg-[#E56B6F]", tc: "text-[#E56B6F]" },
                { label: "Out of Stock", count: buckets.out, color: "bg-[#172321]/30", tc: "text-[#172321]/50" },
              ].map(({ label, count, color, tc }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs"><span className="text-[#172321] font-medium">{label}</span><span className={`font-bold ${tc}`}>{count}</span></div>
                  <div className="h-2 rounded-full bg-[#F7F8F4] overflow-hidden"><div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: totalBuckets > 0 ? `${(count / totalBuckets) * 100}%` : "0%" }} /></div>
                </div>
              ))}
              <div className="pt-2 border-t border-[#172321]/6 flex items-center justify-between text-xs text-[#667572]">
                <span>{totalItems} medicines total</span>
                <span>{lowStock.length > 0 ? `${lowStock.length} need replenishment` : "All adequately stocked"}</span>
              </div>
            </div>
          )}
        </section>
        <section className="bg-white border border-[#172321]/10 rounded-3xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div><span className="text-[10px] font-bold text-[#087F73] uppercase tracking-wider block">FEFO Monitoring</span><h2 className="font-instrument text-2xl text-[#172321]">Expiry-Risk Batches</h2></div>
            <button onClick={() => navigate("/manager/inventory")} className="text-xs font-semibold text-[#087F73] hover:underline flex items-center gap-1"><span>View All</span><ArrowRight className="w-3.5 h-3.5" /></button>
          </div>
          {expiring.length === 0 ? (
            <div className="py-6 text-center space-y-2"><CheckCircle2 className="w-8 h-8 text-[#087F73] mx-auto" /><p className="text-sm font-medium text-[#172321]">No batches expiring within 60 days</p><p className="text-xs text-[#667572]">All batches are within safe shelf-life margins.</p></div>
          ) : (
            <div className="space-y-2">
              {expiring.sort((a, b) => a.daysToExpiry - b.daysToExpiry).slice(0, 5).map(b => (
                <div key={b.id} className="flex items-center justify-between py-2.5 border-b border-[#172321]/6 last:border-0">
                  <div><p className="text-sm font-semibold text-[#172321]">{b.medicineName}</p><p className="text-[10px] text-[#667572]">Batch {b.batchNumber} \u00b7 {b.currentStock} units</p></div>
                  <div className="text-right"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${exClass(b.daysToExpiry)}`}>{exLabel(b.daysToExpiry)}</span><p className="text-[10px] text-[#667572] mt-0.5">{b.daysToExpiry}d remaining</p></div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* DEMAND INTELLIGENCE */}
      <section className="bg-white border border-[#172321]/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#172321]/8">
          <div>
            <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-wider block">Historical Sales Data</span>
            <h2 className="font-instrument text-2xl text-[#172321]">Demand Intelligence</h2>
            <p className="text-xs text-[#667572] mt-0.5">30-day sales velocity from Pharma Sales dataset. Forecast is a linear trend projection.</p>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <select value={demandAtc} onChange={e => setDemandAtc(e.target.value)}
              className="text-xs bg-[#F7F8F4] border border-[#172321]/10 rounded-xl px-3 py-2 text-[#172321] focus:outline-none focus:border-[#087F73] cursor-pointer">
              {Object.entries(ATC).map(([k, v]) => <option key={k} value={k}>{k} \u2014 {v}</option>)}
            </select>
            {demandMeta && (
              <div className="flex items-center gap-3 text-[10px] text-[#667572]">
                <span>Avg: <strong className="text-[#172321]">{demandMeta.avgDaily}</strong>/day</span>
                <span>Vol: <strong className="text-[#172321]">{demandMeta.totalVolume}</strong></span>
                {demandMeta.growthPercent !== undefined && <span className={demandMeta.growthPercent > 0 ? "text-[#E56B6F]" : "text-[#087F73]"}>{demandMeta.growthPercent > 0 ? "\u2191" : "\u2193"} {Math.abs(demandMeta.growthPercent)}%</span>}
              </div>
            )}
          </div>
        </div>
        {loadingDemand ? (
          <div className="h-52 flex items-center justify-center"><div className="flex items-center gap-2 text-xs text-[#667572]"><RefreshCw className="w-4 h-4 animate-spin" /><span>Loading demand data\u2026</span></div></div>
        ) : demandData.length === 0 ? (
          <div className="h-52 flex items-center justify-center"><p className="text-xs text-[#667572]">{backendOnline === false ? "Backend offline \u2014 chart unavailable." : "No data for selected category."}</p></div>
        ) : (
          <>
            <div className="flex items-center gap-6 text-xs text-[#667572]">
              <div className="flex items-center gap-2"><span className="w-3 h-0.5 bg-[#087F73] inline-block" /><span>Historical</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-0.5 border-t-2 border-dashed border-[#9B8AFB] inline-block" /><span>Projection</span></div>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={demandData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v: string) => v.slice(5)} interval="preserveStartEnd" />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "11px" }} labelFormatter={(v) => `Date: ${String(v)}`} />
                  <Line type="monotone" dataKey="historicalDemand" stroke="#087F73" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="forecastDemand" stroke="#9B8AFB" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
        <div className="pt-2 border-t border-[#172321]/6 flex items-center justify-between text-xs text-[#667572]">
          <span>Source: Pharma Sales Dataset (Kaggle) \u00b7 Forecast: Linear extrapolation</span>
          <button onClick={() => navigate("/manager/predictions")} className="font-medium text-[#087F73] hover:underline">Full Predictions \u2192</button>
        </div>
      </section>

      {/* SHORTAGE RISK + RECOMMENDATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 bg-white border border-[#172321]/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#172321]/8">
            <div>
              <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-wider block">Rule-Based Assessment</span>
              <h2 className="font-instrument text-2xl text-[#172321]">FDA Shortage Risk Signals</h2>
              <p className="text-xs text-[#667572]">From FDA Drug Shortage Registry. Risk derived from shortage status classification.</p>
            </div>
            <button onClick={() => navigate("/manager/predictions")} className="text-xs font-semibold text-[#087F73] hover:underline flex items-center gap-1 shrink-0 self-start"><span>Full Analysis</span><ArrowRight className="w-3.5 h-3.5" /></button>
          </div>
          {loadingShortages ? (
            <div className="flex items-center gap-2 text-xs text-[#667572] py-4"><RefreshCw className="w-4 h-4 animate-spin" /><span>Loading\u2026</span></div>
          ) : shortages.length === 0 ? (
            <p className="text-xs text-[#667572] py-4">{backendOnline === false ? "Backend offline." : "No shortage records."}</p>
          ) : (
            <div className="space-y-2">
              {shortages.map(s => (
                <div key={s.id} className="flex items-start justify-between py-3 border-b border-[#172321]/6 last:border-0 gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-sm font-semibold text-[#172321] truncate">{s.drugName}</p>
                    <p className="text-[10px] text-[#667572] truncate">{s.therapeuticCategory} \u00b7 {s.reason}</p>
                    <p className="text-[10px] text-[#667572]">Status: <span className="font-medium text-[#172321]">{s.status}</span></p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase shrink-0 ${rBadge(s.riskLevel)}`}>{s.riskLevel}</span>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="lg:col-span-5 bg-white border border-[#172321]/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#172321]/8">
            <div className="flex items-center gap-2"><Lightbulb className="w-4 h-4 text-[#087F73]" /><h2 className="font-instrument text-2xl text-[#172321]">Recommendations</h2></div>
            <button onClick={() => navigate("/manager/recommendations")} className="text-xs font-semibold text-[#087F73] hover:underline flex items-center gap-1"><span>View All</span><ArrowRight className="w-3.5 h-3.5" /></button>
          </div>
          {loadingRec ? (
            <div className="flex items-center gap-2 text-xs text-[#667572] py-4"><RefreshCw className="w-4 h-4 animate-spin" /><span>Loading\u2026</span></div>
          ) : recs.length === 0 ? (
            <p className="text-xs text-[#667572] py-4">No recommendations from backend.</p>
          ) : (
            <div className="space-y-3">
              {recs.slice(0, 4).map(r => (
                <div key={r.id} className={`p-4 rounded-2xl border space-y-2 ${uBorder(r.urgency)}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-[#172321] leading-tight">{r.drugOrCategory}</p>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${uBadge(r.urgency)}`}>{r.urgency}</span>
                  </div>
                  <p className="text-[11px] text-[#667572] leading-relaxed">{r.rationale}</p>
                  <p className="text-[11px] font-semibold text-[#172321]">\u2192 {r.suggestedAction}</p>
                  <p className="text-[10px] text-[#667572]">Source: {r.dataSource}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ALERTS + PURCHASE ORDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 bg-white border border-[#172321]/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#172321]/8">
            <div><span className="text-[10px] font-bold text-[#087F73] uppercase tracking-wider block">Action Required</span><h2 className="font-instrument text-2xl text-[#172321]">Operational Alerts</h2></div>
            {sortedAlerts.length > 0 && <span className="px-2.5 py-1 rounded-full bg-[#E56B6F]/10 text-[#E56B6F] text-[10px] font-bold">{sortedAlerts.length} active</span>}
          </div>
          {sortedAlerts.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#087F73] mx-auto" />
              <p className="text-sm font-medium text-[#172321]">No outstanding alerts</p>
              <p className="text-xs text-[#667572]">All conditions are within normal thresholds.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedAlerts.map(a => {
                const c = aColors(a.severity);
                return (
                  <div key={a.id} className={`p-4 rounded-2xl border ${c.card} space-y-1.5`}>
                    <div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} /><p className="text-sm font-semibold text-[#172321]">{a.title}</p></div>
                    <p className="text-xs text-[#667572] leading-relaxed pl-4">{a.description}</p>
                    {a.department && <p className="text-[10px] text-[#667572] pl-4">Dept: {a.department}</p>}
                    <div className="flex items-center justify-between pl-4">
                      <span className="text-[10px] text-[#667572]">{a.timestamp}</span>
                      <button onClick={() => { if (a.type === "SHORTAGE") navigate("/manager/predictions"); else if (a.type === "EXPIRY") navigate("/manager/inventory"); else if (a.type === "SUPPLIER") navigate("/manager/suppliers"); else navigate("/manager/inventory"); }}
                        className="text-[10px] font-semibold text-[#087F73] hover:underline">
                        {a.type === "SHORTAGE" ? "Review Predictions \u2192" : a.type === "EXPIRY" ? "View Batches \u2192" : a.type === "SUPPLIER" ? "View Suppliers \u2192" : "View Inventory \u2192"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
        <section className="lg:col-span-5 bg-white border border-[#172321]/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#172321]/8">
            <div><span className="text-[10px] font-bold text-[#087F73] uppercase tracking-wider block">Procurement</span><h2 className="font-instrument text-2xl text-[#172321]">Purchase Orders</h2></div>
            <button onClick={() => navigate("/manager/purchases")} className="text-xs font-semibold text-[#087F73] hover:underline flex items-center gap-1"><span>View All</span><ArrowRight className="w-3.5 h-3.5" /></button>
          </div>
          <div className="space-y-3">
            {INITIAL_ORDERS.map(o => (
              <div key={o.id} className="flex items-center justify-between py-2.5 border-b border-[#172321]/6 last:border-0 gap-2">
                <div className="space-y-0.5 min-w-0">
                  <p className="text-sm font-mono font-bold text-[#087F73]">{o.poNumber}</p>
                  <p className="text-xs text-[#667572] truncate">{o.supplier}</p>
                  <p className="text-[10px] text-[#667572]">Delivery: {o.expectedDelivery}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase shrink-0 ${oBadge(o.status)}`}>{o.status.replace("_", " ")}</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/manager/purchases")} className="w-full py-2.5 rounded-xl border border-[#087F73]/20 text-xs font-semibold text-[#087F73] hover:bg-[#E5F3EE] transition-colors flex items-center justify-center gap-2">
            <ShoppingCart className="w-3.5 h-3.5" /><span>Manage Purchases</span>
          </button>
        </section>
      </div>

      {/* LIVE INVENTORY TABLE */}
      <section className="bg-white border border-[#172321]/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#172321]/8">
          <div><span className="text-[10px] font-bold text-[#087F73] uppercase tracking-wider block">Real-Time Stock</span><h2 className="font-instrument text-2xl text-[#172321]">Live Inventory Snapshot</h2></div>
          <button onClick={() => navigate("/manager/inventory")} className="text-xs font-semibold text-[#087F73] hover:underline flex items-center gap-1.5 self-start sm:self-auto"><span>Full Inventory</span><ArrowRight className="w-3.5 h-3.5" /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#172321]/12 text-[#667572]">
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Medicine</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Stock</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Reorder</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Shortage Risk</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Expiry Risk</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172321]/6">
              {medicines.map(med => (
                <tr key={med.id} className="hover:bg-[#F7F8F4] transition-colors">
                  <td className="py-4 font-semibold text-[#172321] text-sm"><div><span>{med.name}</span><span className="block text-[11px] font-normal text-[#667572]">{med.category}</span></div></td>
                  <td className="py-4"><span className={`font-bold text-sm ${med.totalStock <= med.reorderLevel ? "text-[#E56B6F]" : "text-[#172321]"}`}>{med.totalStock}</span><span className="text-[#667572] text-[11px] ml-1">units</span></td>
                  <td className="py-4 text-[#667572]">{med.reorderLevel}</td>
                  <td className="py-4"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${sRiskBadge(med.shortageRisk)}`}>{med.shortageRisk}</span></td>
                  <td className="py-4"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${eRiskBadge(med.expiryRisk)}`}>{med.expiryRisk}</span></td>
                  <td className="py-4 text-right">
                    <button onClick={() => navigate("/manager/inventory")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase transition-all ${med.recommendedAction === "Urgent Review" || med.recommendedAction === "Urgent Supplier Request" ? "bg-[#E56B6F] hover:bg-[#C95054] text-white" : med.recommendedAction === "Increase Reorder" || med.recommendedAction === "Reorder Safety Buffer" ? "bg-[#087F73] hover:bg-[#06655C] text-white" : "bg-[#F7F8F4] hover:bg-[#EEF3F0] text-[#172321] border border-[#172321]/10"}`}>
                      {med.recommendedAction}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="bg-white border border-[#172321]/10 rounded-3xl p-6 shadow-xs">
        <h2 className="font-instrument text-xl text-[#172321] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Inventory", icon: Package, to: "/manager/inventory", desc: "Stock & Batches" },
            { label: "Purchases", icon: ShoppingCart, to: "/manager/purchases", desc: "Orders & Reorder" },
            { label: "Suppliers", icon: Truck, to: "/manager/suppliers", desc: "Vendor Directory" },
            { label: "Predictions", icon: Sparkles, to: "/manager/predictions", desc: "Risk Modeling" },
            { label: "Recommendations", icon: Lightbulb, to: "/manager/recommendations", desc: "Action Insights" },
            { label: "Reports", icon: FileText, to: "/manager/reports", desc: "Compliance Export" },
          ].map(({ label, icon: Icon, to, desc }) => (
            <button key={to} onClick={() => navigate(to)} className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-[#172321]/10 hover:border-[#087F73]/40 hover:bg-[#E5F3EE]/30 transition-all text-center group">
              <div className="w-9 h-9 rounded-xl bg-[#087F73]/10 flex items-center justify-center group-hover:bg-[#087F73]/20 transition-colors"><Icon className="w-4 h-4 text-[#087F73]" /></div>
              <div><p className="text-xs font-semibold text-[#172321]">{label}</p><p className="text-[10px] text-[#667572]">{desc}</p></div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
export default ManagerDashboard;
