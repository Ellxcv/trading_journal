import React from 'react';

interface DayOfWeekChartProps {
  data: {
    day: string;
    dayIndex: number;
    trades: number;
    totalPnL: number;
    avgPnL: number;
  }[];
}

export const DayOfWeekChart: React.FC<DayOfWeekChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-[var(--color-text-muted)]">
        No data available
      </div>
    );
  }

  const maxAbsValue = Math.max(...data.map(d => Math.abs(d.totalPnL)), 1);
  
  // Find best and worst days
  const sortedByPnL = [...data].sort((a, b) => b.totalPnL - a.totalPnL);
  const bestDay = sortedByPnL[0];
  const worstDay = sortedByPnL[sortedByPnL.length - 1];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Day of Week Performance
        </h3>
        <div className="text-xs text-[var(--color-text-muted)]">
          Best: {bestDay.day} | Worst: {worstDay.day}
        </div>
      </div>

      {/* Histogram Container */}
      <div className="space-y-3">
        {/* Bars Section - Fixed height, independent of labels */}
        <div className="relative h-64">
          {/* Center baseline */}
          <div className="absolute left-0 right-0 top-1/2 border-t-2 border-[var(--color-border)] opacity-60" />
          
          <div className="absolute inset-0 flex items-center justify-between gap-2">
            {data.map((item) => {
              const heightPercent = maxAbsValue > 0 ? (Math.abs(item.totalPnL) / maxAbsValue) * 45 : 0;
              const isPositive = item.totalPnL > 0;
              const isLoss = item.totalPnL < 0;
              const isBest = item.day === bestDay.day;
              const isWorst = item.day === worstDay.day;
              const showValue = heightPercent > 15;
              
              return (
                <div key={item.day} className="flex-1 flex flex-col items-center group relative h-full">
                  <div className="flex-1 flex flex-col justify-end items-center w-full relative">
                    {/* Profit bar (grows upward from center) */}
                    {isPositive && (
                      <div 
                        className={`w-full transition-all duration-200 hover:opacity-80 bg-[var(--color-success)] relative flex items-start justify-center ${
                          isBest ? 'ring-2 ring-[var(--color-success)] ring-offset-2 ring-offset-[var(--color-surface)]' : ''
                        }`}
                        style={{ 
                          height: `${heightPercent}%`,
                          minHeight: '8px'
                        }}
                      >
                        {showValue && (
                          <span className="text-xs font-bold text-white mt-1">
                            +${Math.abs(item.totalPnL).toFixed(0)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-start items-center w-full relative">
                    {/* Loss bar (grows downward from center) */}
                    {isLoss && (
                      <div 
                        className={`w-full transition-all duration-200 hover:opacity-80 bg-[var(--color-danger)] relative flex items-start justify-center ${
                          isWorst ? 'ring-2 ring-[var(--color-danger)] ring-offset-2 ring-offset-[var(--color-surface)]' : ''
                        }`}
                        style={{ 
                          height: `${heightPercent}%`,
                          minHeight: '8px'
                        }}
                      >
                        {showValue && (
                          <span className="text-xs font-bold text-white mt-1">
                            -${Math.abs(item.totalPnL).toFixed(0)}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Zero line indicator */}
                    {!isPositive && !isLoss && (
                      <div className="w-full h-1 bg-[var(--color-border)] rounded" />
                    )}
                  </div>
                  
                  {/* Enhanced Tooltip */}
                  <div className="
                    absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2
                    px-4 py-3
                    bg-[var(--color-surface)] border border-[var(--color-border)]
                    rounded-lg shadow-xl
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible
                    transition-all duration-200
                    whitespace-nowrap z-20
                    pointer-events-none
                  ">
                    <p className="text-sm font-bold text-[var(--color-text-primary)] mb-1">{item.day}</p>
                    <div className="space-y-1">
                      <p className={`text-lg font-bold ${
                        item.totalPnL > 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
                      }`}>
                        {isPositive ? '+' : ''}${item.totalPnL.toFixed(2)}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {item.trades} trades
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Avg: <span className={isPositive ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}>
                          ${item.avgPnL.toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Labels Section - Separate from bars */}
        <div className="flex items-start justify-between gap-2">
          {data.map((item) => {
            const isPositive = item.totalPnL > 0;
            const isBest = item.day === bestDay.day;
            const isWorst = item.day === worstDay.day;
            const heightPercent = maxAbsValue > 0 ? (Math.abs(item.totalPnL) / maxAbsValue) * 45 : 0;
            const showValue = heightPercent > 15;
            
            return (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
                {/* Day Label */}
                <p className={`text-sm font-semibold ${
                  isBest ? 'text-[var(--color-success)]' : isWorst ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-primary)]'
                }`}>
                  {item.day.slice(0, 3)}
                </p>
                
                {/* Trade count badge */}
                <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                  item.trades > 0 
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'bg-[var(--color-surface-light)] text-[var(--color-text-muted)]'
                }`}>
                  {item.trades} {item.trades === 1 ? 'trade' : 'trades'}
                </div>
                
                {/* Badge for best/worst */}
                {(isBest || isWorst) && (
                  <div className={`text-sm font-bold ${
                    isBest ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
                  }`}>
                    {isBest ? '★ Best' : '✕ Worst'}
                  </div>
                )}
                
                {/* Show P&L if bar too small */}
                {!showValue && item.totalPnL !== 0 && (
                  <span className={`text-xs font-semibold ${
                    isPositive ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
                  }`}>
                    {isPositive ? '+' : '-'}${Math.abs(item.totalPnL).toFixed(0)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="text-xs text-[var(--color-text-muted)] text-center">
        ★ = Best performing day | ✕ = Worst performing day
      </div>
    </div>
  );
};
