import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Activity,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Building2,
  Users,
  Pill,
  BarChart3,
  Network,
  Bell,
  CheckCircle2
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/admin', label: 'Overview', exact: true },
    { to: '/admin/hospital', label: 'Hospital' },
    { to: '/admin/pharmacies', label: 'Pharmacies' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/medicines', label: 'Medicines' },
    { to: '/admin/analytics', label: 'Analytics' },
    { to: '/admin/datasets', label: 'Datasets' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#172321] font-barlow flex flex-col selection:bg-[#5BAFA3]/20 selection:text-[#087F73]">
      {/* =========================================================================
          HOSPITAL ADMIN HORIZONTAL COMMAND BAR (No Left Sidebar!)
          ========================================================================= */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#172321]/10 px-6 lg:px-12 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          {/* Brand Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-[#087F73]/10 border border-[#087F73]/20 flex items-center justify-center text-[#087F73]">
              <img
                src="/assets/medpredict-logo.png"
                alt="MEDLINK"
                className="w-5 h-5 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-instrument italic text-xl font-medium tracking-tight text-[#172321] leading-none">
                MEDLINK
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#087F73] font-bold mt-0.5">
                Hospital Command Center
              </span>
            </div>
          </div>

          {/* Clean Horizontal Command Navigation Bar */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.exact}
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all ${
                    isActive
                      ? 'bg-[#172321] text-white shadow-xs'
                      : 'text-[#667572] hover:text-[#172321] hover:bg-[#172321]/5'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Header Status & Admin Dropdown */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#3FA66B]/10 border border-[#3FA66B]/20 text-[11px] font-semibold text-[#3FA66B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3FA66B] animate-pulse" />
              <span>All 4 Units Synced</span>
            </div>

            {/* Admin User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-[#172321]/10 bg-white hover:bg-[#F7F8F4] transition-all text-left focus:outline-none"
              >
                <div className="w-6 h-6 rounded-full bg-[#087F73] text-white text-[11px] font-bold flex items-center justify-center">
                  A
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-semibold text-[#172321] leading-none">
                    {user?.fullName || 'Dr. Sarah Mitchell'}
                  </span>
                  <span className="text-[9px] text-[#667572] mt-0.5">Hospital Admin</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#667572]" />
              </button>

              {isProfileOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#172321]/10 shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setIsProfileOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-[#172321]/5">
                    <p className="text-xs font-semibold text-[#172321]">{user?.fullName || 'Dr. Sarah Mitchell'}</p>
                    <p className="text-[10px] text-[#667572] truncate">{user?.email || 'admin@medlink.health'}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-[#087F73]/10 text-[#087F73] text-[9px] font-bold uppercase tracking-wider">
                      Executive RBAC Clear
                    </span>
                  </div>

                  <div className="p-1 space-y-0.5">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate('/admin/hospital');
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#172321] hover:bg-[#F7F8F4] rounded-lg flex items-center gap-2"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#087F73]" />
                      <span>Hospital Network View</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate('/admin/users');
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#172321] hover:bg-[#F7F8F4] rounded-lg flex items-center gap-2"
                    >
                      <Users className="w-3.5 h-3.5 text-[#087F73]" />
                      <span>Governance & RBAC</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#E56B6F] hover:bg-[#E56B6F]/10 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Sub-scroller */}
        <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pt-2.5 pb-0.5 no-scrollbar">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              className={({ isActive }) =>
                `px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#172321] text-white'
                    : 'text-[#667572] bg-[#F7F8F4] hover:text-[#172321]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </header>

      {/* Main Command Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-8">
        <Outlet />
      </main>

      {/* Admin Minimal Footer */}
      <footer className="w-full border-t border-[#172321]/8 py-6 text-center text-xs text-[#667572]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-instrument italic font-medium text-[#172321]">MEDLINK</span>
            <span>&bull; Hospital Governance & Command Center</span>
          </div>
          <div>All clinical nodes synchronized via PostgreSQL & FastData Pipeline</div>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;
