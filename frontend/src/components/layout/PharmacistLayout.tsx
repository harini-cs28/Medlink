import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { pharmacyStore, SystemAlert } from '../../services/pharmacyStore';
import {
  Search,
  Bell,
  LogOut,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  Pill,
  History,
  AlertTriangle
} from 'lucide-react';

export const PharmacistLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [quickQuery, setQuickQuery] = useState('');

  useEffect(() => {
    setAlerts(pharmacyStore.getAlerts());
    const unsub = pharmacyStore.subscribe(() => {
      setAlerts(pharmacyStore.getAlerts());
    });
    return unsub;
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      navigate(`/pharmacist/search?q=${encodeURIComponent(quickQuery.trim())}`);
    } else {
      navigate('/pharmacist/search');
    }
  };

  const taskLinks = [
    { to: '/pharmacist', label: 'Dispensing Station', exact: true },
    { to: '/pharmacist/search', label: 'Medicine Search' },
    { to: '/pharmacist/dispense', label: 'Fast Dispense' },
    { to: '/pharmacist/batches', label: 'Batch & FEFO' },
    { to: '/pharmacist/stock', label: 'Stock Lookup' },
    { to: '/pharmacist/alerts', label: 'Alerts' },
    { to: '/pharmacist/history', label: 'Dispense Ledger' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#172321] font-barlow flex flex-col selection:bg-[#5BAFA3]/20 selection:text-[#087F73]">
      {/* =========================================================================
          ROLE 3: PHARMACIST SIMPLE TOP TASK BAR (NO SIDEBAR!)
          ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#172321]/10 px-6 lg:px-12 py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Wordmark */}
          <div
            onClick={() => navigate('/pharmacist')}
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-[#087F73]/10 border border-[#087F73]/20 flex items-center justify-center text-[#087F73]">
              <img src="/assets/medpredict-logo.png" alt="MEDLINK" className="w-5 h-5 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-instrument italic text-xl font-medium tracking-tight text-[#172321] leading-none">
                MEDLINK
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#087F73] font-bold mt-0.5">
                Dispensing Workspace
              </span>
            </div>
          </div>

          {/* Center Quick Global Medicine Search */}
          <form
            onSubmit={handleQuickSearch}
            className="flex-1 max-w-lg hidden sm:flex items-center relative"
          >
            <Search className="w-4 h-4 text-[#667572] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Search medicine, batch or barcode..."
              className="w-full h-10 pl-10 pr-4 bg-[#F7F8F4] border border-[#172321]/10 rounded-full text-xs text-[#172321] placeholder-[#667572]/70 focus:outline-none focus:border-[#087F73] focus:bg-white transition-all"
            />
          </form>

          {/* Right Area: FEFO badge, Notifications Bell & Pharmacist Dropdown */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#087F73]/10 text-[11px] font-semibold text-[#087F73]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>FEFO Protocol Enforced</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsAlertsOpen(!isAlertsOpen)}
                className="relative p-2 rounded-xl border border-[#172321]/10 hover:bg-[#F7F8F4] text-[#172321] transition-colors focus:outline-none"
                aria-label="Alerts"
              >
                <Bell className="w-4 h-4" />
                {alerts.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E56B6F]" />
                )}
              </button>

              {isAlertsOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-[#172321]/10 shadow-xl p-4 z-50 animate-in fade-in duration-150"
                  onMouseLeave={() => setIsAlertsOpen(false)}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#172321]/8">
                    <span className="text-xs font-bold text-[#172321] uppercase tracking-wider">
                      Pharmacist Clinical Alerts
                    </span>
                    <span className="text-[10px] text-[#667572]">{alerts.length} active</span>
                  </div>

                  <div className="py-2 space-y-2.5 max-h-72 overflow-y-auto">
                    {alerts.slice(0, 4).map((alt) => (
                      <div
                        key={alt.id}
                        className="p-2.5 rounded-xl bg-[#F7F8F4] border border-[#172321]/5 text-left text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            alt.severity === 'HIGH' ? 'text-[#E56B6F]' : 'text-[#E9A23B]'
                          }`}>
                            ● {alt.severity}
                          </span>
                          <span className="text-[9.5px] text-[#667572]">{alt.timestamp}</span>
                        </div>
                        <p className="text-xs font-semibold text-[#172321]">{alt.title}</p>
                        <p className="text-[11px] text-[#667572]">{alt.description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#172321]/8 text-center">
                    <button
                      onClick={() => {
                        setIsAlertsOpen(false);
                        navigate('/pharmacist/alerts');
                      }}
                      className="text-xs font-medium text-[#087F73] hover:underline"
                    >
                      View All Alerts Feed &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Pharmacist Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#172321]/10 bg-white hover:bg-[#F7F8F4] transition-all text-left focus:outline-none"
              >
                <div className="w-6 h-6 rounded-full bg-[#5BAFA3] text-white text-[11px] font-bold flex items-center justify-center">
                  P
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-semibold text-[#172321] leading-none">
                    {user?.fullName || 'Elena Rostova, RPh'}
                  </span>
                  <span className="text-[9px] text-[#667572] mt-0.5">Licensed Pharmacist</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#667572]" />
              </button>

              {isProfileOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-[#172321]/10 shadow-lg py-2 z-50 animate-in fade-in duration-150"
                  onMouseLeave={() => setIsProfileOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-[#172321]/5">
                    <p className="text-xs font-semibold text-[#172321]">{user?.fullName || 'Elena Rostova, RPh'}</p>
                    <p className="text-[10px] text-[#667572] truncate">{user?.email || 'pharmacist@medlink.health'}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs text-[#E56B6F] hover:bg-[#E56B6F]/10 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task Switcher Pills */}
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto pt-3 pb-0.5 no-scrollbar border-t border-[#172321]/6 mt-2.5">
          {taskLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              className={({ isActive }) =>
                `px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#087F73] text-white font-semibold shadow-xs'
                    : 'text-[#667572] hover:text-[#172321] hover:bg-[#172321]/5'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </header>

      {/* Main Pharmacist Canvas */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Pharmacist Footer */}
      <footer className="w-full border-t border-[#172321]/8 py-5 text-center text-xs text-[#667572] bg-white/50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-instrument italic font-medium text-[#172321]">MEDLINK</span>
            <span>&bull; Clinical Dispensing Station &bull; FEFO Safe Dispense</span>
          </div>
          <div>All transactions committed to permanent medical audit log</div>
        </div>
      </footer>
    </div>
  );
};

export default PharmacistLayout;
