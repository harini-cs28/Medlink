import React from 'react';
import { InventoryRecord } from '../../types/inventory';
import { StatusBadge } from '../ui/StatusBadge';
import { RiskBadge } from '../ui/RiskBadge';

interface InventoryTableProps {
  items: InventoryRecord[];
  isLoading?: boolean;
  onSelectItem?: (item: InventoryRecord) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  isLoading = false,
  onSelectItem,
}) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full mx-auto mb-2" />
        Loading inventory dataset...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        No medicine records found matching criteria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
      <table className="w-full text-left text-xs text-slate-700">
        <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
          <tr>
            <th className="px-4 py-3">Medicine / Code</th>
            <th className="px-4 py-3">Category / Form</th>
            <th className="px-4 py-3 text-right">Available Volume / Stock</th>
            <th className="px-4 py-3 text-center">Trend / Status</th>
            <th className="px-4 py-3 text-center">Shortage Vulnerability</th>
            {onSelectItem && <th className="px-4 py-3 text-right">Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item, idx) => {
            const name = item.generic_name || item.categoryOrDrug || `Item #${idx + 1}`;
            const desc = item.atcDescription || item.category || 'General Formulation';
            const volume = item.total_stock ?? item.volume ?? 0;
            const trend = item.demandTrend || 'Stable';
            const risk = item.shortageStatus === 'SHORTAGE' ? 'HIGH' : 'LOW';

            return (
              <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-900">
                  <div>{name}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{item.brand_name || item.id}</div>
                </td>
                <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{desc}</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">{volume}</td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge status={trend} />
                </td>
                <td className="px-4 py-3 text-center">
                  <RiskBadge risk={risk} size="sm" />
                </td>
                {onSelectItem && (
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onSelectItem(item)}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                    >
                      Analyze
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
