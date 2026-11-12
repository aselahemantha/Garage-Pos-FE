import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { JobBoardPage } from '@/features/jobs/JobBoardPage';
import { NewJobCardPage } from '@/features/jobs/NewJobCardPage';
import { CustomersPage } from '@/features/customers/CustomersPage';
import { CatalogPage } from '@/features/catalog/CatalogPage';
import { InventoryPage } from '@/features/inventory/InventoryPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
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
        element: <div className="p-4 bg-card rounded-lg border">Job Detail (Sprint 2)</div>,
      },
      {
        path: 'invoices',
        element: <div className="p-4 bg-card rounded-lg border">Invoices & Billing (Sprint 3)</div>,
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
        element: <div className="p-4 bg-card rounded-lg border">Cash Drawer & Sessions (Sprint 3)</div>,
      },
      {
        path: 'reports',
        element: <div className="p-4 bg-card rounded-lg border">Reports & Analytics (Sprint 6)</div>,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
