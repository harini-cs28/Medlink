import React from 'react';
import { Clock3, AlertCircle, DollarSign, PackageX } from 'lucide-react';
import { ExpiryRiskResult } from '../../types/prediction';
import { RiskBadge } from '../ui/RiskBadge';

interface ExpiryRiskCardProps {
  result?: ExpiryRiskResult;
  expiryData?: ExpiryRiskResult;
}

export const ExpiryRiskCard: React.FC<ExpiryRiskCardProps> = ({ result, expiryData }) => {
  const data = result || expiryData;
  if (!data) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Batch Expiry Assessment</span>
          <h3 className="text-xl font-bold text-slate-900 mt-0.5">{data.drug_name}</h3>
        </div>
        <RiskBadge risk={data.expiry_risk} />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
            <PackageX className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Unsold Units at Risk</div>
            <div className="text-xl font-bold text-slate-900">{data.expected_unsold_units} units</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Financial Exposure</div>
            <div className="text-xl font-bold text-slate-900">${data.estimated_financial_loss.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900">
        <span className="font-bold">FEFO Action: </span>
        {data.action_recommendation}
      </div>
    </div>
  );
};

export default ExpiryRiskCard;
