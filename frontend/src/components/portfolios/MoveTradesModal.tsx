import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, ArrowRight } from 'lucide-react';
import { portfoliosApi } from '../../lib/api/portfolios';
import { Portfolio } from '../../types/portfolio';
import { AccountTypeBadge } from './AccountTypeBadge';

interface MoveTradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourcePortfolio: Portfolio | null;
}

export const MoveTradesModal: React.FC<MoveTradesModalProps> = ({
  isOpen,
  onClose,
  sourcePortfolio,
}) => {
  const queryClient = useQueryClient();
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');

  const { data: portfolios } = useQuery({
    queryKey: ['portfolios'],
    queryFn: () => portfoliosApi.getPortfolios(),
    enabled: isOpen,
  });

  const moveMutation = useMutation({
    mutationFn: () => portfoliosApi.moveTradesTo(sourcePortfolio!.id, selectedTargetId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      alert(data.message);
      onClose();
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || 'Failed to move trades');
    },
  });

  const handleMove = () => {
    if (!selectedTargetId) {
      alert('Please select a target portfolio');
      return;
    }
    if (confirm(`Move all trades from "${sourcePortfolio?.name}" to the selected portfolio?`)) {
      moveMutation.mutate();
    }
  };

  // Filter out the source portfolio from target options
  const targetPortfolios = portfolios?.filter(p => p.id !== sourcePortfolio?.id) || [];

  if (!isOpen || !sourcePortfolio) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-surface)] rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            Move Trades
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-surface-light)] rounded-lg transition-colors"
          >
            <X size={20} className="text-[var(--color-text-secondary)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Source Portfolio */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              From Portfolio
            </label>
            <div className="glass-card p-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-[var(--color-text-primary)]">{sourcePortfolio.name}</div>
                <div className="text-sm text-[var(--color-text-muted)] mt-1">
                  {sourcePortfolio._count?.trades || 0} trade(s)
                </div>
              </div>
              <AccountTypeBadge accountType={sourcePortfolio.accountType} />
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowRight size={24} className="text-[var(--color-text-muted)]" />
          </div>

          {/* Target Portfolio */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              To Portfolio *
            </label>
            {targetPortfolios.length > 0 ? (
              <select
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-primary)]"
              >
                <option value="">Select target portfolio...</option>
                {targetPortfolios.map((portfolio) => (
                  <option key={portfolio.id} value={portfolio.id}>
                    {portfolio.name} ({portfolio.accountType}) - {portfolio._count?.trades || 0} trade(s)
                  </option>
                ))}
              </select>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
                No other portfolios available. Please create a target portfolio first.
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> All {sourcePortfolio._count?.trades || 0} trade(s) from "{sourcePortfolio.name}" will be moved to the selected portfolio. This action cannot be undone.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-light)] transition-colors text-[var(--color-text-primary)]"
            >
              Cancel
            </button>
            <button
              onClick={handleMove}
              disabled={!selectedTargetId || moveMutation.isPending || targetPortfolios.length === 0}
              className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {moveMutation.isPending ? 'Moving...' : 'Move Trades'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
