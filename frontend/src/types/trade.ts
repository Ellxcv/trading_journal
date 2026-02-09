export interface Trade {
  id: number;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  status: 'OPEN' | 'CLOSED';
  openDate: string;
  closeDate?: string;
  entryPrice: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  lots: number;
  commission?: number;
  swap?: number;
  grossPnL?: number;
  netPnL?: number;
  pnlPercentage?: number;
  riskRewardRatio?: number;
  pips?: number;
  setup?: string;
  entryReason?: string;
  exitReason?: string;
  mistakes?: string;
  lessonsLearned?: string;
  tags?: string[];
  screenshots?: string[];
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    uploadedAt: string;
  }>;
  portfolioId?: string;  // Changed to string to match Portfolio.id type
  createdAt: string;
  updatedAt: string;
}

export interface TradeFilters {
  search: string;
  dateFrom?: string;
  dateTo?: string;
  status?: 'ALL' | 'OPEN' | 'CLOSED';
  direction?: 'ALL' | 'LONG' | 'SHORT';
  profitLoss?: 'ALL' | 'PROFIT' | 'LOSS';
  tags?: string[];
  portfolioId?: string | null;
}

export interface TradeFormData {
  symbol: string;
  direction: 'LONG' | 'SHORT';
  status: 'OPEN' | 'CLOSED';
  openDate: string;
  closeDate?: string;
  entryPrice: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  lots: number;
  commission?: number;
  swap?: number;
  setup?: string;
  entryReason?: string;
  exitReason?: string;
  mistakes?: string;
  lessonsLearned?: string;
  tags?: string[];
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    uploadedAt: string;
  }>;
  portfolioId?: string;  // Changed to string to match Portfolio.id type
}
