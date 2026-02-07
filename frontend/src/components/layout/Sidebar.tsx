import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  BarChart3, 
  Wallet, 
  Tags,
  Menu,
  X,
  Search,
  Bell,
  HelpCircle,
  Settings,
  User,
  LogOut,
  MoreVertical
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Simulated notification count - dapat diganti dengan real data dari API
  const notificationCount = 12;

  return (
    <>
      {/* Sidebar */}
      <aside 
        className={`
          h-screen 
          bg-[var(--color-surface)] 
          border-r border-[var(--color-border)] 
          flex flex-col
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-72'}
        `}
      >
        {/* Header with Logo & Toggle */}
        <div className="h-16 px-4 border-b border-[var(--color-border)] flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
                <TrendingUp size={18} className="text-white" />
              </div>
              <h1 className="text-lg font-bold text-[var(--color-text-primary)]">
                TradeJournal
              </h1>
            </div>
          )}
          
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
              <Menu size={20} className="text-[var(--color-text-secondary)]" />
            ) : (
              <X size={20} className="text-[var(--color-text-secondary)]" />
            )}
          </button>
        </div>

        {/* Search Bar */}
        {!isCollapsed && (
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
                  text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] text-sm
                  focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>
          </div>
        )}

        {/* Search Icon (Collapsed) */}
        {isCollapsed && (
          <div className="px-4 py-3">
            <button className="w-full p-2 rounded-lg hover:bg-[var(--color-surface-light)] transition-colors group relative">
              <Search size={20} className="text-[var(--color-text-muted)] mx-auto" />
              
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
                Search
              </div>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
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
                <span className="font-medium text-sm whitespace-nowrap">
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

        {/* Bottom Actions */}
        <div className="border-t border-[var(--color-border)] px-3 py-2 space-y-1">
          {/* Notifications */}
          <button className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)] hover:text-[var(--color-text-primary)]
            transition-colors group relative
            ${isCollapsed ? 'justify-center' : ''}
          `}>
            <div className="relative flex-shrink-0">
              <Bell size={20} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </div>
            
            {!isCollapsed && (
              <span className="font-medium text-sm whitespace-nowrap">Notifications</span>
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
                Notifications ({notificationCount})
              </div>
            )}
          </button>

          {/* Support */}
          <button className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)] hover:text-[var(--color-text-primary)]
            transition-colors group relative
            ${isCollapsed ? 'justify-center' : ''}
          `}>
            <HelpCircle size={20} className="flex-shrink-0" />
            
            {!isCollapsed && (
              <span className="font-medium text-sm whitespace-nowrap">Support</span>
            )}

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
                Support
              </div>
            )}
          </button>

          {/* Settings */}
          <button className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)] hover:text-[var(--color-text-primary)]
            transition-colors group relative
            ${isCollapsed ? 'justify-center' : ''}
          `}>
            <Settings size={20} className="flex-shrink-0" />
            
            {!isCollapsed && (
              <span className="font-medium text-sm whitespace-nowrap">Settings</span>
            )}

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
                Settings
              </div>
            )}
          </button>
        </div>

        {/* User Profile */}
        <div className="border-t border-[var(--color-border)] p-3">
          {!isCollapsed ? (
            <div className="relative">
              <div className="flex items-center gap-3 px-3 py-2 bg-[var(--color-surface-light)] rounded-lg">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {user?.name || user?.email || 'User'}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="p-1 hover:bg-[var(--color-surface)] rounded transition-colors"
                >
                  <MoreVertical size={16} className="text-[var(--color-text-muted)]" />
                </button>
              </div>

              {/* Profile Menu Dropdown */}
              {showProfileMenu && (
                <div className="absolute bottom-full mb-2 left-0 right-0 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg shadow-lg overflow-hidden">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm
                      text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10
                      transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {/* User Avatar */}
              <button className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-[var(--color-surface-light)] transition-colors group relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
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
                  {user?.name || user?.email || 'User'}
                </div>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
