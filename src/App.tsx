import React, { useState, useEffect } from 'react';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { ShortagePrediction } from './components/ShortagePrediction';
import { ExpiryRisk } from './components/ExpiryRisk';
import { DemandAnalysis } from './components/DemandAnalysis';
import { Recommendations } from './components/Recommendations';
import { Reports } from './components/Reports';
import { DataManagement } from './components/DataManagement';
import { LandingPage } from './components/LandingPage';
import { LoginPage, UserRole } from './components/LoginPage';
import { apiService } from './services/api';

/**
 * App screen flow:
 *   landing → login → dashboard (role-aware)
 *
 * Authentication is handled by the FastAPI backend at /api/auth/login.
 * Roles returned: HOSPITAL_ADMIN | PHARMACY_MANAGER | PHARMACIST
 */
type AppScreen = 'landing' | 'login' | 'app';

export function App() {
  const [screen, setScreen] = useState<AppScreen>('landing');
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isPipelineConnected, setIsPipelineConnected] = useState<boolean>(false);
  const [isModelReady, setIsModelReady] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const checkStatus = async () => {
    try {
      const data = await apiService.getDashboardData();
      if (data) {
        setIsPipelineConnected(data.dataPipelineConnected ?? true);
        setIsModelReady(data.modelServiceReady ?? false);
        setLastUpdated(data.lastUpdated || 'Synchronized');
      }
    } catch {
      setIsPipelineConnected(false);
      setIsModelReady(false);
      setLastUpdated('Awaiting API');
    }
  };

  // Health-check backend once the app screen is active
  useEffect(() => {
    if (screen === 'app') {
      checkStatus();
    }
  }, [screen]);

  /* ── Role-based default tab ── */
  function defaultTabForRole(role: UserRole): NavigationTab {
    switch (role) {
      case 'HOSPITAL_ADMIN':     return 'dashboard';
      case 'PHARMACY_MANAGER':   return 'inventory';
      case 'PHARMACIST':         return 'shortage_prediction';
      default:                   return 'dashboard';
    }
  }

  /* ── Handlers ── */
  const handleEnterLogin = () => setScreen('login');

  const handleLoginSuccess = (role: UserRole) => {
    setUserRole(role);
    setActiveTab(defaultTabForRole(role));
    setScreen('app');
  };

  /* ── Screen: Landing ── */
  if (screen === 'landing') {
    return <LandingPage onEnter={handleEnterLogin} />;
  }

  /* ── Screen: Login ── */
  if (screen === 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  /* ── Screen: Dashboard app ── */
  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':          return <Dashboard />;
      case 'inventory':          return <Inventory />;
      case 'shortage_prediction': return <ShortagePrediction />;
      case 'expiry_risk':        return <ExpiryRisk onNavigateDataManagement={() => setActiveTab('data_management')} />;
      case 'demand_analysis':    return <DemandAnalysis />;
      case 'recommendations':    return <Recommendations />;
      case 'reports':            return <Reports />;
      case 'data_management':    return <DataManagement onDatasetUpdated={checkStatus} />;
      default:                   return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F8] text-[#1E293B] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isPipelineConnected={isPipelineConnected}
        isModelReady={isModelReady}
        lastUpdated={lastUpdated}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar
          activeTab={activeTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          isDataConnected={isPipelineConnected}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {renderActiveScreen()}
        </main>
      </div>
    </div>
  );
}

export default App;
