import api from '../lib/api';
import { Trade, TradeFormData, TradeFilters as TradeFiltersType } from '../types/trade';

// Transform backend response to frontend Trade interface
const transformBackendTrade = (backendTrade: any): Trade => ({
  id: backendTrade.id,
  symbol: backendTrade.symbol,
  direction: backendTrade.type, // Backend: 'type', Frontend: 'direction'
  status: backendTrade.status,
  openDate: backendTrade.entryDate, // Backend: 'entryDate', Frontend: 'openDate'
  closeDate: backendTrade.exitDate, // Backend: 'exitDate', Frontend: 'closeDate'
  entryPrice: Number(backendTrade.entryPrice),
  exitPrice: backendTrade.exitPrice ? Number(backendTrade.exitPrice) : undefined,
  stopLoss: backendTrade.stopLoss ? Number(backendTrade.stopLoss) : undefined,
  takeProfit: backendTrade.takeProfit ? Number(backendTrade.takeProfit) : undefined,
  lots: Number(backendTrade.quantity), // Backend: 'quantity', Frontend: 'lots'
  commission: backendTrade.commission ? Number(backendTrade.commission) : undefined,
  swap: backendTrade.swap ? Number(backendTrade.swap) : undefined,
  grossPnL: backendTrade.profitLoss ? Number(backendTrade.profitLoss) : undefined,
  netPnL: backendTrade.netProfitLoss ? Number(backendTrade.netProfitLoss) : undefined,
  pnlPercentage: backendTrade.pnlPercentage ? Number(backendTrade.pnlPercentage) : undefined,
  riskRewardRatio: backendTrade.riskRewardRatio ? Number(backendTrade.riskRewardRatio) : undefined,
  pips: backendTrade.pips ? Number(backendTrade.pips) : undefined,
  setup: backendTrade.strategy, // Backend: 'strategy', Frontend: 'setup'
  entryReason: backendTrade.notes, // Backend: 'notes', Frontend: 'entryReason'
  exitReason: backendTrade.exitReason,
  mistakes: backendTrade.mistakes,
  lessonsLearned: backendTrade.lessonsLearned,
  tags: backendTrade.tags?.map((t: any) => t.name) || [],
  screenshots: backendTrade.screenshots || [],
  attachments: backendTrade.attachments,
  portfolioId: backendTrade.portfolioId,
  createdAt: backendTrade.createdAt,
  updatedAt: backendTrade.updatedAt,
});

// Trades API Service
export const tradesApi = {
  // Get all trades with optional filters
  async getAll(filters?: TradeFiltersType): Promise<Trade[]> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('symbol', filters.search); // Backend expects 'symbol'
    if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters?.direction && filters.direction !== 'ALL') params.append('type', filters.direction); // Backend expects 'type'
    if (filters?.dateFrom) params.append('startDate', filters.dateFrom); // Backend expects 'startDate'
    if (filters?.dateTo) params.append('endDate', filters.dateTo); // Backend expects 'endDate'
    if (filters?.profitLoss && filters.profitLoss !== 'ALL') {
      if (filters.profitLoss === 'PROFIT') params.append('profitability', 'winning');
      if (filters.profitLoss === 'LOSS') params.append('profitability', 'losing');
    }
    
    // Add portfolio filter if provided
    if (filters?.portfolioId) {
      params.append('portfolioId', filters.portfolioId);
    }
    
    // Set high limit to get all trades (backend default is 10)
    params.append('limit', '1000');
    params.append('page', '1');
    
    const queryString = params.toString();
    const url = queryString ? `/trades?${queryString}` : '/trades';
    const response = await api.get<{ data: any[]; meta: any }>(url);
    
    // Transform backend trades to frontend format
    return response.data.data.map(transformBackendTrade);
  },

  // Get single trade by ID
  async getOne(id: string | number): Promise<Trade> {
    const { data } = await api.get<any>(`/trades/${id}`);
    return transformBackendTrade(data);
  },

  // Create new trade
  async create(tradeData: TradeFormData): Promise<Trade> {
    const { data } = await api.post<any>('/trades', tradeData);
    return transformBackendTrade(data);
  },

  // Update trade
  async update(id: string | number, tradeData: Partial<TradeFormData>): Promise<Trade> {
    const { data } = await api.patch<any>(`/trades/${id}`, tradeData);
    return transformBackendTrade(data);
  },

  // Delete trade
  async delete(id: string | number): Promise<void> {
    await api.delete(`/trades/${id}`);
  },

  // Get trade statistics
  async getStatistics(filters?: { portfolioId?: string | null }): Promise<{
    totalTrades: number;
    openTrades: number;
    winRate: number;
    totalPnL: number;
    profitFactor: number;
  }> {
    const params = new URLSearchParams();
    
    if (filters?.portfolioId) {
      params.append('portfolioId', filters.portfolioId);
    }
    
    const queryString = params.toString();
    const url = queryString ? `/trades/statistics?${queryString}` : '/trades/statistics';
    const { data } = await api.get(url);
    
    return {
      totalTrades: data.totalTrades || 0,
      openTrades: 0, // Will be calculated from data
      winRate: data.winRate || 0,
      totalPnL: data.totalProfitLoss ? Number(data.totalProfitLoss) : 0,
      profitFactor: data.profitFactor || 0,
    };
  },

  // Bulk import trades
  async bulkImport(trades: Partial<TradeFormData>[]): Promise<{
    created: Trade[];
    summary: {
      total: number;
      created: number;
      skipped: number;
      failed: number;
    };
  }> {
    const { data } = await api.post<any>('/trades/bulk', { trades });
    return {
      created: data.created.map(transformBackendTrade),
      summary: data.summary,
    };
  },
};
