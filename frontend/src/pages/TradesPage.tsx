import React from 'react';
import { Card } from '../components/ui';

export const TradesPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Trades</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Manage and track all your trades
          </p>
        </div>
      </div>

      <Card>
        <p className="text-[var(--color-text-muted)]">Trades list coming soon...</p>
      </Card>
    </div>
  );
};
