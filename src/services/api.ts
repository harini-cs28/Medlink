/**
 * MedPredict AI - Data Science & Backend API Service
 * Consumes real pharmaceutical sales, FDA drug shortages, and ML model inference endpoints from FastAPI.
 */

import axios from 'axios';
import {
  DashboardData,
  SalesRecord,
  ShortageRecord,
  DemandData,
  ForecastData,
  PredictionResult,
  ModelMetrics,
  ShapFeature,
  ReportItem,
  SmartRecommendation
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  /**
   * Fetches overall aggregate KPI metrics derived from Pharma Sales and FDA Shortages.
   */
  async getDashboardData(): Promise<DashboardData> {
    const response = await apiClient.get<DashboardData>('/dashboard');
    return response.data;
  },

  /**
   * Fetches sales volume, frequency, and demand records derived from Pharma Sales.
   */
  async getInventoryData(params?: { category?: string; search?: string; page?: number; limit?: number }): Promise<{
    records: SalesRecord[];
    total: number;
  }> {
    const response = await apiClient.get<{ records: SalesRecord[]; total: number }>('/inventory', { params });
    return response.data;
  },

  /**
   * Fetches historical time-series demand for a specific drug or ATC therapeutic class.
   */
  async getDemandData(drugOrCategory: string, timeframe: '7D' | '30D' | '90D' | 'Custom' = '30D'): Promise<DemandData> {
    const response = await apiClient.get<DemandData>('/demand', {
      params: { drugOrCategory, timeframe }
    });
    return response.data;
  },

  /**
   * Fetches real FDA shortage records and filterable dimensions.
   */
  async getShortageData(params?: { status?: string; search?: string; limit?: number }): Promise<{
    records: ShortageRecord[];
    total: number;
    statusDistribution: Record<string, number>;
  }> {
    const response = await apiClient.get<{
      records: ShortageRecord[];
      total: number;
      statusDistribution: Record<string, number>;
    }>('/shortages', { params });
    return response.data;
  },

  /**
   * Runs ML model inference to predict shortage risk and probability for a given drug.
   */
  async predictShortage(drugName: string): Promise<PredictionResult> {
    const response = await apiClient.post<PredictionResult>('/predict/shortage', { drugName });
    return response.data;
  },

  /**
   * Fetches time-series forecasting points with confidence bounds.
   */
  async getDemandForecast(drugOrCategory: string, horizonDays: number = 30): Promise<ForecastData> {
    const response = await apiClient.get<ForecastData>('/forecast', {
      params: { drugOrCategory, horizonDays }
    });
    return response.data;
  },

  /**
   * Fetches cross-validated model evaluation metrics and benchmarking comparisons.
   */
  async getModelMetrics(): Promise<ModelMetrics[]> {
    const response = await apiClient.get<ModelMetrics[]>('/models/metrics');
    return response.data;
  },

  /**
   * Fetches SHAP feature attribution explainability scores for a specific prediction.
   */
  async getShapExplanation(drugName: string): Promise<ShapFeature[]> {
    const response = await apiClient.get<ShapFeature[]>('/explainability/shap', {
      params: { drugName }
    });
    return response.data;
  },

  /**
   * Fetches real analytical smart recommendations based on demand velocity and shortages.
   */
  async getRecommendations(): Promise<SmartRecommendation[]> {
    const response = await apiClient.get<SmartRecommendation[]>('/recommendations');
    return response.data;
  },

  /**
   * Fetches downloadable data science audit reports and evaluation summaries.
   */
  async getReports(): Promise<ReportItem[]> {
    const response = await apiClient.get<ReportItem[]>('/reports');
    return response.data;
  },

  /**
   * Validates an uploaded CSV and returns detected columns, warnings, errors, and preview rows.
   */
  async previewDataset(file: File, datasetType: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('datasetType', datasetType);

    const response = await apiClient.post('/datasets/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /**
   * Uploads and commits a validated CSV dataset into active production.
   */
  async uploadDataset(file: File, datasetType: string, user: string = 'Administrator'): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('datasetType', datasetType);
    formData.append('user', user);

    const response = await apiClient.post('/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /**
   * Fetches audit history of dataset uploads and pipeline synchronizations.
   */
  async getUploadHistory(): Promise<any[]> {
    const response = await apiClient.get<any[]>('/datasets/history');
    return response.data;
  },

  /**
   * Fetches active dataset file statistics, row counts, and synchronization health.
   */
  async getDatasetPipelineStatus(): Promise<any> {
    const response = await apiClient.get('/datasets/status');
    return response.data;
  },

  /**
   * Re-evaluates and runs full dataset cleaning and integration pipeline.
   */
  async refreshPipeline(): Promise<any> {
    const response = await apiClient.post('/datasets/refresh');
    return response.data;
  },

  /**
   * Fetches hospital inventory batch expiry telemetry or dataset limitation notice.
   */
  async getExpiryStatus(): Promise<any> {
    const response = await apiClient.get('/expiry');
    return response.data;
  }
};
