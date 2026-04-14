import { api } from './request';
import type { Payment, Voucher, PaginatedResponse } from '@/types/models';

export interface PaymentQuery {
  page?: number;
  pageSize?: number;
  status?: string;
  paymentType?: string;
  customerId?: string;
  supplierId?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
}

export interface VoucherQuery {
  page?: number;
  pageSize?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreatePaymentData {
  paymentType: 'receive' | 'pay';
  amount: number;
  accountId: string;
  customerId?: string;
  supplierId?: string;
  relateBusinessType?: string;
  relateBusinessId?: string;
  relateBusinessNo?: string;
  paymentDate: string;
  remark?: string;
}

export const financeApi = {
  // Payments
  getPayments: (params?: PaymentQuery) =>
    api.get<PaginatedResponse<Payment>>('/payments', { params }),

  getPayment: (id: string) =>
    api.get<Payment>(`/payments/${id}`),

  createPayment: (data: CreatePaymentData) =>
    api.post<Payment>('/payments', data),

  auditPayment: (id: string) =>
    api.post<Payment>(`/payments/${id}/audit`),

  cancelPayment: (id: string, reason?: string) =>
    api.post<Payment>(`/payments/${id}/cancel`, { reason }),

  // Vouchers
  getVouchers: (params?: VoucherQuery) =>
    api.get<PaginatedResponse<Voucher>>('/vouchers', { params }),

  getVoucher: (id: string) =>
    api.get<Voucher>(`/vouchers/${id}`),
};
