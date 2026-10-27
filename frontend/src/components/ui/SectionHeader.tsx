import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  action,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2 border-b border-[#E2E8F0]">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl lg:text-2xl font-bold text-[#1E293B] tracking-tight">{title}</h1>
          {badge && (
            <span className="px-2.5 py-0.5 bg-[#E8F5F3] text-[#0F766E] border border-[#0F766E]/20 text-xs font-semibold rounded-full">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs lg:text-sm text-[#64748B] mt-1">{subtitle}</p>}
      </div>

      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};
