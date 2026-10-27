import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  controls?: React.ReactNode;
  dataSource?: string;
  children: React.ReactNode;
  minHeight?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  controls,
  dataSource,
  children,
  minHeight = "min-h-[320px]"
}) => {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#F1F5F9]">
        <div>
          <h3 className="text-[16px] font-semibold text-[#1E293B]">{title}</h3>
          {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {controls}
          {dataSource && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded text-[#64748B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]"></span>
              {dataSource}
            </span>
          )}
        </div>
      </div>

      <div className={`w-full flex-1 flex flex-col justify-center ${minHeight}`}>
        {children}
      </div>
    </div>
  );
};
