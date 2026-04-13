import request from './request';

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address?: string;
  principal?: string;
  sortOrder: number;
  status: string;
  createdAt: string;
}

export interface WarehouseQuery {
  keyword?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export const warehouseApi = {
  list: (params: WarehouseQuery) =>
    request.get<{ list: Warehouse[]; pagination: any }>('/warehouses', { params }),

  get: (id: string) =>
    request.get<Warehouse>(`/warehouses/${id}`),

  create: (data: Partial<Warehouse>) =>
    request.post<Warehouse>('/warehouses', data),

  update: (id: string, data: Partial<Warehouse>) =>
    request.put<Warehouse>(`/warehouses/${id}`, data),

  delete: (id: string) =>
    request.delete<void>(`/warehouses/${id}`),

  updateStatus: (id: string, status: string) =>
    request.patch<void>(`/warehouses/${id}/status`, { status }),
};
