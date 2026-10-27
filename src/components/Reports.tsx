import React, { useEffect, useState } from 'react';
import { FileBarChart, Download, Eye, Layers, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { LoadingState } from './ui/LoadingState';
import { EmptyState } from './ui/EmptyState';
import { apiService } from '../services/api';
import { ReportItem, ModelMetrics } from '../types';

export const Reports: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [metrics, setMetrics] = useState<ModelMetrics[]>([]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [repRes, metRes] = await Promise.allSettled([
        apiService.getReports(),
        apiService.getModelMetrics()
      ]);

      if (repRes.status === 'fulfilled') {
        setReports(repRes.value || []);
      }
      if (metRes.status === 'fulfilled') {
        setMetrics(metRes.value || []);
      }
    } catch (err) {
      setReports([]);
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const defaultReportList: ReportItem[] = [
    {
      id: 'rep-01',
      title: 'Pharmaceutical Sales Time-Series Demand Audit',
      category: 'Demand Analysis',
      description: 'Granular consumption volume distribution, seasonal decomposition, and historical velocity across ATC classes.',
      generatedDate: 'Generated on Data Pipeline Sync',
      fileFormat: 'CSV',
      isAvailable: reports.some(r => r.id === 'rep-01')
    },
    {
      id: 'rep-02',
      title: 'FDA National Drug Shortage Registry Synthesis',
      category: 'Shortage Analysis',
      description: 'Aggregated frequency distributions, shortage statuses, reported manufacturing reasons, and therapeutic vulnerabilities.',
      generatedDate: 'Generated on Data Pipeline Sync',
      fileFormat: 'CSV',
      isAvailable: reports.some(r => r.id === 'rep-02')
    },
    {
      id: 'rep-03',
      title: 'Machine Learning Model Performance & Cross-Validation Benchmark',
      category: 'Model Performance',
      description: 'Comprehensive evaluation report comparing LightGBM, XGBoost, and Random Forest across MAE, RMSE, and F1-Scores.',
      generatedDate: 'Generated on Model Training',
      fileFormat: 'PDF',
      isAvailable: reports.some(r => r.id === 'rep-03')
    },
    {
      id: 'rep-04',
      title: 'Explainable AI & SHAP Feature Attribution Log',
      category: 'Explainable AI',
      description: 'Global beeswarm attribution plots and local feature contributions for audited high-risk shortage predictions.',
      generatedDate: 'Generated on XAI Execution',
      fileFormat: 'PDF',
      isAvailable: reports.some(r => r.id === 'rep-04')
    },
    {
      id: 'rep-05',
      title: 'Data Integrity, Schema Diagnostics & Missingness Audit',
      category: 'Data Quality',
      description: 'Data ingestion diagnostics report recording deduplications, missing value imputations, and chronological train/test splits.',
      generatedDate: 'Generated on Ingestion',
      fileFormat: 'JSON',
      isAvailable: reports.some(r => r.id === 'rep-05')
    }
  ];

  const activeReports = reports.length > 0 ? reports : defaultReportList;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Scientific Evaluation & Data Reports"
        subtitle="Reproducible audit exports, model validation summaries, and data quality diagnostics."
        badge="Audit Ready"
        action={
          <button
            onClick={fetchReports}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#1E293B] rounded-lg transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Refresh Reports</span>
          </button>
        }
      />

      {/* Model Benchmark Performance Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#F1F5F9]">
          <div>
            <h3 className="text-sm font-bold text-[#1E293B]">Model Cross-Validation Benchmarks</h3>
            <p className="text-xs text-[#64748B]">Rigorous evaluation on chronologically partitioned test data.</p>
          </div>
          <span className="text-xs font-medium text-[#0F766E] bg-[#E8F5F3] px-2.5 py-0.5 rounded-full">
            No Temporal Data Leakage
          </span>
        </div>

        {metrics.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] font-semibold">
                  <th className="py-2.5 px-3">Algorithm</th>
                  <th className="py-2.5 px-3">Model Type</th>
                  <th className="py-2.5 px-3 text-right">MAE</th>
                  <th className="py-2.5 px-3 text-right">RMSE</th>
                  <th className="py-2.5 px-3 text-right">R² Score</th>
                  <th className="py-2.5 px-3 text-right">Precision</th>
                  <th className="py-2.5 px-3 text-right">Recall</th>
                  <th className="py-2.5 px-3 text-right">F1-Score</th>
                  <th className="py-2.5 px-3 text-right">ROC-AUC</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {metrics.map((m, idx) => (
                  <tr key={idx} className="hover:bg-[#F8FAFC]">
                    <td className="py-2.5 px-3 font-semibold text-[#1E293B]">{m.modelName}</td>
                    <td className="py-2.5 px-3 text-[#64748B]">{m.modelType}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{m.mae ?? '—'}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{m.rmse ?? '—'}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#0F766E]">{m.r2Score ?? '—'}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{m.precision ?? '—'}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{m.recall ?? '—'}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#0F766E]">{m.f1Score ?? '—'}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{m.rocAuc ?? '—'}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-center">
            <p className="text-xs text-[#64748B]">
              Model performance metrics will populate here upon running evaluation pipelines in <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">09_model_evaluation.ipynb</code>.
            </p>
          </div>
        )}
      </div>

      {/* Available Audit & Analytical Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeReports.map((rep) => (
          <div
            key={rep.id}
            className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[11px] font-semibold text-[#0F766E] uppercase tracking-wider">
                  {rep.category}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-[#475569]">
                  {rep.fileFormat}
                </span>
              </div>

              <h4 className="font-bold text-sm text-[#1E293B] mb-1.5">{rep.title}</h4>
              <p className="text-xs text-[#64748B] leading-relaxed mb-4">{rep.description}</p>
            </div>

            <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
              <span className="text-[11px] text-[#94A3B8]">{rep.generatedDate}</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={!rep.isAvailable}
                  className="px-2.5 py-1 text-xs font-semibold text-[#0F766E] hover:bg-[#E8F5F3] disabled:opacity-40 disabled:hover:bg-transparent rounded transition-colors inline-flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
                <button
                  disabled={!rep.isAvailable}
                  className="px-2.5 py-1 text-xs font-semibold bg-[#0F766E] hover:bg-[#115E59] disabled:opacity-40 text-white rounded transition-colors inline-flex items-center gap-1 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
