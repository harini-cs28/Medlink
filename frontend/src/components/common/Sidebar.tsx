import React from 'react';
import {
  LayoutDashboard,
  Package,
  TriangleAlert,
  Clock3,
  TrendingUp,
  ShoppingCart,
  FileBarChart,
  Users,
  Building2,
  Database,
  Search,
  Server,
  Activity,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export type NavigationTab =
  | 'dashboard'
  | 'inventory'
  | 'shortage_prediction'
  | 'expiry_risk'
  | 'demand_analysis'
  | 'recommendations'
  | 'reports'
  | 'users'
  | 'pharmacies';

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
  isPipelineConnected = true,
  isModelReady = true,
  lastUpdated,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();

  const role = user?.role || 'HOSPITAL_ADMIN';

  const allNavItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard, roles: ['HOSPITAL_ADMIN', 'PHARMACY_MANAGER', 'PHARMACIST'] },
    { id: 'inventory' as NavigationTab, label: 'Inventory', icon: Package, roles: ['HOSPITAL_ADMIN', 'PHARMACY_MANAGER', 'PHARMACIST'] },
    { id: 'shortage_prediction' as NavigationTab, label: 'Shortage Prediction', icon: TriangleAlert, roles: ['HOSPITAL_ADMIN', 'PHARMACY_MANAGER', 'PHARMACIST'] },
    { id: 'expiry_risk' as NavigationTab, label: 'Expiry Risk & FEFO', icon: Clock3, roles: ['HOSPITAL_ADMIN', 'PHARMACY_MANAGER', 'PHARMACIST'] },
    { id: 'demand_analysis' as NavigationTab, label: 'Demand Analysis', icon: TrendingUp, roles: ['HOSPITAL_ADMIN', 'PHARMACY_MANAGER'] },
    { id: 'recommendations' as NavigationTab, label: 'Recommendations', icon: ShoppingCart, roles: ['HOSPITAL_ADMIN', 'PHARMACY_MANAGER'] },
    { id: 'reports' as NavigationTab, label: 'Reports & Audits', icon: FileBarChart, roles: ['HOSPITAL_ADMIN', 'PHARMACY_MANAGER'] },
  ];

  const filteredNavItems = allNavItems.filter((item) => item.roles.includes(role));

  const getFormattedRole = (r?: string) => {
    switch (r) {
      case 'HOSPITAL_ADMIN':
        return 'Hospital Admin';
      case 'PHARMACY_MANAGER':
        return 'Pharmacy Manager';
      case 'PHARMACIST':
        return 'Pharmacist';
      default:
        return r ? r.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Hospital Admin';
    }
  };

  const formattedRole = getFormattedRole(user?.role);

  return (
    <>
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
                {formattedRole}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {filteredNavItems.map((item) => {
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
            <span>Architecture Status</span>
          </div>

          <div className="space-y-1.5 text-xs text-[#64748B]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                FastAPI + DB
              </span>
              <span className="text-[11px] font-medium text-[#1E293B]">
                {isPipelineConnected ? 'Online' : 'Standby'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                ML & FEFO Core
              </span>
              <span className="text-[11px] font-medium text-[#1E293B]">
                {isModelReady ? 'Active' : 'Standby'}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#E2E8F0] text-[10px] text-[#94A3B8] flex items-center justify-between">
            <span>Role</span>
            <span className="font-semibold text-slate-700">{formattedRole}</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
