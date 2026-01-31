import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default',
  className = '' 
}) => {
  const variants = {
    default: 'bg-[var(--color-surface-light)] text-[var(--color-text-secondary)]',
    success: 'bg-[var(--color-success)]/20 text-[var(--color-success-light)]',
    danger: 'bg-[var(--color-danger)]/20 text-[var(--color-danger-light)]',
    warning: 'bg-[var(--color-warning)]/20 text-[var(--color-warning-light)]',
    info: 'bg-[var(--color-primary)]/20 text-[var(--color-primary-light)]',
  };
  
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 
        rounded-md text-xs font-medium
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};
