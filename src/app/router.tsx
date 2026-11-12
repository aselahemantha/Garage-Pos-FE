import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { JobBoardPage } from '@/features/jobs/JobBoardPage';
import { useAuthStore } from '@/features/auth/store';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
        element: <div className="p-4 bg-white rounded-lg border">New Job Card Form (Sprint 2)</div>,
      },
      {
        path: 'jobs/:id',
        element: <div className="p-4 bg-white rounded-lg border">Job Detail (Sprint 2)</div>,
      },
      {
        path: 'invoices',
        element: <div className="p-4 bg-white rounded-lg border">Invoices & Billing (Sprint 3)</div>,
      },
      {
        path: 'customers',
        element: <div className="p-4 bg-white rounded-lg border">Customer Management (Sprint 1)</div>,
      },
      {
        path: 'catalog',
        element: <div className="p-4 bg-white rounded-lg border">Service Catalog (Sprint 1)</div>,
      },
      {
        path: 'inventory',
        element: <div className="p-4 bg-white rounded-lg border">Parts Inventory (Sprint 2 & 4)</div>,
      },
      {
        path: 'cash',
        element: <div className="p-4 bg-white rounded-lg border">Cash Drawer & Sessions (Sprint 3)</div>,
      },
      {
        path: 'reports',
        element: <div className="p-4 bg-white rounded-lg border">Reports & Analytics (Sprint 6)</div>,
      },
      {
        path: 'settings',
        element: <div className="p-4 bg-white rounded-lg border">Garage Settings (Sprint 1)</div>,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
