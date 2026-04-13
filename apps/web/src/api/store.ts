import request from './request';

export interface Store {
  id: string;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  manager?: string;
  status: string;
  warehouses?: any[];
  _count?: { userStores: number };
}

export interface StoreStats {
  todaySales: number;
  monthSales: number;
  inventoryCount: number;
  staffCount: number;
}

export interface UserStore {
  id: string;
  userId: string;
  storeId: string;
  role: string;
  store: Store;
  user?: { id: string; username: string; realName: string };
}

export const storeApi = {
  list: (params: { tenantId: string; keyword?: string; status?: string }) =>
    request.get<Store[]>('/store', { params }),

  get: (id: string) =>
    request.get<Store>(`/store/${id}`),

  getStats: (tenantId: string, id: string) =>
    request.get<StoreStats>(`/store/${id}/stats`, { params: { tenantId } }),

  create: (data: Partial<Store>) =>
    request.post<Store>('/store', data),

  update: (id: string, data: Partial<Store>) =>
    request.put<Store>(`/store/${id}`, data),

  remove: (id: string) =>
    request.delete(`/store/${id}`),

  // 用户归属
  assignUser: (data: { tenantId: string; userId: string; storeId: string; role?: string }) =>
    request.post<UserStore>('/store/assign', data),

  unassignUser: (params: { tenantId: string; userId: string; storeId: string }) =>
    request.delete('/store/unassign', { params }),

  getUserStores: (tenantId: string, userId: string) =>
    request.get<UserStore[]>(`/store/user/${userId}/stores`, { params: { tenantId } }),
};
