'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, 
        retry: 1,
        refetchOnWindowFocus: false, // Prevent aggressive refetching on 401s
      },
    },
  }));

  // Re-hydrate auth state on mount
  useEffect(() => {
    const initAuth = async () => {
        // FIX: Stop infinite loops by checking if we even have a session locally.
        // Only call the API if we think we are logged in.
        // @ts-ignore - access state directly
        const { isAuthenticated } = useAuthStore.getState();

        // If we are already logged out locally, DO NOT call the API.
        if (!isAuthenticated) {
            return;
        }

        try {
            const { data } = await apiClient.post('/auth/refresh');
            if (data?.access_token) {
                useAuthStore.getState().setAuth(data.user, data.access_token);
            }
        } catch (e) {
            // If session is invalid (401), logout to clear local state.
            // Next time this runs, isAuthenticated will be false, stopping the loop.
            console.log("Session invalid or expired - Clearing auth state");
            useAuthStore.getState().logout();
        }
    };
    initAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}