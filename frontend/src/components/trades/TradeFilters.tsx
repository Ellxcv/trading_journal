import React from 'react';
import { Search, X } from 'lucide-react';
import { TradeFilters as TradeFiltersType } from '../../types/trade';

interface TradeFiltersProps {
  filters: TradeFiltersType;
  onFiltersChange: (filters: TradeFiltersType) => void;
  availableTags: string[];
}

export const TradeFilters: React.FC<TradeFiltersProps> = ({ 
  filters, 
  onFiltersChange,
  availableTags 
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value as TradeFiltersType['status'] });
  };

  const handleDirectionChange = (value: string) => {
    onFiltersChange({ ...filters, direction: value as TradeFiltersType['direction'] });
  };

  const handleProfitLossChange = (value: string) => {
    onFiltersChange({ ...filters, profitLoss: value as TradeFiltersType['profitLoss'] });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'ALL',
      direction: 'ALL',
      profitLoss: 'ALL',
      tags: [],
    });
  };

  const hasActiveFilters = 
    filters.search || 
    filters.status !== 'ALL' || 
    filters.direction !== 'ALL' || 
    filters.profitLoss !== 'ALL' ||
    (filters.tags && filters.tags.length > 0);

  return (
    <div className="glass-card p-4 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by symbol, notes, or tags..."
          className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
            text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]
            focus:outline-none focus:border-[var(--color-primary)] transition-colors"
        />
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-3 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
            text-[var(--color-text-primary)] text-sm
            focus:outline-none focus:border-[var(--color-primary)] transition-colors cursor-pointer"
        >
          <option value="ALL">All Status</option>
          <option value="OPEN">Open</option>
          <option value="CLOSED">Closed</option>
        </select>

        {/* Direction Filter */}
        <select
          value={filters.direction}
          onChange={(e) => handleDirectionChange(e.target.value)}
          className="px-3 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
            text-[var(--color-text-primary)] text-sm
            focus:outline-none focus:border-[var(--color-primary)] transition-colors cursor-pointer"
        >
          <option value="ALL">All Directions</option>
          <option value="LONG">Long Only</option>
          <option value="SHORT">Short Only</option>
        </select>

        {/* Profit/Loss Filter */}
        <select
          value={filters.profitLoss}
          onChange={(e) => handleProfitLossChange(e.target.value)}
          className="px-3 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
            text-[var(--color-text-primary)] text-sm
            focus:outline-none focus:border-[var(--color-primary)] transition-colors cursor-pointer"
        >
          <option value="ALL">All Results</option>
          <option value="PROFIT">Profit Only</option>
          <option value="LOSS">Loss Only</option>
        </select>

        {/* Date From */}
        <input
          type="date"
          value={filters.dateFrom || ''}
          onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
          className="px-3 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
            text-[var(--color-text-primary)] text-sm
            focus:outline-none focus:border-[var(--color-primary)] transition-colors"
        />

        {/* Date To */}
        <input
          type="date"
          value={filters.dateTo || ''}
          onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
          className="px-3 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
            text-[var(--color-text-primary)] text-sm
            focus:outline-none focus:border-[var(--color-primary)] transition-colors"
        />
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]
            hover:bg-[var(--color-surface-light)] rounded-lg transition-colors"
        >
          <X size={16} />
          Clear All Filters
        </button>
      )}
    </div>
  );
};
