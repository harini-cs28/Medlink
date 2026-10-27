import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Sparkles,
  Lightbulb,
  FileText,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Building,
  Menu,
  X
} from 'lucide-react';

export const ManagerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/manager', label: 'Overview', icon: LayoutDashboard, exact: true },
    { to: '/manager/inventory', label: 'Inventory', icon: Package },
    { to: '/manager/purchases', label: 'Purchases', icon: ShoppingCart },
    { to: '/manager/suppliers', label: 'Suppliers', icon: Truck },
    { to: '/manager/predictions', label: 'Predictions', icon: Sparkles },
    { to: '/manager/recommendations', label: 'Recommendations', icon: Lightbulb },
    { to: '/manager/reports', label: 'Reports', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#172321] font-barlow flex flex-col md:flex-row selection:bg-[#5BAFA3]/20 selection:text-[#087F73]">
      {/* =========================================================================
          ROLE 2: PHARMACY MANAGER COMPACT VERTICAL OPERATIONS RAIL
          ========================================================================= */}
      
      {/* Mobile Top Toggle Header */}
      <div className="md:hidden flex items-center justify-between px-5 py-3.5 bg-white border-b border-[#172321]/10 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <img src="/assets/medpredict-logo.png" alt="MEDLINK" className="w-6 h-6 object-contain" />
          <span className="font-instrument italic text-lg text-[#172321]">MEDLINK Operations</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 rounded-lg border border-[#172321]/10 text-[#172321]"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Vertical Operations Rail Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 md:w-60 bg-white border-r border-[#172321]/10 z-40 flex flex-col justify-between p-5 transition-transform duration-200 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Branding */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#087F73]/10 border border-[#087F73]/20 flex items-center justify-center text-[#087F73]">
              <img src="/assets/medpredict-logo.png" alt="MEDLINK" className="w-5 h-5 object-contain" />
            </div>
            <div>
              <span className="font-instrument italic text-xl font-medium tracking-tight text-[#172321] block leading-none">
                MEDLINK
              </span>
              <span className="text-[9px] uppercase tracking-[0.18em] text-[#087F73] font-bold mt-0.5 block">
                Operations Rail
              </span>
            </div>
          </div>

          <div className="text-[10px] uppercase tracking-wider text-[#667572] font-semibold px-2">
            Operations Menu
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#087F73] text-white font-semibold shadow-xs'
                        : 'text-[#667572] hover:text-[#172321] hover:bg-[#F7F8F4]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Manager Profile Block */}
        <div className="pt-4 border-t border-[#172321]/8 space-y-3">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#087F73]/10 text-[#087F73] text-xs font-bold flex items-center justify-center">
                M
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#172321] leading-none">
                  {user?.fullName || 'Marcus Vance, PharmD'}
                </span>
                <span className="text-[9.5px] text-[#667572] mt-0.5">Pharmacy Manager</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#E56B6F] hover:bg-[#E56B6F]/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Subtle Top Pharmacy Banner */}
        <div className="bg-white/80 backdrop-blur-xs border-b border-[#172321]/6 px-6 lg:px-10 py-2.5 flex items-center justify-between text-xs text-[#667572]">
          <div className="flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-[#087F73]" />
            <span className="font-medium text-[#172321]">Unit: Main Central Inpatient Pharmacy</span>
            <span className="text-[#667572]/40">|</span>
            <span>Lead Time Buffer: 72 hrs</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3FA66B]" />
            <span className="text-[11px] font-medium text-[#3FA66B]">FEFO & ML Active</span>
          </div>
        </div>

        <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;
