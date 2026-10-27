import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  minHeight?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading real dataset from API...",
  subMessage = "Querying Data Science pipelines and validated analytical records.",
  minHeight = "min-h-[220px]"
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 bg-white border border-[#E2E8F0] rounded-xl text-center ${minHeight}`}>
      <div className="w-10 h-10 rounded-full bg-[#E8F5F3] flex items-center justify-center mb-3">
        <Loader2 className="w-5 h-5 text-[#0F766E] animate-spin" />
      </div>
      <h4 className="text-sm font-semibold text-[#1E293B] mb-1">{message}</h4>
      <p className="text-xs text-[#64748B] max-w-sm">{subMessage}</p>
    </div>
  );
};
