import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Upload,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Layers,
  Activity,
  Sliders,
  TrendingDown,
  Clock,
  Pill,
  Send,
  X,
} from 'lucide-react';
import { pharmacyStore, MedicineItem } from '../../services/pharmacyStore';
import apiService from '../../services/api';
import { ShortagePredictionResult, ExpiryRiskResult } from '../../types/prediction';

interface SingleFormState {
  drug_name: string;
  current_stock: number;
  average_daily_demand: number;
  lead_time_days: number;
  supplier_reliability: number;
  previous_shortage: number;
  medicine_criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  days_to_expiry: number;
  unit_cost: number;
}

interface CsvRowInput {
  drug_name: string;
  current_stock: number;
  average_daily_demand: number;
  lead_time_days: number;
  supplier_reliability: number;
  previous_shortage: number;
  medicine_criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  days_to_expiry: number;
  unit_cost: number;
}

interface CsvPredictionRecord {
  input: CsvRowInput;
  shortage?: ShortagePredictionResult;
  expiry?: ExpiryRiskResult;
  status: 'SUCCESS' | 'ERROR';
  errorMessage?: string;
}

export const Predictions: React.FC = () => {
  const navigate = useNavigate();
  const medicines = pharmacyStore.getMedicines();

  // Active Tab: 'single' | 'csv' | 'formulary'
  const [activeTab, setActiveTab] = useState<'single' | 'csv' | 'formulary'>('single');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // =========================================================================
  // 1. SINGLE-RECORD PREDICTION STATE
  // =========================================================================
  const [singleForm, setSingleForm] = useState<SingleFormState>({
    drug_name: 'Ceftriaxone Sodium 1g',
    current_stock: 45,
    average_daily_demand: 12,
    lead_time_days: 10,
    supplier_reliability: 0.82,
    previous_shortage: 1,
    medicine_criticality: 'CRITICAL',
    days_to_expiry: 42,
    unit_cost: 3.85,
  });

  const [loadingSingle, setLoadingSingle] = useState(false);
  const [singleShortageResult, setSingleShortageResult] = useState<ShortagePredictionResult | null>(null);
  const [singleExpiryResult, setSingleExpiryResult] = useState<ExpiryRiskResult | null>(null);

  const handleRunSinglePrediction = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!singleForm.drug_name.trim()) {
      showToast('Please provide a valid medicine name.');
      return;
    }
    if (singleForm.current_stock < 0 || singleForm.average_daily_demand <= 0) {
      showToast('Stock must be >= 0 and daily demand must be > 0.');
      return;
    }

    setLoadingSingle(true);
    try {
      // Call live FastAPI shortage endpoint
      const shortageRes = await apiService.predictShortageInput({
        drug_name: singleForm.drug_name,
        current_stock: Number(singleForm.current_stock),
        average_daily_demand: Number(singleForm.average_daily_demand),
        lead_time_days: Number(singleForm.lead_time_days),
        supplier_reliability: Number(singleForm.supplier_reliability),
        previous_shortage: Number(singleForm.previous_shortage),
        medicine_criticality: singleForm.medicine_criticality,
      });

      // Call live FastAPI expiry endpoint
      const expiryRes = await apiService.predictExpiryInput({
        drug_name: singleForm.drug_name,
        current_stock: Number(singleForm.current_stock),
        average_daily_demand: Number(singleForm.average_daily_demand),
        days_to_expiry: Number(singleForm.days_to_expiry),
        remaining_shelf_life: Number(singleForm.days_to_expiry) / 365.0,
        medicine_criticality: singleForm.medicine_criticality,
      });

      setSingleShortageResult(shortageRes);
      setSingleExpiryResult(expiryRes);
      showToast(`Inference complete for ${singleForm.drug_name}`);
    } catch (err: any) {
      showToast(`Prediction failed: ${err?.message || 'Server error'}`);
    } finally {
      setLoadingSingle(false);
    }
  };

  // Run initial prediction on mount
  useEffect(() => {
    handleRunSinglePrediction();
  }, []); // eslint-disable-line

  // Sync single prediction to Manager Dashboard
  const handleSyncToDashboard = (drugName: string, shortageRes: ShortagePredictionResult, expiryRes: ExpiryRiskResult) => {
    try {
      const existingRaw = localStorage.getItem('medlink_latest_predictions');
      const list: any[] = existingRaw ? JSON.parse(existingRaw) : [];

      const newEntry = {
        id: `pred-${Date.now()}`,
        drugName: drugName,
        shortageRisk: shortageRes.shortage_risk || shortageRes.riskLevel || 'MEDIUM',
        shortageProb: shortageRes.shortage_probability || shortageRes.shortageProbabilityPercent || 50,
        runoutDays: shortageRes.runout_days_estimated || shortageRes.expectedShortageDays || 7,
        expiryRisk: expiryRes.expiry_risk || 'LOW',
        loss: expiryRes.estimated_financial_loss || 0,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Put at top of list
      list.unshift(newEntry);
      localStorage.setItem('medlink_latest_predictions', JSON.stringify(list.slice(0, 10)));

      // Add system alert in pharmacyStore
      if (newEntry.shortageRisk === 'HIGH' || newEntry.shortageRisk === 'CRITICAL') {
        const alerts = pharmacyStore.getAlerts();
        alerts.unshift({
          id: `alt-${Date.now()}`,
          type: 'SHORTAGE',
          severity: 'HIGH',
          title: `Predicted Shortage Risk: ${drugName}`,
          description: `ML model predicted ${newEntry.shortageRisk} shortage risk (${(newEntry.shortageProb * 100).toFixed(0)}%). Estimated runout in ${newEntry.runoutDays} days.`,
          timestamp: 'Just now',
          department: 'Pharmacy Analytics',
        });
      }

      showToast(`Synchronized ${drugName} risk telemetry to Manager Dashboard!`);
    } catch {
      showToast('Saved prediction telemetry locally.');
    }
  };

  // =========================================================================
  // 2. CSV BULK PREDICTION STATE
  // =========================================================================
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<CsvRowInput[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  const [csvPredictions, setCsvPredictions] = useState<CsvPredictionRecord[]>([]);
  const [csvFilter, setCsvFilter] = useState<'ALL' | 'HIGH_SHORTAGE' | 'HIGH_EXPIRY'>('ALL');
  const [csvSearch, setCsvSearch] = useState('');

  // Download Sample CSV Template
  const handleDownloadTemplate = () => {
    const csvContent =
      'drug_name,current_stock,average_daily_demand,lead_time_days,supplier_reliability,previous_shortage,medicine_criticality,days_to_expiry,unit_cost\n' +
      'Paracetamol 500mg,120,40,7,0.95,0,MEDIUM,180,0.12\n' +
      'Amoxicillin 500mg,35,15,14,0.78,1,CRITICAL,45,0.45\n' +
      'Ibuprofen 400mg,240,18,5,0.92,0,LOW,365,0.18\n' +
      'Ceftriaxone 1g,20,8,12,0.80,2,HIGH,28,4.20\n' +
      'Salbutamol Inhaler,85,6,10,0.90,0,HIGH,90,3.50\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'medlink_prediction_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse CSV File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setCsvErrors([]);
    setCsvPredictions([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
      if (lines.length < 2) {
        setCsvErrors(['CSV file must have a header row and at least one data row.']);
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const required = ['drug_name', 'current_stock', 'average_daily_demand'];
      const missing = required.filter((r) => !headers.includes(r));

      if (missing.length > 0) {
        setCsvErrors([`Missing required column headers: ${missing.join(', ')}`]);
        return;
      }

      const rows: CsvRowInput[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim());
        if (cols.length < headers.length) {
          errors.push(`Row ${i + 1}: Incomplete columns (expected ${headers.length}, found ${cols.length})`);
          continue;
        }

        const getVal = (colName: string, defVal: any = '') => {
          const idx = headers.indexOf(colName);
          return idx !== -1 && cols[idx] !== undefined ? cols[idx] : defVal;
        };

        const drugName = getVal('drug_name');
        const stock = parseFloat(getVal('current_stock', '0'));
        const demand = parseFloat(getVal('average_daily_demand', '1'));
        const leadTime = parseInt(getVal('lead_time_days', '7')) || 7;
        const reliability = parseFloat(getVal('supplier_reliability', '0.95')) || 0.95;
        const prevShortage = parseInt(getVal('previous_shortage', '0')) || 0;
        const criticality = (getVal('medicine_criticality', 'MEDIUM').toUpperCase() as any) || 'MEDIUM';
        const expiryDays = parseInt(getVal('days_to_expiry', '180')) || 180;
        const unitCost = parseFloat(getVal('unit_cost', '1.0')) || 1.0;

        if (!drugName) {
          errors.push(`Row ${i + 1}: drug_name is empty.`);
          continue;
        }
        if (isNaN(stock) || stock < 0) {
          errors.push(`Row ${i + 1} (${drugName}): Invalid current_stock value.`);
          continue;
        }
        if (isNaN(demand) || demand <= 0) {
          errors.push(`Row ${i + 1} (${drugName}): average_daily_demand must be > 0.`);
          continue;
        }

        rows.push({
          drug_name: drugName,
          current_stock: stock,
          average_daily_demand: demand,
          lead_time_days: leadTime,
          supplier_reliability: reliability,
          previous_shortage: prevShortage,
          medicine_criticality: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(criticality) ? criticality : 'MEDIUM',
          days_to_expiry: expiryDays,
          unit_cost: unitCost,
        });
      }

      setParsedRows(rows);
      setCsvErrors(errors);
      showToast(`Parsed ${rows.length} valid rows from ${file.name}`);
    };
    reader.readAsText(file);
  };

  // Execute Bulk Predictions
  const handleExecuteBulkPredictions = async () => {
    if (parsedRows.length === 0) return;
    setIsProcessingCsv(true);

    const results: CsvPredictionRecord[] = [];

    try {
      for (const row of parsedRows) {
        try {
          const shortage = await apiService.predictShortageInput({
            drug_name: row.drug_name,
            current_stock: row.current_stock,
            average_daily_demand: row.average_daily_demand,
            lead_time_days: row.lead_time_days,
            supplier_reliability: row.supplier_reliability,
            previous_shortage: row.previous_shortage,
            medicine_criticality: row.medicine_criticality,
          });

          const expiry = await apiService.predictExpiryInput({
            drug_name: row.drug_name,
            current_stock: row.current_stock,
            average_daily_demand: row.average_daily_demand,
            days_to_expiry: row.days_to_expiry,
            remaining_shelf_life: row.days_to_expiry / 365.0,
            medicine_criticality: row.medicine_criticality,
          });

          results.push({
            input: row,
            shortage,
            expiry,
            status: 'SUCCESS',
          });
        } catch (rowErr: any) {
          results.push({
            input: row,
            status: 'ERROR',
            errorMessage: rowErr?.message || 'Inference error',
          });
        }
      }

      setCsvPredictions(results);
      showToast(`Processed ${results.filter((r) => r.status === 'SUCCESS').length} predictions successfully!`);
    } finally {
      setIsProcessingCsv(false);
    }
  };

  // Download Bulk Results as CSV
  const handleDownloadResultsCsv = () => {
    if (csvPredictions.length === 0) return;

    let csv =
      'drug_name,current_stock,daily_demand,lead_time_days,shortage_risk,shortage_probability,runout_days_estimated,expiry_risk,expiry_probability,unsold_units,estimated_loss_usd,action_recommendation\n';

    csvPredictions.forEach((p) => {
      const drug = `"${p.input.drug_name}"`;
      const stock = p.input.current_stock;
      const demand = p.input.average_daily_demand;
      const lead = p.input.lead_time_days;
      const sRisk = p.shortage?.shortage_risk || p.shortage?.riskLevel || 'N/A';
      const sProb = p.shortage?.shortage_probability ? (p.shortage.shortage_probability * 100).toFixed(1) + '%' : 'N/A';
      const runout = p.shortage?.runout_days_estimated ?? 'N/A';
      const eRisk = p.expiry?.expiry_risk || 'N/A';
      const eProb = p.expiry?.expiry_probability ? (p.expiry.expiry_probability * 100).toFixed(1) + '%' : 'N/A';
      const unsold = p.expiry?.expected_unsold_units ?? '0';
      const loss = p.expiry?.estimated_financial_loss ?? '0';
      const action = `"${(p.expiry?.action_recommendation || 'Standard inventory monitoring').replace(/"/g, '""')}"`;

      csv += `${drug},${stock},${demand},${lead},${sRisk},${sProb},${runout},${eRisk},${eProb},${unsold},${loss},${action}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'medlink_prediction_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered CSV predictions
  const filteredCsvResults = csvPredictions.filter((p) => {
    const matchesSearch = p.input.drug_name.toLowerCase().includes(csvSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (csvFilter === 'HIGH_SHORTAGE') return p.shortage?.shortage_risk === 'HIGH' || p.shortage?.shortage_risk === 'CRITICAL';
    if (csvFilter === 'HIGH_EXPIRY') return p.expiry?.expiry_risk === 'HIGH';
    return true;
  });

  // =========================================================================
  // 3. IN-HOUSE FORMULARIES TAB STATE
  // =========================================================================
  const [selectedFormulary, setSelectedFormulary] = useState<MedicineItem>(medicines[0]);
  const [formularyShortage, setFormularyShortage] = useState<ShortagePredictionResult | null>(null);
  const [formularyExpiry, setFormularyExpiry] = useState<ExpiryRiskResult | null>(null);
  const [loadingFormulary, setLoadingFormulary] = useState(false);

  const evaluateFormulary = async (med: MedicineItem) => {
    setSelectedFormulary(med);
    setLoadingFormulary(true);

    try {
      const nearestExpBatch = med.batches.find((b) => b.currentStock > 0) || med.batches[0];
      const daysToExp = nearestExpBatch ? nearestExpBatch.daysToExpiry : 120;

      const [sRes, eRes] = await Promise.all([
        apiService.predictShortageInput({
          drug_name: med.name,
          current_stock: med.totalStock,
          average_daily_demand: med.dailyDemand,
          lead_time_days: 7,
          supplier_reliability: 0.95,
          previous_shortage: med.shortageRisk === 'HIGH' ? 1 : 0,
          medicine_criticality: 'HIGH',
        }),
        apiService.predictExpiryInput({
          drug_name: med.name,
          current_stock: med.totalStock,
          average_daily_demand: med.dailyDemand,
          days_to_expiry: daysToExp,
          remaining_shelf_life: daysToExp / 365.0,
          medicine_criticality: 'HIGH',
        }),
      ]);

      setFormularyShortage(sRes);
      setFormularyExpiry(eRes);
    } catch (err: any) {
      console.warn('Formulary evaluation warning', err);
    } finally {
      setLoadingFormulary(false);
    }
  };

  useEffect(() => {
    if (medicines.length > 0 && activeTab === 'formulary' && !formularyShortage) {
      evaluateFormulary(medicines[0]);
    }
  }, [activeTab]); // eslint-disable-line

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl bg-[#087F73] text-white text-xs font-semibold shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          HEADER & MODEL VERIFICATION BANNER
          ========================================================================= */}
      <div className="border-b border-[#172321]/8 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#087F73]/10 text-[11px] font-bold text-[#087F73] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#087F73]" />
              <span>Machine Learning Inference Pipeline</span>
            </div>
            <h1 className="font-instrument text-3xl sm:text-4xl text-[#172321] font-normal">
              Predictions & <span className="italic text-[#087F73]">Risk Analytics</span>
            </h1>
            <p className="text-xs text-[#667572] max-w-2xl">
              Trained Random Forest models evaluating multi-factor shortage risk timelines, batch expiry hazards, and SHAP feature attribution explainability.
            </p>
          </div>

          {/* Model Status Pill */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3.5 py-2 rounded-2xl bg-[#E5F3EE] border border-[#087F73]/20 text-[11px] text-[#087F73] font-semibold flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#087F73]" />
              <span>Models Loaded (ROC-AUC 0.983 & 0.990)</span>
            </div>
          </div>
        </div>

        {/* Model Evaluation Metric Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="p-3.5 rounded-2xl bg-white border border-[#172321]/10 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-[#667572] block">Shortage Model ROC-AUC</span>
            <span className="font-mono font-bold text-lg text-[#087F73]">0.9828</span>
            <span className="text-[10px] text-[#667572] block">Random Forest Classifier</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-[#172321]/10 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-[#667572] block">Shortage F1-Score</span>
            <span className="font-mono font-bold text-lg text-[#087F73]">0.92</span>
            <span className="text-[10px] text-[#667572] block">91.0% Test Accuracy</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-[#172321]/10 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-[#667572] block">Expiry Model ROC-AUC</span>
            <span className="font-mono font-bold text-lg text-[#087F73]">0.9900</span>
            <span className="text-[10px] text-[#667572] block">Random Forest Classifier</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-[#172321]/10 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-[#667572] block">Expiry Test Accuracy</span>
            <span className="font-mono font-bold text-lg text-[#087F73]">97.0%</span>
            <span className="text-[10px] text-[#667572] block">FEFO Loss Estimator</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          WORKFLOW TABS
          ========================================================================= */}
      <div className="flex border-b border-[#172321]/10 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('single')}
          className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'single'
              ? 'border-[#087F73] text-[#087F73]'
              : 'border-transparent text-[#667572] hover:text-[#172321]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Single Record Inference</span>
        </button>

        <button
          onClick={() => setActiveTab('csv')}
          className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'csv'
              ? 'border-[#087F73] text-[#087F73]'
              : 'border-transparent text-[#667572] hover:text-[#172321]'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>CSV Bulk Prediction</span>
        </button>

        <button
          onClick={() => setActiveTab('formulary')}
          className={`pb-3 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'formulary'
              ? 'border-[#087F73] text-[#087F73]'
              : 'border-transparent text-[#667572] hover:text-[#172321]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>In-House Formularies ({medicines.length})</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: SINGLE RECORD PREDICTOR
          ========================================================================= */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input Form */}
          <form
            onSubmit={handleRunSinglePrediction}
            className="lg:col-span-5 bg-white border border-[#172321]/10 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#172321]/8">
              <div>
                <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-wider block">
                  Model Input Schema
                </span>
                <h3 className="font-instrument text-2xl text-[#172321]">Medicine & Batch Parameters</h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSingleForm({
                    drug_name: 'Amoxicillin Trihydrate 500mg',
                    current_stock: 30,
                    average_daily_demand: 15,
                    lead_time_days: 14,
                    supplier_reliability: 0.75,
                    previous_shortage: 2,
                    medicine_criticality: 'CRITICAL',
                    days_to_expiry: 35,
                    unit_cost: 0.45,
                  })
                }
                className="text-[11px] text-[#087F73] font-semibold hover:underline cursor-pointer"
              >
                Load Critical Preset
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#172321] mb-1">Medicine Name / Formulation</label>
                <input
                  type="text"
                  value={singleForm.drug_name}
                  onChange={(e) => setSingleForm({ ...singleForm, drug_name: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-[#172321]/15 bg-[#F7F8F4] text-[#172321] focus:outline-none focus:border-[#087F73]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#172321] mb-1">Current Stock (Units)</label>
                  <input
                    type="number"
                    min={0}
                    value={singleForm.current_stock}
                    onChange={(e) => setSingleForm({ ...singleForm, current_stock: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-xl border border-[#172321]/15 bg-[#F7F8F4] text-[#172321] focus:outline-none focus:border-[#087F73]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#172321] mb-1">Avg Daily Demand</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0.1}
                    value={singleForm.average_daily_demand}
                    onChange={(e) => setSingleForm({ ...singleForm, average_daily_demand: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-xl border border-[#172321]/15 bg-[#F7F8F4] text-[#172321] focus:outline-none focus:border-[#087F73]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#172321] mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={singleForm.lead_time_days}
                    onChange={(e) => setSingleForm({ ...singleForm, lead_time_days: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-xl border border-[#172321]/15 bg-[#F7F8F4] text-[#172321] focus:outline-none focus:border-[#087F73]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#172321] mb-1">Supplier Reliability</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0.5}
                    max={1.0}
                    value={singleForm.supplier_reliability}
                    onChange={(e) => setSingleForm({ ...singleForm, supplier_reliability: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-xl border border-[#172321]/15 bg-[#F7F8F4] text-[#172321] focus:outline-none focus:border-[#087F73]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#172321] mb-1">Past Shortage Incidents</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={singleForm.previous_shortage}
                    onChange={(e) => setSingleForm({ ...singleForm, previous_shortage: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-xl border border-[#172321]/15 bg-[#F7F8F4] text-[#172321] focus:outline-none focus:border-[#087F73]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#172321] mb-1">Criticality Tier</label>
                  <select
                    value={singleForm.medicine_criticality}
                    onChange={(e) => setSingleForm({ ...singleForm, medicine_criticality: e.target.value as any })}
                    className="w-full h-9 px-3 rounded-xl border border-[#172321]/15 bg-[#F7F8F4] text-[#172321] focus:outline-none focus:border-[#087F73]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#172321] mb-1">Days to Batch Expiry</label>
                  <input
                    type="number"
                    min={1}
                    value={singleForm.days_to_expiry}
                    onChange={(e) => setSingleForm({ ...singleForm, days_to_expiry: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-xl border border-[#172321]/15 bg-[#F7F8F4] text-[#172321] focus:outline-none focus:border-[#087F73]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#172321] mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0.01}
                    value={singleForm.unit_cost}
                    onChange={(e) => setSingleForm({ ...singleForm, unit_cost: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-xl border border-[#172321]/15 bg-[#F7F8F4] text-[#172321] focus:outline-none focus:border-[#087F73]"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingSingle}
              className="w-full py-3 bg-[#087F73] hover:bg-[#06655C] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingSingle ? 'animate-spin' : ''}`} />
              <span>{loadingSingle ? 'Running Model Inference...' : 'Run AI Risk Inference'}</span>
            </button>
          </form>

          {/* Results Display */}
          <div className="lg:col-span-7 bg-white border border-[#172321]/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#172321]/8">
              <div>
                <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-wider block">
                  Model Output & Predictions
                </span>
                <h3 className="font-instrument text-2xl text-[#172321]">{singleForm.drug_name}</h3>
              </div>

              {singleShortageResult && singleExpiryResult && (
                <button
                  onClick={() => handleSyncToDashboard(singleForm.drug_name, singleShortageResult, singleExpiryResult)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#087F73]/10 hover:bg-[#087F73]/20 text-[#087F73] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Sync to Dashboard</span>
                </button>
              )}
            </div>

            {loadingSingle ? (
              <div className="p-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-[#087F73] animate-spin mx-auto" />
                <p className="text-xs text-[#667572]">Evaluating parameters across Random Forest classification pipelines...</p>
              </div>
            ) : singleShortageResult && singleExpiryResult ? (
              <div className="space-y-6">
                {/* 2 Main Result Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Shortage Card */}
                  <div className="p-4 rounded-2xl bg-[#F7F8F4] border border-[#172321]/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#667572] uppercase">Shortage Risk</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          singleShortageResult.shortage_risk === 'CRITICAL' || singleShortageResult.shortage_risk === 'HIGH'
                            ? 'bg-[#FCEBEC] text-[#E56B6F]'
                            : singleShortageResult.shortage_risk === 'MEDIUM'
                            ? 'bg-[#FFF0D9] text-[#E9A23B]'
                            : 'bg-[#E5F3EE] text-[#087F73]'
                        }`}
                      >
                        {singleShortageResult.shortage_risk}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-[#172321]">
                        {((singleShortageResult.shortage_probability || singleShortageResult.shortageProbabilityPercent || 0) * 100).toFixed(1)}%
                      </span>
                      <span className="text-xs text-[#667572]">probability</span>
                    </div>

                    <p className="text-xs text-[#667572] pt-1">
                      Projected Runout:{' '}
                      <span className="font-semibold text-[#172321]">
                        {singleShortageResult.runout_days_estimated ?? singleShortageResult.expectedShortageDays ?? '—'} days
                      </span>
                    </p>
                  </div>

                  {/* Expiry Card */}
                  <div className="p-4 rounded-2xl bg-[#F7F8F4] border border-[#172321]/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#667572] uppercase">Batch Expiry Hazard</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          singleExpiryResult.expiry_risk === 'HIGH'
                            ? 'bg-[#FCEBEC] text-[#E56B6F]'
                            : singleExpiryResult.expiry_risk === 'MEDIUM'
                            ? 'bg-[#FFF0D9] text-[#E9A23B]'
                            : 'bg-[#E5F3EE] text-[#087F73]'
                        }`}
                      >
                        {singleExpiryResult.expiry_risk}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-[#172321]">
                        {((singleExpiryResult.expiry_probability || 0) * 100).toFixed(1)}%
                      </span>
                      <span className="text-xs text-[#667572]">hazard</span>
                    </div>

                    <p className="text-xs text-[#667572] pt-1">
                      Value at Risk:{' '}
                      <span className="font-semibold text-[#E56B6F]">
                        ${(singleExpiryResult.estimated_financial_loss || 0).toFixed(2)}
                      </span>{' '}
                      ({singleExpiryResult.expected_unsold_units || 0} unsold units)
                    </p>
                  </div>
                </div>

                {/* Prescribed Action */}
                <div className="p-4 rounded-2xl bg-[#E5F3EE]/60 border border-[#087F73]/20 space-y-1">
                  <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-wider block">
                    AI Prescriptive Recommendation
                  </span>
                  <p className="text-xs font-semibold text-[#172321]">
                    {singleExpiryResult.action_recommendation || 'Standard inventory monitoring.'}
                  </p>
                </div>

                {/* SHAP Feature Explanations */}
                {singleShortageResult.shap_explanations && singleShortageResult.shap_explanations.length > 0 && (
                  <div className="space-y-2.5 pt-1">
                    <h4 className="text-xs font-bold text-[#172321] uppercase tracking-wider">
                      SHAP Feature Attribution (Why this prediction was made)
                    </h4>
                    <div className="space-y-2">
                      {singleShortageResult.shap_explanations.map((f: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-[#F7F8F4] border border-[#172321]/5 flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-semibold text-[#172321]">{f.feature || f.featureName}</p>
                            <p className="text-[11px] text-[#667572]">{f.description}</p>
                          </div>
                          <span
                            className={`font-mono font-bold text-xs shrink-0 ml-3 ${
                              f.impact === 'CRITICAL_INCREASE' || f.impact === 'INCREASE'
                                ? 'text-[#E56B6F]'
                                : 'text-[#087F73]'
                            }`}
                          >
                            {f.value || f.impact || 'Impacted'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#667572]">
                Configure parameters and click &ldquo;Run AI Risk Inference&rdquo; to evaluate.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: CSV BULK PREDICTION
          ========================================================================= */}
      {activeTab === 'csv' && (
        <div className="space-y-6">
          {/* Upload and Template Actions */}
          <div className="bg-white border border-[#172321]/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#172321]/8">
              <div>
                <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-wider block">
                  Batch Processing Pipeline
                </span>
                <h3 className="font-instrument text-2xl text-[#172321]">CSV Medicine & Batch Prediction Upload</h3>
                <p className="text-xs text-[#667572] mt-0.5">
                  Upload a CSV file containing candidate medicines and stock metrics to generate shortage and expiry predictions in bulk.
                </p>
              </div>

              <button
                onClick={handleDownloadTemplate}
                className="px-4 py-2 rounded-xl bg-[#F7F8F4] border border-[#172321]/10 hover:border-[#087F73] text-[#172321] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5 text-[#087F73]" />
                <span>Download Sample Template</span>
              </button>
            </div>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-[#172321]/15 hover:border-[#087F73] rounded-3xl p-8 text-center bg-[#F7F8F4]/50 transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-prediction-input"
              />
              <label htmlFor="csv-prediction-input" className="cursor-pointer space-y-3 block">
                <FileSpreadsheet className="w-10 h-10 text-[#087F73] mx-auto" />
                <div>
                  <p className="text-sm font-semibold text-[#172321]">
                    {csvFile ? csvFile.name : 'Click to select or drop CSV file'}
                  </p>
                  <p className="text-xs text-[#667572] mt-0.5">
                    Expected columns: drug_name, current_stock, average_daily_demand, lead_time_days, days_to_expiry
                  </p>
                </div>
              </label>
            </div>

            {/* Validation errors */}
            {csvErrors.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#FCEBEC] border border-[#E56B6F]/30 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#E56B6F]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Validation Notices ({csvErrors.length})</span>
                </div>
                <ul className="text-xs text-[#E56B6F] list-disc list-inside space-y-0.5">
                  {csvErrors.slice(0, 5).map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                  {csvErrors.length > 5 && <li>...and {csvErrors.length - 5} more issues.</li>}
                </ul>
              </div>
            )}

            {/* Ready to process */}
            {parsedRows.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#E5F3EE]/40 border border-[#087F73]/20">
                <div className="text-xs text-[#172321]">
                  <span className="font-bold text-[#087F73]">{parsedRows.length} valid rows</span> ready for model inference.
                </div>
                <button
                  onClick={handleExecuteBulkPredictions}
                  disabled={isProcessingCsv}
                  className="px-5 py-2.5 bg-[#087F73] hover:bg-[#06655C] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isProcessingCsv ? 'animate-spin' : ''}`} />
                  <span>{isProcessingCsv ? 'Evaluating Batch Inference...' : 'Execute Batch Inference'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Results Table */}
          {csvPredictions.length > 0 && (
            <div className="bg-white border border-[#172321]/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#172321]/8">
                <div>
                  <h3 className="font-instrument text-2xl text-[#172321]">
                    Batch Prediction Results ({csvPredictions.length})
                  </h3>
                  <p className="text-xs text-[#667572]">Matched model outputs for uploaded candidate records.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Filters */}
                  <div className="flex rounded-xl bg-[#F7F8F4] border border-[#172321]/10 p-1 text-[11px] font-semibold">
                    <button
                      onClick={() => setCsvFilter('ALL')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        csvFilter === 'ALL' ? 'bg-[#087F73] text-white' : 'text-[#667572]'
                      }`}
                    >
                      All ({csvPredictions.length})
                    </button>
                    <button
                      onClick={() => setCsvFilter('HIGH_SHORTAGE')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        csvFilter === 'HIGH_SHORTAGE' ? 'bg-[#E56B6F] text-white' : 'text-[#667572]'
                      }`}
                    >
                      High Shortage (
                      {
                        csvPredictions.filter(
                          (p) => p.shortage?.shortage_risk === 'HIGH' || p.shortage?.shortage_risk === 'CRITICAL'
                        ).length
                      }
                      )
                    </button>
                    <button
                      onClick={() => setCsvFilter('HIGH_EXPIRY')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        csvFilter === 'HIGH_EXPIRY' ? 'bg-[#E9A23B] text-white' : 'text-[#667572]'
                      }`}
                    >
                      High Expiry ({csvPredictions.filter((p) => p.expiry?.expiry_risk === 'HIGH').length})
                    </button>
                  </div>

                  <button
                    onClick={handleDownloadResultsCsv}
                    className="px-3.5 py-2 rounded-xl bg-[#087F73] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:bg-[#06655C] transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV Results</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#172321]/10 text-[10px] font-bold uppercase tracking-wider text-[#667572]">
                      <th className="pb-3 pr-4">Drug / Formulation</th>
                      <th className="pb-3 pr-4">Stock / Demand</th>
                      <th className="pb-3 pr-4">Shortage Risk</th>
                      <th className="pb-3 pr-4">Runout Timeline</th>
                      <th className="pb-3 pr-4">Expiry Risk</th>
                      <th className="pb-3 pr-4">Unsold Loss ($)</th>
                      <th className="pb-3 text-right">Prescribed Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#172321]/6">
                    {filteredCsvResults.map((p, idx) => (
                      <tr key={idx} className="hover:bg-[#F7F8F4] transition-colors">
                        <td className="py-3 pr-4 font-semibold text-[#172321]">{p.input.drug_name}</td>
                        <td className="py-3 pr-4 text-[#667572]">
                          {p.input.current_stock} units &bull; {p.input.average_daily_demand}/d
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              p.shortage?.shortage_risk === 'CRITICAL' || p.shortage?.shortage_risk === 'HIGH'
                                ? 'bg-[#FCEBEC] text-[#E56B6F]'
                                : p.shortage?.shortage_risk === 'MEDIUM'
                                ? 'bg-[#FFF0D9] text-[#E9A23B]'
                                : 'bg-[#E5F3EE] text-[#087F73]'
                            }`}
                          >
                            {p.shortage?.shortage_risk || 'N/A'}{' '}
                            {p.shortage?.shortage_probability
                              ? `(${(p.shortage.shortage_probability * 100).toFixed(0)}%)`
                              : ''}
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-mono font-semibold text-[#172321]">
                          {p.shortage?.runout_days_estimated !== undefined
                            ? `${p.shortage.runout_days_estimated} days`
                            : '—'}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              p.expiry?.expiry_risk === 'HIGH'
                                ? 'bg-[#FCEBEC] text-[#E56B6F]'
                                : p.expiry?.expiry_risk === 'MEDIUM'
                                ? 'bg-[#FFF0D9] text-[#E9A23B]'
                                : 'bg-[#E5F3EE] text-[#087F73]'
                            }`}
                          >
                            {p.expiry?.expiry_risk || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-mono font-bold text-[#E56B6F]">
                          ${p.expiry?.estimated_financial_loss?.toFixed(2) || '0.00'}
                        </td>
                        <td className="py-3 text-right">
                          <span className="text-[11px] text-[#087F73] font-medium block truncate max-w-[200px] ml-auto">
                            {p.expiry?.action_recommendation || 'Standard monitoring'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: IN-HOUSE FORMULARIES
          ========================================================================= */}
      {activeTab === 'formulary' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* List of Formularies */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#667572] px-1">
              Active Hospital Formularies ({medicines.length})
            </h3>
            <div className="space-y-2.5">
              {medicines.map((m) => (
                <button
                  key={m.id}
                  onClick={() => evaluateFormulary(m)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedFormulary?.id === m.id
                      ? 'bg-white border-[#087F73] ring-2 ring-[#087F73]/15 shadow-sm'
                      : 'bg-white/60 hover:bg-white border-[#172321]/10 text-[#172321]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-instrument text-lg text-[#172321]">{m.name}</span>
                    <span className="text-[10px] text-[#667572] uppercase font-mono">{m.atcCode}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#667572] mt-1">
                    <span>Stock: {m.totalStock} units</span>
                    <span>Demand: {m.dailyDemand}/d</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Inference View */}
          <div className="lg:col-span-7 bg-white border border-[#172321]/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#172321]/8">
              <div>
                <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-wider block">
                  Formulary Inference Result
                </span>
                <h3 className="font-instrument text-2xl text-[#172321]">{selectedFormulary.name}</h3>
                <p className="text-xs text-[#667572]">{selectedFormulary.category} &bull; ATC: {selectedFormulary.atcCode}</p>
              </div>

              {formularyShortage && formularyExpiry && (
                <button
                  onClick={() => handleSyncToDashboard(selectedFormulary.name, formularyShortage, formularyExpiry)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#087F73]/10 hover:bg-[#087F73]/20 text-[#087F73] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Sync to Dashboard</span>
                </button>
              )}
            </div>

            {loadingFormulary ? (
              <div className="p-12 text-center">
                <RefreshCw className="w-7 h-7 text-[#087F73] animate-spin mx-auto mb-2" />
                <p className="text-xs text-[#667572]">Evaluating against loaded Random Forest models...</p>
              </div>
            ) : formularyShortage && formularyExpiry ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#F7F8F4] border border-[#172321]/10 space-y-1">
                    <span className="text-[10px] font-bold text-[#667572] uppercase">Shortage Probability</span>
                    <p className="font-instrument text-2xl font-bold text-[#172321]">
                      {((formularyShortage.shortage_probability || 0) * 100).toFixed(1)}%
                    </p>
                    <p className="text-[11px] text-[#667572]">
                      Runout in {formularyShortage.runout_days_estimated} days
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F7F8F4] border border-[#172321]/10 space-y-1">
                    <span className="text-[10px] font-bold text-[#667572] uppercase">Expiry Risk</span>
                    <p className="font-instrument text-2xl font-bold text-[#172321]">
                      {((formularyExpiry.expiry_probability || 0) * 100).toFixed(1)}%
                    </p>
                    <p className="text-[11px] text-[#E56B6F] font-semibold">
                      ${formularyExpiry.estimated_financial_loss?.toFixed(2)} exposure
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#E5F3EE]/60 border border-[#087F73]/20 space-y-1">
                  <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-wider block">
                    Optimization Action
                  </span>
                  <p className="text-xs font-semibold text-[#172321]">
                    {formularyExpiry.action_recommendation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#667572]">
                Select a formulary from the left to evaluate.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Predictions;
