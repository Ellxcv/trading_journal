import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit, TrendingUp, BarChart3, MoveRight } from 'lucide-react';
import { portfoliosApi } from '../lib/api/portfolios';
import { Portfolio, AccountType } from '../types/portfolio';
import { CreatePortfolioModal, EditPortfolioModal, MoveTradesModal, PortfolioStatsModal, AccountTypeBadge } from '../components/portfolios';

export const PortfoliosPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [accountTypeFilter, setAccountTypeFilter] = useState<AccountType | undefined>(undefined);
  const queryClient = useQueryClient();

  const { data: portfolios, isLoading } = useQuery({
    queryKey: ['portfolios', accountTypeFilter],
    queryFn: () => portfoliosApi.getPortfolios(accountTypeFilter),
  });

  const { data: unassignedData } = useQuery({
    queryKey: ['unassigned-trades-count'],
    queryFn: portfoliosApi.getUnassignedTradesCount,
  });

  const deleteMutation = useMutation({
    mutationFn: portfoliosApi.deletePortfolio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete portfolio';
      alert(message);
    },
  });

  const assignMutation = useMutation({
    mutationFn: portfoliosApi.assignUnassignedTrades,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      queryClient.invalidateQueries({ queryKey: ['unassigned-trades-count'] });
      alert(data.message);
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete portfolio "${name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleAssign = (id: string, name: string) => {
    if (confirm(`Assign all unassigned trades to "${name}"?`)) {
      assignMutation.mutate(id);
    }
  };

  const unassignedCount = unassignedData?.count || 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
          Portfolios
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Manage your trading portfolios and track performance
        </p>
      </div>

      {/* Actions & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setAccountTypeFilter(undefined)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              accountTypeFilter === undefined
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setAccountTypeFilter(AccountType.REAL)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              accountTypeFilter === AccountType.REAL
                ? 'bg-green-500 text-white'
                : 'bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'
            }`}
          >
            💰 Real
          </button>
          <button
            onClick={() => setAccountTypeFilter(AccountType.DEMO)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              accountTypeFilter === AccountType.DEMO
                ? 'bg-orange-500 text-white'
                : 'bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'
            }`}
          >
            🎮 Demo
          </button>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="ml-auto px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Create Portfolio
        </button>
      </div>

      {/* Portfolios Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          Loading portfolios...
        </div>
      ) : portfolios && portfolios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolios.map((portfolio) => (
            <PortfolioCard
              key={portfolio.id}
              portfolio={portfolio}
              unassignedCount={unassignedCount}
              onDelete={handleDelete}
              onAssign={handleAssign}
              onViewStats={(p) => {
                setSelectedPortfolio(p);
                setIsStatsModalOpen(true);
              }}
              onEdit={(p) => {
                setSelectedPortfolio(p);
                setIsEditModalOpen(true);
              }}
              onMove={(p) => {
                setSelectedPortfolio(p);
                setIsMoveModalOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-[var(--color-text-muted)] mb-4">
            {accountTypeFilter
              ? `No ${accountTypeFilter.toLowerCase()} portfolios found`
              : 'No portfolios yet'}
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Create Your First Portfolio
          </button>
        </div>
      )}

      {/* Create Modal */}
      {/* Modals */}
      <CreatePortfolioModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <PortfolioStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => {
          setIsStatsModalOpen(false);
          setSelectedPortfolio(null);
        }}
        portfolioId={selectedPortfolio?.id || ''}
      />
      <EditPortfolioModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPortfolio(null);
        }}
        portfolio={selectedPortfolio}
      />
      <MoveTradesModal
        isOpen={isMoveModalOpen}
        onClose={() => {
          setIsMoveModalOpen(false);
          setSelectedPortfolio(null);
        }}
        sourcePortfolio={selectedPortfolio}
      />
    </div>
  );
};

// Portfolio Card Component
interface PortfolioCardProps {
  portfolio: Portfolio;
  unassignedCount: number;
  onDelete: (id: string, name: string) => void;
  onAssign: (id: string, name: string) => void;
  onViewStats: (portfolio: Portfolio) => void;
  onEdit: (portfolio: Portfolio) => void;
  onMove: (portfolio: Portfolio) => void;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({ 
  portfolio, 
  unassignedCount,
  onDelete,
  onAssign,
  onViewStats,
  onEdit,
  onMove
}) => {
  // Convert Decimal to number for calculations
  const currentBalance = Number(portfolio.currentBalance);
  const initialBalance = Number(portfolio.initialBalance);
  const pnl = currentBalance - initialBalance;
  const pnlPercent = (pnl / initialBalance) * 100;

  return (
    <div className="glass-card p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
            {portfolio.name}
          </h3>
          <AccountTypeBadge accountType={portfolio.accountType} />
        </div>
        <div className="flex gap-2">
          {(portfolio._count?.trades ?? 0) > 0 && (
            <button
              onClick={() => onMove(portfolio)}
              className="p-2 hover:bg-blue-100 rounded-lg transition-colors group"
              title="Move trades to another portfolio"
            >
              <MoveRight size={16} className="text-[var(--color-text-muted)] group-hover:text-blue-500" />
            </button>
          )}
          <button
            onClick={() => onDelete(portfolio.id, portfolio.name)}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
          >
            <Trash2 size={16} className="text-[var(--color-text-muted)] group-hover:text-red-500" />
          </button>
        </div>
      </div>

      {/* Description */}
      {portfolio.description && (
        <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-2">
          {portfolio.description}
        </p>
      )}

      {/* Stats */}
      <div className="space-y-3">
        {/* Balance */}
        <div>
          <div className="text-xs text-[var(--color-text-muted)] mb-1">Current Balance</div>
          <div className="text-2xl font-bold text-[var(--color-text-primary)]">
            {portfolio.currency} {currentBalance.toFixed(2)}
          </div>
        </div>

        {/* P&L */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
          <div>
            <div className="text-xs text-[var(--color-text-muted)] mb-1">Total P&L</div>
            <div className={`text-lg font-semibold ${
              pnl >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
            }`}>
              {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%)
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[var(--color-text-muted)] mb-1">Trades</div>
            <div className="text-lg font-semibold text-[var(--color-text-primary)]">
              {portfolio._count?.trades || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 mt-4 pt-4 border-t border-[var(--color-border)]">
        {/* Assign Button - Only show if there are unassigned trades */}
        {unassignedCount > 0 && (
          <button
            onClick={() => onAssign(portfolio.id, portfolio.name)}
            className="w-full px-3 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <TrendingUp size={16} />
            Assign {unassignedCount} Unassigned Trade{unassignedCount > 1 ? 's' : ''}
          </button>
        )}
        
        <div className="flex gap-2">
          <button 
            onClick={() => onViewStats(portfolio)}
            className="flex-1 px-3 py-2 bg-[var(--color-surface-light)] hover:bg-[var(--color-surface)] rounded-lg transition-colors flex items-center justify-center gap-2 text-sm text-[var(--color-text-primary)]">
            <BarChart3 size={16} />
            View Stats
          </button>
          <button 
            onClick={() => onEdit(portfolio)}
            className="flex-1 px-3 py-2 bg-[var(--color-surface-light)] hover:bg-[var(--color-surface)] rounded-lg transition-colors flex items-center justify-center gap-2 text-sm text-[var(--color-text-primary)]">
            <Edit size={16} />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};
