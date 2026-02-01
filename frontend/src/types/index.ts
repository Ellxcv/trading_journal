export interface User {
  id: number;
  email: string;
  name?: string;
  role: string;
}

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

// Trade types
export type { Trade, TradeFilters, TradeFormData } from './trade';
