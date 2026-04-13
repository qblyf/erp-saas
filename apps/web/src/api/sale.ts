import request from './request';

export interface SaleOrderItem {
  id?: string;
  productId: string;
  product?: { id: string; name: string; code: string; spec?: string };
  warehouseId?: string;
  quantity: number;
  price: number;
  amount: number;
  taxRate?: number;
  taxAmount?: number;
}

export interface SaleOrder {
  id: string;
  orderNo: string;
  orderDate: string;
  customerId: string;
  customer?: { id: string; name: string };
  warehouseId: string;
  warehouse?: { id: string; name: string };
  contact?: string;
  phone?: string;
  totalAmount: number;
  receivedAmount: number;
  status: string;
  deliveryDate?: string;
  remark?: string;
  items: SaleOrderItem[];
  createdAt: string;
}

export interface SaleStockOut {
  id: string;
  orderNo: string;
  stockOutDate: string;
  customerId: string;
  customer?: { id: string; name: string };
  warehouseId: string;
  warehouse?: { id: string; name: string };
  totalAmount: number;
  receivedAmount: number;
  status: string;
  remark?: string;
  items: SaleOrderItem[];
  createdAt: string;
}

export interface SaleReturn {
  id: string;
  orderNo: string;
  returnDate: string;
  customerId: string;
  customer?: { id: string; name: string };
  warehouseId: string;
  warehouse?: { id: string; name: string };
  totalAmount: number;
  status: string;
  remark?: string;
  items: SaleOrderItem[];
  createdAt: string;
}

export interface SaleQuery {
  keyword?: string;
  customerId?: string;
  warehouseId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export const saleApi = {
  // 销售订单
  listOrders: (params: SaleQuery) =>
    request.get<{ list: SaleOrder[]; pagination: any }>('/sale/orders', { params }),
  getOrder: (id: string) =>
    request.get<SaleOrder>(`/sale/orders/${id}`),
  createOrder: (data: Partial<SaleOrder>) =>
    request.post<SaleOrder>('/sale/orders', data),
  updateOrder: (id: string, data: Partial<SaleOrder>) =>
    request.put<SaleOrder>(`/sale/orders/${id}`, data),
  deleteOrder: (id: string) =>
    request.delete<void>(`/sale/orders/${id}`),
  auditOrder: (id: string) =>
    request.patch<SaleOrder>(`/sale/orders/${id}/audit`, {}),
  cancelOrder: (id: string) =>
    request.patch<SaleOrder>(`/sale/orders/${id}/cancel`, {}),

  // 销售出库
  listStockOuts: (params: SaleQuery) =>
    request.get<{ list: SaleStockOut[]; pagination: any }>('/sale/stock-outs', { params }),
  getStockOut: (id: string) =>
    request.get<SaleStockOut>(`/sale/stock-outs/${id}`),
  createStockOut: (data: Partial<SaleStockOut>) =>
    request.post<SaleStockOut>('/sale/stock-outs', data),
  auditStockOut: (id: string) =>
    request.patch<SaleStockOut>(`/sale/stock-outs/${id}/audit`, {}),

  // 销售退货
  listReturns: (params: SaleQuery) =>
    request.get<{ list: SaleReturn[]; pagination: any }>('/sale/returns', { params }),
  createReturn: (data: Partial<SaleReturn>) =>
    request.post<SaleReturn>('/sale/returns', data),
  auditReturn: (id: string) =>
    request.patch<SaleReturn>(`/sale/returns/${id}/audit`, {}),
};
