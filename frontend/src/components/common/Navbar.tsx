import React from 'react';
import { Menu, Search, Bell, ShieldCheck, Database, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface NavbarProps {
  activeTab?: string;
  onOpenMobileSidebar?: () => void;
  isDataConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab = 'Dashboard',
  onOpenMobileSidebar,
  isDataConnected = true,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E2E8F0] px-4 lg:px-8 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle, Official Brand Logo & Brand Name / Tab Title */}
      <div className="flex items-center gap-3 lg:gap-4">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-[#64748B] hover:bg-[#F8FAFC]"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

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

        {activeTab && (
          <div className="hidden xl:flex items-center border-l border-[#E2E8F0] pl-3.5 ml-1">
            <span className="text-xs font-semibold text-[#64748B] capitalize truncate max-w-xs">
              {activeTab.replace(/_/g, ' ')}
            </span>
          </div>
        )}
      </div>

      {/* Right: Data Source Badge, Search, Notifications & Profile */}
      <div className="flex items-center gap-3 lg:gap-5">
        {/* Data Source Provenance Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full text-xs text-[#64748B]">
          <Database className="w-3.5 h-3.5 text-[#0F766E]" />
          <span className="font-medium text-[#475569]">Data Engine:</span>
          <span className="text-[#0F766E] font-semibold">PostgreSQL + Kaggle + FDA</span>
        </div>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search medicine catalog..."
            className="w-48 lg:w-56 pl-8 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0F766E] rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-[#E2E8F0]">
          <div className="w-8 h-8 rounded-full bg-[#123047] text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'MP'}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-[#1E293B]">{user?.fullName || 'Clinical Staff'}</div>
            <div className="text-[10px] text-[#0F766E] font-medium">{user?.role || 'HOSPITAL_ADMIN'}</div>
          </div>
          {user && (
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
