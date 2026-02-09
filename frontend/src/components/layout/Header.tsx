import React from 'react';
import { useLocation } from 'react-router-dom';
import { DollarSign, Calendar, Wallet } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useFilters } from '../../hooks';
import { usePortfolio } from '../../contexts/PortfolioContext';
import { portfoliosApi } from '../../lib/api/portfolios';

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
    setDateRange 
  } = useFilters();

  // Use global portfolio context
  const { selectedPortfolio, setSelectedPortfolio } = usePortfolio();

  // Fetch portfolios
  const { data: portfolios } = useQuery({
    queryKey: ['portfolios'],
    queryFn: () => portfoliosApi.getPortfolios(),
  });

  // Mock data for currency and date range
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'IDR'];
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

        {/* Portfolio Selector */}
        <div className="relative">
          <button className="flex items-center gap-2 px-3 py-2 bg-[var(--color-surface-light)] hover:bg-[var(--color-border)] rounded-lg transition-colors min-w-[200px]">
            <Wallet size={18} className="text-[var(--color-primary)]" />
            <select
              value={selectedPortfolio?.id || ''}
              onChange={(e) => {
                const portfolio = portfolios?.find(p => p.id === e.target.value);
                setSelectedPortfolio(portfolio || null);
              }}
              className="bg-transparent text-sm font-medium text-[var(--color-text-primary)] outline-none cursor-pointer flex-1"
            >
              <option value="" className="bg-[var(--color-surface)] text-[var(--color-text-primary)]">
                All Portfolios
              </option>
              {portfolios?.map((portfolio) => (
                <option key={portfolio.id} value={portfolio.id} className="bg-[var(--color-surface)] text-[var(--color-text-primary)]">
                  {portfolio.name} ({portfolio.accountType})
                </option>
              ))}
            </select>
          </button>
        </div>
      </div>
    </header>
  );
};
