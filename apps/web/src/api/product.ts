import request from './request';

export interface Product {
  id: string;
  categoryId?: string;
  category?: { id: string; name: string };
  code: string;
  name: string;
  spec?: string;
  unit?: string;
  purchasePrice?: number;
  salePrice?: number;
  costPrice?: number;
  minStock?: number;
  maxStock?: number;
  status: string;
  imageUrl?: string;
  description?: string;
}

export interface ProductCategory {
  id: string;
  parentId?: string;
  name: string;
  sortOrder: number;
  children?: ProductCategory[];
}

export interface ProductQuery {
  keyword?: string;
  categoryId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export const productCategoryApi = {
  list: () =>
    request.get<ProductCategory[]>('/product-categories'),

  get: (id: string) =>
    request.get<ProductCategory>(`/product-categories/${id}`),

  create: (data: Partial<ProductCategory>) =>
    request.post<ProductCategory>('/product-categories', data),

  update: (id: string, data: Partial<ProductCategory>) =>
    request.put<ProductCategory>(`/product-categories/${id}`, data),

  delete: (id: string) =>
    request.delete<void>(`/product-categories/${id}`),
};

export const productApi = {
  list: (params: ProductQuery) =>
    request.get<{ list: Product[]; pagination: any }>('/products', { params }),

  get: (id: string) =>
    request.get<Product>(`/products/${id}`),

  create: (data: Partial<Product>) =>
    request.post<Product>('/products', data),

  update: (id: string, data: Partial<Product>) =>
    request.put<Product>(`/products/${id}`, data),

  delete: (id: string) =>
    request.delete<void>(`/products/${id}`),

  updateStatus: (id: string, status: string) =>
    request.patch<void>(`/products/${id}/status`, { status }),
};
