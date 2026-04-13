import request from './request';

export interface Inventory {
  id: string;
  productId: string;
  product?: { id: string; name: string; code: string; spec?: string };
  warehouseId: string;
  warehouse?: { id: string; name: string };
  quantity: number;
  frozenQuantity: number;
  avgCostPrice: number;
  lastInPrice?: number;
  lastOutPrice?: number;
}

export interface StockCheck {
  id: string;
  orderNo: string;
  checkDate: string;
  warehouseId: string;
  warehouse?: { id: string; name: string };
  totalAmount: number;
  status: string;
  remark?: string;
  items: StockCheckItem[];
}

export interface StockCheckItem {
  id: string;
  productId: string;
  product?: { id: string; name: string };
  bookQuantity: number;
  checkQuantity: number;
  diffQuantity: number;
  costPrice: number;
  diffAmount: number;
  reason?: string;
}

export interface StockTransfer {
  id: string;
  orderNo: string;
  transferDate: string;
  fromWarehouseId: string;
  fromWarehouse?: { id: string; name: string };
  toWarehouseId: string;
  toWarehouse?: { id: string; name: string };
  totalAmount: number;
  status: string;
  remark?: string;
  items: StockTransferItem[];
}

export interface StockTransferItem {
  id: string;
  productId: string;
  product?: { id: string; name: string };
  quantity: number;
  costPrice: number;
  amount: number;
}

export interface InventoryQuery {
  keyword?: string;
  productId?: string;
  warehouseId?: string;
  stockStatus?: string;
  page?: number;
  pageSize?: number;
}

export interface InventorySummary {
  totalProductTypes: number;
  totalQuantity: number;
  lowStockCount: number;
  overStockCount: number;
}

export const inventoryApi = {
  list: (params: InventoryQuery) =>
    request.get<{ list: Inventory[]; pagination: any }>('/inventory', { params }),

  getSummary: () =>
    request.get<InventorySummary>('/inventory/summary'),

  getWarnings: () =>
    request.get<any[]>('/inventory/warnings'),

  // 盘点
  listChecks: (params: any) =>
    request.get<{ list: StockCheck[]; pagination: any }>('/inventory/checks', { params }),
  getCheck: (id: string) =>
    request.get<StockCheck>(`/inventory/checks/${id}`),
  createCheck: (data: any) =>
    request.post<StockCheck>('/inventory/checks', data),
  auditCheck: (id: string) =>
    request.patch<StockCheck>(`/inventory/checks/${id}/audit`, {}),
  approveCheck: (id: string) =>
    request.patch<StockCheck>(`/inventory/checks/${id}/approve`, {}),

  // 调拨
  listTransfers: (params: any) =>
    request.get<{ list: StockTransfer[]; pagination: any }>('/inventory/transfers', { params }),
  getTransfer: (id: string) =>
    request.get<StockTransfer>(`/inventory/transfers/${id}`),
  createTransfer: (data: any) =>
    request.post<StockTransfer>('/inventory/transfers', data),
  auditTransfer: (id: string) =>
    request.patch<StockTransfer>(`/inventory/transfers/${id}/audit`, {}),
};
