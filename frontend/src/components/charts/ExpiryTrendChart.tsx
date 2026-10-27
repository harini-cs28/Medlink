import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface ExpiryTrendChartProps {
  data: Array<{ range: string; units: number }>;
}

export const ExpiryTrendChart: React.FC<ExpiryTrendChartProps> = ({ data }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Batch Expiration Timeline Analysis</h4>
          <span className="text-xs text-slate-500">Days to batch expiry thresholding</span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="range" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
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
            <Bar dataKey="units" fill="#F59E0B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpiryTrendChart;
