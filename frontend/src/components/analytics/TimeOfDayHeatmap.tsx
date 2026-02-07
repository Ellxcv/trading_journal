import React from 'react';

interface TimeOfDayHeatmapProps {
  data: {
    hour: number;
    trades: number;
    avgPnL: number;
    totalPnL: number;
  }[];
  onHourClick?: (hour: number) => void;
}

export const TimeOfDayHeatmap: React.FC<TimeOfDayHeatmapProps> = ({ data, onHourClick }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-[var(--color-text-muted)]">
        No data available
      </div>
    );
  }

  // Find best and worst hours
  const sortedByPnL = [...data].sort((a, b) => b.totalPnL - a.totalPnL);
  const bestHour = sortedByPnL[0];
  const worstHour = sortedByPnL[sortedByPnL.length - 1];

  const getCellColor = (pnl: number, trades: number) => {
    if (trades === 0) return 'bg-[var(--color-surface-light)]'; // No trade
    if (pnl > 0) return 'bg-[var(--color-success)]/30 border-[var(--color-success)]'; // Profit
    if (pnl < 0) return 'bg-[var(--color-danger)]/30 border-[var(--color-danger)]'; // Loss
    return 'bg-[var(--color-surface-light)]'; // Breakeven
  };

  const getCellTextColor = (pnl: number, trades: number) => {
    if (trades === 0) return 'text-[var(--color-text-muted)]';
    if (pnl > 0) return 'text-[var(--color-success)]';
    if (pnl < 0) return 'text-[var(--color-danger)]';
    return 'text-[var(--color-text-muted)]';
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Time of Day Performance
        </h3>
        <div className="text-sm text-[var(--color-text-muted)]">
          Best: {formatHour(bestHour.hour)} | Worst: {formatHour(worstHour.hour)}
        </div>
      </div>

      {/* Heatmap Grid - Calendar Style - 4 rows x 6 columns */}
      <div className="grid grid-cols-6 gap-1">
        {data.map((hourData) => {
          const isProfit = hourData.totalPnL >= 0;
          
          return (
            <div
              key={hourData.hour}
              className={`
                aspect-square rounded-lg border-2 border-transparent
                flex flex-col items-center justify-center
                transition-all duration-200 hover:scale-105
                ${getCellColor(hourData.totalPnL, hourData.trades)}
                group cursor-pointer relative
              `}
              onClick={() => onHourClick?.(hourData.hour)}
            >
              {/* Hour label - smaller and muted */}
              <div className="text-[10px] font-medium text-[var(--color-text-muted)] opacity-70">
                {hourData.hour}h
              </div>
              
              {/* Trade count - larger and prominent */}
              {hourData.trades > 0 && (
                <span className={`text-sm font-bold ${getCellTextColor(hourData.totalPnL, hourData.trades)}`}>
                  #{hourData.trades}
                </span>
              )}
              
              {/* Empty state - show just hour prominently */}
              {hourData.trades === 0 && (
                <span className="text-sm font-semibold text-[var(--color-text-muted)]">
                  {hourData.hour}
                </span>
              )}
              
              {/* Tooltip on hover */}
              {hourData.trades > 0 && (
                <div className="
                  absolute bottom-full mb-2 px-3 py-2
                  bg-[var(--color-surface)] border border-[var(--color-border)]
                  rounded-lg shadow-lg
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible
                  transition-all duration-200
                  whitespace-nowrap z-10
                  pointer-events-none
                ">
                  <p className="text-xs text-[var(--color-text-muted)]">{formatHour(hourData.hour)}</p>
                  <p className={`text-sm font-bold ${getCellTextColor(hourData.totalPnL, hourData.trades)}`}>
                    ${hourData.totalPnL.toFixed(2)}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {hourData.trades} trades | Avg: ${hourData.avgPnL.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend - Calendar Style */}
      <div className="flex items-center justify-center gap-6 pt-4 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[var(--color-success)]/30 border-2 border-[var(--color-success)]" />
          <span className="text-sm text-[var(--color-text-muted)]">Profit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[var(--color-danger)]/30 border-2 border-[var(--color-danger)]" />
          <span className="text-sm text-[var(--color-text-muted)]">Loss</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[var(--color-surface-light)]" />
          <span className="text-sm text-[var(--color-text-muted)]">No Trade</span>
        </div>
      </div>
    </div>
  );
};
