import React, { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';

interface Trade {
  id: string | number;
  closeDate?: string;
  netPnL?: number;
  status: string;
}

interface DailyPnLHistogramProps {
  trades: Trade[];
  daysToShow?: number;
}

export const DailyPnLHistogram: React.FC<DailyPnLHistogramProps> = ({ 
  trades, 
  daysToShow = 14 
}) => {
  // Calculate daily P&L for the last N days
  const dailyData = useMemo(() => {
    const today = new Date();
    const data: { date: string; pnl: number; dateObj: Date }[] = [];
    
    // Generate dates for the last N days
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      // Calculate P&L for this date
      const dayTrades = trades.filter((t: Trade) => {
        if (t.status !== 'CLOSED' || !t.closeDate || t.netPnL === undefined) return false;
        const tradeDate = new Date(t.closeDate);
        const tradeDateStr = `${tradeDate.getFullYear()}-${String(tradeDate.getMonth() + 1).padStart(2, '0')}-${String(tradeDate.getDate()).padStart(2, '0')}`;
        return tradeDateStr === dateStr;
      });
      
      const pnl = dayTrades.reduce((sum, t: Trade) => sum + (t.netPnL || 0), 0);
      
      data.push({ 
        date: dateStr,
        pnl, 
        dateObj: date 
      });
    }
    
    return data;
  }, [trades, daysToShow]);

  // Find max value for scaling
  const maxValue = Math.max(...dailyData.map(d => Math.abs(d.pnl)), 1);

  // Format date for display
  const formatDate = (dateObj: Date) => {
    return `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
  };

  // Calculate today's P&L
  const todayPnL = dailyData[dailyData.length - 1]?.pnl || 0;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--color-primary)]/10">
            <BarChart3 size={24} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
              Daily P&L
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Last {daysToShow} days
            </p>
          </div>
        </div>
        
        {/* Today's P&L Badge */}
        <div className="text-right">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">Today</p>
          <p className={`text-2xl font-bold ${
            todayPnL > 0 ? 'text-[var(--color-success)]' : 
            todayPnL < 0 ? 'text-[var(--color-danger)]' : 
            'text-[var(--color-text-muted)]'
          }`}>
            ${todayPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Histogram */}
      <div className="relative h-64">
        {/* Center baseline */}
        <div className="absolute left-0 right-0 top-1/2 border-t border-[var(--color-border)] opacity-50" />
        
        <div className="absolute inset-0 flex items-center justify-between gap-1">
          {dailyData.map((day, index) => {
            const heightPercent = maxValue > 0 ? (Math.abs(day.pnl) / maxValue) * 50 : 0; // Max 50% (half the container)
            const isToday = index === dailyData.length - 1;
            const isProfit = day.pnl > 0;
            const isLoss = day.pnl < 0;
            
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center group relative h-full">
                <div className="flex-1 flex flex-col justify-end items-center w-full">
                  {/* Profit bar (grows upward from center) */}
                  {isProfit && (
                    <div 
                      className={`w-full rounded-t transition-all duration-200 hover:opacity-80 bg-[var(--color-success)] ${
                        isToday ? 'ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--color-surface)]' : ''
                      }`}
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
                      className={`w-full rounded-b transition-all duration-200 hover:opacity-80 bg-[var(--color-danger)] ${
                        isToday ? 'ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--color-surface)]' : ''
                      }`}
                      style={{ 
                        height: `${heightPercent}%`,
                        minHeight: '4px'
                      }}
                    />
                  )}
                  
                  {/* Zero line indicator */}
                  {!isProfit && !isLoss && (
                    <div className="w-full h-1 bg-[var(--color-border)] rounded" />
                  )}
                </div>
                
                {/* Date Label */}
                <p className={`text-xs mt-2 ${
                  isToday ? 'font-semibold text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
                }`}>
                  {formatDate(day.dateObj)}
                </p>
                
                {/* Tooltip */}
                {day.pnl !== 0 && (
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
                    <p className="text-xs text-[var(--color-text-muted)]">{day.date}</p>
                    <p className={`text-sm font-bold ${
                      day.pnl > 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
                    }`}>
                      ${day.pnl.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[var(--color-success)]" />
          <span className="text-sm text-[var(--color-text-muted)]">Profit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[var(--color-danger)]" />
          <span className="text-sm text-[var(--color-text-muted)]">Loss</span>
        </div>
      </div>
    </div>
  );
};
