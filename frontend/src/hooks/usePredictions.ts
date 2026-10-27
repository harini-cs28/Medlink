import { useState } from 'react';
import { apiService } from '../services/api';
import { ShortagePredictionResult, ExpiryRiskResult, RecommendationResult } from '../types/prediction';

export const usePredictions = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const predictShortage = async (drugName: string): Promise<ShortagePredictionResult> => {
    setIsLoading(true);
    setError(null);
    try {
      return await apiService.predictShortageRisk(drugName);
    } catch (err: any) {
      setError(err.message || 'Shortage prediction failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const predictExpiry = async (inputData: any): Promise<ExpiryRiskResult> => {
    setIsLoading(true);
    setError(null);
    try {
      return await apiService.predictExpiryInput(inputData);
    } catch (err: any) {
      setError(err.message || 'Expiry risk evaluation failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendation = async (data: any): Promise<RecommendationResult> => {
    setIsLoading(true);
    setError(null);
    try {
      return await apiService.getRecommendation(data);
    } catch (err: any) {
      setError(err.message || 'Recommendation generation failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { predictShortage, predictExpiry, getRecommendation, isLoading, error };
};
