import apiService from './api';

export const predictionService = {
  predictShortageRisk: apiService.predictShortageRisk,
  predictShortageInput: apiService.predictShortageInput,
  predictExpiryInput: apiService.predictExpiryInput,
  getRecommendation: apiService.getRecommendation,
  getShortages: apiService.getShortages,
};
