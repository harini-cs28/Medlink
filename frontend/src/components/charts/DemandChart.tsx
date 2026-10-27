import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface DemandChartProps {
  data: Array<{ date: string; volume: number; forecast?: number }>;
  title?: string;
}

export const DemandChart: React.FC<DemandChartProps> = ({
  data,
  title = 'Pharmaceutical Demand & Consumption Velocity',
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">{title}</h4>
          <span className="text-xs text-slate-500">Daily unit dispensing records (Pharma Sales)</span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0F766E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748B', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748B', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E293B',
                borderRadius: '8px',
                border: 'none',
                color: '#F8FAFC',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="#0F766E"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#demandGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DemandChart;
