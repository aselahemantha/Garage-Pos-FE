import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { useAuthStore } from '@/features/auth/store';
import { setAccessToken } from '@/lib/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  const { setUser } = useAuthStore();

  useEffect(() => {
    // Initial auth verification on boot
    const checkSession = async () => {
      try {
        const refreshRes = await fetch('/api/v1/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          if (data?.data?.access_token) {
            setAccessToken(data.data.access_token);
            const meRes = await fetch('/api/v1/auth/me', {
              headers: { Authorization: `Bearer ${data.data.access_token}` },
            });
            if (meRes.ok) {
              const meData = await meRes.json();
              setUser(meData.data);
              return;
            }
          }
        }
      } catch {
        // Not logged in or backend offline
      }
      setUser(null);
    };

    checkSession();
  }, [setUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};
