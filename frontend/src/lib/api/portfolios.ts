import axios from 'axios';
import type { Portfolio, PortfolioStats, CreatePortfolioPayload, UpdatePortfolioPayload, AccountType } from '../../types/portfolio';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const portfoliosApi = {
  // Get all portfolios
  getPortfolios: async (accountType?: AccountType): Promise<Portfolio[]> => {
    const params = accountType ? { accountType } : {};
    const response = await api.get<Portfolio[]>('/portfolios', { params });
    return response.data;
  },

  // Get single portfolio
  getPortfolio: async (id: string): Promise<Portfolio> => {
    const response = await api.get<Portfolio>(`/portfolios/${id}`);
    return response.data;
  },

  // Get portfolio statistics
  getPortfolioStats: async (id: string): Promise<PortfolioStats> => {
    const response = await api.get<PortfolioStats>(`/portfolios/${id}/stats`);
    return response.data;
  },

  // Create portfolio
  createPortfolio: async (data: CreatePortfolioPayload): Promise<Portfolio> => {
    const response = await api.post<Portfolio>('/portfolios', data);
    return response.data;
  },

  // Update portfolio
  updatePortfolio: async (id: string, data: UpdatePortfolioPayload): Promise<Portfolio> => {
    const response = await api.patch<Portfolio>(`/portfolios/${id}`, data);
    return response.data;
  },

  // Delete portfolio
  deletePortfolio: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/portfolios/${id}`);
    return response.data;
  },

  // Assign unassigned trades to portfolio
  assignUnassignedTrades: async (id: string): Promise<{ message: string; count: number }> => {
    const response = await api.post<{ message: string; count: number }>(`/portfolios/${id}/assign-unassigned-trades`);
    return response.data;
  },

  // Get count of unassigned trades
  getUnassignedTradesCount: async (): Promise<{ count: number }> => {
    const response = await api.get<{ count: number }>('/portfolios/unassigned-trades/count');
    return response.data;
  },

  // Move trades from one portfolio to another
  moveTradesTo: async (fromId: string, toId: string): Promise<{ message: string; count: number }> => {
    const response = await api.post<{ message: string; count: number }>(`/portfolios/${fromId}/move-trades-to/${toId}`);
    return response.data;
  },
};
