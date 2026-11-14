import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { JobBoardPage } from '@/features/jobs/JobBoardPage';
import { NewJobCardPage } from '@/features/jobs/NewJobCardPage';
import { JobDetailPage } from '@/features/jobs/JobDetailPage';
import { CustomersPage } from '@/features/customers/CustomersPage';
import { CatalogPage } from '@/features/catalog/CatalogPage';
import { InventoryPage } from '@/features/inventory/InventoryPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { InvoicesListPage } from '@/features/billing/InvoicesListPage';
import { InvoiceDetailPage } from '@/features/billing/InvoiceDetailPage';
import { PrintInvoicePage } from '@/features/billing/PrintInvoicePage';
import { CashDrawerPage } from '@/features/billing/CashDrawerPage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { UsersPage } from '@/features/users/UsersPage';
import { PrintWorkOrderPage } from '@/features/jobs/PrintWorkOrderPage';
import { PublicTrackingPage } from '@/features/jobs/PublicTrackingPage';
import { VehicleHistoryPage } from '@/features/vehicles/VehicleHistoryPage';
import { useAuthStore } from '@/features/auth/store';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/track/:token',
    element: <PublicTrackingPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <JobBoardPage />,
      },
      {
        path: 'jobs/new',
        element: <NewJobCardPage />,
      },
      {
        path: 'jobs/:id',
        element: <JobDetailPage />,
      },
      {
        path: 'invoices',
        element: <InvoicesListPage />,
      },
      {
        path: 'invoices/:id',
        element: <InvoiceDetailPage />,
      },
      {
        path: 'customers',
        element: <CustomersPage />,
      },
      {
        path: 'catalog',
        element: <CatalogPage />,
      },
      {
        path: 'inventory',
        element: <InventoryPage />,
      },
      {
        path: 'cash',
        element: <CashDrawerPage />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'settings/users',
        element: <UsersPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'vehicles/:id',
        element: <VehicleHistoryPage />,
      },
    ],
  },
  {
    path: '/invoices/:id/print',
    element: (
      <ProtectedRoute>
        <PrintInvoicePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/jobs/:id/print',
    element: (
      <ProtectedRoute>
        <PrintWorkOrderPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
