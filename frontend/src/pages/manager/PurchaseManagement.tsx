import React, { useState } from 'react';
import { ShoppingCart, Plus, CheckCircle2, Clock, Truck, FileText, ArrowRight } from 'lucide-react';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  items: string;
  totalCost: number;
  status: 'ORDERED' | 'IN_TRANSIT' | 'RECEIVED' | 'STOCKED';
  orderDate: string;
  expectedDelivery: string;
}

export const PurchaseManagement: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([
    {
      id: 'po-1',
      poNumber: 'PO-2026-891',
      supplier: 'Apex Pharma Ltd',
      items: 'Paracetamol 500mg (800 units), Ceftriaxone 1g (200 units)',
      totalCost: 776.0,
      status: 'IN_TRANSIT',
      orderDate: 'Oct 06, 2026',
      expectedDelivery: 'Tomorrow, 10:00 AM',
    },
    {
      id: 'po-2',
      poNumber: 'PO-2026-890',
      supplier: 'MedPharm Global',
      items: 'Amoxicillin 500mg (400 units), Cefixime 200mg (300 units)',
      totalCost: 525.0,
      status: 'ORDERED',
      orderDate: 'Oct 07, 2026',
      expectedDelivery: 'Oct 11, 2026',
    },
    {
      id: 'po-3',
      poNumber: 'PO-2026-888',
      supplier: 'Novis Health',
      items: 'Metformin 500mg (1,000 units), Ibuprofen 400mg (300 units)',
      totalCost: 264.0,
      status: 'STOCKED',
      orderDate: 'Oct 01, 2026',
      expectedDelivery: 'Oct 04, 2026',
    },
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#172321]/8 pb-5">
        <div>
          <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-widest block">
            Procurement & Logistics
          </span>
          <h1 className="font-instrument text-3xl sm:text-4xl text-[#172321] font-normal">
            Purchase Orders & <span className="italic text-[#087F73]">Reorder Pipeline</span>
          </h1>
          <p className="text-xs text-[#667572] mt-0.5">
            Manage hospital medicine purchase orders, supplier fulfillment timelines, and receiving logs.
          </p>
        </div>

        <button
          onClick={() => alert('New Purchase Order creator opened.')}
          className="px-4 py-2.5 bg-[#087F73] hover:bg-[#06655C] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Purchase Order</span>
        </button>
      </div>

      <div className="bg-white border border-[#172321]/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#172321]/10 text-[#667572]">
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">PO Reference</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Supplier</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Ordered Medicines</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Order Value</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Fulfillment Status</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider">Expected Delivery</th>
                <th className="pb-3.5 font-semibold uppercase text-[10px] tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172321]/6">
              {orders.map((po) => (
                <tr key={po.id} className="hover:bg-[#F7F8F4]/80 transition-colors">
                  <td className="py-4 font-mono font-bold text-[#087F73] text-xs">{po.poNumber}</td>
                  <td className="py-4 font-semibold text-[#172321]">{po.supplier}</td>
                  <td className="py-4 text-[#667572] max-w-xs truncate">{po.items}</td>
                  <td className="py-4 font-bold text-[#172321]">${po.totalCost.toFixed(2)}</td>
                  <td className="py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        po.status === 'IN_TRANSIT'
                          ? 'bg-[#E9A23B]/10 text-[#E9A23B]'
                          : po.status === 'STOCKED'
                          ? 'bg-[#3FA66B]/10 text-[#3FA66B]'
                          : 'bg-[#087F73]/10 text-[#087F73]'
                      }`}
                    >
                      {po.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 text-[#667572]">{po.expectedDelivery}</td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => alert(`Reviewing shipping invoice for ${po.poNumber}`)}
                      className="px-2.5 py-1 rounded-lg border border-[#172321]/10 text-[#172321] hover:bg-white text-[11px] font-medium"
                    >
                      View Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseManagement;
