import React from 'react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  emptyState?: React.ReactNode;
  dataSource?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyState,
  dataSource
}: DataTableProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden p-6">
        {emptyState || <div className="text-center text-xs text-[#64748B] py-8">No records available from dataset.</div>}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] uppercase font-semibold tracking-wider text-[11px]">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{ width: col.width }}
                  className={`py-3 px-4 ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
            {data.map((item, rowIdx) => (
              <tr
                key={keyExtractor(item, rowIdx)}
                className="hover:bg-[#E8F5F3]/30 transition-colors"
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`py-3 px-4 ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                  >
                    {col.cell
                      ? col.cell(item, rowIdx)
                      : col.accessorKey
                      ? String(item[col.accessorKey] ?? '')
                      : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dataSource && (
        <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] px-4 py-2 flex items-center justify-between text-[11px] text-[#64748B]">
          <span>Showing {data.length} records</span>
          <span className="inline-flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]"></span>
            Data Source: {dataSource}
          </span>
        </div>
      )}
    </div>
  );
}
