import React, { useEffect, useState } from 'react';
import { Package, Search, Filter, RefreshCw, Layers } from 'lucide-react';
import { DataTable, Column } from './ui/DataTable';
import { RiskBadge } from './ui/RiskBadge';
import { LoadingState } from './ui/LoadingState';
import { EmptyState } from './ui/EmptyState';
import { SectionHeader } from './ui/SectionHeader';
import { apiService } from '../services/api';
import { SalesRecord } from '../types';

export const Inventory: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await apiService.getInventoryData({ search, category: categoryFilter !== 'ALL' ? categoryFilter : undefined });
      setRecords(res.records || []);
    } catch (err) {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [categoryFilter]);

  const columns: Column<SalesRecord>[] = [
    {
      header: 'Medicine / Therapeutic Category',
      cell: (row) => (
        <div>
          <div className="font-semibold text-xs text-[#1E293B]">{row.categoryOrDrug}</div>
          {row.atcDescription && <div className="text-[11px] text-[#64748B]">{row.atcDescription}</div>}
        </div>
      ),
    },
    {
      header: 'Recorded Date / Interval',
      accessorKey: 'date',
    },
    {
      header: 'Sales Volume (Units)',
      cell: (row) => (
        <span className="font-mono font-semibold text-xs text-[#1E293B]">
          {row.volume !== undefined ? row.volume.toLocaleString() : '—'}
        </span>
      ),
      align: 'right',
    },
    {
      header: 'Consumption Velocity',
      cell: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
            row.demandTrend === 'Increasing'
              ? 'bg-rose-50 text-rose-700'
              : row.demandTrend === 'Decreasing'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {row.demandTrend || 'Stable'}
        </span>
      ),
      align: 'center',
    },
    {
      header: 'National Shortage Flag',
      cell: (row) => (
        <RiskBadge level={row.shortageStatus || 'SAFE'} size="sm" />
      ),
      align: 'center',
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Pharmaceutical Consumption & Transaction Ledger"
        subtitle="Empirical sales volume, frequency, and category-level demand indicators."
        badge="Pharma Sales Schema"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchInventory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#1E293B] rounded-lg transition-colors shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Refresh Ledger</span>
            </button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchInventory()}
            placeholder="Filter by drug name, ATC class (e.g., M01AB, N02BE)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#0F766E]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#64748B]" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-[#1E293B] focus:outline-none focus:border-[#0F766E]"
          >
            <option value="ALL">All Therapeutic Classes</option>
            <option value="M01AB">M01AB — Anti-inflammatory (Acetic)</option>
            <option value="M01AE">M01AE — Anti-inflammatory (Propionic)</option>
            <option value="N02BA">N02BA — Analgesics (Salicylic)</option>
            <option value="N02BE">N02BE — Analgesics (Anilides/Paracetamol)</option>
            <option value="N05B">N05B — Anxiolytics</option>
            <option value="R03">R03 — Airway / Respiratory</option>
            <option value="R06">R06 — Antihistamines</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingState message="Loading Consumption Data..." subMessage="Fetching sales records from real Pharma Sales dataset..." />
      ) : records.length > 0 ? (
        <DataTable
          columns={columns}
          data={records}
          keyExtractor={(item, idx) => item.id || `${item.categoryOrDrug}-${item.date}-${idx}`}
          dataSource="Pharma Sales Dataset (Kaggle)"
        />
      ) : (
        <EmptyState
          title="Waiting for Pharmaceutical Sales Records"
          description="No transaction records loaded from the backend. When pharma_sales.csv is processed by the Data Science pipeline, verified consumption records will display here."
          dataSource="Pharma Sales (Kaggle)"
          actionText="Retry API Ingestion"
          onAction={fetchInventory}
        />
      )}
    </div>
  );
};
