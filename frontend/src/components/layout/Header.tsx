import React from 'react';
import { useLocation } from 'react-router-dom';
import { DollarSign, Calendar, Wallet } from 'lucide-react';
import { useFilters } from '../../hooks';

// Helper to get page title from path
const getPageTitle = (pathname: string): string => {
  const routes: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/trades': 'Trades',
    '/analytics': 'Analytics',
    '/portfolios': 'Portfolios',
    '/tags': 'Tags',
  };
  return routes[pathname] || 'Dashboard';
};

export const Header: React.FC = () => {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  // Use global filter context
  const { 
    currency, 
    setCurrency, 
    dateRange, 
    setDateRange, 
    selectedAccount, 
    setSelectedAccount 
  } = useFilters();

  // Mock data - will be replaced with real data from API
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'IDR'];
  const accounts = [
    { id: 'main', name: 'Main Account', balance: '$10,245' },
    { id: 'demo', name: 'Demo Account', balance: '$50,000' },
    { id: 'swing', name: 'Swing Trading', balance: '$5,120' },
  ];
  const dateRanges = ['Today', 'This Week', 'This Month', 'This Year', 'All Time', 'Custom'];

  return (
    <header className="h-16 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between px-6">
      {/* Left: Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
          {pageTitle}
        </h2>
      </div>

      {/* Right: Filters Only */}
      <div className="flex items-center gap-3">
        {/* Currency Selector */}
        <div className="relative">
          <button className="flex items-center gap-2 px-3 py-2 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] rounded-lg transition-colors group">
            <DollarSign size={18} className="text-[var(--color-primary)]" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-transparent text-sm font-medium text-[var(--color-text-primary)] outline-none cursor-pointer pr-2"
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency} className="bg-[var(--color-surface)] text-[var(--color-text-primary)]">
                  {currency}
                </option>
              ))}
            </select>
          </button>
        </div>

        {/* Date Range Picker */}
        <div className="relative">
          <button className="flex items-center gap-2 px-3 py-2 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] rounded-lg transition-colors">
            <Calendar size={18} className="text-[var(--color-primary)]" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-sm font-medium text-[var(--color-text-primary)] outline-none cursor-pointer pr-2"
            >
              {dateRanges.map((range) => (
                <option key={range} value={range} className="bg-[var(--color-surface)] text-[var(--color-text-primary)]">
                  {range}
                </option>
              ))}
            </select>
          </button>
        </div>

        {/* Trading Account Selector */}
        <div className="relative">
          <button className="flex items-center gap-2 px-3 py-2 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] rounded-lg transition-colors min-w-[180px]">
            <Wallet size={18} className="text-[var(--color-primary)]" />
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="bg-transparent text-sm font-medium text-[var(--color-text-primary)] outline-none cursor-pointer flex-1"
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id} className="bg-[var(--color-surface)] text-[var(--color-text-primary)]">
                  {account.name}
                </option>
              ))}
            </select>
          </button>
        </div>
      </div>
    </header>
  );
};
