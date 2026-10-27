import React, { useState } from 'react';
import {
  TriangleAlert,
  Search,
  Sparkles,
  HelpCircle,
  Activity,
  CheckCircle2,
  Info,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { RiskBadge } from './ui/RiskBadge';
import { LoadingState } from './ui/LoadingState';
import { EmptyState } from './ui/EmptyState';
import { SectionHeader } from './ui/SectionHeader';
import { apiService } from '../services/api';
import { PredictionResult, ShapFeature } from '../types';

export const ShortagePrediction: React.FC = () => {
  const [searchDrug, setSearchDrug] = useState<string>('Amoxicillin');
  const [loading, setLoading] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    if (!searchDrug.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.predictShortage(searchDrug);
      setPrediction(result);
    } catch (err: any) {
      setError(
        'Prediction service unavailable. The machine learning model (LightGBM/Random Forest) has not been trained or the backend endpoint is not reachable.'
      );
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Machine Learning Shortage Risk Prediction"
        subtitle="Empirical vulnerability classification trained on combined pharma consumption and FDA shortage histories."
        badge="Explainable AI Enabled"
      />

      {/* Drug Search / Selector */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
        <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">
          Select / Search Target Pharmaceutical
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchDrug}
              onChange={(e) => setSearchDrug(e.target.value)}
              placeholder="Enter active ingredient or generic name (e.g., Amoxicillin, Paracetamol, Ibuprofen)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#1E293B] focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
            />
          </div>
          <button
            onClick={handlePredict}
            disabled={loading || !searchDrug.trim()}
            className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            {loading ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Evaluate Shortage Risk</span>
          </button>
        </div>
        <p className="text-[11px] text-[#94A3B8] mt-2">
          Note: Inferences are executed exclusively on entities present in the connected data science datasets.
        </p>
      </div>

      {/* Error or Not Trained State */}
      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-800">
          <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold text-amber-900 mb-0.5">Model Not Trained Yet / Prediction Unavailable</div>
            <p className="leading-relaxed">{error}</p>
            <div className="mt-2 text-[11px] text-amber-700 font-medium">
              Run notebook <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">08_shortage_prediction.ipynb</code> or execute <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">python src/models/shortage_prediction.py</code> to train the classifier.
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <LoadingState
          message={`Executing ML Classification for "${searchDrug}"...`}
          subMessage="Evaluating lag demand variance, historical shortage occurrences, and computing SHAP attributions."
        />
      )}

      {/* Prediction Result Display */}
      {prediction && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Risk Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Shortage Risk Level</span>
                <RiskBadge level={prediction.riskLevel} size="md" />
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-bold text-[#1E293B] mb-1">{prediction.drugName}</h3>
                <div className="text-xs text-[#64748B]">
                  Evaluated Algorithm: <span className="font-mono text-[#1E293B]">{prediction.modelAlgorithm}</span>
                </div>
              </div>

              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg mb-4">
                <div className="text-xs text-[#64748B] mb-1">Shortage Likelihood Probability</div>
                <div className="text-3xl font-bold text-[#0F766E]">
                  {prediction.shortageProbabilityPercent}%
                </div>
                {prediction.expectedShortageDays && (
                  <div className="text-xs text-[#64748B] mt-1">
                    Estimated Stockout Horizon: <span className="font-semibold text-[#1E293B]">~{prediction.expectedShortageDays} Days</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#F1F5F9] text-[11px] text-[#94A3B8] flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Model Confidence: {(prediction.confidenceScore * 100).toFixed(1)}%</span>
                <span>Explainable AI Verified</span>
              </div>
              {prediction.datasetVersion && (
                <div className="flex justify-between text-[10px] text-[#64748B] pt-1 border-t border-slate-100">
                  <span>Data Version: <span className="font-mono font-semibold text-[#0F766E]">{prediction.datasetVersion}</span></span>
                  <span>Synced: {prediction.lastDataSync ? new Date(prediction.lastDataSync).toLocaleDateString() : 'Active'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Explainable AI / SHAP Attribution */}
          <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F1F5F9]">
              <div>
                <h3 className="text-[16px] font-semibold text-[#1E293B] flex items-center gap-1.5">
                  <span>Why This Prediction?</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#E8F5F3] text-[#0F766E] border border-[#0F766E]/20">
                    Explainable AI (SHAP)
                  </span>
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Mathematical feature attributions indicating risk contribution weights.
                </p>
              </div>
            </div>

            {prediction.shapExplanations && prediction.shapExplanations.length > 0 ? (
              <div className="space-y-3">
                {prediction.shapExplanations.map((factor, idx) => (
                  <div key={idx} className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#1E293B] mb-1.5">
                      <div className="flex items-center gap-1.5">
                        {factor.direction === 'increase_risk' ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#DC2626]" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5 text-[#15803D]" />
                        )}
                        <span>{factor.featureName}</span>
                      </div>
                      <span className="font-mono text-[#0F766E]">{factor.contributionPercent}% Weight</span>
                    </div>

                    <div className="w-full bg-[#E2E8F0] rounded-full h-1.5 mb-2 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          factor.direction === 'increase_risk' ? 'bg-[#DC2626]' : 'bg-[#15803D]'
                        }`}
                        style={{ width: `${Math.min(100, factor.contributionPercent)}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-[#64748B]">{factor.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[#64748B] py-8 text-center">
                SHAP feature contributions will be computed upon model training.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Initial Waiting State */}
      {!prediction && !loading && !error && (
        <EmptyState
          title="Awaiting Medicine Selection"
          description="Enter an active pharmaceutical name above to query the trained shortage prediction model and view explainable feature attributions."
          dataSource="Integrated Data Matrix & ML Classifier"
          minHeight="min-h-[220px]"
        />
      )}
    </div>
  );
};
