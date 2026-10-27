import React from 'react';
import { RiskLevel } from '../../types/prediction';

export interface RiskBadgeProps {
  level?: RiskLevel | string;
  risk?: RiskLevel | string;
  size?: 'sm' | 'md';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, risk, size = 'sm' }) => {
  const value = level || risk || 'LOW';
  const norm = String(value).toUpperCase();
  
  let styles = 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]';
  
  if (norm === 'LOW' || norm === 'SAFE' || norm === 'RESOLVED') {
    styles = 'bg-emerald-50 text-[#15803D] border-emerald-200';
  } else if (norm === 'MEDIUM' || norm === 'WATCH' || norm === 'WARNING') {
    styles = 'bg-amber-50 text-[#D97706] border-amber-200';
  } else if (norm === 'HIGH' || norm === 'CURRENT' || norm === 'SHORTAGE') {
    styles = 'bg-orange-50 text-orange-700 border-orange-200';
  } else if (norm === 'CRITICAL' || norm === 'EXPIRED' || norm === 'DISCONTINUED') {
    styles = 'bg-rose-50 text-[#DC2626] border-rose-200';
  }
  
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-semibold rounded-md border tracking-wide uppercase ${sizeClasses} ${styles}`}>
      {value}
    </span>
  );
};

export default RiskBadge;
