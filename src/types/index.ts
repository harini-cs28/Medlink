export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ShortageStatus = 'Current' | 'Resolved' | 'Discontinued' | 'Unknown';
export type DemandTrend = 'Increasing' | 'Stable' | 'Decreasing';

export interface DashboardData {
  totalSalesRecords: number;
  uniqueMedicines: number;
  shortageRecordsCount: number;
  predictedHighRiskCount: number;
  dataPipelineConnected: boolean;
  modelServiceReady: boolean;
  lastUpdated: string;
  dataSources: string[];
}

export interface SalesRecord {
  id?: string;
  date: string;
  categoryOrDrug: string;
  volume: number;
  frequency?: number;
  demandTrend?: DemandTrend;
  shortageStatus?: ShortageStatus;
  atcDescription?: string;
}

export interface ShortageRecord {
  id: string;
  drugName: string;
  genericName?: string;
  status: ShortageStatus;
  initialPostingDate?: string;
  updateDate?: string;
  reason?: string;
  therapeuticCategory?: string;
  dosageForm?: string;
  riskLevel: RiskLevel;
}

export interface DemandDataPoint {
  date: string;
  historicalDemand: number;
  forecastDemand?: number;
}

export interface DemandData {
  drugOrCategory: string;
  timeframe: '7D' | '30D' | '90D' | 'Custom';
  dataPoints: DemandDataPoint[];
  totalVolume: number;
  averageDailyDemand: number;
  growthRatePercent?: number;
}

export interface ForecastData {
  drugOrCategory: string;
  horizonDays: number;
  modelUsed: string;
  historical: DemandDataPoint[];
  forecast: DemandDataPoint[];
  confidenceLower?: number[];
  confidenceUpper?: number[];
  forecastTrained: boolean;
}

export interface ShapFeature {
  featureName: string;
  impactScore: number;
  contributionPercent: number;
  direction: 'increase_risk' | 'decrease_risk';
  description: string;
}

export interface PredictionResult {
  drugName: string;
  riskLevel: RiskLevel;
  shortageProbabilityPercent: number;
  expectedShortageDays?: number;
  modelTrained: boolean;
  modelAlgorithm: string;
  confidenceScore: number;
  datasetVersion?: string;
  lastDataSync?: string;
  shapExplanations: ShapFeature[];
  recommendationSummary?: string;
}

export interface ModelMetrics {
  modelName: string;
  modelType: 'Forecasting' | 'Classification';
  mae?: number;
  rmse?: number;
  mapePercent?: number;
  r2Score?: number;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  rocAuc?: number;
  trainingSamplesCount: number;
  lastTrainedDate: string;
  status: 'Ready' | 'Training' | 'Untrained';
}

export interface ReportItem {
  id: string;
  title: string;
  category: 'Demand Analysis' | 'Shortage Analysis' | 'Model Performance' | 'Explainable AI' | 'Data Quality';
  description: string;
  generatedDate: string;
  fileFormat: 'CSV' | 'PDF' | 'JSON';
  isAvailable: boolean;
  downloadUrl?: string;
}

export interface SmartRecommendation {
  id: string;
  drugOrCategory: string;
  type: 'Demand Surge Alert' | 'Shortage Risk Alert' | 'Consumption Anomaly' | 'Procurement Review';
  urgency: RiskLevel;
  rationale: string;
  suggestedAction: string;
  dataSource: string;
}

export type DatasetType = 'pharma_sales' | 'fda_shortages' | 'hospital_inventory';

export interface DatasetPreviewResult {
  valid: boolean;
  filename: string;
  dataset_type: DatasetType;
  file_size: number;
  total_rows_detected: number;
  columns: string[];
  required_columns_found: string[];
  missing_required_columns: string[];
  preview_rows: Record<string, any>[];
  errors: string[];
  warnings: string[];
}

export interface UploadHistoryRecord {
  id: string;
  timestamp: string;
  dataset_type: DatasetType | 'all';
  filename: string;
  file_size: number;
  rows_count: number;
  status: 'SUCCESS' | 'VALIDATION_FAILED' | 'PROCESSING_FAILED';
  version_tag?: string;
  details: string;
  user: string;
}

export interface DatasetPipelineStatus {
  pipelineStatus: string;
  activeVersion: string;
  lastUpdated?: string;
  datasets: {
    pharma_sales: { exists: boolean; rows: number; sizeBytes: number; lastModified: string | null };
    fda_shortages: { exists: boolean; rows: number; sizeBytes: number; lastModified: string | null };
    hospital_inventory: { exists: boolean; rows: number; sizeBytes: number; lastModified: string | null };
    integrated_matrix: { exists: boolean; rows: number; sizeBytes: number; lastModified: string | null };
  };
}

export interface HospitalBatchRecord {
  drug_name: string;
  batch_number: string;
  expiry_date_str: string;
  quantity: number;
  unit_cost: number;
  days_until_expiry: number;
  risk_level: 'EXPIRED' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'SAFE';
  total_batch_value: number;
}

export interface ExpiryRiskResponse {
  status: 'data_connected' | 'data_unavailable';
  message: string;
  isAvailable: boolean;
  prerequisites?: string[];
  metrics?: {
    totalBatches: number;
    expiredBatches: number;
    criticalBatches: number;
    highRiskBatches: number;
    safeBatches: number;
    unitsAtRisk: number;
    financialExposure: number;
  };
  records?: HospitalBatchRecord[];
}
