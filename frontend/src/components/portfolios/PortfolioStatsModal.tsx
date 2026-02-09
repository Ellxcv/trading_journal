import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { portfoliosApi } from '../../lib/api/portfolios';
import { AccountTypeBadge } from './AccountTypeBadge';

interface PortfolioStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioId: string;
}

export const PortfolioStatsModal: React.FC<PortfolioStatsModalProps> = ({
  isOpen,
  onClose,
  portfolioId,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['portfolio-stats', portfolioId],
    queryFn: () => portfoliosApi.getPortfolioStats(portfolioId),
    enabled: isOpen && !!portfolioId,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[var(--color-surface)] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-surface)] z-10">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
              {data?.portfolio.name || 'Portfolio Statistics'}
            </h2>
            {data?.portfolio && (
              <div className="mt-2">
                <AccountTypeBadge accountType={data.portfolio.accountType} />
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-surface-light)] rounded-lg transition-colors"
          >
            <X size={20} className="text-[var(--color-text-secondary)]" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-6 text-center text-[var(--color-text-muted)]">Loading statistics...</div>
        ) : data ? (
          <div className="p-6 space-y-6">
            {/* Balance Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4">
                <div className="text-xs text-[var(--color-text-muted)] mb-1">Initial Balance</div>
                <div className="text-xl font-bold text-[var(--color-text-primary)]">
                  {data.portfolio.currency} {Number(data.portfolio.initialBalance).toFixed(2)}
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="text-xs text-[var(--color-text-muted)] mb-1">Current Balance</div>
                <div className="text-xl font-bold text-[var(--color-text-primary)]">
                  {data.portfolio.currency} {Number(data.portfolio.currentBalance).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Trading Stats */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                <BarChart3 size={16} />
                Trading Performance
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                  label="Total Trades"
                  value={data.stats.totalTrades.toString()}
                  icon={<BarChart3 size={16} />}
                />
                <StatCard
                  label="Winning Trades"
                  value={data.stats.winningTrades.toString()}
                  icon={<TrendingUp size={16} />}
                  valueColor="text-[var(--color-success)]"
                />
                <StatCard
                  label="Losing Trades"
                  value={data.stats.losingTrades.toString()}
                  icon={<TrendingDown size={16} />}
                  valueColor="text-[var(--color-danger)]"
                />
                <StatCard
                  label="Win Rate"
                  value={`${data.stats.winRate.toFixed(1)}%`}
                  icon={<BarChart3 size={16} />}
                  valueColor={data.stats.winRate >= 50 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}
                />
              </div>
            </div>

            {/* P&L Stats */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                <DollarSign size={16} />
                Profit & Loss
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatCard
                  label="Total P&L"
                  value={`${data.stats.totalPnL >= 0 ? '+' : ''}$${data.stats.totalPnL.toFixed(2)}`}
                  valueColor={data.stats.totalPnL >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}
                />
                <StatCard
                  label="Gross P&L"
                  value={`$${data.stats.totalGrossPnL.toFixed(2)}`}
                />
                <StatCard
                  label="Commission"
                  value={`$${data.stats.totalCommission.toFixed(2)}`}
                  valueColor="text-[var(--color-danger)]"
                />
                <StatCard
                  label="Average P&L"
                  value={`${data.stats.averagePnL >= 0 ? '+' : ''}$${data.stats.averagePnL.toFixed(2)}`}
                  valueColor={data.stats.averagePnL >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}
                />
                <StatCard
                  label="Profit Factor"
                  value={data.stats.profitFactor.toString()}
                  valueColor={Number(data.stats.profitFactor) >= 1 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}
                />
              </div>
            </div>

            {/* Description */}
            {data.portfolio.description && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">Description</h3>
                <p className="text-sm text-[var(--color-text-secondary)] bg-[var(--color-surface-light)] p-3 rounded-lg">
                  {data.portfolio.description}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center text-[var(--color-text-muted)]">Failed to load statistics</div>
        )}
      </div>
    </div>
  );
};

// Helper component for stat cards
interface StatCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  valueColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, valueColor = 'text-[var(--color-text-primary)]' }) => (
  <div className="bg-[var(--color-surface-light)] p-3 rounded-lg">
    <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] mb-1">
      {icon}
      {label}
    </div>
    <div className={`text-lg font-bold ${valueColor}`}>
      {value}
    </div>
  </div>
);
