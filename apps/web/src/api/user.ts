import request from './request';

export interface User {
  id: string;
  username: string;
  realName?: string;
  phone?: string;
  email?: string;
  status: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface UserQuery {
  keyword?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export const userApi = {
  list: (params: UserQuery) =>
    request.get<{ list: User[]; pagination: any }>('/users', { params }),

  get: (id: string) =>
    request.get<User>(`/users/${id}`),

  create: (data: any) =>
    request.post<User>('/users', data),

  update: (id: string, data: any) =>
    request.put<User>(`/users/${id}`, data),

  updateStatus: (id: string, status: string) =>
    request.post(`/users/${id}/status`, { status }),

  delete: (id: string) =>
    request.delete<void>(`/users/${id}`),

  resetPassword: (id: string, password: string) =>
    request.post(`/users/${id}/reset-password`, { password }),
};
