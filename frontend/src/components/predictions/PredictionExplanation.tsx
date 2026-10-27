import React from 'react';
import { ShapExplanation } from '../../types/prediction';
import { ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';

interface PredictionExplanationProps {
  explanations: ShapExplanation[];
}

export const PredictionExplanation: React.FC<PredictionExplanationProps> = ({ explanations }) => {
  if (!explanations || explanations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-[#0F766E]" />
        <h4 className="text-sm font-bold text-slate-900">SHAP Feature Attribution & Explainability</h4>
      </div>

      <p className="text-xs text-slate-500 mb-4">
        Feature-level influence breakdown indicating which variables elevated or mitigated the risk prediction.
      </p>

      <div className="space-y-3">
        {explanations.map((item, idx) => {
          const feature = item.featureName || item.feature || `Feature ${idx + 1}`;
          const isIncrease = item.direction === 'increase_risk' || item.impact === 'CRITICAL_INCREASE' || (item.weight && item.weight > 0);
          const weight = item.contributionPercent || (item.weight ? Math.abs(Math.round(item.weight * 100)) : 20);

          return (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">{feature}</span>
                <span
                  className={`inline-flex items-center gap-0.5 font-bold ${
                    isIncrease ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {isIncrease ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {isIncrease ? `+${weight}% Risk` : `-${weight}% Buffer`}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 leading-relaxed">{item.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PredictionExplanation;
