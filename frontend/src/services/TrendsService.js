import api from './api.js';

export const trendsService = {
  getTrends: () => api.get('/trending' ),
};