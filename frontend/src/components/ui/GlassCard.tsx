import React, { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xs p-6 transition-all hover:shadow-md ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;
