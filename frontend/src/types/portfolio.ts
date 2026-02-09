export enum AccountType {
  REAL = 'REAL',
  DEMO = 'DEMO'
}

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  initialBalance: number;
  currentBalance: number;
  currency: string;
  accountType: AccountType;
  createdAt: string;
  updatedAt: string;
  _count?: {
    trades: number;
  };
}

export interface PortfolioStats {
  portfolio: Portfolio;
  stats: {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    totalPnL: number;
    totalGrossPnL: number;
    totalCommission: number;
    profitFactor: number | 'Infinity';
    averagePnL: number;
  };
}

export interface CreatePortfolioPayload {
  name: string;
  description?: string;
  initialBalance: number;
  currency?: string;
  accountType?: AccountType;
}

export interface UpdatePortfolioPayload {
  name?: string;
  description?: string;
  initialBalance?: number;
  currentBalance?: number;
  currency?: string;
  accountType?: AccountType;
}
