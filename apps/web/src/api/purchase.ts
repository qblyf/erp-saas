import request from './request';

export interface PurchaseOrderItem {
  id?: string;
  productId: string;
  product?: { id: string; name: string; code: string; spec?: string };
  warehouseId?: string;
  quantity: number;
  price: number;
  amount: number;
  taxRate?: number;
  taxAmount?: number;
  remark?: string;
}

export interface PurchaseOrder {
  id: string;
  orderNo: string;
  orderDate: string;
  supplierId: string;
  supplier?: { id: string; name: string };
  warehouseId: string;
  warehouse?: { id: string; name: string };
  contact?: string;
  phone?: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  deliveryDate?: string;
  remark?: string;
  items: PurchaseOrderItem[];
  createdAt: string;
}

export interface PurchaseStockIn {
  id: string;
  orderNo: string;
  stockInDate: string;
  supplierId: string;
  supplier?: { id: string; name: string };
  warehouseId: string;
  warehouse?: { id: string; name: string };
  totalAmount: number;
  paidAmount: number;
  status: string;
  remark?: string;
  items: PurchaseOrderItem[];
  createdAt: string;
}

export interface PurchaseReturn {
  id: string;
  orderNo: string;
  returnDate: string;
  supplierId: string;
  supplier?: { id: string; name: string };
  warehouseId: string;
  warehouse?: { id: string; name: string };
  totalAmount: number;
  status: string;
  remark?: string;
  items: PurchaseOrderItem[];
  createdAt: string;
}

export interface PurchaseQuery {
  keyword?: string;
  supplierId?: string;
  warehouseId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export const purchaseApi = {
  // 采购订单
  listOrders: (params: PurchaseQuery) =>
    request.get<{ list: PurchaseOrder[]; pagination: any }>('/purchase/orders', { params }),
  getOrder: (id: string) =>
    request.get<PurchaseOrder>(`/purchase/orders/${id}`),
  createOrder: (data: Partial<PurchaseOrder>) =>
    request.post<PurchaseOrder>('/purchase/orders', data),
  updateOrder: (id: string, data: Partial<PurchaseOrder>) =>
    request.put<PurchaseOrder>(`/purchase/orders/${id}`, data),
  deleteOrder: (id: string) =>
    request.delete<void>(`/purchase/orders/${id}`),
  auditOrder: (id: string) =>
    request.patch<PurchaseOrder>(`/purchase/orders/${id}/audit`, {}),
  cancelOrder: (id: string) =>
    request.patch<PurchaseOrder>(`/purchase/orders/${id}/cancel`, {}),

  // 采购入库
  listStockIns: (params: PurchaseQuery) =>
    request.get<{ list: PurchaseStockIn[]; pagination: any }>('/purchase/stock-ins', { params }),
  getStockIn: (id: string) =>
    request.get<PurchaseStockIn>(`/purchase/stock-ins/${id}`),
  createStockIn: (data: Partial<PurchaseStockIn>) =>
    request.post<PurchaseStockIn>('/purchase/stock-ins', data),
  auditStockIn: (id: string) =>
    request.patch<PurchaseStockIn>(`/purchase/stock-ins/${id}/audit`, {}),

  // 采购退货
  listReturns: (params: PurchaseQuery) =>
    request.get<{ list: PurchaseReturn[]; pagination: any }>('/purchase/returns', { params }),
  createReturn: (data: Partial<PurchaseReturn>) =>
    request.post<PurchaseReturn>('/purchase/returns', data),
  auditReturn: (id: string) =>
    request.patch<PurchaseReturn>(`/purchase/returns/${id}/audit`, {}),
};
