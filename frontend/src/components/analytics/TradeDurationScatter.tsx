import React from 'react';

interface TradeDurationScatterProps {
  data: { duration: number; pnl: number; symbol: string }[];
}

export const TradeDurationScatter: React.FC<TradeDurationScatterProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-[var(--color-text-muted)]">
        No data available
      </div>
    );
  }

  // Calculate average hold time
  const avgDuration = data.reduce((sum, d) => sum + d.duration, 0) / data.length;
  
  // Find min/max for scaling
  const maxDuration = Math.max(...data.map(d => d.duration), 1);
  const minPnL = Math.min(...data.map(d => d.pnl), 0);
  const maxPnL = Math.max(...data.map(d => d.pnl), 0);
  const pnlRange = maxPnL - minPnL || 1;
  
  const height = 300;
  const padding = 40;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Trade Duration Analysis
        </h3>
        <div className="text-sm text-[var(--color-text-muted)]">
          Avg: {avgDuration.toFixed(1)} hours
        </div>
      </div>

      {/* Scatter Plot */}
      <div className="relative bg-[var(--color-surface-light)] rounded-lg p-4">
        <svg
          viewBox={`0 0 100 ${height}`}
          className="w-full"
          style={{ height: `${height}px` }}
        >
          {/* Zero P&L line */}
          <line
            x1={padding / 2}
            y1={((maxPnL - 0) / pnlRange) * (height - 2 * padding) + padding}
            x2="100"
            y2={((maxPnL - 0) / pnlRange) * (height - 2 * padding) + padding}
            stroke="var(--color-border)"
            strokeWidth="0.5"
            strokeDasharray="2,2"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = (point.duration / maxDuration) * (100 - padding) + padding / 2;
            const y = ((maxPnL - point.pnl) / pnlRange) * (height - 2 * padding) + padding;
            const isProfit = point.pnl >= 0;
            
            return (
              <g key={index} className="group">
                <circle
                  cx={x}
                  cy={y}
                  r="3"
                  fill={isProfit ? 'var(--color-success)' : 'var(--color-danger)'}
                  opacity="0.6"
                  className="transition-all hover:r-5 hover:opacity-100"
                />
                
                {/* Tooltip on hover */}
                <text
                  x={x}
                  y={y - 8}
                  className="text-xs opacity-0 group-hover:opacity-100 pointer-events-none"
                  fill="var(--color-text-primary)"
                  textAnchor="middle"
                  style={{ fontSize: '3px' }}
                >
                  {point.symbol}: ${point.pnl.toFixed(2)} ({point.duration.toFixed(1)}h)
                </text>
              </g>
            );
          })}
        </svg>
        
        {/* Axes labels */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-[var(--color-text-muted)]">
          Duration (hours)
        </div>
        <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-[var(--color-text-muted)]">
          P&L ($)
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[var(--color-success)]" />
          <span className="text-[var(--color-text-muted)]">Profits</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[var(--color-danger)]" />
          <span className="text-[var(--color-text-muted)]">Losses</span>
        </div>
      </div>
    </div>
  );
};
