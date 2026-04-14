import { api } from './request';
import type { Customer, PaginatedResponse } from '@/types/models';

export interface CustomerQuery {
  page?: number;
  pageSize?: number;
  status?: string;
  keyword?: string;
  customerType?: string;
}

export const customerApi = {
  getCustomers: (params?: CustomerQuery) =>
    api.get<PaginatedResponse<Customer>>('/customers', { params }),

  getCustomer: (id: string) =>
    api.get<Customer>(`/customers/${id}`),

  getCustomerByCode: (code: string) =>
    api.get<Customer>(`/customers/code/${code}`),
};
