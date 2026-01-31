import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-background)]">
      <div className="text-center">
        <h1 className="text-9xl font-bold gradient-text mb-4">404</h1>
        <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">
          Page Not Found
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard">
          <Button variant="primary">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
