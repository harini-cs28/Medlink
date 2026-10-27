import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'System Warning',
  message,
  onRetry,
}) => {
  return (
    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 flex items-start space-x-3">
      <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-rose-300 text-sm">{title}</h4>
        <p className="text-xs text-rose-200/80 mt-1">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 inline-flex items-center text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/20 hover:bg-rose-500/30 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Retry Request
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
