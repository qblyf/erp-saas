import request from './request';

export interface StoreTransfer {
  id: string;
  transferNo: string;
  fromStoreId: string;
  toStoreId: string;
  fromStore: { id: string; name: string };
  toStore: { id: string; name: string };
  status: string;
  remark?: string;
  creatorId: string;
  createdAt: string;
  items: StoreTransferItem[];
}

export interface StoreTransferItem {
  id: string;
  productId: string;
  product: { id: string; name: string; code: string };
  fromWarehouseId?: string;
  toWarehouseId?: string;
  quantity: number;
  status: string;
}

export interface CreateStoreTransferDto {
  tenantId: string;
  creatorId: string;
  fromStoreId: string;
  toStoreId: string;
  items: {
    productId: string;
    fromWarehouseId?: string;
    toWarehouseId?: string;
    quantity: number;
  }[];
  remark?: string;
}

export const storeTransferApi = {
  list: (params: { tenantId: string; status?: string }) =>
    request.get<StoreTransfer[]>('/store-transfer', { params }),

  get: (id: string) =>
    request.get<StoreTransfer>(`/store-transfer/${id}`),

  create: (data: CreateStoreTransferDto) =>
    request.post<StoreTransfer>('/store-transfer', data),

  update: (id: string, data: { status?: string; remark?: string }) =>
    request.put<StoreTransfer>(`/store-transfer/${id}`, data),

  execute: (id: string) =>
    request.post<StoreTransfer>(`/store-transfer/${id}/execute`, {}),
};
