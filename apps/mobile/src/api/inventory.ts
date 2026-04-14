import { api } from './request';
import type { Inventory, StockCheck, StockTransfer, PaginatedResponse } from '@/types/models';

export interface InventoryQuery {
  page?: number;
  pageSize?: number;
  warehouseId?: string;
  productId?: string;
  categoryId?: string;
  lowStock?: boolean;
}

export interface StockCheckQuery {
  page?: number;
  pageSize?: number;
  status?: string;
  warehouseId?: string;
}

export interface StockTransferQuery {
  page?: number;
  pageSize?: number;
  status?: string;
}

export interface CreateStockCheckData {
  warehouseId: string;
  checkDate: string;
  remark?: string;
  items: {
    productId: string;
    checkQuantity: number;
    reason?: string;
  }[];
}

export interface CreateStockTransferData {
  fromWarehouseId: string;
  toWarehouseId: string;
  transferDate: string;
  remark?: string;
  items: {
    productId: string;
    quantity: number;
    costPrice?: number;
  }[];
}

export const inventoryApi = {
  // Inventory
  getInventories: (params?: InventoryQuery) =>
    api.get<PaginatedResponse<Inventory>>('/inventories', { params }),

  getInventory: (productId: string, warehouseId: string) =>
    api.get<Inventory>(`/inventories/${productId}/${warehouseId}`),

  // Stock Check
  getStockChecks: (params?: StockCheckQuery) =>
    api.get<PaginatedResponse<StockCheck>>('/stock-checks', { params }),

  getStockCheck: (id: string) =>
    api.get<StockCheck>(`/stock-checks/${id}`),

  createStockCheck: (data: CreateStockCheckData) =>
    api.post<StockCheck>('/stock-checks', data),

  auditStockCheck: (id: string) =>
    api.post<StockCheck>(`/stock-checks/${id}/audit`),

  // Stock Transfer
  getStockTransfers: (params?: StockTransferQuery) =>
    api.get<PaginatedResponse<StockTransfer>>('/stock-transfers', { params }),

  getStockTransfer: (id: string) =>
    api.get<StockTransfer>(`/stock-transfers/${id}`),

  createStockTransfer: (data: CreateStockTransferData) =>
    api.post<StockTransfer>('/stock-transfers', data),

  auditStockTransfer: (id: string) =>
    api.post<StockTransfer>(`/stock-transfers/${id}/audit`),
};
