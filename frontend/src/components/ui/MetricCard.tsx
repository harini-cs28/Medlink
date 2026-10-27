import React from 'react';

interface MetricCardProps {
  label: string;
  value?: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trendText?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  dataSource?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  trendText,
  trendType = 'neutral',
  dataSource,
}) => {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs hover:border-[#CBD5E1] transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-[#64748B] uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-[#E8F5F3] text-[#0F766E] flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>

      <div className="mb-2">
        <div className="text-2xl lg:text-3xl font-bold text-[#1E293B] tracking-tight">
          {value !== undefined && value !== null ? value : <span className="text-sm font-normal text-[#94A3B8]">Waiting for data</span>}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9] text-xs">
        {subtitle && <span className="text-[#64748B] text-[12px] truncate">{subtitle}</span>}
        {trendText && (
          <span
            className={`font-medium text-[11px] px-1.5 py-0.5 rounded ${
              trendType === 'positive'
                ? 'bg-emerald-50 text-[#15803D]'
                : trendType === 'negative'
                ? 'bg-rose-50 text-[#DC2626]'
                : 'bg-slate-100 text-[#64748B]'
            }`}
          >
            {trendText}
          </span>
        )}
      </div>

      {dataSource && (
        <div className="mt-2 text-[10px] text-[#94A3B8] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]"></span>
          <span>Source: {dataSource}</span>
        </div>
      )}
    </div>
  );
};
