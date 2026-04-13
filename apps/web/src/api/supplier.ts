import request from './request';

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contact?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  address?: string;
  bankName?: string;
  bankAccount?: string;
  taxNo?: string;
  status: string;
}

export interface SupplierQuery {
  keyword?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export const supplierApi = {
  list: (params: SupplierQuery) =>
    request.get<{ list: Supplier[]; pagination: any }>('/suppliers', { params }),

  get: (id: string) =>
    request.get<Supplier>(`/suppliers/${id}`),

  create: (data: Partial<Supplier>) =>
    request.post<Supplier>('/suppliers', data),

  update: (id: string, data: Partial<Supplier>) =>
    request.put<Supplier>(`/suppliers/${id}`, data),

  delete: (id: string) =>
    request.delete<void>(`/suppliers/${id}`),

  updateStatus: (id: string, status: string) =>
    request.patch<void>(`/suppliers/${id}/status`, { status }),
};
