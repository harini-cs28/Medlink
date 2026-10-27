import React from 'react';
import {
  LayoutDashboard,
  Package,
  TriangleAlert,
  Clock3,
  TrendingUp,
  ShoppingCart,
  FileBarChart,
  Activity,
  Server,
  Database
} from 'lucide-react';

export type NavigationTab =
  | 'dashboard'
  | 'inventory'
  | 'shortage_prediction'
  | 'expiry_risk'
  | 'demand_analysis'
  | 'recommendations'
  | 'reports'
  | 'data_management';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isPipelineConnected?: boolean;
  isModelReady?: boolean;
  lastUpdated?: string;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isPipelineConnected = false,
  isModelReady = false,
  lastUpdated,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory' as NavigationTab, label: 'Inventory', icon: Package },
    { id: 'shortage_prediction' as NavigationTab, label: 'Shortage Prediction', icon: TriangleAlert },
    { id: 'expiry_risk' as NavigationTab, label: 'Expiry Risk', icon: Clock3 },
    { id: 'demand_analysis' as NavigationTab, label: 'Demand Analysis', icon: TrendingUp },
    { id: 'recommendations' as NavigationTab, label: 'Recommendations', icon: ShoppingCart },
    { id: 'reports' as NavigationTab, label: 'Reports', icon: FileBarChart },
    { id: 'data_management' as NavigationTab, label: 'Data Management', icon: Database },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-[#E2E8F0] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo & Brand Header */}
          <div className="h-20 flex items-center gap-3 px-5 border-b border-[#E2E8F0]">
            <img
              src="/assets/medpredict-logo.png"
              alt="MedPredict AI"
              className="h-11 w-11 object-contain shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="font-instrument italic text-xl font-medium text-[#172033] tracking-tight leading-snug">
                MedPredict <span className="text-[#0F9D8A] font-semibold">AI</span>
              </div>
              <div className="text-[11px] font-medium text-[#0F9D8A] truncate">
                Hospital Admin
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#E8F5F3] text-[#0F766E] shadow-xs'
                      : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0F766E]' : 'text-[#64748B]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* System & Data Pipeline Diagnostics */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="text-[11px] font-semibold text-[#475569] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>System Pipeline</span>
          </div>

          <div className="space-y-1.5 text-xs text-[#64748B]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isPipelineConnected ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-slate-300'
                  }`}
                />
                Data Pipeline
              </span>
              <span className="text-[11px] font-medium text-[#1E293B]">
                {isPipelineConnected ? 'Connected' : 'Awaiting Data'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isModelReady ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-slate-300'
                  }`}
                />
                Model Service
              </span>
              <span className="text-[11px] font-medium text-[#1E293B]">
                {isModelReady ? 'Ready' : 'Untrained'}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#E2E8F0] text-[10px] text-[#94A3B8] flex items-center justify-between">
            <span>Last Updated</span>
            <span>{lastUpdated || 'Not synchronized'}</span>
          </div>
        </div>
      </aside>
    </>
  );
};
