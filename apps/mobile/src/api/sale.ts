import { api } from './request';
import type { SaleOrder, SaleOrderItem, PaginatedResponse } from '@/types/models';

export interface SaleOrderQuery {
  page?: number;
  pageSize?: number;
  status?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateSaleOrderData {
  customerId: string;
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

export const saleApi = {
  // Orders
  getOrders: (params?: SaleOrderQuery) =>
    api.get<PaginatedResponse<SaleOrder>>('/sale-orders', { params }),

  getOrder: (id: string) =>
    api.get<SaleOrder>(`/sale-orders/${id}`),

  createOrder: (data: CreateSaleOrderData) =>
    api.post<SaleOrder>('/sale-orders', data),

  updateOrder: (id: string, data: Partial<CreateSaleOrderData>) =>
    api.put<SaleOrder>(`/sale-orders/${id}`, data),

  deleteOrder: (id: string) =>
    api.delete(`/sale-orders/${id}`),

  // Audit
  auditOrder: (id: string) =>
    api.post<SaleOrder>(`/sale-orders/${id}/audit`),

  cancelOrder: (id: string, reason?: string) =>
    api.post<SaleOrder>(`/sale-orders/${id}/cancel`, { reason }),

  // Stock Out
  createStockOut: (orderId: string, data: { warehouseId: string; remark?: string }) =>
    api.post(`/sale-orders/${orderId}/stock-out`, data),

  // Return
  createReturn: (orderId: string, data: {
    items: { itemId: string; quantity: number; reason?: string }[];
    remark?: string;
  }) => api.post(`/sale-orders/${orderId}/return`, data),
};
