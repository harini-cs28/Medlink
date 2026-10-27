export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ShapExplanation {
  featureName?: string;
  feature?: string;
  impactScore?: number;
  weight?: number;
  contributionPercent?: number;
  direction?: 'increase_risk' | 'decrease_risk';
  description: string;
  value?: string;
  impact?: string;
}

export interface ShortagePredictionResult {
  drugName?: string;
  drug_name?: string;
  riskLevel?: RiskLevel;
  shortage_risk?: RiskLevel;
  shortageProbabilityPercent?: number;
  shortage_probability?: number;
  expectedShortageDays?: number | null;
  runout_days_estimated?: number;
  confidenceScore?: number;
  confidence_score?: number;
  shapExplanations?: ShapExplanation[];
  shap_explanations?: ShapExplanation[];
  recommendationSummary?: string;
}

export interface ExpiryRiskResult {
  drug_name: string;
  expiry_probability: number;
  expiry_risk: RiskLevel;
  expected_unsold_units: number;
  estimated_financial_loss: number;
  action_recommendation: string;
}

export interface RecommendationResult {
  medicine_id?: number;
  drug_name: string;
  shortage_risk: string;
  expiry_risk: string;
  primary_action: string;
  action_details: string;
  priority_level: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';
  suggested_order_quantity: number;
  fefo_priority: boolean;
}
