import React from 'react';
import { Menu, Search, Bell, ShieldCheck, Database } from 'lucide-react';
import { NavigationTab } from './Sidebar';

interface NavbarProps {
  activeTab: NavigationTab;
  onOpenMobileSidebar: () => void;
  isDataConnected?: boolean;
}

const TAB_TITLES: Record<NavigationTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Medicine Intelligence Dashboard',
    subtitle: 'Monitor pharmaceutical demand, shortage patterns, and predictive insights.'
  },
  inventory: {
    title: 'Pharmaceutical Sales & Inventory Telemetry',
    subtitle: 'Consumption volume, velocity, and transaction metrics from Pharma Sales records.'
  },
  shortage_prediction: {
    title: 'Shortage Risk Prediction & XAI Attribution',
    subtitle: 'Machine learning vulnerability classification with SHAP feature explanations.'
  },
  expiry_risk: {
    title: 'Expiry Risk & Shelf Life Analysis',
    subtitle: 'Dataset boundary and expiration tracking module.'
  },
  demand_analysis: {
    title: 'Demand Analysis & Forecasting',
    subtitle: 'Time-series consumption trends and algorithmic forecasts.'
  },
  recommendations: {
    title: 'Smart Procurement & Demand Recommendations',
    subtitle: 'Algorithmic notifications based on empirical consumption shifts.'
  },
  reports: {
    title: 'Scientific Evaluation & Data Reports',
    subtitle: 'Model performance metrics, cross-validation summaries, and audit exports.'
  },
  data_management: {
    title: 'Dataset Management & Pipeline Ingestion',
    subtitle: 'Upload, validate, and integrate pharmaceutical sales, FDA shortage alerts, and batch inventory data.'
  }
};

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onOpenMobileSidebar,
  isDataConnected = false,
}) => {
  const current = TAB_TITLES[activeTab] || { title: 'Dashboard', subtitle: '' };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E2E8F0] px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle, Official Brand Logo & Brand Name / Tab Title */}
      <div className="flex items-center gap-3 lg:gap-4">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-[#64748B] hover:bg-[#F8FAFC]"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <img
            src="/assets/medpredict-logo.png"
            alt="MedPredict AI"
            className="h-11 w-11 object-contain"
          />
          <span className="font-instrument italic text-xl font-medium text-[#172033] tracking-tight flex items-center gap-1 select-none">
            <span className="hidden sm:inline">MedPredict</span>
            <span className="sm:hidden">MedPredict</span>
            <span className="text-[#0F9D8A] font-semibold">AI</span>
          </span>
        </div>

        {current.title && (
          <div className="hidden xl:flex items-center border-l border-[#E2E8F0] pl-3.5 ml-1">
            <span className="text-xs font-semibold text-[#64748B] truncate max-w-xs">
              {current.title}
            </span>
          </div>
        )}
      </div>

      {/* Right: Data Source Badge, Search, Notifications & Profile */}
      <div className="flex items-center gap-3 lg:gap-5">
        {/* Data Source Provenance Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full text-xs text-[#64748B]">
          <Database className="w-3.5 h-3.5 text-[#0F766E]" />
          <span className="font-medium text-[#475569]">Data Sources:</span>
          <span className="text-[#0F766E] font-semibold">Pharma Sales + FDA Shortages</span>
        </div>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search drug, ATC class..."
            className="w-48 lg:w-56 pl-8 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0F766E] rounded-full ring-2 ring-white"></span>
        </button>

        {/* User / Hospital Admin Profile */}
        <div className="flex items-center gap-2 pl-3 border-l border-[#E2E8F0]">
          <div className="w-8 h-8 rounded-full bg-[#123047] text-white flex items-center justify-center text-xs font-bold shadow-xs">
            MP
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-[#1E293B]">Inventory Admin</div>
            <div className="text-[10px] text-[#64748B]">Clinical Supply Chain</div>
          </div>
        </div>
      </div>
    </header>
  );
};
