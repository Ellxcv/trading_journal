import React from 'react';

interface WinLossDistributionProps {
  data: {
    range: string;
    count: number;
    percentage: number;
  }[];
}

export const WinLossDistribution: React.FC<WinLossDistributionProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-[var(--color-text-muted)]">
        No data available
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="space-y-4">
      {/* Chart Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Win/Loss Distribution
        </h3>
        <div className="text-sm text-[var(--color-text-muted)]">
          Trade count by P&L range
        </div>
      </div>

      {/* Histogram */}
      <div className="bg-[var(--color-surface-light)] rounded-lg p-4 space-y-2">
        {data.map((item, index) => {
          const barWidth = (item.count / maxCount) * 100;
          const isWin = !item.range.includes('-');
          
          return (
            <div key={index} className="group">
              <div className="flex items-center gap-3">
                {/* Range label */}
                <div className="w-24 text-xs text-[var(--color-text-muted)] text-right font-mono">
                  {item.range}
                </div>
                
                {/* Bar */}
                <div className="flex-1 relative">
                  <div
                    className={`h-8 rounded transition-all duration-300 ${
                      isWin
                        ? 'bg-[var(--color-success)] hover:bg-[var(--color-success)]/80'
                        : 'bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/80'
                    }`}
                    style={{ width: `${barWidth}%`, minWidth: item.count > 0 ? '2px' : '0' }}
                  />
                  
                  {/* Count label inside bar */}
                  {item.count > 0 && (
                    <div className="absolute inset-0 flex items-center px-3">
                      <span className="text-xs font-semibold text-white">
                        {item.count} ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[var(--color-danger)]" />
          <span className="text-[var(--color-text-muted)]">Losses</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[var(--color-success)]" />
          <span className="text-[var(--color-text-muted)]">Wins</span>
        </div>
      </div>
    </div>
  );
};
