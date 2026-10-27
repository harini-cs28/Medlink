import React from 'react';
import { TriangleAlert, ShieldCheck, Clock, TrendingUp } from 'lucide-react';
import { ShortagePredictionResult } from '../../types/prediction';
import { RiskBadge } from '../ui/RiskBadge';

interface ShortageRiskCardProps {
  prediction: ShortagePredictionResult;
}

export const ShortageRiskCard: React.FC<ShortageRiskCardProps> = ({ prediction }) => {
  const drug = prediction.drugName || prediction.drug_name || 'Pharmaceutical';
  const risk = prediction.riskLevel || prediction.shortage_risk || 'LOW';
  const prob = prediction.shortageProbabilityPercent ?? (prediction.shortage_probability ? prediction.shortage_probability * 100 : 15);
  const horizon = prediction.expectedShortageDays ?? prediction.runout_days_estimated ?? null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Shortage Vulnerability</span>
          <h3 className="text-xl font-bold text-slate-900 mt-0.5">{drug}</h3>
        </div>
        <RiskBadge risk={risk} />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-xs text-slate-500 font-medium">Predicted Probability</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{prob.toFixed(1)}%</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-xs text-slate-500 font-medium">Estimated Runout</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {horizon !== null ? `${horizon} days` : 'Safe Buffer'}
          </div>
        </div>
      </div>

      {prediction.recommendationSummary && (
        <div className="mt-4 p-3 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900">
          <span className="font-semibold">Procurement Insight: </span>
          {prediction.recommendationSummary}
        </div>
      )}
    </div>
  );
};

export default ShortageRiskCard;
