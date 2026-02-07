import React from 'react';
import { X } from 'lucide-react';
import type { Trade } from '../../types/trade';

interface HourTradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  hour: number;
  trades: Trade[];
}

export const HourTradesModal: React.FC<HourTradesModalProps> = ({
  isOpen,
  onClose,
  hour,
  trades,
}) => {
  if (!isOpen) return null;

  const formatHour = (h: number) => {
    if (h === 0) return '12 AM';
    if (h < 12) return `${h} AM`;
    if (h === 12) return '12 PM';
    return `${h - 12} PM`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalPnL = trades.reduce((sum, t) => sum + (Number(t.netPnL) || 0), 0);
  const avgPnL = trades.length > 0 ? totalPnL / trades.length : 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                Trades at {formatHour(hour)}
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                {trades.length} trades | Total: ${totalPnL.toFixed(2)} | Avg: ${avgPnL.toFixed(2)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--color-surface-light)] rounded-lg transition-colors"
            >
              <X size={24} className="text-[var(--color-text-muted)]" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {trades.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-[var(--color-text-muted)]">
                No trades found for this hour
              </div>
            ) : (
              <div className="space-y-3">
                {trades.map((trade) => {
                  const pnl = Number(trade.netPnL) || 0;
                  const isProfit = pnl >= 0;
                  
                  return (
                    <div
                      key={trade.id}
                      className="glass-card p-4 hover:border-[var(--color-primary)] transition-colors"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Symbol & Type */}
                        <div>
                          <div className="text-xs text-[var(--color-text-muted)] mb-1">Symbol</div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--color-text-primary)]">
                              {trade.symbol}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                trade.direction === 'LONG'
                                  ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]'
                                  : 'bg-[var(--color-danger)]/20 text-[var(--color-danger)]'
                              }`}
                            >
                              {trade.direction}
                            </span>
                          </div>
                        </div>

                        {/* Entry/Exit */}
                        <div>
                          <div className="text-xs text-[var(--color-text-muted)] mb-1">Price</div>
                          <div className="text-sm text-[var(--color-text-primary)]">
                            {trade.entryPrice.toFixed(5)}
                            {trade.exitPrice && (
                              <span> → {trade.exitPrice.toFixed(5)}</span>
                            )}
                          </div>
                        </div>

                        {/* Date/Time */}
                        <div>
                          <div className="text-xs text-[var(--color-text-muted)] mb-1">Open Time</div>
                          <div className="text-sm text-[var(--color-text-primary)]">
                            {formatTime(trade.openDate)}
                          </div>
                        </div>

                        {/* P&L */}
                        <div>
                          <div className="text-xs text-[var(--color-text-muted)] mb-1">P&L</div>
                          <div
                            className={`text-lg font-bold ${
                              isProfit ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
                            }`}
                          >
                            {isProfit ? '+' : ''}${pnl.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[var(--color-border)] flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
