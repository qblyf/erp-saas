import request from './request';

export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  permissions: { id: string; permissionCode: string }[];
  createdAt: string;
}

export const roleApi = {
  list: (tenantId: string) =>
    request.get<Role[]>('/roles', { params: { tenantId } }),

  get: (id: string) =>
    request.get<Role>(`/roles/${id}`),

  create: (data: any) =>
    request.post<Role>('/roles', data),

  update: (id: string, data: any) =>
    request.put<Role>(`/roles/${id}`, data),

  delete: (id: string) =>
    request.delete<void>(`/roles/${id}`),
};
