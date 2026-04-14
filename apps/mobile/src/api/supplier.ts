import { api } from './request';
import type { Supplier, PaginatedResponse } from '@/types/models';

export interface SupplierQuery {
  page?: number;
  pageSize?: number;
  status?: string;
  keyword?: string;
}

export const supplierApi = {
  getSuppliers: (params?: SupplierQuery) =>
    api.get<PaginatedResponse<Supplier>>('/suppliers', { params }),

  getSupplier: (id: string) =>
    api.get<Supplier>(`/suppliers/${id}`),

  getSupplierByCode: (code: string) =>
    api.get<Supplier>(`/suppliers/code/${code}`),
};
