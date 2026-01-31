import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between px-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
          Welcome back{user?.name ? `, ${user.name}` : ''}
        </h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* User info */}
        <div className="flex items-center gap-3 px-4 py-2 bg-[var(--color-surface-light)] rounded-lg">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {user?.name || user?.email}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {user?.role}
            </p>
          </div>
        </div>

        {/* Logout button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="gap-2"
        >
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </header>
  );
};
