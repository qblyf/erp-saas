import { api } from './request';
import type { DashboardStats } from '@/types/models';

export const reportApi = {
  getDashboard: () =>
    api.get<DashboardStats>('/report/dashboard'),
};
