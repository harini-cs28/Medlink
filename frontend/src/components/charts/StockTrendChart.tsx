import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface StockTrendChartProps {
  data: Array<{ date: string; actual: number; predicted: number }>;
}

export const StockTrendChart: React.FC<StockTrendChartProps> = ({ data }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Stock Runway & Forecast Trajectory</h4>
          <span className="text-xs text-slate-500">Historical consumption vs LightGBM predictive model</span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E293B',
                borderRadius: '8px',
                border: 'none',
                color: '#F8FAFC',
                fontSize: '12px',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="actual" name="Historical Demand" stroke="#0F766E" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="predicted" name="Model Forecast" stroke="#3B82F6" strokeWidth={2} strokeDasharray="4 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockTrendChart;
