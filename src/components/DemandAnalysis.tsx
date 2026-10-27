import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  Filter,
  RefreshCw,
  Info
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
  AreaChart,
  Area
} from 'recharts';
import { ChartCard } from './ui/ChartCard';
import { LoadingState } from './ui/LoadingState';
import { EmptyState } from './ui/EmptyState';
import { SectionHeader } from './ui/SectionHeader';
import { apiService } from '../services/api';
import { DemandData, ForecastData } from '../types';

export const DemandAnalysis: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('M01AB');
  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '90D'>('30D');
  const [horizon, setHorizon] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);
  const [demandData, setDemandData] = useState<DemandData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [demandRes, forecastRes] = await Promise.allSettled([
        apiService.getDemandData(selectedCategory, timeframe),
        apiService.getDemandForecast(selectedCategory, horizon)
      ]);

      if (demandRes.status === 'fulfilled') {
        setDemandData(demandRes.value);
      } else {
        setDemandData(null);
      }

      if (forecastRes.status === 'fulfilled') {
        setForecastData(forecastRes.value);
      } else {
        setForecastData(null);
      }
    } catch (err) {
      setDemandData(null);
      setForecastData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, timeframe, horizon]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Pharmaceutical Demand Analysis & Time-Series Forecasting"
        subtitle="Empirical consumption trajectories, rolling moving averages, and statistical ML projections."
        badge="Time-Series Engine"
        action={
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#1E293B] rounded-lg transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Re-evaluate Series</span>
          </button>
        }
      />

      {/* Control Filters Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              Therapeutic Category (ATC)
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5 font-medium text-[#1E293B] focus:outline-none focus:border-[#0F766E]"
            >
              <option value="M01AB">M01AB — Anti-inflammatory (Diclofenac/Acetic)</option>
              <option value="M01AE">M01AE — Anti-inflammatory (Ibuprofen/Propionic)</option>
              <option value="N02BA">N02BA — Analgesics (Aspirin/Salicylic)</option>
              <option value="N02BE">N02BE — Analgesics (Paracetamol/Anilides)</option>
              <option value="N05B">N05B — Anxiolytics (Diazepam/Alprazolam)</option>
              <option value="R03">R03 — Airway Diseases (Salbutamol)</option>
              <option value="R06">R06 — Antihistamines (Cetirizine)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              Historical Window
            </label>
            <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-lg text-xs font-medium text-[#64748B]">
              {(['7D', '30D', '90D'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    timeframe === tf ? 'bg-white text-[#0F766E] font-semibold shadow-2xs' : 'hover:text-[#1E293B]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              Forecast Horizon
            </label>
            <select
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value))}
              className="text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5 font-medium text-[#1E293B] focus:outline-none focus:border-[#0F766E]"
            >
              <option value={7}>7 Days Ahead</option>
              <option value={14}>14 Days Ahead</option>
              <option value={30}>30 Days Ahead</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading Time-Series Analysis..." subMessage="Computing historical demand statistics and ML forecast..." />
      ) : (
        <div className="space-y-6">
          {/* Main Forecasting Line Chart */}
          <ChartCard
            title={`Demand Curve & Forecast: ${selectedCategory}`}
            subtitle="Actual historical consumption vs. ML predictive forecast"
            dataSource="Pharma Sales (Kaggle)"
          >
            {demandData && demandData.dataPoints.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
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
                    name="Actual Sales (Units)"
                    stroke="#0F766E"
                    strokeWidth={2.5}
                    dot={{ r: 2 }}
                  />
                  {demandData.dataPoints.some((d) => d.forecastDemand !== undefined) && (
                    <Line
                      type="monotone"
                      dataKey="forecastDemand"
                      name="Forecast (LightGBM/XGBoost)"
                      stroke="#2563EB"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 2 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="Historical Demand Data Not Loaded"
                description="Load pharma_sales.csv via the backend pipeline to generate time-series analysis charts."
                dataSource="Pharma Sales (Kaggle)"
                minHeight="min-h-[260px]"
              />
            )}
          </ChartCard>

          {/* Forecasting Model Status Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#0F766E]" />
                <h3 className="text-sm font-bold text-[#1E293B]">Demand Forecasting Engine Status</h3>
              </div>
              <span className="text-xs text-[#64748B]">Time-Series Regressor</span>
            </div>

            {forecastData && forecastData.forecastTrained ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                  <div className="text-[#64748B] mb-0.5">Active Forecaster Algorithm</div>
                  <div className="font-mono font-bold text-[#1E293B]">{forecastData.modelUsed}</div>
                </div>
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                  <div className="text-[#64748B] mb-0.5">Evaluation Horizon</div>
                  <div className="font-bold text-[#0F766E]">{forecastData.horizonDays} Days Ahead</div>
                </div>
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                  <div className="text-[#64748B] mb-0.5">Chronological Cross-Validation</div>
                  <div className="font-bold text-emerald-700">Validated (No Temporal Leakage)</div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#64748B]">
                <div className="font-semibold text-[#1E293B] mb-1">Forecast Model Unavailable</div>
                <p>
                  Train the forecasting model by executing notebook <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">07_demand_analysis_and_forecasting.ipynb</code> or <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">python src/models/demand_forecasting.py</code>.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
