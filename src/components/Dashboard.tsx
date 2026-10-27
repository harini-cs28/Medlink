import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  Pill,
  TriangleAlert,
  TrendingUp,
  Activity,
  CheckCircle2,
  RefreshCw,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { MetricCard } from './ui/MetricCard';
import { ChartCard } from './ui/ChartCard';
import { AlertCard } from './ui/AlertCard';
import { LoadingState } from './ui/LoadingState';
import { EmptyState } from './ui/EmptyState';
import { SectionHeader } from './ui/SectionHeader';
import { apiService } from '../services/api';
import { DashboardData, DemandData, ShortageRecord } from '../types';

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [demandData, setDemandData] = useState<DemandData | null>(null);
  const [shortages, setShortages] = useState<ShortageRecord[]>([]);
  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '90D'>('30D');
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, demandRes, shortRes] = await Promise.allSettled([
        apiService.getDashboardData(),
        apiService.getDemandData('M01AB', timeframe),
        apiService.getShortageData({ limit: 4 })
      ]);

      if (dashRes.status === 'fulfilled') {
        setDashboardData(dashRes.value);
      }
      if (demandRes.status === 'fulfilled') {
        setDemandData(demandRes.value);
      }
      if (shortRes.status === 'fulfilled') {
        setShortages(shortRes.value.records);
      }
    } catch (err) {
      setError('Unable to reach FastAPI backend. Waiting for data pipeline synchronization.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  if (loading) {
    return <LoadingState message="Loading Data Science Dashboard..." subMessage="Aggregating records from Pharma Sales & FDA Shortages..." />;
  }

  const hasData = dashboardData && dashboardData.totalSalesRecords > 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <SectionHeader
        title="Medicine Intelligence Dashboard"
        subtitle="Monitor pharmaceutical demand, shortage patterns, and predictive insights."
        badge="Real Dataset Mode"
        action={
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#1E293B] rounded-lg transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Sync Data</span>
          </button>
        }
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Sales Records"
          value={dashboardData?.totalSalesRecords ? dashboardData.totalSalesRecords.toLocaleString() : undefined}
          subtitle="Empirical transaction logs"
          icon={<FileSpreadsheet className="w-4 h-4" />}
          dataSource="Pharma Sales (Kaggle)"
        />

        <MetricCard
          label="Monitored Medicines / Classes"
          value={dashboardData?.uniqueMedicines ? dashboardData.uniqueMedicines.toLocaleString() : undefined}
          subtitle="Active pharmaceutical categories"
          icon={<Pill className="w-4 h-4" />}
          dataSource="Pharma Sales (Kaggle)"
        />

        <MetricCard
          label="FDA Shortage Records"
          value={dashboardData?.shortageRecordsCount ? dashboardData.shortageRecordsCount.toLocaleString() : undefined}
          subtitle="National shortage alerts"
          icon={<TriangleAlert className="w-4 h-4" />}
          dataSource="FDA Drug Shortages"
        />

        <MetricCard
          label="Predicted High-Risk Items"
          value={dashboardData?.predictedHighRiskCount !== undefined ? dashboardData.predictedHighRiskCount : undefined}
          subtitle="Vulnerability threshold met"
          icon={<Activity className="w-4 h-4" />}
          trendText={dashboardData?.modelServiceReady ? 'ML Evaluated' : 'Awaiting Model'}
          trendType={dashboardData?.modelServiceReady ? 'positive' : 'neutral'}
          dataSource="Shortage Classifier"
        />
      </div>

      {/* Main Analytics Area: 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Demand Trend */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Pharmaceutical Demand Trend"
            subtitle="Historical sales volume and consumption trajectory"
            dataSource="Pharma Sales"
            controls={
              <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-lg text-[11px] font-medium text-[#64748B]">
                {(['7D', '30D', '90D'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      timeframe === tf ? 'bg-white text-[#0F766E] font-semibold shadow-2xs' : 'hover:text-[#1E293B]'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            }
          >
            {demandData && demandData.dataPoints.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={demandData.dataPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="historicalDemand"
                    name="Historical Sales Volume"
                    stroke="#0F766E"
                    strokeWidth={2}
                    dot={false}
                  />
                  {demandData.dataPoints.some((d) => d.forecastDemand !== undefined) && (
                    <Line
                      type="monotone"
                      dataKey="forecastDemand"
                      name="Model Forecast"
                      stroke="#2563EB"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="Waiting for Sales Data"
                description="Connect the FastAPI backend with pharma_sales.csv loaded in data/raw/ to view demand curves."
                dataSource="Pharma Sales Dataset"
                minHeight="min-h-[260px]"
              />
            )}
          </ChartCard>
        </div>

        {/* Right 1 Col: Shortage Status Breakdown */}
        <div>
          <ChartCard
            title="Shortage Overview"
            subtitle="Verified FDA status classifications"
            dataSource="FDA Drug Shortages"
          >
            {shortages.length > 0 ? (
              <div className="space-y-3 py-2">
                <div className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">
                  Active Shortage Records ({shortages.length})
                </div>
                {shortages.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-[#1E293B] truncate">{item.drugName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                        {item.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      {item.reason || 'Manufacturing Delay / Demand Surge'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Waiting for Shortage Records"
                description="FDA drug shortage records will appear once the backend ingests data/raw/fda_shortages/."
                dataSource="FDA Shortages"
                minHeight="min-h-[260px]"
              />
            )}
          </ChartCard>
        </div>
      </div>

      {/* Shortage Intelligence Alert Stream */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TriangleAlert className="w-4 h-4 text-[#D97706]" />
            <h2 className="text-base font-bold text-[#1E293B]">Shortage Intelligence Alerts</h2>
          </div>
          <span className="text-xs text-[#64748B]">Source: FDA Drug Shortages Registry</span>
        </div>

        {shortages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shortages.map((rec) => (
              <AlertCard
                key={rec.id}
                title={rec.drugName}
                subtitle={rec.therapeuticCategory || 'Therapeutic Formulation'}
                riskLevel={rec.riskLevel || 'HIGH'}
                date={rec.initialPostingDate || 'Recorded in Registry'}
                manufacturer={rec.dosageForm}
                reason={rec.reason}
                dataSource="FDA Drug Shortages"
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Active Shortage Alerts Detected"
            description="When shortage notifications are registered in the FDA database, they will stream here with verified details."
            dataSource="FDA Drug Shortages"
            minHeight="min-h-[160px]"
          />
        )}
      </div>
    </div>
  );
};
