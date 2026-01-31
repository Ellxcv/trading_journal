import React from 'react';
import { Card } from '../components/ui';

export const PortfoliosPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Portfolios</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Manage your trading portfolios
        </p>
      </div>

      <Card>
        <p className="text-[var(--color-text-muted)]">Portfolio management coming soon...</p>
      </Card>
    </div>
  );
};
