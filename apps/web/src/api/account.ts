import request from './request';

export interface Account {
  id: string;
  code: string;
  name: string;
  type?: string;
  bankName?: string;
  bankAccount?: string;
  initialBalance: number;
  currentBalance: number;
  status: string;
  isDefault: boolean;
  sortOrder: number;
}

export interface AccountQuery {
  keyword?: string;
  type?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export const accountApi = {
  list: (params: AccountQuery) =>
    request.get<{ list: Account[]; pagination: any }>('/accounts', { params }),

  listSimple: () =>
    request.get<Account[]>('/accounts/simple'),

  get: (id: string) =>
    request.get<Account>(`/accounts/${id}`),

  create: (data: Partial<Account>) =>
    request.post<Account>('/accounts', data),

  update: (id: string, data: Partial<Account>) =>
    request.put<Account>(`/accounts/${id}`, data),

  delete: (id: string) =>
    request.delete<void>(`/accounts/${id}`),

  updateStatus: (id: string, status: string) =>
    request.patch<void>(`/accounts/${id}/status`, { status }),
};
