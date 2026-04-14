import { api } from './request';
import type { User, Tenant, Store, Warehouse } from '@/types/models';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  tenant: Tenant;
  stores: Store[];
  warehouses: Warehouse[];
}

export interface RefreshResponse {
  token: string;
  refreshToken: string;
  user: User;
  tenant: Tenant;
}

export const authApi = {
  login: (data: LoginRequest) => api.post<LoginResponse>('/auth/login', data),

  refresh: (refreshToken: string) =>
    api.post<RefreshResponse>('/auth/refresh', { refreshToken }),

  logout: () => api.post('/auth/logout'),

  getCurrentUser: () => api.get<User>('/auth/me'),
};
