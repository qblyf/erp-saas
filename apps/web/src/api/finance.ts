import request from './request';

export interface Voucher {
  id: string;
  voucherNo: string;
  voucherDate: string;
  voucherType: string;
  totalDebit: number;
  totalCredit: number;
  status: string;
  remark?: string;
  items: VoucherItem[];
  createdAt: string;
}

export interface VoucherItem {
  id: string;
  accountId: string;
  account?: { id: string; code: string; name: string };
  direction: string;
  amount: number;
  summary?: string;
}

export interface Payment {
  id: string;
  paymentNo: string;
  paymentDate: string;
  paymentType: string;
  amount: number;
  accountId: string;
  account?: { id: string; name: string };
  customerId?: string;
  customer?: { id: string; name: string };
  supplierId?: string;
  supplier?: { id: string; name: string };
  status: string;
  remark?: string;
}

export interface AccountSubject {
  id: string;
  code: string;
  name: string;
  type?: string;
  direction?: string;
  parentId?: string;
  children?: AccountSubject[];
}

export const financeApi = {
  // 会计科目
  listSubjects: () => request.get<AccountSubject[]>('/finance/subjects'),
  createSubject: (data: any) => request.post<AccountSubject>('/finance/subjects', data),
  initSubjects: () => request.post('/finance/subjects/init', {}),

  // 凭证
  listVouchers: (params: any) =>
    request.get<{ list: Voucher[]; pagination: any }>('/finance/vouchers', { params }),
  getVoucher: (id: string) => request.get<Voucher>(`/finance/vouchers/${id}`),
  createVoucher: (data: any) => request.post<Voucher>('/finance/vouchers', data),
  auditVoucher: (id: string) => request.patch<Voucher>(`/finance/vouchers/${id}/audit`, {}),
  postVoucher: (id: string) => request.patch<Voucher>(`/finance/vouchers/${id}/post`, {}),
  deleteVoucher: (id: string) => request.delete<void>(`/finance/vouchers/${id}`),

  // 收付款
  listPayments: (params: any) =>
    request.get<{ list: Payment[]; pagination: any }>('/finance/payments', { params }),
  createPayment: (data: any) => request.post<Payment>('/finance/payments', data),
  auditPayment: (id: string) => request.patch<Payment>(`/finance/payments/${id}/audit`, {}),

  // 报表
  getProfitStatement: (startDate: string, endDate: string) =>
    request.get<any>('/finance/reports/profit', { params: { startDate, endDate } }),
};
