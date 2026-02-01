import React from 'react';
import { TrendingUp, TrendingDown, Edit, Trash2, Eye } from 'lucide-react';
import { Trade } from '../../types/trade';
import { Badge } from '../ui';

interface TradesTableProps {
  trades: Trade[];
  onViewTrade: (trade: Trade) => void;
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (trade: Trade) => void;
}

export const TradesTable: React.FC<TradesTableProps> = ({
  trades,
  onViewTrade,
  onEditTrade,
  onDeleteTrade,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return price.toFixed(5);
  };

  const formatPnL = (pnl: number | undefined) => {
    if (pnl === undefined) return '-';
    const sign = pnl >= 0 ? '+' : '';
    return `${sign}$${pnl.toFixed(2)}`;
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-light)]">
              <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text-primary)]">
                Status
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text-primary)]">
                Date
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text-primary)]">
                Symbol
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text-primary)]">
                Direction
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-[var(--color-text-primary)]">
                Entry
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-[var(--color-text-primary)]">
                Exit
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-[var(--color-text-primary)]">
                Lots
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-[var(--color-text-primary)]">
                Net P&L
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-[var(--color-text-primary)]">
                R:R
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-[var(--color-text-primary)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => {
              const pnlColor = trade.netPnL && trade.netPnL >= 0 
                ? 'text-[var(--color-success)]' 
                : 'text-[var(--color-danger)]';
              
              const rowBgClass = trade.status === 'OPEN' 
                ? 'bg-[var(--color-primary)]/5 border-l-4 border-l-[var(--color-primary)]'
                : trade.netPnL && trade.netPnL >= 0
                  ? 'hover:bg-[var(--color-success)]/5'
                  : 'hover:bg-[var(--color-danger)]/5';

              return (
                <tr
                  key={trade.id}
                  className={`border-b border-[var(--color-border)] transition-colors cursor-pointer ${rowBgClass}`}
                  onClick={() => onViewTrade(trade)}
                >
                  <td className="py-3 px-4">
                    <Badge variant={trade.status === 'OPEN' ? 'info' : 'default'}>
                      {trade.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-[var(--color-text-secondary)]">
                    {formatDate(trade.closeDate || trade.openDate)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {trade.symbol}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`flex items-center gap-1 ${
                      trade.direction === 'LONG' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
                    }`}>
                      {trade.direction === 'LONG' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      <span className="text-sm font-medium">{trade.direction}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-sm font-mono text-[var(--color-text-secondary)]">
                    {formatPrice(trade.entryPrice)}
                  </td>
                  <td className="py-3 px-4 text-right text-sm font-mono text-[var(--color-text-secondary)]">
                    {trade.exitPrice ? formatPrice(trade.exitPrice) : '-'}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-[var(--color-text-secondary)]">
                    {trade.lots.toFixed(2)}
                  </td>
                  <td className={`py-3 px-4 text-right text-sm font-bold ${pnlColor}`}>
                    {formatPnL(trade.netPnL)}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-[var(--color-text-secondary)]">
                    {trade.riskRewardRatio ? trade.riskRewardRatio.toFixed(2) : '-'}
                  </td>
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onViewTrade(trade)}
                        className="p-1.5 hover:bg-[var(--color-surface-light)] rounded transition-colors"
                        title="View details"
                      >
                        <Eye size={16} className="text-[var(--color-text-muted)]" />
                      </button>
                      <button
                        onClick={() => onEditTrade(trade)}
                        className="p-1.5 hover:bg-[var(--color-surface-light)] rounded transition-colors"
                        title="Edit trade"
                      >
                        <Edit size={16} className="text-[var(--color-text-muted)]" />
                      </button>
                      <button
                        onClick={() => onDeleteTrade(trade)}
                        className="p-1.5 hover:bg-[var(--color-danger)]/10 rounded transition-colors"
                        title="Delete trade"
                      >
                        <Trash2 size={16} className="text-[var(--color-danger)]" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {trades.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--color-text-muted)] mb-4">No trades found</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              Adjust your filters or add your first trade
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
