import React from 'react';
import { X } from 'lucide-react';
import { Trade } from '../../types/trade';

interface DayTradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  trades: Trade[];
}

export const DayTradesModal: React.FC<DayTradesModalProps> = ({
  isOpen,
  onClose,
  date,
  trades
}) => {
  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const totalPnL = trades.reduce((sum, t) => sum + (t.netPnL || 0), 0);
  const profitableTrades = trades.filter(t => (t.netPnL || 0) > 0).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-surface)] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
              Trades on {formatDate(date)}
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {trades.length} {trades.length === 1 ? 'trade' : 'trades'} | 
              Win Rate: {trades.length > 0 ? ((profitableTrades / trades.length) * 100).toFixed(0) : 0}% | 
              <span className={totalPnL >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}>
                {' '}Total: ${totalPnL.toFixed(2)}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-surface-light)] rounded-lg transition-colors"
          >
            <X size={20} className="text-[var(--color-text-secondary)]" />
          </button>
        </div>

        {/* Trades List */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          {trades.length === 0 ? (
            <div className="text-center py-12 text-[var(--color-text-muted)]">
              No trades found for this date
            </div>
          ) : (
            <div className="space-y-3">
              {trades.map((trade) => (
                <div
                  key={trade.id}
                  className="glass-card p-4 hover:bg-[var(--color-surface-light)] transition-colors"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Symbol & Direction */}
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)] mb-1">Symbol</p>
                      <p className="font-semibold text-[var(--color-text-primary)]">
                        {trade.symbol}
                      </p>
                      <p className={`text-xs font-medium ${
                        trade.direction === 'LONG' 
                          ? 'text-[var(--color-success)]' 
                          : 'text-[var(--color-danger)]'
                      }`}>
                        {trade.direction}
                      </p>
                    </div>

                    {/* Entry & Exit */}
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)] mb-1">Entry → Exit</p>
                      <p className="text-sm text-[var(--color-text-primary)]">
                        ${trade.entryPrice?.toFixed(2)} → ${trade.exitPrice?.toFixed(2)}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {trade.lots} lots
                      </p>
                    </div>

                    {/* Time */}
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)] mb-1">Time</p>
                      <p className="text-sm text-[var(--color-text-primary)]">
                        {trade.openDate ? formatTime(trade.openDate) : 'N/A'}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        to {trade.closeDate ? formatTime(trade.closeDate) : 'N/A'}
                      </p>
                    </div>

                    {/* P&L */}
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)] mb-1">P&L</p>
                      <p className={`text-lg font-bold ${
                        (trade.netPnL || 0) >= 0 
                          ? 'text-[var(--color-success)]' 
                          : 'text-[var(--color-danger)]'
                      }`}>
                        {(trade.netPnL || 0) >= 0 ? '+' : ''}${(trade.netPnL || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
