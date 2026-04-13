import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStockCheckDto, StockCheckQueryDto,
  CreateStockTransferDto, StockTransferQueryDto,
  InventoryQueryDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // ========== 库存查询 ==========
  async findInventories(tenantId: string, query: InventoryQueryDto) {
    const { keyword, productId, warehouseId, stockStatus, page = 1, pageSize = 20 } = query;

    const where: any = { tenantId };
    if (productId) where.productId = productId;
    if (warehouseId) where.warehouseId = warehouseId;

    // 子查询来筛选库存状态
    if (stockStatus === 'low') {
      where.quantity = { gt: 0, lte: 100 }; // 简化：低于某值
    } else if (stockStatus === 'over') {
      where.quantity = { gt: 1000 }; // 简化：超过某值
    } else if (stockStatus === 'zero') {
      where.quantity = 0;
    }

    if (keyword) {
      where.product = {
        OR: [
          { name: { contains: keyword } },
          { code: { contains: keyword } },
        ],
      };
    }

    const [list, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where,
        include: { product: true, warehouse: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.inventory.count({ where }),
    ]);

    return { list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async getInventorySummary(tenantId: string) {
    const [totalProductTypes, totalQuantity, lowStockCount, overStockCount] = await Promise.all([
      this.prisma.inventory.count({ where: { tenantId, quantity: { gt: 0 } } }),
      this.prisma.inventory.aggregate({ where: { tenantId }, _sum: { quantity: true } }),
      this.prisma.inventory.count({ where: { tenantId, quantity: { gt: 0, lte: 100 } } }),
      this.prisma.inventory.count({ where: { tenantId, quantity: { gt: 1000 } } }),
    ]);

    return {
      totalProductTypes,
      totalQuantity: totalQuantity._sum.quantity || 0,
      lowStockCount,
      overStockCount,
    };
  }

  // ========== 库存预警 ==========
  async getWarnings(tenantId: string) {
    const products = await this.prisma.product.findMany({
      where: { tenantId, status: 'active' },
      include: { category: true },
    });

    const warnings: any[] = [];
    for (const product of products) {
      const inventories = await this.prisma.inventory.findMany({
        where: { tenantId, productId: product.id },
      });

      const totalQty = inventories.reduce((sum, inv) => sum + Number(inv.quantity || 0), 0);

      if (product.minStock && totalQty < product.minStock) {
        warnings.push({ product, type: 'low', message: '库存不足' });
      }
      if (product.maxStock && totalQty > product.maxStock) {
        warnings.push({ product, type: 'over', message: '超储' });
      }
    }

    return warnings.slice(0, 10);
  }

  // ========== 库存盘点 ==========
  async createStockCheck(tenantId: string, dto: CreateStockCheckDto) {
    const totalDiffAmount = dto.items.reduce((sum, item) => sum + (item.diffAmount || 0), 0);

    return this.prisma.$transaction(async (tx) => {
      const check = await tx.stockCheck.create({
        data: {
          tenantId,
          orderNo: `SC${Date.now()}`,
          checkDate: new Date(dto.checkDate),
          warehouseId: dto.warehouseId,
          remark: dto.remark,
          totalAmount: totalDiffAmount,
          items: {
            create: dto.items.map(item => ({
              tenantId,
              productId: item.productId,
              bookQuantity: item.bookQuantity,
              checkQuantity: item.checkQuantity,
              diffQuantity: item.diffQuantity,
              costPrice: item.costPrice || 0,
              diffAmount: item.diffAmount || 0,
              reason: item.reason,
            })),
          },
        },
        include: { items: true },
      });

      return check;
    });
  }

  async findStockChecks(tenantId: string, query: StockCheckQueryDto) {
    const { keyword, warehouseId, status, page = 1, pageSize = 20 } = query;

    const where: any = { tenantId };
    if (keyword) where.OR = [{ orderNo: { contains: keyword } }];
    if (warehouseId) where.warehouseId = warehouseId;
    if (status) where.status = status;

    const [list, total] = await Promise.all([
      this.prisma.stockCheck.findMany({
        where,
        include: { warehouse: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stockCheck.count({ where }),
    ]);

    return { list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async findStockCheckById(tenantId: string, id: string) {
    return this.prisma.stockCheck.findFirst({
      where: { id, tenantId },
      include: { items: { include: { product: true } }, warehouse: true },
    });
  }

  async auditStockCheck(tenantId: string, id: string, userId: string) {
    const check = await this.prisma.stockCheck.findFirst({ where: { id, tenantId } });
    if (!check) throw new BadRequestException('盘点单不存在');
    if (check.status !== 'pending') throw new BadRequestException('只能审核待审核盘点单');

    return this.prisma.stockCheck.update({
      where: { id },
      data: { status: 'approved', auditedById: userId, auditedAt: new Date() },
    });
  }

  async approveStockCheck(tenantId: string, id: string, userId: string) {
    const check = await this.prisma.stockCheck.findFirst({
      where: { id, tenantId },
      include: { items: true },
    });
    if (!check) throw new BadRequestException('盘点单不存在');
    if (check.status !== 'approved') throw new BadRequestException('只能确认已审核的盘点单');

    return this.prisma.$transaction(async (tx) => {
      // 更新库存
      for (const item of check.items) {
        await tx.inventory.update({
          where: {
            tenantId_productId_warehouseId: {
              tenantId,
              productId: item.productId,
              warehouseId: check.warehouseId,
            },
          },
          data: { quantity: item.checkQuantity },
        });

        // 记录库存变动
        await tx.inventoryLog.create({
          data: {
            tenantId,
            productId: item.productId,
            warehouseId: check.warehouseId,
            businessType: 'stock_check',
            businessId: check.id,
            businessNo: check.orderNo,
            quantity: item.diffQuantity,
            beforeQuantity: item.bookQuantity,
            afterQuantity: item.checkQuantity,
            price: item.costPrice,
            amount: item.diffAmount,
            remark: item.reason,
          },
        });
      }

      return tx.stockCheck.update({
        where: { id },
        data: { status: 'completed' },
      });
    });
  }

  // ========== 库存调拨 ==========
  async createStockTransfer(tenantId: string, dto: CreateStockTransferDto) {
    const totalAmount = dto.items.reduce((sum, item) => sum + (item.amount || 0), 0);

    return this.prisma.$transaction(async (tx) => {
      const transfer = await tx.stockTransfer.create({
        data: {
          tenantId,
          orderNo: `ST${Date.now()}`,
          transferDate: new Date(dto.transferDate),
          fromWarehouseId: dto.fromWarehouseId,
          toWarehouseId: dto.toWarehouseId,
          remark: dto.remark,
          totalAmount,
          items: {
            create: dto.items.map(item => ({
              tenantId,
              productId: item.productId,
              quantity: item.quantity,
              costPrice: item.costPrice || 0,
              amount: item.amount || 0,
            })),
          },
        },
        include: { items: true },
      });

      // 出库仓库减少
      for (const item of dto.items) {
        const inv = await tx.inventory.findFirst({
          where: {
            tenantId,
            productId: item.productId,
            warehouseId: dto.fromWarehouseId,
          },
        });

        if (!inv || Number(inv.quantity) < Number(item.quantity)) {
          throw new BadRequestException(`商品库存不足`);
        }

        await tx.inventory.update({
          where: {
            tenantId_productId_warehouseId: {
              tenantId,
              productId: item.productId,
              warehouseId: dto.fromWarehouseId,
            },
          },
          data: { quantity: { decrement: item.quantity } },
        });

        await tx.inventoryLog.create({
          data: {
            tenantId,
            productId: item.productId,
            warehouseId: dto.fromWarehouseId,
            businessType: 'transfer_out',
            businessId: transfer.id,
            businessNo: transfer.orderNo,
            quantity: -item.quantity,
            beforeQuantity: inv.quantity,
            afterQuantity: Number(inv.quantity) - Number(item.quantity),
            price: item.costPrice,
            amount: item.amount,
          },
        });
      }

      // 入库仓库增加
      for (const item of dto.items) {
        await tx.inventory.upsert({
          where: {
            tenantId_productId_warehouseId: {
              tenantId,
              productId: item.productId,
              warehouseId: dto.toWarehouseId,
            },
          },
          create: {
            tenantId,
            productId: item.productId,
            warehouseId: dto.toWarehouseId,
            quantity: item.quantity,
            avgCostPrice: item.costPrice || 0,
          },
          update: {
            quantity: { increment: item.quantity },
          },
        });

        const inv = await tx.inventory.findFirst({
          where: {
            tenantId,
            productId: item.productId,
            warehouseId: dto.toWarehouseId,
          },
        });

        await tx.inventoryLog.create({
          data: {
            tenantId,
            productId: item.productId,
            warehouseId: dto.toWarehouseId,
            businessType: 'transfer_in',
            businessId: transfer.id,
            businessNo: transfer.orderNo,
            quantity: item.quantity,
            beforeQuantity: Number(inv?.quantity || 0) - Number(item.quantity),
            afterQuantity: inv?.quantity ? Number(inv.quantity) + Number(item.quantity) : item.quantity,
            price: item.costPrice,
            amount: item.amount,
          },
        });
      }

      return transfer;
    });
  }

  async findStockTransfers(tenantId: string, query: StockTransferQueryDto) {
    const { keyword, fromWarehouseId, toWarehouseId, status, page = 1, pageSize = 20 } = query;

    const where: any = { tenantId };
    if (keyword) where.OR = [{ orderNo: { contains: keyword } }];
    if (fromWarehouseId) where.fromWarehouseId = fromWarehouseId;
    if (toWarehouseId) where.toWarehouseId = toWarehouseId;
    if (status) where.status = status;

    const [list, total] = await Promise.all([
      this.prisma.stockTransfer.findMany({
        where,
        include: { fromWarehouse: true, toWarehouse: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stockTransfer.count({ where }),
    ]);

    return { list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async findStockTransferById(tenantId: string, id: string) {
    return this.prisma.stockTransfer.findFirst({
      where: { id, tenantId },
      include: { items: { include: { product: true } }, fromWarehouse: true, toWarehouse: true },
    });
  }

  async auditStockTransfer(tenantId: string, id: string, userId: string) {
    const transfer = await this.prisma.stockTransfer.findFirst({ where: { id, tenantId } });
    if (!transfer) throw new BadRequestException('调拨单不存在');
    if (transfer.status !== 'pending') throw new BadRequestException('只能审核待审核调拨单');

    return this.prisma.stockTransfer.update({
      where: { id },
      data: { status: 'approved', auditedById: userId, auditedAt: new Date() },
    });
  }
}
