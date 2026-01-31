import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  BarChart3, 
  Wallet, 
  Tags 
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { name: 'Trades', path: '/trades', icon: <TrendingUp size={20} /> },
  { name: 'Analytics', path: '/analytics', icon: <BarChart3 size={20} /> },
  { name: 'Portfolios', path: '/portfolios', icon: <Wallet size={20} /> },
  { name: 'Tags', path: '/tags', icon: <Tags size={20} /> },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 h-screen bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--color-border)]">
        <h1 className="text-2xl font-bold gradient-text">
          Trading Journal
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)] hover:text-[var(--color-text-primary)]'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-muted)] text-center">
          © 2026 Trading Journal
        </p>
      </div>
    </aside>
  );
};
