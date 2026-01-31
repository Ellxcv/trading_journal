import React from 'react';
import { Card, CardHeader } from '../components/ui';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6 ​animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Dashboard</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Your trading performance overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Placeholder metrics cards */}
        <Card>
          <CardHeader title="Total P&L" subtitle="Coming soon..." />
          <p className="text-2xl font-bold text-[var(--color-success)]">+$0.00</p>
        </Card>
        <Card>
          <CardHeader title="Win Rate" subtitle="Coming soon..." />
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">0%</p>
        </Card>
        <Card>
          <CardHeader title="Total Trades" subtitle="Coming soon..." />
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">0</p>
        </Card>
        <Card>
          <CardHeader title="Profit Factor" subtitle="Coming soon..." />
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">0.00</p>
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent Trades" subtitle="Your latest trading activity" />
        <p className="text-[var(--color-text-muted)]">No trades yet. Start by creating your first trade!</p>
      </Card>
    </div>
  );
};
