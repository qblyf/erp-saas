import { api } from './request';
import type { PurchaseOrder, PurchaseStockIn, PaginatedResponse } from '@/types/models';

export interface PurchaseOrderQuery {
  page?: number;
  pageSize?: number;
  status?: string;
  supplierId?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreatePurchaseOrderData {
  supplierId: string;
  warehouseId: string;
  orderDate: string;
  deliveryDate?: string;
  contact?: string;
  phone?: string;
  remark?: string;
  items: {
    productId: string;
    warehouseId: string;
    quantity: number;
    price: number;
    taxRate?: number;
    remark?: string;
  }[];
}

export const purchaseApi = {
  // Orders
  getOrders: (params?: PurchaseOrderQuery) =>
    api.get<PaginatedResponse<PurchaseOrder>>('/purchase-orders', { params }),

  getOrder: (id: string) =>
    api.get<PurchaseOrder>(`/purchase-orders/${id}`),

  createOrder: (data: CreatePurchaseOrderData) =>
    api.post<PurchaseOrder>('/purchase-orders', data),

  updateOrder: (id: string, data: Partial<CreatePurchaseOrderData>) =>
    api.put<PurchaseOrder>(`/purchase-orders/${id}`, data),

  deleteOrder: (id: string) =>
    api.delete(`/purchase-orders/${id}`),

  // Audit
  auditOrder: (id: string) =>
    api.post<PurchaseOrder>(`/purchase-orders/${id}/audit`),

  cancelOrder: (id: string, reason?: string) =>
    api.post<PurchaseOrder>(`/purchase-orders/${id}/cancel`, { reason }),

  // Stock In
  createStockIn: (orderId: string, data: { warehouseId: string; remark?: string }) =>
    api.post<PurchaseStockIn>(`/purchase-orders/${orderId}/stock-in`, data),

  getStockIns: (params?: { page?: number; pageSize?: number; status?: string }) =>
    api.get<PaginatedResponse<PurchaseStockIn>>('/purchase-stock-ins', { params }),

  getStockIn: (id: string) =>
    api.get<PurchaseStockIn>(`/purchase-stock-ins/${id}`),

  // Return
  createReturn: (orderId: string, data: {
    items: { itemId: string; quantity: number; reason?: string }[];
    remark?: string;
  }) => api.post(`/purchase-orders/${orderId}/return`, data),
};
