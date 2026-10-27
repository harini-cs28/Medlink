import React from 'react';
import { RecommendationResult } from '../../types/prediction';
import { ShoppingCart, RefreshCw, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface RecommendationCardProps {
  rec?: RecommendationResult;
  recommendation?: RecommendationResult;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ rec, recommendation }) => {
  const data = rec || recommendation;
  if (!data) return null;
  const item = data;
  const getBadgeStyle = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'HIGH':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'NORMAL':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getIcon = () => {
    if (item.priority_level === 'URGENT') return <AlertOctagon className="w-5 h-5 text-purple-600" />;
    if (item.fefo_priority) return <RefreshCw className="w-5 h-5 text-amber-600" />;
    if (item.suggested_order_quantity > 0) return <ShoppingCart className="w-5 h-5 text-emerald-600" />;
    return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">{getIcon()}</div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.drug_name}</span>
              <h4 className="text-base font-bold text-slate-900">{item.primary_action}</h4>
            </div>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getBadgeStyle(item.priority_level)}`}>
            {item.priority_level}
          </span>
        </div>

        <p className="text-xs text-slate-600 mt-4 leading-relaxed">{item.action_details}</p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex gap-4">
          <div>
            <span className="text-slate-400 block text-[10px]">Shortage</span>
            <span className="font-bold text-slate-800">{item.shortage_risk}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Expiry</span>
            <span className="font-bold text-slate-800">{item.expiry_risk}</span>
          </div>
        </div>

        {item.suggested_order_quantity > 0 && (
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">Suggested Order</span>
            <span className="font-bold text-emerald-600">{item.suggested_order_quantity} units</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationCard;
