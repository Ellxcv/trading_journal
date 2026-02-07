import React from 'react';

interface EquityCurveProps {
  data: { date: string; equity: number }[];
}

export const EquityCurve: React.FC<EquityCurveProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-[var(--color-text-muted)]">
        No data available
      </div>
    );
  }

  // Find min and max for scaling
  const values = data.map(d => d.equity);
  const minValue = Math.min(...values, 0);
  const maxValue = Math.max(...values, 0);
  const range = maxValue - minValue || 1;
  
  // Calculate chart dimensions
  const height = 256; // pixels
  const padding = 20;
  
  // Create SVG path
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = ((maxValue - point.equity) / range) * (height - 2 * padding) + padding;
    return `${x},${y}`;
  });
  
  const pathData = `M ${points.join(' L ')}`;
  
  // Zero line position
  const zeroY = ((maxValue - 0) / range) * (height - 2 * padding) + padding;
  
  // Latest equity value
  const latestEquity = data[data.length - 1]?.equity || 0;
  const isPositive = latestEquity >= 0;

  return (
    <div className="space-y-4">
      {/* Chart Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Equity Curve
        </h3>
        <div className={`text-lg font-bold ${isPositive ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
          ${latestEquity.toFixed(2)}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative bg-[var(--color-surface-light)] rounded-lg p-4 overflow-hidden">
        <svg
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          className="w-full"
          style={{ height: `${height}px` }}
        >
          {/* Zero line */}
          <line
            x1="0"
            y1={zeroY}
            x2="100"
            y2={zeroY}
            stroke="var(--color-border)"
            strokeWidth="0.5"
            strokeDasharray="2,2"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Equity line */}
          <path
            d={pathData}
            fill="none"
            stroke={isPositive ? 'var(--color-success)' : 'var(--color-danger)'}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Area fill */}
          <path
            d={`${pathData} L 100,${zeroY} L 0,${zeroY} Z`}
            fill={isPositive ? 'var(--color-success)' : 'var(--color-danger)'}
            opacity="0.1"
          />
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-4 bottom-4 flex flex-col justify-between text-xs text-[var(--color-text-muted)] pointer-events-none">
          <span>${maxValue.toFixed(0)}</span>
          <span>$0</span>
          <span>${minValue.toFixed(0)}</span>
        </div>
      </div>

      {/* X-axis info */}
      <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
        <span>{data[0]?.date || 'Start'}</span>
        <span>{data.length} trades</span>
        <span>{data[data.length - 1]?.date || 'End'}</span>
      </div>
    </div>
  );
};
