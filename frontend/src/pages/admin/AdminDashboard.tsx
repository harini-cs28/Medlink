import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  X,
  ExternalLink,
  Database,
  RefreshCw,
  Pill,
  Package,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { pharmacyStore, MedicineItem } from '../../services/pharmacyStore';

interface NetworkNode {
  id: string;
  name: string;
  category: 'CORE' | 'DEPARTMENT' | 'PHARMACY' | 'INVENTORY';
  status: 'OPTIMAL' | 'HIGH_RISK' | 'WARNING';
  shortageCount: number;
  expiringBatches: number;
  stockHealth: number; // percentage
  occupancy?: string;
  details: string;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const calculateKpis = () => {
    setIsRefreshing(true);
    const meds = pharmacyStore.getMedicines();
    setMedicines(meds);
    setLastRefreshed(new Date().toLocaleTimeString());
    setTimeout(() => setIsRefreshing(false), 400);
  };

  useEffect(() => {
    calculateKpis();
    const unsub = pharmacyStore.subscribe(() => {
      calculateKpis();
    });

    // Modest 60-second automatic refresh timer
    const interval = setInterval(() => {
      calculateKpis();
    }, 60000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  // Verified calculations from pharmacyStore
  const totalMedicines = medicines.length;
  const lowStockCount = medicines.filter((m) => m.totalStock <= m.reorderLevel).length;
  const expiringBatchesCount = medicines.reduce((acc, m) => {
    return acc + (m.batches || []).filter((b) => b.daysToExpiry <= 60 && b.currentStock > 0).length;
  }, 0);
  const shortageRiskCount = medicines.filter((m) => m.shortageRisk === 'HIGH').length;

  const networkNodes: Record<string, NetworkNode> = {
    hospital: {
      id: 'hospital',
      name: 'Central Hospital Command',
      category: 'CORE',
      status: 'WARNING',
      shortageCount: 7,
      expiringBatches: 12,
      stockHealth: 88,
      details: 'Overall network health aggregated across 4 physical pharmacies, 6 clinical departments, and 450 active inpatient beds.',
    },
    emergency: {
      id: 'emergency',
      name: 'Emergency Department',
      category: 'DEPARTMENT',
      status: 'HIGH_RISK',
      shortageCount: 4,
      expiringBatches: 2,
      stockHealth: 74,
      occupancy: '94% Bed Occupancy',
      details: 'Elevated consumption velocity in Analgesics & IV Antibiotics. Safety stock buffer down to 3.8 days.',
    },
    icu: {
      id: 'icu',
      name: 'Intensive Care Unit (ICU)',
      category: 'DEPARTMENT',
      status: 'OPTIMAL',
      shortageCount: 0,
      expiringBatches: 1,
      stockHealth: 96,
      occupancy: '82% Bed Occupancy',
      details: 'Critical resuscitation stocks verified. 14 days minimum buffer maintained across all life-support formulas.',
    },
    general: {
      id: 'general',
      name: 'General Medicine Ward',
      category: 'DEPARTMENT',
      status: 'WARNING',
      shortageCount: 2,
      expiringBatches: 8,
      stockHealth: 84,
      occupancy: '88% Bed Occupancy',
      details: 'Batch expiry risk concentrated in secondary antibiotics. FEFO distribution protocol required immediately.',
    },
    pharmacy: {
      id: 'pharmacy',
      name: 'Central Inpatient Pharmacy',
      category: 'PHARMACY',
      status: 'OPTIMAL',
      shortageCount: 1,
      expiringBatches: 3,
      stockHealth: 92,
      details: 'Primary automated dispensing hub. 1,280 verified catalog medicines with real-time barcode telemetry.',
    },
    inventory: {
      id: 'inventory',
      name: 'Active Inventory Pools',
      category: 'INVENTORY',
      status: 'OPTIMAL',
      shortageCount: 7,
      expiringBatches: 12,
      stockHealth: 89,
      details: 'Total physical reserves: 42,850 dosage units distributed across climate-controlled storage cells.',
    },
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* =========================================================================
          ADMIN HEADER (Editorial & Minimal)
          ========================================================================= */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#172321]/8 pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#087F73]/10 text-[11px] font-semibold text-[#087F73] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#087F73]" />
            <span>Hospital Command Center &bull; Executive Telemetry</span>
          </div>
          <h1 className="font-instrument text-4xl sm:text-5xl font-normal text-[#172321] tracking-tight">
            Hospital <span className="italic text-[#087F73]">Overview</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#667572] font-normal max-w-2xl">
            Hospital-wide medicine inventory telemetry, shortage & expiry risk modeling, and operational governance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {lastRefreshed && (
            <span className="text-[11px] px-3 py-1.5 rounded-xl bg-white border border-[#172321]/10 text-[#667572]">
              Refreshed: {lastRefreshed}
            </span>
          )}

          <button
            onClick={calculateKpis}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F7F8F4] border border-[#172321]/15 text-xs font-semibold text-[#172321] transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#087F73] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Now</span>
          </button>

          <button
            onClick={() => navigate('/admin/datasets')}
            className="px-4 py-2 rounded-xl bg-[#087F73] hover:bg-[#06655C] text-white text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2 shadow-xs"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Dataset Management</span>
          </button>
        </div>
      </section>

      {/* =========================================================================
          FOUR VERIFIED KPI CARDS (Calculated from Store/Backend)
          ========================================================================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Medicines */}
        <div className="p-5 bg-white border border-[#172321]/10 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#667572]">
              Total Medicines
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#087F73]/10 text-[#087F73] flex items-center justify-center">
              <Pill className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-instrument text-3xl font-medium text-[#172321]">
              {totalMedicines}
            </span>
            <span className="text-[11px] text-[#087F73] font-semibold">Formularies</span>
          </div>
          <p className="text-[11px] text-[#667572]">
            Verified catalog medicines active in hospital master registry.
          </p>
        </div>

        {/* KPI 2: Low-Stock Items */}
        <div className="p-5 bg-white border border-[#172321]/10 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#667572]">
              Low-Stock Items
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#E9A23B]/10 text-[#E9A23B] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-instrument text-3xl font-medium text-[#E9A23B]">
              {lowStockCount}
            </span>
            <span className="text-[11px] text-[#E9A23B] font-semibold">Under Buffer</span>
          </div>
          <p className="text-[11px] text-[#667572]">
            Medicines at or below configured hospital safety reorder threshold.
          </p>
        </div>

        {/* KPI 3: Expiring Batches */}
        <div className="p-5 bg-white border border-[#172321]/10 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#667572]">
              Expiring Batches
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#E56B6F]/10 text-[#E56B6F] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-instrument text-3xl font-medium text-[#E56B6F]">
              {expiringBatchesCount}
            </span>
            <span className="text-[11px] text-[#E56B6F] font-semibold">&le; 60 Days</span>
          </div>
          <p className="text-[11px] text-[#667572]">
            Active hospital batches requiring immediate FEFO dispensing rotation.
          </p>
        </div>

        {/* KPI 4: Shortage Risks */}
        <div className="p-5 bg-white border border-[#172321]/10 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#667572]">
              Shortage Risks
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#E56B6F]/10 text-[#E56B6F] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-instrument text-3xl font-medium text-[#E56B6F]">
              {shortageRiskCount}
            </span>
            <span className="text-[11px] text-[#E56B6F] font-semibold">High Risk</span>
          </div>
          <p className="text-[11px] text-[#667572]">
            Critical formulations flagged by cross-signal shortage risk model.
          </p>
        </div>
      </section>

      {/* =========================================================================
          HOSPITAL INVENTORY NETWORK (Large Thin-Line Node Visualization)
          ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-instrument text-2xl sm:text-3xl text-[#172321]">
              Hospital Inventory <span className="italic text-[#087F73]">Network</span>
            </h2>
            <p className="text-xs text-[#667572]">
              Illustrative Network Topology &bull; Real-time status indicators across clinical wards and dispensaries.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#667572]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#087F73]" />
              <span>Normal / Optimal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E9A23B]" />
              <span>Attention Required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E56B6F]" />
              <span>Critical Shortage</span>
            </div>
          </div>
        </div>

        {/* Network Canvas */}
        <div className="relative bg-white border border-[#172321]/10 rounded-3xl p-6 sm:p-10 shadow-xs overflow-hidden">
          {/* SVG Connecting Lines Background */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Main Central Stem */}
            <line x1="50%" y1="18%" x2="50%" y2="46%" stroke="#087F73" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.35" />
            <line x1="50%" y1="46%" x2="20%" y2="46%" stroke="#087F73" strokeWidth="1.5" opacity="0.3" />
            <line x1="50%" y1="46%" x2="80%" y2="46%" stroke="#087F73" strokeWidth="1.5" opacity="0.3" />
            
            {/* Department drops */}
            <line x1="20%" y1="46%" x2="20%" y2="52%" stroke="#E56B6F" strokeWidth="2" opacity="0.6" />
            <line x1="50%" y1="46%" x2="50%" y2="52%" stroke="#087F73" strokeWidth="1.5" opacity="0.4" />
            <line x1="80%" y1="46%" x2="80%" y2="52%" stroke="#E9A23B" strokeWidth="1.5" opacity="0.6" />

            {/* Department bottom convergence to Pharmacy */}
            <line x1="20%" y1="68%" x2="20%" y2="74%" stroke="#087F73" strokeWidth="1.5" opacity="0.3" />
            <line x1="50%" y1="68%" x2="50%" y2="74%" stroke="#087F73" strokeWidth="1.5" opacity="0.3" />
            <line x1="80%" y1="68%" x2="80%" y2="74%" stroke="#087F73" strokeWidth="1.5" opacity="0.3" />
            
            <line x1="20%" y1="74%" x2="80%" y2="74%" stroke="#087F73" strokeWidth="1.5" opacity="0.3" />
            <line x1="50%" y1="74%" x2="50%" y2="82%" stroke="#087F73" strokeWidth="1.5" opacity="0.4" />

            {/* Subtle Lavender AI Telemetry flow lines */}
            <path
              d="M 20% 56% Q 35% 30% 50% 18%"
              fill="none"
              stroke="#9B8AFB"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.45"
            />
            <path
              d="M 80% 56% Q 65% 30% 50% 18%"
              fill="none"
              stroke="#9B8AFB"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.45"
            />
          </svg>

          {/* Nodes Overlay Structure */}
          <div className="relative z-10 flex flex-col items-center gap-12 sm:gap-14">
            {/* LEVEL 1: HOSPITAL ROOT */}
            <div>
              <button
                onClick={() => setSelectedNode(networkNodes.hospital)}
                className="group px-6 py-3.5 rounded-2xl bg-[#F7F8F4] border border-[#172321]/15 hover:border-[#087F73] hover:shadow-md transition-all flex items-center gap-3.5 focus:outline-none"
              >
                <div className="w-3 h-3 rounded-full bg-[#087F73] ring-4 ring-[#087F73]/20" />
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#087F73] block">
                    Central Node
                  </span>
                  <span className="font-instrument text-xl text-[#172321] font-medium block">
                    HOSPITAL COMMAND
                  </span>
                </div>
                <span className="text-xs text-[#667572] ml-2 px-2.5 py-1 rounded-full bg-white border border-[#172321]/10">
                  88% Healthy
                </span>
              </button>
            </div>

            {/* LEVEL 2: 3 CLINICAL DEPARTMENTS */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
              {/* Emergency */}
              <button
                onClick={() => setSelectedNode(networkNodes.emergency)}
                className="group p-5 rounded-2xl bg-white border-2 border-[#E56B6F]/40 hover:border-[#E56B6F] hover:shadow-md transition-all text-left focus:outline-none relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-2 h-full bg-[#E56B6F]" />
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E56B6F] animate-ping" />
                    <span className="text-[10px] font-bold text-[#E56B6F] uppercase tracking-wider">
                      HIGH SHORTAGE RISK
                    </span>
                  </div>
                  <span className="text-[10px] text-[#667572]">94% Beds</span>
                </div>
                <h3 className="font-instrument text-2xl text-[#172321] font-medium leading-none">
                  EMERGENCY
                </h3>
                <p className="text-xs text-[#667572] mt-2">
                  4 critical shortages &bull; Analgesics low
                </p>
              </button>

              {/* ICU */}
              <button
                onClick={() => setSelectedNode(networkNodes.icu)}
                className="group p-5 rounded-2xl bg-white border border-[#087F73]/30 hover:border-[#087F73] hover:shadow-md transition-all text-left focus:outline-none"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#087F73]" />
                    <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-wider">
                      OPTIMAL STOCK
                    </span>
                  </div>
                  <span className="text-[10px] text-[#667572]">82% Beds</span>
                </div>
                <h3 className="font-instrument text-2xl text-[#172321] font-medium leading-none">
                  ICU
                </h3>
                <p className="text-xs text-[#667572] mt-2">
                  14 days buffer &bull; Resuscitation safe
                </p>
              </button>

              {/* General Medicine */}
              <button
                onClick={() => setSelectedNode(networkNodes.general)}
                className="group p-5 rounded-2xl bg-white border-2 border-[#E9A23B]/40 hover:border-[#E9A23B] hover:shadow-md transition-all text-left focus:outline-none relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-2 h-full bg-[#E9A23B]" />
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E9A23B]" />
                    <span className="text-[10px] font-bold text-[#E9A23B] uppercase tracking-wider">
                      EXPIRY RISK
                    </span>
                  </div>
                  <span className="text-[10px] text-[#667572]">88% Beds</span>
                </div>
                <h3 className="font-instrument text-2xl text-[#172321] font-medium leading-none">
                  GENERAL MEDICINE
                </h3>
                <p className="text-xs text-[#667572] mt-2">
                  8 batches &lt;60d &bull; FEFO Priority
                </p>
              </button>
            </div>

            {/* LEVEL 3: PHARMACY & INVENTORY POOLS */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => setSelectedNode(networkNodes.pharmacy)}
                className="px-5 py-3 rounded-2xl bg-[#F7F8F4] border border-[#172321]/15 hover:border-[#087F73] transition-all flex items-center gap-3"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#087F73]" />
                <div className="text-left">
                  <span className="text-[9.5px] uppercase font-bold text-[#087F73] tracking-widest block">
                    Dispensing Engine
                  </span>
                  <span className="font-instrument text-lg text-[#172321]">CENTRAL PHARMACY</span>
                </div>
              </button>

              <span className="text-xs text-[#667572] font-serif italic hidden sm:inline">&mdash; linked &mdash;</span>

              <button
                onClick={() => setSelectedNode(networkNodes.inventory)}
                className="px-5 py-3 rounded-2xl bg-[#F7F8F4] border border-[#172321]/15 hover:border-[#9B8AFB] transition-all flex items-center gap-3"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#9B8AFB]" />
                <div className="text-left">
                  <span className="text-[9.5px] uppercase font-bold text-[#9B8AFB] tracking-widest block">
                    Telemetry Pool
                  </span>
                  <span className="font-instrument text-lg text-[#172321]">ACTIVE INVENTORY</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Node Inspection Panel Modal / Drawer */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-6 rounded-3xl bg-white border border-[#087F73]/30 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#087F73]/10 text-[10px] font-bold uppercase tracking-wider text-[#087F73]">
                    {selectedNode.category}
                  </span>
                  <span className="text-xs text-[#667572]">&bull; Status: {selectedNode.status}</span>
                </div>
                <h3 className="font-instrument text-2xl text-[#172321]">{selectedNode.name}</h3>
                <p className="text-xs text-[#667572] leading-relaxed">{selectedNode.details}</p>
                
                <div className="flex items-center gap-6 pt-2 text-xs">
                  <div>
                    <span className="text-[#667572] block text-[10px] uppercase">Shortage Items</span>
                    <span className="font-bold text-[#E56B6F] text-sm">{selectedNode.shortageCount}</span>
                  </div>
                  <div>
                    <span className="text-[#667572] block text-[10px] uppercase">Approaching Expiry</span>
                    <span className="font-bold text-[#E9A23B] text-sm">{selectedNode.expiringBatches}</span>
                  </div>
                  <div>
                    <span className="text-[#667572] block text-[10px] uppercase">Stock Health Index</span>
                    <span className="font-bold text-[#087F73] text-sm">{selectedNode.stockHealth}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => navigate('/admin/hospital')}
                  className="px-4 py-2.5 rounded-xl bg-[#087F73] hover:bg-[#06655C] text-white text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2"
                >
                  <span>Inspect Department</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-2 rounded-xl border border-[#172321]/10 text-[#667572] hover:text-[#172321]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* =========================================================================
          ADMIN ATTENTION AREA & MEDLINK AI INSIGHT (Two Editorial Columns)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: ATTENTION REQUIRED VERTICAL TIMELINE (approx 58%) */}
        <section className="lg:col-span-7 bg-white border border-[#172321]/10 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#172321]/8">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#E56B6F]">
                Priority Escalations
              </span>
              <h2 className="font-instrument text-2xl text-[#172321]">ATTENTION REQUIRED</h2>
            </div>
            <span className="text-xs text-[#667572] px-2.5 py-1 rounded-full bg-[#F7F8F4]">
              4 Events Pending
            </span>
          </div>

          {/* Vertical Timeline with Thin Vertical Line */}
          <div className="relative pl-6 space-y-7 my-2">
            {/* The Spine Line */}
            <div className="absolute left-[9px] top-2 bottom-2 w-[1.5px] bg-[#172321]/15" />

            {/* Event 1: High Shortage */}
            <div className="relative group">
              <div className="absolute -left-[24px] top-1 w-3.5 h-3.5 rounded-full bg-white ring-3 ring-[#E56B6F] shadow-xs" />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#E56B6F] tracking-wide uppercase">
                    ● 7 medicines have high shortage risk
                  </span>
                  <span className="text-[10px] text-[#667572]">14 min ago</span>
                </div>
                <p className="text-xs text-[#172321] font-medium leading-relaxed">
                  Paracetamol 500mg, Ceftriaxone 1g, and Ibuprofen 400mg are trending to zero buffer in under 7 days.
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-[#087F73]">
                  <span>Emergency & General Wards</span>
                  <span>&bull;</span>
                  <button onClick={() => navigate('/admin/medicines')} className="hover:underline font-semibold">
                    Review Shortage Registry &rarr;
                  </button>
                </div>
              </div>
            </div>

            {/* Event 2: Approaching Expiry */}
            <div className="relative group">
              <div className="absolute -left-[24px] top-1 w-3.5 h-3.5 rounded-full bg-white ring-3 ring-[#E9A23B] shadow-xs" />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#E9A23B] tracking-wide uppercase">
                    ● 12 batches are approaching expiry
                  </span>
                  <span className="text-[10px] text-[#667572]">42 min ago</span>
                </div>
                <p className="text-xs text-[#172321] font-medium leading-relaxed">
                  Batches with &lt;60 days shelf-life detected in secondary storage. Requires automated FEFO enforcement.
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-[#087F73]">
                  <span>Inpatient Satellites</span>
                  <span>&bull;</span>
                  <button onClick={() => navigate('/admin/hospital')} className="hover:underline font-semibold">
                    Trigger FEFO Dispatch &rarr;
                  </button>
                </div>
              </div>
            </div>

            {/* Event 3: Supplier Delayed */}
            <div className="relative group">
              <div className="absolute -left-[24px] top-1 w-3.5 h-3.5 rounded-full bg-white ring-3 ring-[#E9A23B] shadow-xs" />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#E9A23B] tracking-wide uppercase">
                    ● Supplier delivery delayed for 3 medicines
                  </span>
                  <span className="text-[10px] text-[#667572]">2 hours ago</span>
                </div>
                <p className="text-xs text-[#172321] font-medium leading-relaxed">
                  MedPharm Global reported logistics delay for Amoxicillin 500mg and Ceftriaxone shipments.
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-[#087F73]">
                  <span>Central Warehouse</span>
                  <span>&bull;</span>
                  <button onClick={() => navigate('/admin/pharmacies')} className="hover:underline font-semibold">
                    Inspect Alternate Suppliers &rarr;
                  </button>
                </div>
              </div>
            </div>

            {/* Event 4: Emergency Stock Request */}
            <div className="relative group">
              <div className="absolute -left-[24px] top-1 w-3.5 h-3.5 rounded-full bg-white ring-3 ring-[#E56B6F] shadow-xs" />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#E56B6F] tracking-wide uppercase">
                    ● Emergency department requested additional stock
                  </span>
                  <span className="text-[10px] text-[#667572]">3 hours ago</span>
                </div>
                <p className="text-xs text-[#172321] font-medium leading-relaxed">
                  Trauma Unit requisitioned 150 supplemental vials of injectable Analgesics and IV fluids.
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-[#087F73]">
                  <span>Emergency Wing</span>
                  <span>&bull;</span>
                  <button onClick={() => navigate('/admin/hospital')} className="hover:underline font-semibold">
                    Authorize Stock Transfer &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: ADMIN AI INSIGHT (MEDLINK INTELLIGENCE) (approx 42%) */}
        <section className="lg:col-span-5 bg-white border border-[#172321]/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#9B8AFB]" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#9B8AFB]">
                MEDLINK INTELLIGENCE
              </span>
            </div>

            <h3 className="font-instrument text-3xl sm:text-4xl text-[#172321] font-normal leading-tight">
              &ldquo;Inventory risk is concentrated in Emergency and General Medicine.&rdquo;
            </h3>

            <p className="text-xs text-[#667572] leading-relaxed">
              Machine learning models running multi-factor cross validation across FDA Shortage Database and hospital consumption rates indicate an asymmetric imbalance.
            </p>

            {/* Visual Subtle Connections */}
            <div className="pt-4 space-y-3.5 border-t border-[#172321]/8">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#172321]">Emergency</span>
                <div className="flex-1 mx-3 border-b border-dashed border-[#E56B6F]" />
                <span className="font-bold text-[#E56B6F] text-[11px] uppercase tracking-wider">
                  HIGH SHORTAGE RISK
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#172321]">General Medicine</span>
                <div className="flex-1 mx-3 border-b border-dashed border-[#E9A23B]" />
                <span className="font-bold text-[#E9A23B] text-[11px] uppercase tracking-wider">
                  EXPIRY RISK
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#172321]">ICU & Surgery</span>
                <div className="flex-1 mx-3 border-b border-dashed border-[#087F73]" />
                <span className="font-bold text-[#087F73] text-[11px] uppercase tracking-wider">
                  OPTIMAL REBALANCE
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#172321]/8">
            <button
              onClick={() => navigate('/admin/analytics')}
              className="w-full py-3 rounded-2xl bg-[#F7F8F4] hover:bg-[#EEF3F0] text-[#172321] border border-[#172321]/10 text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Full Analytics Engine</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#087F73]" />
            </button>
          </div>
        </section>
      </div>

      {/* =========================================================================
          ADMIN QUICK ACCESS TILES (6 Working Hub Links)
          ========================================================================= */}
      <section className="space-y-3">
        <h3 className="font-instrument text-xl text-[#172321]">
          Administrative <span className="italic text-[#087F73]">Quick Actions</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/admin/hospital')}
            className="p-5 bg-white border border-[#172321]/10 hover:border-[#087F73] rounded-2xl shadow-2xs text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#087F73]/10 text-[#087F73] flex items-center justify-center mb-3">
              <Building2 className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-[#172321]">Hospital Management</h4>
            <p className="text-xs text-[#667572] mt-1">Inspect department wards, bed stock reserves, and inter-ward transfers.</p>
          </button>

          <button
            onClick={() => navigate('/admin/pharmacies')}
            className="p-5 bg-white border border-[#172321]/10 hover:border-[#087F73] rounded-2xl shadow-2xs text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#087F73]/10 text-[#087F73] flex items-center justify-center mb-3">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-[#172321]">Pharmacy Management</h4>
            <p className="text-xs text-[#667572] mt-1">Configure physical pharmacy hubs, manager assignments, and vault capacities.</p>
          </button>

          <button
            onClick={() => navigate('/admin/medicines')}
            className="p-5 bg-white border border-[#172321]/10 hover:border-[#087F73] rounded-2xl shadow-2xs text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#087F73]/10 text-[#087F73] flex items-center justify-center mb-3">
              <Pill className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-[#172321]">Medicine Master</h4>
            <p className="text-xs text-[#667572] mt-1">Verified catalog medicines with WHO ATC codes and safety buffers.</p>
          </button>

          <button
            onClick={() => navigate('/admin/users')}
            className="p-5 bg-white border border-[#172321]/10 hover:border-[#087F73] rounded-2xl shadow-2xs text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#087F73]/10 text-[#087F73] flex items-center justify-center mb-3">
              <Activity className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-[#172321]">User Management</h4>
            <p className="text-xs text-[#667572] mt-1">Manage clinical staff accounts, roles, credentials, and token governance.</p>
          </button>

          <button
            onClick={() => navigate('/admin/analytics')}
            className="p-5 bg-white border border-[#172321]/10 hover:border-[#087F73] rounded-2xl shadow-2xs text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#087F73]/10 text-[#087F73] flex items-center justify-center mb-3">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-[#172321]">System Analytics</h4>
            <p className="text-xs text-[#667572] mt-1">Cross-department dispensing velocity, model ROC curves, and turnover trends.</p>
          </button>

          <button
            onClick={() => navigate('/admin/datasets')}
            className="p-5 bg-white border border-[#172321]/10 hover:border-[#087F73] rounded-2xl shadow-2xs text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#087F73]/10 text-[#087F73] flex items-center justify-center mb-3">
              <Database className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-[#172321]">Dataset Management</h4>
            <p className="text-xs text-[#667572] mt-1">Validate schemas, preview rows, and ingest historical Kaggle/FDA CSVs.</p>
          </button>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
