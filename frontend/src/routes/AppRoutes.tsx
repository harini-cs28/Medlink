import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

// Layouts for the 3 distinct roles
import { AdminLayout } from '../components/layout/AdminLayout';
import { ManagerLayout } from '../components/layout/ManagerLayout';
import { PharmacistLayout } from '../components/layout/PharmacistLayout';

// Public Landing & Auth Pages
import { MedlinkLanding } from '../pages/landing/MedlinkLanding';
import { Login } from '../pages/auth/Login';

// 1. Hospital Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminHospital } from '../pages/admin/AdminHospital';
import { PharmacyManagement } from '../pages/admin/PharmacyManagement';
import { UserManagement } from '../pages/admin/UserManagement';
import { MedicineMaster } from '../pages/admin/MedicineMaster';
import { SystemAnalytics } from '../pages/admin/SystemAnalytics';
import { DatasetManagement } from '../pages/admin/DatasetManagement';

// 2. Pharmacy Manager Pages
import { ManagerDashboard } from '../pages/manager/ManagerDashboard';
import { InventoryManagement } from '../pages/manager/InventoryManagement';
import { PurchaseManagement } from '../pages/manager/PurchaseManagement';
import { SupplierManagement } from '../pages/manager/SupplierManagement';
import { Predictions } from '../pages/manager/Predictions';
import { ManagerRecommendations } from '../pages/manager/ManagerRecommendations';
import { Reports } from '../pages/manager/Reports';

// 3. Pharmacist Pages
import { PharmacistDashboard } from '../pages/pharmacist/PharmacistDashboard';
import { MedicineSearch } from '../pages/pharmacist/MedicineSearch';
import { PharmacistDispense } from '../pages/pharmacist/PharmacistDispense';
import { BatchExpiry } from '../pages/pharmacist/BatchExpiry';
import { PharmacistStock } from '../pages/pharmacist/PharmacistStock';
import { Alerts } from '../pages/pharmacist/Alerts';
import { PharmacistHistory } from '../pages/pharmacist/PharmacistHistory';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  // Redirect to role-specific workspace root
  const getDefaultWorkspace = () => {
    if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
    if (user.role === 'HOSPITAL_ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'PHARMACY_MANAGER') return <Navigate to="/manager" replace />;
    return <Navigate to="/pharmacist" replace />;
  };

  return (
    <Routes>
      {/* Public Editorial Landing Page */}
      <Route path="/" element={<MedlinkLanding />} />
      <Route path="/landing" element={<MedlinkLanding />} />

      {/* Public Authentication Route */}
      <Route
        path="/login"
        element={
          isAuthenticated ? getDefaultWorkspace() : <Login />
        }
      />

      {/* General Dashboard Shortcuts */}
      <Route path="/dashboard" element={getDefaultWorkspace()} />
      <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
      <Route path="/manager/dashboard" element={<Navigate to="/manager" replace />} />
      <Route path="/pharmacist/dashboard" element={<Navigate to="/pharmacist" replace />} />

      {/* =========================================================================
          ROLE 1: HOSPITAL ADMIN WORKSPACE (Hospital Command Center)
          ========================================================================= */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['HOSPITAL_ADMIN']} />
        }
      >
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="hospital" element={<AdminHospital />} />
          <Route path="pharmacies" element={<PharmacyManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="medicines" element={<MedicineMaster />} />
          <Route path="analytics" element={<SystemAnalytics />} />
          <Route path="datasets" element={<DatasetManagement />} />
        </Route>
      </Route>

      {/* =========================================================================
          ROLE 2: PHARMACY MANAGER WORKSPACE (Inventory Operations Workspace)
          ========================================================================= */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['HOSPITAL_ADMIN', 'PHARMACY_MANAGER']} />
        }
      >
        <Route path="/manager" element={<ManagerLayout />}>
          <Route index element={<ManagerDashboard />} />
          <Route path="inventory" element={<InventoryManagement />} />
          <Route path="purchases" element={<PurchaseManagement />} />
          <Route path="suppliers" element={<SupplierManagement />} />
          <Route path="predictions" element={<Predictions />} />
          <Route path="recommendations" element={<ManagerRecommendations />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Route>

      {/* =========================================================================
          ROLE 3: PHARMACIST WORKSPACE (Dispensing Workspace)
          ========================================================================= */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['HOSPITAL_ADMIN', 'PHARMACY_MANAGER', 'PHARMACIST']} />
        }
      >
        <Route path="/pharmacist" element={<PharmacistLayout />}>
          <Route index element={<PharmacistDashboard />} />
          <Route path="search" element={<MedicineSearch />} />
          <Route path="dispense" element={<PharmacistDispense />} />
          <Route path="batches" element={<BatchExpiry />} />
          <Route path="stock" element={<PharmacistStock />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="history" element={<PharmacistHistory />} />
        </Route>
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
