import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FilterContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
  selectedAccount: string;
  setSelectedAccount: (account: string) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const [currency, setCurrency] = useState('USD');
  const [dateRange, setDateRange] = useState('This Month');
  const [selectedAccount, setSelectedAccount] = useState('main');

  return (
    <FilterContext.Provider
      value={{
        currency,
        setCurrency,
        dateRange,
        setDateRange,
        selectedAccount,
        setSelectedAccount,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within FilterProvider');
  }
  return context;
};
