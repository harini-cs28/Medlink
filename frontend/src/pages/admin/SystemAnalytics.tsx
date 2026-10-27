import React from 'react';
import { BarChart3, TrendingUp, Activity, CheckCircle, ShieldCheck, Database, Layers } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';

export const SystemAnalytics: React.FC = () => {
  const modelBenchmarks = [
    { model: 'LightGBM Shortage Classifier', precision: '94.2%', recall: '92.8%', f1: '0.935', roc: '0.962', status: 'ACTIVE INFERENCE' },
    { model: 'XGBoost Expiry Predictor', precision: '91.6%', recall: '89.4%', f1: '0.905', roc: '0.941', status: 'ACTIVE INFERENCE' },
    { model: 'Random Forest Baseline', precision: '88.1%', recall: '86.5%', f1: '0.873', roc: '0.912', status: 'BENCHMARK' },
    { model: 'Logistic Regression Baseline', precision: '79.3%', recall: '74.2%', f1: '0.767', roc: '0.820', status: 'BENCHMARK' },
  ];

  const hospitalConsumptionData = [
    { month: 'May', emergency: 3400, inpatient: 5200, outpatient: 2900 },
    { month: 'Jun', emergency: 3800, inpatient: 5400, outpatient: 3100 },
    { month: 'Jul', emergency: 4200, inpatient: 5100, outpatient: 3300 },
    { month: 'Aug', emergency: 3900, inpatient: 5600, outpatient: 3000 },
    { month: 'Sep', emergency: 4600, inpatient: 5900, outpatient: 3500 },
    { month: 'Oct', emergency: 5100, inpatient: 6200, outpatient: 3700 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-[#172321]/8 pb-5">
        <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-widest block">
          Hospital Intelligence
        </span>
        <h1 className="font-instrument text-3xl sm:text-4xl text-[#172321] font-normal">
          Hospital System <span className="italic text-[#087F73]">Analytics & Benchmarks</span>
        </h1>
        <p className="text-xs text-[#667572] mt-0.5">
          High-level cross-departmental drug velocity, annual wastage reduction telemetry, and model validation.
        </p>
      </div>

      {/* Consumption Trend Chart */}
      <div className="bg-white border border-[#172321]/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-instrument text-2xl text-[#172321]">
              Hospital-Wide Monthly <span className="italic text-[#087F73]">Dispensing Volume</span>
            </h2>
            <p className="text-xs text-[#667572]">Aggregated units consumed across Emergency, Inpatient, and Outpatient suites.</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#667572]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E56B6F]" />
              <span>Emergency</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#087F73]" />
              <span>Inpatient</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5BAFA3]" />
              <span>Outpatient</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hospitalConsumptionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="emergency" stroke="#E56B6F" fill="#E56B6F" fillOpacity={0.12} strokeWidth={2} />
              <Area type="monotone" dataKey="inpatient" stroke="#087F73" fill="#087F73" fillOpacity={0.12} strokeWidth={2} />
              <Area type="monotone" dataKey="outpatient" stroke="#5BAFA3" fill="#5BAFA3" fillOpacity={0.08} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Machine Learning Validation Benchmarks Table */}
      <div className="bg-white border border-[#172321]/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div>
          <span className="text-[10px] font-bold text-[#9B8AFB] uppercase tracking-wider block">
            AI Engine Validation
          </span>
          <h2 className="font-instrument text-2xl text-[#172321]">
            Cross-Validation <span className="italic text-[#087F73]">Model Benchmarks</span>
          </h2>
          <p className="text-xs text-[#667572]">
            Trained and verified on 2,106 real Kaggle Pharma sales records and FDA Drug Shortages dataset.
          </p>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#172321]/10 text-[#667572]">
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Algorithm / Model Architecture</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Precision</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Recall</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">F1-Score</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">ROC-AUC</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider text-right">Deployment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172321]/6">
              {modelBenchmarks.map((m, idx) => (
                <tr key={idx} className="hover:bg-[#F7F8F4]/80 transition-colors">
                  <td className="py-4 font-semibold text-[#172321]">{m.model}</td>
                  <td className="py-4 font-mono font-bold text-[#087F73]">{m.precision}</td>
                  <td className="py-4 font-mono">{m.recall}</td>
                  <td className="py-4 font-mono">{m.f1}</td>
                  <td className="py-4 font-mono font-bold text-[#172321]">{m.roc}</td>
                  <td className="py-4 text-right">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        m.status.includes('ACTIVE')
                          ? 'bg-[#087F73]/10 text-[#087F73]'
                          : 'bg-[#F7F8F4] text-[#667572]'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SystemAnalytics;
