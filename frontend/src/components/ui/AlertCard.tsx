import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { RiskBadge } from './RiskBadge';
import { RiskLevel } from '../../types/prediction';

interface AlertCardProps {
  title: string;
  subtitle?: string;
  details?: string;
  riskLevel: RiskLevel | string;
  date?: string;
  manufacturer?: string;
  reason?: string;
  dataSource?: string;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  title,
  subtitle,
  details,
  riskLevel,
  date,
  manufacturer,
  reason,
  dataSource = "FDA Drug Shortages",
}) => {
  const norm = String(riskLevel).toUpperCase();
  
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs hover:border-[#CBD5E1] transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {norm === 'CRITICAL' || norm === 'HIGH' ? (
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
          ) : norm === 'MEDIUM' ? (
            <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-[#2563EB] shrink-0" />
          )}
          <h4 className="text-sm font-semibold text-[#1E293B] line-clamp-1">{title}</h4>
        </div>
        <RiskBadge level={riskLevel} size="sm" />
      </div>

      {subtitle && <div className="text-xs text-[#64748B] mb-2">{subtitle}</div>}

      <div className="space-y-1 bg-[#F8FAFC] border border-[#F1F5F9] rounded-lg p-2.5 text-[11px] text-[#475569] mb-3">
        {manufacturer && (
          <div className="flex justify-between">
            <span className="text-[#94A3B8]">Manufacturer:</span>
            <span className="font-medium text-[#1E293B]">{manufacturer}</span>
          </div>
        )}
        {reason && (
          <div className="flex justify-between">
            <span className="text-[#94A3B8]">Reason Reported:</span>
            <span className="font-medium text-[#1E293B] line-clamp-1">{reason}</span>
          </div>
        )}
        {date && (
          <div className="flex justify-between">
            <span className="text-[#94A3B8]">Reported Date:</span>
            <span className="font-medium text-[#1E293B]">{date}</span>
          </div>
        )}
      </div>

      {details && <p className="text-xs text-[#64748B] mb-2 leading-relaxed">{details}</p>}

      <div className="flex items-center justify-between text-[10px] text-[#94A3B8] pt-2 border-t border-[#F1F5F9]">
        <span>Verified Record</span>
        <span>Source: {dataSource}</span>
      </div>
    </div>
  );
};
