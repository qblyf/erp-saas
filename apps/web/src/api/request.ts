import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';
import { useAuthStore } from '@/stores/auth';

// 创建axios实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
});

// 请求拦截器
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

// 响应拦截器 - 返回 data（自动解包 AxiosResponse）
axiosInstance.interceptors.response.use(
  <T>(response: AxiosResponse<T>): T => response.data,
  (error: AxiosError<{ code: number; message: string }>) => {
    const { response } = error;

    if (response?.status === 401) {
      useAuthStore.getState().logout();
      message.error('登录已过期，请重新登录');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    const msg = response?.data?.message || error.message || '请求失败';
    message.error(msg);

    return Promise.reject(error);
  }
);

// 核心 request 实例：类型为 AxiosInstance，但拦截器已解包
// 所有方法返回 Promise<T>（不再是 Promise<AxiosResponse<T>>）
const request = axiosInstance as unknown as {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
};

export default request;

// 导出 get/post/put/delete/patch 作为 Promise<T> 返回类型
export const api = {
  get: <T>(url: string) => request.get<T>(url),
  post: <T>(url: string, data?: unknown) => request.post<T>(url, data),
  put: <T>(url: string, data?: unknown) => request.put<T>(url, data),
  delete: <T>(url: string) => request.delete<T>(url),
  patch: <T>(url: string, data?: unknown) => request.patch<T>(url, data),
};
