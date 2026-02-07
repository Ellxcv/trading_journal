import React from 'react';

interface MonthlyPnLChartProps {
  data: { month: string; pnl: number; trades: number }[];
}

export const MonthlyPnLChart: React.FC<MonthlyPnLChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-[var(--color-text-muted)]">
        No data available
      </div>
    );
  }

  // Find max absolute value for scaling
  const maxAbsValue = Math.max(...data.map(d => Math.abs(d.pnl)), 1);
  
  return (
    <div className="space-y-4">
      {/* Chart Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Monthly P&L
        </h3>
        <div className="text-sm text-[var(--color-text-muted)]">
          Last {data.length} months
        </div>
      </div>

      {/* Histogram */}
      <div className="relative h-64">
        {/* Center baseline */}
        <div className="absolute left-0 right-0 top-1/2 border-t border-[var(--color-border)] opacity-50" />
        
        <div className="absolute inset-0 flex items-center justify-between gap-1">
          {data.map((item, index) => {
            const heightPercent = maxAbsValue > 0 ? (Math.abs(item.pnl) / maxAbsValue) * 50 : 0; // Max 50%
            const isPositive = item.pnl > 0;
            const isLoss = item.pnl < 0;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center group relative h-full">
                <div className="flex-1 flex flex-col justify-end items-center w-full">
                  {/* Profit bar (grows upward from center) */}
                  {isPositive && (
                    <div 
                      className="w-full transition-all duration-200 hover:opacity-80 bg-[var(--color-success)]"
                      style={{ 
                        height: `${heightPercent}%`,
                        minHeight: '4px'
                      }}
                    />
                  )}
                </div>
                
                <div className="flex-1 flex flex-col justify-start items-center w-full">
                  {/* Loss bar (grows downward from center) */}
                  {isLoss && (
                    <div 
                      className="w-full transition-all duration-200 hover:opacity-80 bg-[var(--color-danger)]"
                      style={{ 
                        height: `${heightPercent}%`,
                        minHeight: '4px'
                      }}
                    />
                  )}
                  
                  {/* Zero line indicator */}
                  {!isPositive && !isLoss && (
                    <div className="w-full h-1 bg-[var(--color-border)] rounded" />
                  )}
                </div>
                
                {/* Month Label */}
                <p className="text-xs mt-2 text-[var(--color-text-muted)] whitespace-nowrap">
                  {item.month}
                </p>
                
                {/* Tooltip */}
                {item.pnl !== 0 && (
                  <div className="
                    absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2
                    px-3 py-2
                    bg-[var(--color-surface)] border border-[var(--color-border)]
                    rounded-lg shadow-lg
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible
                    transition-all duration-200
                    whitespace-nowrap z-10
                    pointer-events-none
                  ">
                    <p className="text-xs text-[var(--color-text-muted)]">{item.month}</p>
                    <p className={`text-sm font-bold ${
                      item.pnl > 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
                    }`}>
                      ${item.pnl.toFixed(2)}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">{item.trades} trades</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
