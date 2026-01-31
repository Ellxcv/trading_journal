import React from 'react';
import { TrendingUp, TrendingDown, Activity, Target, DollarSign } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon }) => {
  const trendColors = {
    up: 'text-[var(--color-success)]',
    down: 'text-[var(--color-danger)]',
    neutral: 'text-[var(--color-text-muted)]',
  };

  const trendBgColors = {
    up: 'bg-[var(--color-success)]/10',
    down: 'bg-[var(--color-danger)]/10',
    neutral: 'bg-[var(--color-surface-light)]',
  };

  return (
    <div className="glass-card p-6 hover:scale-[1.02] transition-transform duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${trend ? trendBgColors[trend] : 'bg-[var(--color-primary)]/10'}`}>
          {icon}
        </div>
        {change && trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trendColors[trend]}`}>
            {trend === 'up' ? <TrendingUp size={16} /> : trend === 'down' ? <TrendingDown size={16} /> : null}
            {change}
          </div>
        )}
      </div>
      
      <h3 className="text-sm text-[var(--color-text-muted)] mb-1">{title}</h3>
      <p className="text-3xl font-bold text-[var(--color-text-primary)]">{value}</p>
    </div>
  );
};
