import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CumulativePnLChartProps {
  data: Array<{
    date: string;
    pnl: number;
  }>;
}

export const CumulativePnLChart: React.FC<CumulativePnLChartProps> = ({ data }) => {
  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-6">
        Daily Net Cumulative P&L
      </h2>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis 
            dataKey="date" 
            stroke="var(--color-text-muted)"
            tick={{ fill: 'var(--color-text-muted)' }}
          />
          <YAxis 
            stroke="var(--color-text-muted)"
            tick={{ fill: 'var(--color-text-muted)' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'var(--color-text-primary)' }}
            itemStyle={{ color: 'var(--color-primary)' }}
            formatter={(value: number | undefined) => [`$${(value || 0).toFixed(2)}`, 'P&L']}
          />
          <Line 
            type="monotone" 
            dataKey="pnl" 
            stroke="var(--color-primary)" 
            strokeWidth={2}
            dot={{ fill: 'var(--color-primary)', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
