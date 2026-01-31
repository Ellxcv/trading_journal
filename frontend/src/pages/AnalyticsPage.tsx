import React from 'react';
import { Card } from '../components/ui';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Analytics</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Detailed performance analytics and insights
        </p>
      </div>

      <Card>
        <p className="text-[var(--color-text-muted)]">Analytics charts coming soon...</p>
      </Card>
    </div>
  );
};
