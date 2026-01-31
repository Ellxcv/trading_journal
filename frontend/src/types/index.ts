// User types
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

// Trade types
export enum TradeType {
  LONG = 'LONG',
  SHORT = 'SHORT',
}

export enum TradeStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

export interface Trade {
  id: string;
  userId: string;
  portfolioId?: string;
  symbol: string;
  type: TradeType;
  status: TradeStatus;
  entryPrice: number;
  entryDate: string;
  quantity: number;
  exitPrice?: number;
  exitDate?: string;
  stopLoss?: number;
  takeProfit?: number;
  profitLoss?: number;
  commission?: number;
  netProfitLoss?: number;
  notes?: string;
  screenshots?: string[];
  strategy?: string;
  timeframe?: string;
  createdAt: string;
  updatedAt: string;
  tags?: Tag[];
}

// Portfolio types
export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description?: string;
  initialBalance: number;
  currentBalance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioHistory {
  id: string;
  portfolioId: string;
  balance: number;
  equity?: number;
  date: string;
  notes?: string;
  createdAt: string;
}

// Tag types
export enum TagType {
  STRATEGY = 'STRATEGY',
  MARKET = 'MARKET',
  SETUP = 'SETUP',
  TIMEFRAME = 'TIMEFRAME',
  OTHER = 'OTHER',
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  type: TagType;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

// Analytics types
export interface AnalyticsOverview {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfitLoss: number;
  totalCommission: number;
  netProfitLoss: number;
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
  averageWin: number;
  averageLoss: number;
  averageRR: number;
}

export interface PerformanceChartData {
  date: string;
  cumulativePL: number;
  trade?: Trade;
}

export interface MonthlyPerformance {
  month: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalPL: number;
  winRate: number;
}

// Trade statistics
export interface TradeStatistics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfitLoss: number;
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
  averageWin: number;
  averageLoss: number;
}

// API Query params
export interface TradeFilters {
  symbol?: string;
  type?: TradeType;
  status?: TradeStatus;
  startDate?: string;
  endDate?: string;
  strategy?: string;
  profitability?: 'winning' | 'losing';
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Form types
export interface TradeFormData {
  symbol: string;
  type: TradeType;
  status: TradeStatus;
  entryPrice: number;
  entryDate: Date;
  quantity: number;
  exitPrice?: number;
  exitDate?: Date;
  stopLoss?: number;
  takeProfit?: number;
  commission?: number;
  notes?: string;
  strategy?: string;
  timeframe?: string;
}
