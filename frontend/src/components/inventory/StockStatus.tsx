import React from 'react';
import { PackageCheck, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';

interface StockStatusProps {
  inStockCount: number;
  lowStockCount: number;
  criticalShortageCount: number;
  totalVolume: number;
}

export const StockStatus: React.FC<StockStatusProps> = ({
  inStockCount,
  lowStockCount,
  criticalShortageCount,
  totalVolume,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
          <PackageCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl font-bold text-slate-800">{inStockCount}</div>
          <div className="text-xs text-slate-500">In Stock Medicines</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl font-bold text-slate-800">{lowStockCount}</div>
          <div className="text-xs text-slate-500">Low Stock / Reorder</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600">
          <XCircle className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl font-bold text-slate-800">{criticalShortageCount}</div>
          <div className="text-xs text-slate-500">Active FDA Shortages</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl font-bold text-slate-800">{totalVolume.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Total Units Tracked</div>
        </div>
      </div>
    </div>
  );
};

export default StockStatus;
