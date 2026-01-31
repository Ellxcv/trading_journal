import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  BarChart3, 
  Wallet, 
  Tags,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

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

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Sidebar - now collapsible on all screen sizes */}
      <aside 
        className={`
          h-screen 
          bg-[var(--color-surface)] 
          border-r border-[var(--color-border)] 
          flex flex-col
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Logo & Toggle Button */}
        <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-2xl font-bold gradient-text transition-opacity duration-300">
              Journal
            </h1>
          )}
          
          {/* Toggle button */}
          <button
            onClick={onToggle}
            className={`
              p-2 rounded-lg 
              hover:bg-[var(--color-surface-light)] 
              transition-colors
              ${isCollapsed ? 'mx-auto' : ''}
            `}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight size={20} className="text-[var(--color-text-secondary)]" />
            ) : (
              <ChevronLeft size={20} className="text-[var(--color-text-secondary)]" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)] hover:text-[var(--color-text-primary)]'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <span className={isCollapsed ? '' : 'flex-shrink-0'}>
                {item.icon}
              </span>
              
              {!isCollapsed && (
                <span className="font-medium whitespace-nowrap">
                  {item.name}
                </span>
              )}

              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <div className="
                  absolute left-full ml-2 px-3 py-2 
                  bg-[var(--color-surface-light)] 
                  text-[var(--color-text-primary)]
                  rounded-lg shadow-lg
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible
                  transition-all duration-200
                  whitespace-nowrap
                  z-50
                  pointer-events-none
                ">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile & Logout Footer */}
        <div className="border-t border-[var(--color-border)]">
          {!isCollapsed ? (
            // Expanded mode - show full profile card
            <div className="p-4 space-y-3">
              {/* User Info */}
              <div className="flex items-center gap-3 px-3 py-2 bg-[var(--color-surface-light)] rounded-lg">
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {user?.name || user?.email}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] capitalize">
                    {user?.role || 'User'}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                  bg-[var(--color-danger)]/10 hover:bg-[var(--color-danger)]/20
                  text-[var(--color-danger)] rounded-lg transition-colors"
              >
                <LogOut size={16} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          ) : (
            // Collapsed mode - show icon buttons
            <div className="p-4 space-y-2">
              {/* User Avatar */}
              <button 
                className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-[var(--color-surface-light)] transition-colors group relative"
                title={user?.name || user?.email || 'User'}
              >
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
                
                {/* Tooltip */}
                <div className="
                  absolute left-full ml-2 px-3 py-2 
                  bg-[var(--color-surface-light)] 
                  text-[var(--color-text-primary)]
                  rounded-lg shadow-lg
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible
                  transition-all duration-200
                  whitespace-nowrap
                  z-50
                  pointer-events-none
                ">
                  {user?.name || user?.email}
                </div>
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="w-full flex items-center justify-center p-2.5 
                  bg-[var(--color-danger)]/10 hover:bg-[var(--color-danger)]/20
                  text-[var(--color-danger)] rounded-lg transition-colors group relative"
                title="Logout"
              >
                <LogOut size={18} />
                
                {/* Tooltip */}
                <div className="
                  absolute left-full ml-2 px-3 py-2 
                  bg-[var(--color-surface-light)] 
                  text-[var(--color-text-primary)]
                  rounded-lg shadow-lg
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible
                  transition-all duration-200
                  whitespace-nowrap
                  z-50
                  pointer-events-none
                ">
                  Logout
                </div>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
