import React from 'react';
import { FileText, Download, CheckCircle, Clock, ShieldCheck, Database } from 'lucide-react';

export const Reports: React.FC = () => {
  const reportsList = [
    {
      id: 'rep-1',
      title: 'Monthly Medicine Consumption & FEFO Audit Report',
      description: 'Comprehensive audit of all dispensed units, batch rotations, and shelf-life expiration adherence.',
      date: 'Oct 08, 2026',
      size: '2.4 MB CSV / PDF',
      type: 'FEFO_AUDIT',
    },
    {
      id: 'rep-2',
      title: 'FDA Shortage Risk & Lead Time Vulnerability Assessment',
      description: 'Cross-validated evaluation of 1,599 national drug shortage alerts against current inpatient formulary buffers.',
      date: 'Oct 07, 2026',
      size: '1.8 MB CSV',
      type: 'SHORTAGE_RISK',
    },
    {
      id: 'rep-3',
      title: 'Quarterly Vendor & Supplier Performance Report',
      description: 'Lead time consistency, fulfillment accuracy, and delivery variance rankings for all verified pharmaceutical vendors.',
      date: 'Oct 01, 2026',
      size: '950 KB CSV',
      type: 'SUPPLIER_PERFORMANCE',
    },
    {
      id: 'rep-4',
      title: 'Wastage & Expiry Prevention Financial Summary',
      description: 'Financial ledger documenting $14,200 in projected drug wastage prevented through active FEFO rebalancing.',
      date: 'Sep 30, 2026',
      size: '1.1 MB CSV',
      type: 'FINANCIAL_AUDIT',
    },
  ];

  const handleDownload = (rep: typeof reportsList[0]) => {
    // Generate simple CSV download
    const csvContent = `Report,${rep.title}\nGenerated,${rep.date}\nType,${rep.type}\nStatus,Verified Medical Record\nExport,MEDLINK Inventory Intelligence V2.0\n`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${rep.id}_${rep.type}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-[#172321]/8 pb-5">
        <span className="text-[10px] font-bold text-[#087F73] uppercase tracking-widest block">
          Auditing & Governance
        </span>
        <h1 className="font-instrument text-3xl sm:text-4xl text-[#172321] font-normal">
          Inventory Reports & <span className="italic text-[#087F73]">Compliance Exports</span>
        </h1>
        <p className="text-xs text-[#667572] mt-0.5">
          Generate audit-ready datasets, regulatory compliance logs, and inventory turnover statistics.
        </p>
      </div>

      <div className="space-y-4">
        {reportsList.map((rep) => (
          <div
            key={rep.id}
            className="p-6 rounded-3xl bg-white border border-[#172321]/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#087F73] transition-all"
          >
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#087F73]/10 text-[9.5px] font-bold text-[#087F73] uppercase tracking-wider">
                  {rep.type.replace('_', ' ')}
                </span>
                <span className="text-xs text-[#667572]">&bull; {rep.date}</span>
              </div>
              <h3 className="font-instrument text-2xl text-[#172321]">{rep.title}</h3>
              <p className="text-xs text-[#667572] leading-relaxed">{rep.description}</p>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
              <span className="text-xs text-[#667572] font-mono hidden sm:inline">{rep.size}</span>
              <button
                onClick={() => handleDownload(rep)}
                className="px-4 py-2.5 bg-[#F7F8F4] hover:bg-[#087F73] hover:text-white border border-[#172321]/10 text-[#172321] text-xs font-semibold rounded-xl flex items-center gap-2 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
