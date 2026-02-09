import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { portfoliosApi } from '../../lib/api/portfolios';
import { CreatePortfolioPayload, AccountType } from '../../types/portfolio';

interface CreatePortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePortfolioModal: React.FC<CreatePortfolioModalProps> = ({
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreatePortfolioPayload>({
    name: '',
    description: '',
    initialBalance: 10000,
    currency: 'USD',
    accountType: AccountType.DEMO,
  });

  const createMutation = useMutation({
    mutationFn: portfoliosApi.createPortfolio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      onClose();
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      initialBalance: 10000,
      currency: 'USD',
      accountType: AccountType.DEMO,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-surface)] rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            Create New Portfolio
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-surface-light)] rounded-lg transition-colors"
          >
            <X size={20} className="text-[var(--color-text-secondary)]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Portfolio Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Portfolio Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-primary)]"
              placeholder="My Trading Portfolio"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-primary)]"
              placeholder="Optional description..."
            />
          </div>

          {/* Initial Balance */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Initial Balance *
            </label>
            <div className="flex gap-2">
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="px-3 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-primary)]"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.initialBalance}
                onChange={(e) => setFormData({ ...formData, initialBalance: Number(e.target.value) })}
                className="flex-1 px-3 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-primary)]"
              />
            </div>
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Account Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, accountType: AccountType.DEMO })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.accountType === AccountType.DEMO
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-light)] text-[var(--color-text-secondary)]'
                }`}
              >
                <div className="text-2xl mb-1">🎮</div>
                <div className="font-medium">Demo</div>
                <div className="text-xs opacity-75">Practice trading</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, accountType: AccountType.REAL })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.accountType === AccountType.REAL
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-light)] text-[var(--color-text-secondary)]'
                }`}
              >
                <div className="text-2xl mb-1">💰</div>
                <div className="font-medium">Real</div>
                <div className="text-xs opacity-75">Live trading</div>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-light)] transition-colors text-[var(--color-text-primary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Portfolio'}
            </button>
          </div>

          {createMutation.isError && (
            <div className="text-sm text-red-500 text-center">
              Failed to create portfolio. Please try again.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
