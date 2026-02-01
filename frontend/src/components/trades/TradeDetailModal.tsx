import React from 'react';
import { X, TrendingUp, TrendingDown, Calendar, DollarSign, Target } from 'lucide-react';
import { Trade } from '../../types/trade';
import { Modal, Badge } from '../ui';

interface TradeDetailModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (trade: Trade) => void;
  onDelete: (trade: Trade) => void;
}

export const TradeDetailModal: React.FC<TradeDetailModalProps> = ({
  trade,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!trade) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => price.toFixed(5);
  const formatPnL = (pnl: number | undefined) => {
    if (pnl === undefined) return '-';
    const sign = pnl >= 0 ? '+' : '';
    return `${sign}$${pnl.toFixed(2)}`;
  };

  const pnlColor = trade.netPnL && trade.netPnL >= 0 
    ? 'text-[var(--color-success)]' 
    : 'text-[var(--color-danger)]';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <div className="p-6 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
              {trade.symbol}
            </h2>
            <div className="flex items-center gap-3">
              <Badge variant={trade.status === 'OPEN' ? 'info' : 'default'}>
                {trade.status}
              </Badge>
              <div className={`flex items-center gap-1 ${
                trade.direction === 'LONG' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
              }`}>
                {trade.direction === 'LONG' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                <span className="font-semibold">{trade.direction}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-surface-light)] rounded-lg transition-colors"
          >
            <X size={20} className="text-[var(--color-text-muted)]" />
          </button>
        </div>

        {/* General Info */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
            General Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[var(--color-surface-light)] rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={16} className="text-[var(--color-text-muted)]" />
                <p className="text-sm text-[var(--color-text-muted)]">Open Date</p>
              </div>
              <p className="font-semibold text-[var(--color-text-primary)]">
                {formatDate(trade.openDate)}
              </p>
            </div>
            {trade.closeDate && (
              <div className="p-4 bg-[var(--color-surface-light)] rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={16} className="text-[var(--color-text-muted)]" />
                  <p className="text-sm text-[var(--color-text-muted)]">Close Date</p>
                </div>
                <p className="font-semibold text-[var(--color-text-primary)]">
                  {formatDate(trade.closeDate)}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Prices */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
            Prices
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[var(--color-surface-light)] rounded-lg">
              <p className="text-sm text-[var(--color-text-muted)] mb-1">Entry Price</p>
              <p className="font-mono font-bold text-[var(--color-text-primary)]">
                {formatPrice(trade.entryPrice)}
              </p>
            </div>
            {trade.exitPrice && (
              <div className="p-4 bg-[var(--color-surface-light)] rounded-lg">
                <p className="text-sm text-[var(--color-text-muted)] mb-1">Exit Price</p>
                <p className="font-mono font-bold text-[var(--color-text-primary)]">
                  {formatPrice(trade.exitPrice)}
                </p>
              </div>
            )}
            {trade.stopLoss && (
              <div className="p-4 bg-[var(--color-surface-light)] rounded-lg">
                <p className="text-sm text-[var(--color-text-muted)] mb-1">Stop Loss</p>
                <p className="font-mono font-bold text-[var(--color-danger)]">
                  {formatPrice(trade.stopLoss)}
                </p>
              </div>
            )}
            {trade.takeProfit && (
              <div className="p-4 bg-[var(--color-surface-light)] rounded-lg">
                <p className="text-sm text-[var(--color-text-muted)] mb-1">Take Profit</p>
                <p className="font-mono font-bold text-[var(--color-success)]">
                  {formatPrice(trade.takeProfit)}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Results */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
            Results
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[var(--color-surface-light)] rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign size={16} className="text-[var(--color-text-muted)]" />
                <p className="text-sm text-[var(--color-text-muted)]">Net P&L</p>
              </div>
              <p className={`text-2xl font-bold ${pnlColor}`}>
                {formatPnL(trade.netPnL)}
              </p>
            </div>
            {trade.pnlPercentage !== undefined && (
              <div className="p-4 bg-[var(--color-surface-light)] rounded-lg">
                <p className="text-sm text-[var(--color-text-muted)] mb-1">P&L %</p>
                <p className={`text-2xl font-bold ${pnlColor}`}>
                  {trade.pnlPercentage >= 0 ? '+' : ''}{trade.pnlPercentage.toFixed(2)}%
                </p>
              </div>
            )}
            {trade.riskRewardRatio !== undefined && (
              <div className="p-4 bg-[var(--color-surface-light)] rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Target size={16} className="text-[var(--color-text-muted)]" />
                  <p className="text-sm text-[var(--color-text-muted)]">R:R Ratio</p>
                </div>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {trade.riskRewardRatio.toFixed(2)}
                </p>
              </div>
            )}
            <div className="p-4 bg-[var(--color-surface-light)] rounded-lg">
              <p className="text-sm text-[var(--color-text-muted)] mb-1">Lots</p>
              <p className="text-xl font-bold text-[var(--color-text-primary)]">
                {trade.lots.toFixed(2)}
              </p>
            </div>
            {trade.pips !== undefined && (
              <div className="p-4 bg-[var(--color-surface-light)] rounded-lg">
                <p className="text-sm text-[var(--color-text-muted)] mb-1">Pips</p>
                <p className="text-xl font-bold text-[var(--color-text-primary)]">
                  {trade.pips.toFixed(1)}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Strategy & Notes */}
        {(trade.setup || trade.entryReason || trade.exitReason || trade.mistakes || trade.lessonsLearned) && (
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
              Strategy & Notes
            </h3>
            <div className="space-y-4">
              {trade.setup && (
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-muted)] mb-1">Setup</p>
                  <p className="text-[var(--color-text-primary)]">{trade.setup}</p>
                </div>
              )}
              {trade.entryReason && (
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-muted)] mb-1">Entry Reason</p>
                  <p className="text-[var(--color-text-primary)]">{trade.entryReason}</p>
                </div>
              )}
              {trade.exitReason && (
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-muted)] mb-1">Exit Reason</p>
                  <p className="text-[var(--color-text-primary)]">{trade.exitReason}</p>
                </div>
              )}
              {trade.mistakes && (
                <div>
                  <p className="text-sm font-medium text-[var(--color-danger)] mb-1">Mistakes</p>
                  <p className="text-[var(--color-text-primary)]">{trade.mistakes}</p>
                </div>
              )}
              {trade.lessonsLearned && (
                <div>
                  <p className="text-sm font-medium text-[var(--color-success)] mb-1">Lessons Learned</p>
                  <p className="text-[var(--color-text-primary)]">{trade.lessonsLearned}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tags */}
        {trade.tags && trade.tags.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {trade.tags.map((tag, index) => (
                <Badge key={index} variant="default">
                  {tag}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Attachments */}
        {trade.attachments && trade.attachments.length > 0 && (
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
              Attachments ({trade.attachments.length})
            </h3>
            <div className="space-y-2">
              {trade.attachments.map((file) => (
                <a
                  key={file.id}
                  href={file.url}
                  download={file.name}
                  className="flex items-center gap-3 p-3 bg-[var(--color-surface-light)] rounded-lg hover:bg-[var(--color-border)] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {(file.size / 1024).toFixed(1)} KB • {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-[var(--color-primary)] hover:text-[var(--color-primary-light)]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this trade?')) {
                onDelete(trade);
                onClose();
              }
            }}
            className="px-4 py-2 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 rounded-lg transition-colors"
          >
            Delete Trade
          </button>
          <button
            onClick={() => {
              onEdit(trade);
              onClose();
            }}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Edit Trade
          </button>
        </div>
      </div>
    </Modal>
  );
};
