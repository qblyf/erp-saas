import { api } from './request';
import type { Product, PaginatedResponse } from '@/types/models';

export interface ProductQuery {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  status?: string;
  keyword?: string;
}

export const productApi = {
  getProducts: (params?: ProductQuery) =>
    api.get<PaginatedResponse<Product>>('/products', { params }),

  getProduct: (id: string) =>
    api.get<Product>(`/products/${id}`),

  getProductByCode: (code: string) =>
    api.get<Product>(`/products/code/${code}`),
};
