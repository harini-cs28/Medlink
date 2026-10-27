import React from 'react';
import { Database, AlertCircle, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  dataSource?: string;
  minHeight?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Waiting for Data from Backend",
  description = "No records were returned from the real dataset. Ensure the FastAPI service and data ingestion pipelines are active.",
  actionText,
  onAction,
  icon,
  dataSource,
  minHeight = "min-h-[220px]"
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 bg-white border border-[#E2E8F0] rounded-xl text-center ${minHeight}`}>
      <div className="w-12 h-12 rounded-full bg-[#F1F5F9] flex items-center justify-center mb-3 text-[#64748B]">
        {icon || <Database className="w-6 h-6 text-[#64748B]" />}
      </div>
      
      <h4 className="text-sm font-semibold text-[#1E293B] mb-1">{title}</h4>
      <p className="text-xs text-[#64748B] max-w-md mb-4 leading-relaxed">{description}</p>
      
      {dataSource && (
        <div className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full text-[11px] font-medium text-[#64748B]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]"></span>
          <span>Target Source: {dataSource}</span>
        </div>
      )}
      
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {actionText}
        </button>
      )}
    </div>
  );
};
