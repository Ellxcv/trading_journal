import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { portfoliosApi } from '../../lib/api/portfolios';
import { Portfolio, AccountType } from '../../types/portfolio';
import { AccountTypeBadge } from './AccountTypeBadge';

interface PortfolioSelectorProps {
  selectedPortfolioId?: string | null;
  onSelect: (portfolio: Portfolio | null) => void;
  accountTypeFilter?: AccountType;
}

export const PortfolioSelector: React.FC<PortfolioSelectorProps> = ({
  selectedPortfolioId,
  onSelect,
  accountTypeFilter,
}) => {
  const { data: portfolios, isLoading } = useQuery({
    queryKey: ['portfolios', accountTypeFilter],
    queryFn: () => portfoliosApi.getPortfolios(accountTypeFilter),
  });

  const selectedPortfolio = portfolios?.find(p => p.id === selectedPortfolioId);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
        Portfolio
      </label>
      <div className="relative">
        <select
          value={selectedPortfolioId || ''}
          onChange={(e) => {
            const portfolio = portfolios?.find(p => p.id === e.target.value);
            onSelect(portfolio || null);
          }}
          disabled={isLoading}
          className="w-full px-3 py-2 pr-10 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-primary)] appearance-none cursor-pointer"
        >
          <option value="">All Portfolios</option>
          {portfolios?.map((portfolio) => (
            <option key={portfolio.id} value={portfolio.id}>
              {portfolio.name} ({portfolio.currency} {portfolio.currentBalance.toFixed(2)})
            </option>
          ))}
        </select>
        <ChevronDown 
          size={16} 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
        />
      </div>
      
      {selectedPortfolio && (
        <div className="mt-2 flex items-center gap-2">
          <AccountTypeBadge accountType={selectedPortfolio.accountType} />
          <span className="text-xs text-[var(--color-text-muted)]">
            {selectedPortfolio._count?.trades || 0} trades
          </span>
        </div>
      )}
    </div>
  );
};
