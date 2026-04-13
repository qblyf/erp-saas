import request from './request';

export interface Customer {
  id: string;
  code: string;
  name: string;
  contact?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  address?: string;
  customerType?: string;
  creditLimit?: number;
  status: string;
}

export interface CustomerQuery {
  keyword?: string;
  customerType?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export const customerApi = {
  list: (params: CustomerQuery) =>
    request.get<{ list: Customer[]; pagination: any }>('/customers', { params }),

  get: (id: string) =>
    request.get<Customer>(`/customers/${id}`),

  create: (data: Partial<Customer>) =>
    request.post<Customer>('/customers', data),

  update: (id: string, data: Partial<Customer>) =>
    request.put<Customer>(`/customers/${id}`, data),

  delete: (id: string) =>
    request.delete<void>(`/customers/${id}`),

  updateStatus: (id: string, status: string) =>
    request.patch<void>(`/customers/${id}/status`, { status }),
};
