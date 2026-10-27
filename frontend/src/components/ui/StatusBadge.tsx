import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const norm = (status || '').toUpperCase();

  const getStyle = () => {
    switch (norm) {
      case 'IN_STOCK':
      case 'CURRENT':
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'LOW_STOCK':
      case 'EXPIRING_SOON':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'OUT_OF_STOCK':
      case 'EXPIRED':
      case 'DISCONTINUED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getStyle()}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

export default StatusBadge;
