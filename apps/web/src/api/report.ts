import request from './request';

// Dashboard 统计数据
export interface DashboardStats {
  todaySales: number;
  monthSales: number;
  todayPurchases: number;
  monthPurchases: number;
  inventoryCount: number;
  pendingSaleOrders: number;
  pendingPurchaseOrders: number;
  lowStockCount: number;
  customerCount: number;
  supplierCount: number;
  productCount: number;
}

// 销售汇总
export interface SalesSummary {
  totalAmount: number;
  totalOrders: number;
  totalQuantity: number;
}

// 商品销售排行
export interface ProductSalesRanking {
  productId: string;
  productName: string;
  quantity: number;
  amount: number;
}

export const reportApi = {
  // Dashboard 统计
  getDashboardStats: () => request.get<DashboardStats>('/report/dashboard'),

  // 销售汇总
  getSalesSummary: (params: { startDate: string; endDate: string }) =>
    request.get<SalesSummary>('/report/sales-summary', { params }),

  // 商品销售排行
  getProductSalesRanking: (params: { startDate: string; endDate: string }) =>
    request.get<ProductSalesRanking[]>('/report/sales-ranking', { params }),
};
