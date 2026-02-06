import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Trade {
  id: number;
  closeDate: string;
  symbol: string;
  netPnL: number;
}

interface RecentTradesTableProps {
  trades: Trade[];
}

// Format date to readable format
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
};

export const RecentTradesTable: React.FC<RecentTradesTableProps> = ({ trades }) => {
  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-6">
        Recent Trades
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left py-3 px-4 text-sm font-medium text-[var(--color-text-muted)]">
                Close Date
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-[var(--color-text-muted)]">
                Symbol
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-[var(--color-text-muted)]">
                Net P&L
              </th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr 
                key={trade.id}
                className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-light)] transition-colors"
              >
                <td className="py-3 px-4 text-sm text-[var(--color-text-secondary)]">
                  {formatDate(trade.closeDate)}
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {trade.symbol}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className={`flex items-center justify-end gap-1 font-semibold ${
                    trade.netPnL >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
                  }`}>
                    {trade.netPnL >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span>${Math.abs(trade.netPnL).toFixed(2)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {trades.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--color-text-muted)]">No recent trades</p>
          </div>
        )}
      </div>
    </div>
  );
};
