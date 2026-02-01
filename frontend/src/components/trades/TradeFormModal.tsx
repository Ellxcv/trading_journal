import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TradeFormData } from '../../types/trade';
import { Modal, Button, FileUpload } from '../ui';

interface TradeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TradeFormData) => void;
  initialData?: Partial<TradeFormData>;
  mode: 'create' | 'edit';
}

export const TradeFormModal: React.FC<TradeFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}) => {
  const [formData, setFormData] = useState<TradeFormData>({
    symbol: '',
    direction: 'LONG',
    status: 'OPEN',
    openDate: new Date().toISOString().slice(0, 16),
    entryPrice: 0,
    lots: 0.01,
    ...initialData,
  });

  const [attachments, setAttachments] = useState<Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    uploadedAt: string;
  }>>(initialData?.attachments || []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        symbol: '',
        direction: 'LONG',
        status: 'OPEN',
        openDate: new Date().toISOString().slice(0, 16),
        entryPrice: 0,
        lots: 0.01,
        ...initialData,
      });
      setAttachments(initialData.attachments || []);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, attachments });
    onClose();
  };

  const handleChange = (field: keyof TradeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {mode === 'create' ? 'Add New Trade' : 'Edit Trade'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-surface-light)] rounded-lg transition-colors"
          >
            <X size={20} className="text-[var(--color-text-muted)]" />
          </button>
        </div>

        {/* Trade Details Section */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            Trade Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Symbol *
              </label>
              <input
                type="text"
                required
                value={formData.symbol}
                onChange={(e) => handleChange('symbol', e.target.value.toUpperCase())}
                placeholder="EURUSD"
                className="w-full px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
                  text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]
                  focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Direction *
              </label>
              <div className="flex gap-3">
                <label className="flex-1">
                  <input
                    type="radio"
                    name="direction"
                    value="LONG"
                    checked={formData.direction === 'LONG'}
                    onChange={(e) => handleChange('direction', e.target.value)}
                    className="sr-only peer"
                  />
                  <div className="px-4 py-2 text-center border-2 border-[var(--color-border)] rounded-lg cursor-pointer
                    peer-checked:border-[var(--color-success)] peer-checked:bg-[var(--color-success)]/10
                    peer-checked:text-[var(--color-success)] text-[var(--color-text-secondary)]
                    hover:bg-[var(--color-surface-light)] transition-all">
                    ↑ Long
                  </div>
                </label>
                <label className="flex-1">
                  <input
                    type="radio"
                    name="direction"
                    value="SHORT"
                    checked={formData.direction === 'SHORT'}
                    onChange={(e) => handleChange('direction', e.target.value)}
                    className="sr-only peer"
                  />
                  <div className="px-4 py-2 text-center border-2 border-[var(--color-border)] rounded-lg cursor-pointer
                    peer-checked:border-[var(--color-danger)] peer-checked:bg-[var(--color-danger)]/10
                    peer-checked:text-[var(--color-danger)] text-[var(--color-text-secondary)]
                    hover:bg-[var(--color-surface-light)] transition-all">
                    ↓ Short
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
                  text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors cursor-pointer"
              >
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Lot Size *
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0.01"
                value={formData.lots}
                onChange={(e) => handleChange('lots', parseFloat(e.target.value))}
                className="w-full px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
                  text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Dates Section */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            Dates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Open Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.openDate}
                onChange={(e) => handleChange('openDate', e.target.value)}
                className="w-full px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
                  text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>

            {formData.status === 'CLOSED' && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                  Close Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.closeDate || ''}
                  onChange={(e) => handleChange('closeDate', e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
                    text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>
            )}
          </div>
        </section>

        {/* Prices Section */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            Prices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Entry Price *
              </label>
              <input
                type="number"
                required
                step="0.00001"
                value={formData.entryPrice}
                onChange={(e) => handleChange('entryPrice', parseFloat(e.target.value))}
                className="w-full px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
                  text-[var(--color-text-primary)] font-mono focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>

            {formData.status === 'CLOSED' && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                  Exit Price
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={formData.exitPrice || ''}
                  onChange={(e) => handleChange('exitPrice', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
                    text-[var(--color-text-primary)] font-mono focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Stop Loss
              </label>
              <input
                type="number"
                step="0.00001"
                value={formData.stopLoss || ''}
                onChange={(e) => handleChange('stopLoss', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
                  text-[var(--color-text-primary)] font-mono focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Take Profit
              </label>
              <input
                type="number"
                step="0.00001"
                value={formData.takeProfit || ''}
                onChange={(e) => handleChange('takeProfit', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
                  text-[var(--color-text-primary)] font-mono focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Costs Section */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            Costs (Optional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Commission
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.commission || ''}
                onChange={(e) => handleChange('commission', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
                  text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Swap
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.swap || ''}
                onChange={(e) => handleChange('swap', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
                  text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Strategy & Notes Section */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            Strategy & Notes (Optional)
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Setup/Strategy
              </label>
              <input
                type="text"
                value={formData.setup || ''}
                onChange={(e) => handleChange('setup', e.target.value)}
                placeholder="e.g., Breakout, Pullback, Reversal"
                className="w-full px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
                  text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]
                  focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Entry Reason
              </label>
              <textarea
                rows={3}
                value={formData.entryReason || ''}
                onChange={(e) => handleChange('entryReason', e.target.value)}
                placeholder="Why did you enter this trade?"
                className="w-full px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
                  text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]
                  focus:outline-none focus:border-[var(--color-primary)] transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Exit Reason
              </label>
              <textarea
                rows={3}
                value={formData.exitReason || ''}
                onChange={(e) => handleChange('exitReason', e.target.value)}
                placeholder="Why did you exit this trade?"
                className="w-full px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
                  text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]
                  focus:outline-none focus:border-[var(--color-primary)] transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Mistakes Made
              </label>
              <textarea
                rows={2}
                value={formData.mistakes || ''}
                onChange={(e) => handleChange('mistakes', e.target.value)}
                placeholder="What mistakes did you make?"
                className="w-full px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
                  text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]
                  focus:outline-none focus:border-[var(--color-primary)] transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Lessons Learned
              </label>
              <textarea
                rows={2}
                value={formData.lessonsLearned || ''}
                onChange={(e) => handleChange('lessonsLearned', e.target.value)}
                placeholder="What did you learn from this trade?"
                className="w-full px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
                  text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]
                  focus:outline-none focus:border-[var(--color-primary)] transition-colors resize-none"
              />
            </div>
          </div>
        </section>

        {/* File Attachments Section */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            Attachments (Optional)
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Upload additional documents like trade plans, analysis reports, or notes (PDF, Word, Text files)
          </p>
          <FileUpload
            files={attachments}
            onFilesChange={setAttachments}
            maxSizeMB={10}
          />
        </section>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-[var(--color-border)]">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {mode === 'create' ? 'Add Trade' : 'Update Trade'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
