import axios from 'axios';
import { InventoryRecord } from '../types/inventory';
import { ShortagePredictionResult, ExpiryRiskResult, RecommendationResult } from '../types/prediction';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('medpredict_auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // System & Dashboard
  async getDashboardData() {
    const response = await client.get('/dashboard');
    return response.data;
  },

  // Demand Analysis & Forecasting
  async getDemandData(categoryOrDrug: string = 'M01AB', timeframe: string = '30D') {
    const response = await client.get('/demand', {
      params: { drugOrCategory: categoryOrDrug, timeframe },
    });
    return response.data;
  },

  async getForecastData(categoryOrDrug: string = 'M01AB', horizonDays: number = 30) {
    const response = await client.get('/forecast', {
      params: { drugOrCategory: categoryOrDrug, horizonDays },
    });
    return response.data;
  },

  // Shortage Predictions
  async getShortages(params?: { status?: string; search?: string; limit?: number }) {
    const response = await client.get('/shortages', { params });
    return response.data;
  },

  async predictShortageRisk(drugName: string): Promise<ShortagePredictionResult> {
    const response = await client.post('/predict/shortage', { drugName });
    return response.data;
  },

  async predictShortageInput(data: any): Promise<ShortagePredictionResult> {
    const response = await client.post('/predictions/shortage', data);
    return response.data;
  },

  async predictExpiryInput(data: any): Promise<ExpiryRiskResult> {
    const response = await client.post('/predictions/expiry', data);
    return response.data;
  },

  async getRecommendation(data: any): Promise<RecommendationResult> {
    const response = await client.post('/predictions/recommendation', data);
    return response.data;
  },

  // Inventory
  async getInventory(params?: { category?: string; search?: string; limit?: number }) {
    const response = await client.get('/inventory', { params });
    return response.data;
  },

  async getInventoryData(params?: { category?: string; search?: string; limit?: number }) {
    return this.getInventory(params);
  },

  async predictShortage(data: any): Promise<ShortagePredictionResult> {
    return this.predictShortageInput(data);
  },

  async predictExpiry(data: any): Promise<ExpiryRiskResult> {
    return this.predictExpiryInput(data);
  },

  // Reports & Metrics
  async getModelMetrics() {
    const response = await client.get('/reports/metrics');
    return response.data;
  },

  async getRecommendations() {
    const response = await client.get('/reports/recommendations');
    return response.data;
  },

  async getReportsList() {
    const response = await client.get('/reports');
    return response.data;
  },

  // Transactions & Dispensing
  async getTransactions(params?: { medicine_id?: number; limit?: number }) {
    const response = await client.get('/transactions', { params });
    return response.data;
  },

  async createTransaction(data: {
    medicine_id: number;
    batch_id?: number;
    hospital_id?: number;
    transaction_type: 'DISPENSE' | 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'RETURN' | 'DISPOSAL';
    quantity: number;
    unit_price?: number;
    notes?: string;
  }) {
    const response = await client.post('/transactions', data);
    return response.data;
  },

  // Medicines Master
  async getMedicines(params?: { search?: string; category?: string; limit?: number }) {
    const response = await client.get('/medicines', { params });
    return response.data;
  },

  // Expiry Risk
  async getExpiryData() {
    const response = await client.get('/expiry');
    return response.data;
  },

  // Dataset Management
  async getDatasetStatus() {
    const response = await client.get('/datasets/status');
    return response.data;
  },

  async getDatasetHistory() {
    const response = await client.get('/datasets/history');
    return response.data;
  },

  async previewDataset(formData: FormData) {
    const response = await client.post('/datasets/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async uploadDataset(formData: FormData) {
    const response = await client.post('/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async refreshPipeline() {
    const response = await client.post('/datasets/refresh');
    return response.data;
  },
};

export default apiService;
