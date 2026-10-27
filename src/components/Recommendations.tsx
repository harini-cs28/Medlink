import React, { useEffect, useState } from 'react';
import { ShoppingCart, AlertCircle, TrendingUp, CheckCircle, RefreshCw, Layers } from 'lucide-react';
import { RiskBadge } from './ui/RiskBadge';
import { LoadingState } from './ui/LoadingState';
import { EmptyState } from './ui/EmptyState';
import { SectionHeader } from './ui/SectionHeader';
import { apiService } from '../services/api';
import { SmartRecommendation } from '../types';

export const Recommendations: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);

  const fetchRecs = async () => {
    setLoading(true);
    try {
      const data = await apiService.getRecommendations();
      setRecommendations(data || []);
    } catch (err) {
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Smart Procurement & Demand Recommendations"
        subtitle="Algorithmic operational suggestions derived from empirical consumption shifts and national shortage alerts."
        badge="Decision Support"
        action={
          <button
            onClick={fetchRecs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#1E293B] rounded-lg transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Refresh Insights</span>
          </button>
        }
      />

      {loading ? (
        <LoadingState
          message="Evaluating Demand Analytics & Shortage Signals..."
          subMessage="Generating recommendations based strictly on verified dataset patterns..."
        />
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs hover:border-[#CBD5E1] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-[#0F766E] shrink-0" />
                    <h3 className="font-bold text-sm text-[#1E293B]">{rec.drugOrCategory}</h3>
                  </div>
                  <RiskBadge level={rec.urgency} size="sm" />
                </div>

                <div className="text-xs font-semibold text-[#0F766E] mb-2">{rec.type}</div>

                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs space-y-2 mb-3">
                  <div>
                    <span className="font-semibold text-[#475569]">Analytical Rationale: </span>
                    <span className="text-[#64748B]">{rec.rationale}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#475569]">Recommended Action: </span>
                    <span className="text-[#1E293B] font-medium">{rec.suggestedAction}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#F1F5F9] text-[10px] text-[#94A3B8] flex justify-between">
                <span>Verified Recommendation</span>
                <span>Source: {rec.dataSource}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Awaiting Analytical Pipeline Output"
          description="Recommendations are derived automatically when sales data surges or FDA shortage notices trigger threshold conditions."
          dataSource="Pharma Sales + FDA Shortages"
          minHeight="min-h-[220px]"
        />
      )}
    </div>
  );
};
