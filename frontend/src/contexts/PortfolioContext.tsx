import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Portfolio } from '../types/portfolio';

interface PortfolioContextType {
  selectedPortfolio: Portfolio | null;
  setSelectedPortfolio: (portfolio: Portfolio | null) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);

  return (
    <PortfolioContext.Provider value={{ selectedPortfolio, setSelectedPortfolio }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
