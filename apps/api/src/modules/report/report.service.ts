import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    const [
      todaySalesAgg, monthSalesAgg,
      todayPurchaseAgg, monthPurchaseAgg,
      inventoryCount,
      pendingSaleOrders,
      pendingPurchaseOrders,
      lowStockCount,
      customerCount,
      supplierCount,
      productCount,
    ] = await Promise.all([
      this.prisma.saleOrder.aggregate({
        where: { tenantId, status: 'completed', createdAt: { gte: today, lte: todayEnd } },
        _sum: { totalAmount: true },
      }),
      this.prisma.saleOrder.aggregate({
        where: { tenantId, status: 'completed', createdAt: { gte: monthStart, lte: monthEnd } },
        _sum: { totalAmount: true },
      }),
      this.prisma.purchaseOrder.aggregate({
        where: { tenantId, status: 'completed', createdAt: { gte: today, lte: todayEnd } },
        _sum: { totalAmount: true },
      }),
      this.prisma.purchaseOrder.aggregate({
        where: { tenantId, status: 'completed', createdAt: { gte: monthStart, lte: monthEnd } },
        _sum: { totalAmount: true },
      }),
      this.prisma.inventory.count({ where: { tenantId, quantity: { gt: 0 } } }),
      this.prisma.saleOrder.count({ where: { tenantId, status: 'pending' } }),
      this.prisma.purchaseOrder.count({ where: { tenantId, status: 'pending' } }),
      this.prisma.inventory.count({ where: { tenantId, quantity: { lte: 10 } } }),
      this.prisma.customer.count({ where: { tenantId } }),
      this.prisma.supplier.count({ where: { tenantId } }),
      this.prisma.product.count({ where: { tenantId } }),
    ]);

    return {
      todaySales: todaySalesAgg._sum.totalAmount || 0,
      monthSales: monthSalesAgg._sum.totalAmount || 0,
      todayPurchases: todayPurchaseAgg._sum.totalAmount || 0,
      monthPurchases: monthPurchaseAgg._sum.totalAmount || 0,
      inventoryCount,
      pendingSaleOrders,
      pendingPurchaseOrders,
      lowStockCount,
      customerCount,
      supplierCount,
      productCount,
    };
  }

  async getSalesSummary(tenantId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const orders = await this.prisma.saleOrder.findMany({
      where: {
        tenantId,
        status: 'completed',
        createdAt: { gte: start, lte: end },
      },
      include: { items: true },
    });

    const totalAmount = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const totalOrders = orders.length;
    const totalQuantity = orders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + Number(i.quantity), 0), 0
    );

    return { totalAmount, totalOrders, totalQuantity };
  }

  async getSalesRanking(tenantId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const orders = await this.prisma.saleOrder.findMany({
      where: {
        tenantId,
        status: 'completed',
        createdAt: { gte: start, lte: end },
      },
      include: { items: { include: { product: true } } },
    });

    // 按商品汇总
    const map = new Map<string, { productId: string; productName: string; quantity: number; amount: number }>();
    for (const order of orders) {
      for (const item of order.items) {
        const existing = map.get(item.productId);
        const qty = Number(item.quantity);
        const amt = Number(item.price) * qty;
        if (existing) {
          existing.quantity += qty;
          existing.amount += amt;
        } else {
          map.set(item.productId, {
            productId: item.productId,
            productName: item.product?.name || '-',
            quantity: qty,
            amount: amt,
          });
        }
      }
    }

    return Array.from(map.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 20);
  }
}
