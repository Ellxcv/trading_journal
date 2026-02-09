import React from 'react';
import { AccountType } from '../../types/portfolio';

interface AccountTypeBadgeProps {
  accountType: AccountType;
  className?: string;
}

export const AccountTypeBadge: React.FC<AccountTypeBadgeProps> = ({ 
  accountType, 
  className = '' 
}) => {
  const isReal = accountType === AccountType.REAL;

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${isReal 
          ? 'bg-green-100 text-green-800 border border-green-300' 
          : 'bg-orange-100 text-orange-800 border border-orange-300'
        }
        ${className}
      `}
    >
      {isReal ? '💰 Real' : '🎮 Demo'}
    </span>
  );
};
