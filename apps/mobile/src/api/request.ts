import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import * as Linking from 'expo-linking';

// Base URL - in production this would come from environment
const BASE_URL = Linking.createURL('/api/v1').replace('/api/v1', '') || 'http://localhost:4000/api/v1';

console.log('API Base URL:', BASE_URL);

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const tenantId = useAuthStore.getState().tenant?.id;
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  <T>(response: AxiosResponse<T>): T => response.data,
  async (error: AxiosError<{ code: number; message: string }>) => {
    const { response } = error;

    // Handle 401 - try to refresh token
    if (response?.status === 401) {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          // Attempt to refresh token
          const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          const { token, refreshToken: newRefreshToken, user, tenant } = refreshResponse.data;
          useAuthStore.getState().setAuth(token, newRefreshToken, user, tenant);

          // Retry original request
          const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
          if (originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;
            originalRequest.headers!.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, logout
          useAuthStore.getState().logout();
          return Promise.reject(refreshError);
        }
      } else {
        useAuthStore.getState().logout();
      }
    }

    const msg = response?.data?.message || error.message || '请求失败';
    console.error('API Error:', msg);
    return Promise.reject(error);
  }
);

// Typed request methods
const request = axiosInstance as unknown as {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
};

export default request;

// Export get/post/put/delete/patch as Promise<T> return type
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => request.get<T>(url, config),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => request.post<T>(url, data, config),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => request.put<T>(url, data, config),
  delete: <T>(url: string, config?: AxiosRequestConfig) => request.delete<T>(url, config),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => request.patch<T>(url, data, config),
};
