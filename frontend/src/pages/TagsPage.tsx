import React from 'react';
import { Card } from '../components/ui';

export const TagsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Tags</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Organize trades with custom tags
        </p>
      </div>

      <Card>
        <p className="text-[var(--color-text-muted)]">Tags management coming soon...</p>
      </Card>
    </div>
  );
};
