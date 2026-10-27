import React, { useEffect, useState } from 'react';
import {
  Clock,
  ShieldAlert,
  Database,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  Package,
  DollarSign
} from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { MetricCard } from './ui/MetricCard';
import { RiskBadge } from './ui/RiskBadge';
import { LoadingState } from './ui/LoadingState';
import { apiService } from '../services/api';
import { ExpiryRiskResponse, HospitalBatchRecord } from '../types';

interface ExpiryRiskProps {
  onNavigateDataManagement?: () => void;
}

export const ExpiryRisk: React.FC<ExpiryRiskProps> = ({ onNavigateDataManagement }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [expiryData, setExpiryData] = useState<ExpiryRiskResponse | null>(null);

  const fetchExpiryData = async () => {
    setLoading(true);
    try {
      const data = await apiService.getExpiryStatus();
      setExpiryData(data);
    } catch (err) {
      setExpiryData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiryData();
  }, []);

  if (loading) {
    return <LoadingState message="Auditing Shelf-Life Telemetry..." subMessage="Evaluating connected batch and expiration records..." />;
  }

  const isConnected = expiryData?.isAvailable && expiryData?.records && expiryData.records.length > 0;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Expiry Risk & Shelf-Life Management"
        subtitle={
          isConnected
            ? "Dynamic First-Expired-First-Out (FEFO) shelf-life monitoring and financial risk exposure."
            : "Batch expiration tracking and early liquidation alerts."
        }
        badge={isConnected ? "FEFO Engine Active" : "Data Boundary Audit"}
        action={
          isConnected ? (
            <button
              onClick={fetchExpiryData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#1E293B] rounded-lg transition-colors shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Refresh Batches</span>
            </button>
          ) : undefined
        }
      />

      {isConnected && expiryData.metrics ? (
        <div className="space-y-6">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Monitored Hospital Batches"
              value={expiryData.metrics.totalBatches.toLocaleString()}
              subtitle="Active clinical inventory lots"
              icon={<Package className="w-4 h-4" />}
              dataSource="Hospital Batch Ledger"
            />

            <MetricCard
              label="Expired Batches"
              value={expiryData.metrics.expiredBatches}
              subtitle="Immediate quarantine required"
              icon={<ShieldAlert className="w-4 h-4" />}
              trendText={expiryData.metrics.expiredBatches > 0 ? "Action Required" : "Zero Expired"}
              trendType={expiryData.metrics.expiredBatches > 0 ? "negative" : "positive"}
              dataSource="Hospital Batch Ledger"
            />

            <MetricCard
              label="Expiring Within 30 Days"
              value={expiryData.metrics.criticalBatches}
              subtitle="Liquidation / FEFO priority"
              icon={<Clock className="w-4 h-4" />}
              trendText={`${expiryData.metrics.unitsAtRisk.toLocaleString()} units`}
              trendType={expiryData.metrics.criticalBatches > 0 ? "neutral" : "positive"}
              dataSource="Hospital Batch Ledger"
            />

            <MetricCard
              label="Financial Exposure at Risk"
              value={`$${expiryData.metrics.financialExposure.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle="Value of expiring/expired lots"
              icon={<DollarSign className="w-4 h-4" />}
              dataSource="Unit Cost Ledger"
            />
          </div>

          {/* Batch Inventory Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#F1F5F9]">
              <div>
                <h3 className="text-sm font-bold text-[#1E293B]">Clinical Batch Expiration Ledger</h3>
                <p className="text-xs text-[#64748B]">Sorted by nearest expiration date for FEFO compliance.</p>
              </div>
              <span className="text-xs font-semibold text-[#0F766E] bg-[#E8F5F3] px-2.5 py-1 rounded-lg">
                Verified Expiration Data
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] font-semibold">
                    <th className="py-2.5 px-3">Medicine / Product</th>
                    <th className="py-2.5 px-3">Batch / Lot Number</th>
                    <th className="py-2.5 px-3">Expiration Date</th>
                    <th className="py-2.5 px-3 text-right">Stock Units</th>
                    <th className="py-2.5 px-3 text-right">Unit Cost</th>
                    <th className="py-2.5 px-3 text-right">Batch Value</th>
                    <th className="py-2.5 px-3 text-center">Days Remaining</th>
                    <th className="py-2.5 px-3 text-center">Shelf-Life Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {expiryData.records?.map((batch, idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAFC]">
                      <td className="py-2.5 px-3 font-semibold text-[#1E293B]">{batch.drug_name}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#64748B]">{batch.batch_number}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">{batch.expiry_date_str}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium">{batch.quantity.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#64748B]">${batch.unit_cost.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#1E293B]">${batch.total_batch_value.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        <span className={`font-semibold ${
                          batch.days_until_expiry < 0
                            ? 'text-rose-700'
                            : batch.days_until_expiry <= 30
                            ? 'text-amber-700'
                            : 'text-[#1E293B]'
                        }`}>
                          {batch.days_until_expiry < 0 ? `${Math.abs(batch.days_until_expiry)}d ago` : `${batch.days_until_expiry}d`}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <RiskBadge level={batch.risk_level === 'EXPIRED' ? 'CRITICAL' : batch.risk_level} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Professional Data Limitation State */
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-xs max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F5F3] text-[#0F766E] flex items-center justify-center mx-auto mb-4">
            <Clock className="w-7 h-7" />
          </div>

          <h2 className="text-lg font-bold text-[#1E293B] mb-2">Expiry Risk Analysis Module</h2>

          <p className="text-xs lg:text-sm text-[#64748B] max-w-xl mx-auto leading-relaxed mb-6">
            Expiry and batch information are not present in the currently connected public datasets
            (<span className="font-semibold text-[#1E293B]">Kaggle Pharma Sales</span> & <span className="font-semibold text-[#1E293B]">FDA Drug Shortages</span>).
            In accordance with strict scientific data integrity standards, fake or synthetic expiration records are not generated.
          </p>

          {/* Required Data Specification Box */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 text-left max-w-lg mx-auto mb-6">
            <div className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#0F766E]" />
              <span>Prerequisites to Activate Expiry Module</span>
            </div>

            <ul className="space-y-2 text-xs text-[#334155]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]"></span>
                <span><strong>Expiration Date (YYYY-MM-DD)</strong> — Verified shelf life timestamp</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]"></span>
                <span><strong>Batch / Lot Number</strong> — Traceable manufacturing batch identifier</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]"></span>
                <span><strong>Product / SKU Identifier</strong> — Unique hospital inventory code</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]"></span>
                <span><strong>Unit Acquisition Cost</strong> — For financial loss exposure computation</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F1F5F9] rounded-lg text-xs text-[#64748B]">
              <ShieldAlert className="w-4 h-4 text-[#D97706]" />
              <span>Upload a hospital inventory ledger CSV to activate FEFO tracking.</span>
            </div>

            {onNavigateDataManagement && (
              <button
                onClick={onNavigateDataManagement}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
              >
                <span>Upload Batch CSV</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
