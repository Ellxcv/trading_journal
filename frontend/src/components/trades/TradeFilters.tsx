import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { TradeFilters as TradeFiltersType } from '../../types/trade';

interface TradeFiltersProps {
  filters: TradeFiltersType;
  onFiltersChange: (filters: TradeFiltersType) => void;
  availableTags: string[];
}

type DateRangePreset = 'ALL' | 'TODAY' | 'LAST_WEEK' | 'LAST_MONTH' | 'LAST_3_MONTHS' | 'CUSTOM';

export const TradeFilters: React.FC<TradeFiltersProps> = ({ 
  filters, 
  onFiltersChange,
  availableTags 
}) => {
  // Local state for search input (not yet applied)
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [datePreset, setDatePreset] = useState<DateRangePreset>('ALL');

  // Calculate date ranges based on preset
  const calculateDateRange = (preset: DateRangePreset): { dateFrom?: string; dateTo?: string } => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    switch (preset) {
      case 'TODAY':
        return { dateFrom: formatDate(today), dateTo: formatDate(today) };
      
      case 'LAST_WEEK': {
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);
        return { dateFrom: formatDate(lastWeek), dateTo: formatDate(today) };
      }
      
      case 'LAST_MONTH': {
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        return { dateFrom: formatDate(lastMonth), dateTo: formatDate(today) };
      }
      
      case 'LAST_3_MONTHS': {
        const last3Months = new Date(today);
        last3Months.setMonth(today.getMonth() - 3);
        return { dateFrom: formatDate(last3Months), dateTo: formatDate(today) };
      }
      
      case 'CUSTOM':
      case 'ALL':
      default:
        return { dateFrom: undefined, dateTo: undefined };
    }
  };

  // Handle date preset change
  const handleDatePresetChange = (preset: DateRangePreset) => {
    setDatePreset(preset);
    
    if (preset === 'CUSTOM') {
      // Keep existing custom dates or clear them
      // Don't auto-apply until user sets dates
      return;
    }
    
    // Apply preset dates immediately
    const range = calculateDateRange(preset);
    onFiltersChange({ 
      ...filters, 
      dateFrom: range.dateFrom,
      dateTo: range.dateTo 
    });
  };

  const handleSearchSubmit = () => {
    onFiltersChange({ ...filters, search: searchInput });
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
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
    setSearchInput('');
    setDatePreset('ALL');
    onFiltersChange({
      search: '',
      status: 'ALL',
      direction: 'ALL',
      profitLoss: 'ALL',
      tags: [],
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  const hasActiveFilters = 
    filters.search || 
    filters.status !== 'ALL' || 
    filters.direction !== 'ALL' || 
    filters.profitLoss !== 'ALL' ||
    filters.dateFrom ||
    filters.dateTo ||
    (filters.tags && filters.tags.length > 0);

  return (
    <div className="glass-card p-4 space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            placeholder="Search by symbol, notes, or tags..."
            className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
              text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]
              focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
        </div>
        <button
          onClick={handleSearchSubmit}
          className="px-6 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] 
            text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
        >
          <Search size={18} />
          Search
        </button>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
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

        {/* Date Range Preset Dropdown */}
        <select
          value={datePreset}
          onChange={(e) => handleDatePresetChange(e.target.value as DateRangePreset)}
          className="px-3 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
            text-[var(--color-text-primary)] text-sm col-span-2 md:col-span-1
            focus:outline-none focus:border-[var(--color-primary)] transition-colors cursor-pointer"
        >
          <option value="ALL">All Time</option>
          <option value="TODAY">Today</option>
          <option value="LAST_WEEK">Last Week</option>
          <option value="LAST_MONTH">Last Month</option>
          <option value="LAST_3_MONTHS">Last 3 Months</option>
          <option value="CUSTOM">Custom Range</option>
        </select>
      </div>

      {/* Custom Date Range Inputs - Only show when CUSTOM is selected */}
      {datePreset === 'CUSTOM' && (
        <div className="grid grid-cols-2 gap-3 pl-4 border-l-2 border-[var(--color-primary)]">
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1">Start Date</label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
                text-[var(--color-text-primary)] text-sm
                focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1">End Date</label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
                text-[var(--color-text-primary)] text-sm
                focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>
        </div>
      )}

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
