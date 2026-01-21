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
        // Try to refresh token immediately on load to check if session is valid
        try {
            const { data } = await apiClient.post('/auth/refresh');
            if (data?.access_token) {
                useAuthStore.getState().setAuth(data.user, data.access_token);
            }
        } catch (e) {
            // Use silent fail here; if they aren't logged in, they aren't logged in.
            console.log("Session invalid or expired");
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