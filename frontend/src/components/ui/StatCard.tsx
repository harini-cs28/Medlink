import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon: Icon,
  trend,
  className = '',
}) => {
  const displayTrend = trend || (change ? { value: change, isPositive } : undefined);
  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-all hover:border-slate-300 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        {(subtitle || displayTrend) && (
          <div className="mt-1 flex items-center gap-2 text-xs">
            {displayTrend && (
              <span className={`font-semibold ${displayTrend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {displayTrend.value}
              </span>
            )}
            {subtitle && <span className="text-slate-500">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
