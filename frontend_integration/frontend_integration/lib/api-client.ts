import axios from 'axios';
import { useAuthStore } from '@/store/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`, 
          {}, 
          { withCredentials: true }
        );

        useAuthStore.getState().setAuth(data.user, data.access_token);

        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const campaignApi = {
  list: () => apiClient.get('/campaigns'),
  get: (id: string) => apiClient.get(`/campaigns/${id}`),
  create: (data: any) => apiClient.post('/campaigns', data),
  update: (id: string, data: any) => apiClient.patch(`/campaigns/${id}`, data),
  pause: (id: string) => apiClient.post(`/campaigns/${id}/pause`),
  resume: (id: string) => apiClient.post(`/campaigns/${id}/resume`),
  cancel: (id: string) => apiClient.delete(`/campaigns/${id}`),
  getArticles: (id: string) => apiClient.get(`/campaigns/${id}/articles`),
};

export const creditApi = {
  getBalance: () => apiClient.get('/credits'),
  getTransactions: (limit = 50) => apiClient.get(`/credits/transactions?limit=${limit}`),
  purchase: () => apiClient.post('/credits/purchase'),
};

export const apiKeyApi = {
  list: () => apiClient.get('/api-keys'),
  create: (name: string) => apiClient.post('/api-keys', { name }),
  revoke: (id: string) => apiClient.delete(`/api-keys/${id}`),
};

export const integrationApi = {
  list: () => apiClient.get('/integrations'),
  create: (data: any) => apiClient.post('/integrations', data),
  update: (id: string, data: any) => apiClient.patch(`/integrations/${id}`, data),
  delete: (id: string) => apiClient.delete(`/integrations/${id}`),
  test: (webhook_url: string, webhook_secret?: string) => 
    apiClient.post('/integrations/test', { webhook_url, webhook_secret }),
};
