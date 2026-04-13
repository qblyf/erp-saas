import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class FinanceStatisticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    const [
      todaySales, monthSales,
      todayPurchases, monthPurchases,
      inventoryCount,
      pendingOrders,
      customers,
      suppliers,
    ] = await Promise.all([
      // 今日销售额
      this.prisma.saleOrder.aggregate({
        where: { tenantId, status: 'completed', createdAt: { gte: today, lte: todayEnd } },
        _sum: { totalAmount: true },
      }),
      // 本月销售额
      this.prisma.saleOrder.aggregate({
        where: { tenantId, status: 'completed', createdAt: { gte: monthStart, lte: monthEnd } },
        _sum: { totalAmount: true },
      }),
      // 今日采购额
      this.prisma.purchaseOrder.aggregate({
        where: { tenantId, status: 'completed', createdAt: { gte: today, lte: todayEnd } },
        _sum: { totalAmount: true },
      }),
      // 本月采购额
      this.prisma.purchaseOrder.aggregate({
        where: { tenantId, status: 'completed', createdAt: { gte: monthStart, lte: monthEnd } },
        _sum: { totalAmount: true },
      }),
      // 商品库存总数
      this.prisma.inventory.count({ where: { tenantId, quantity: { gt: 0 } } }),
      // 待处理订单数
      this.prisma.saleOrder.count({ where: { tenantId, status: 'pending' } }),
      // 客户总数
      this.prisma.customer.count({ where: { tenantId } }),
      // 供应商总数
      this.prisma.supplier.count({ where: { tenantId } }),
    ]);

    return {
      todaySales: todaySales._sum.totalAmount || 0,
      monthSales: monthSales._sum.totalAmount || 0,
      todayPurchases: todayPurchases._sum.totalAmount || 0,
      monthPurchases: monthPurchases._sum.totalAmount || 0,
      inventoryCount,
      pendingOrders,
      customers,
      suppliers,
    };
  }
}
