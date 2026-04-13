import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, PurchaseOrderQueryDto,
  CreatePurchaseStockInDto, PurchaseStockInQueryDto,
  CreatePurchaseReturnDto, PurchaseReturnQueryDto } from './dto/purchase.dto';

@Injectable()
export class PurchaseService {
  constructor(private prisma: PrismaService) {}

  // ========== 采购订单 ==========
  async createOrder(tenantId: string, dto: CreatePurchaseOrderDto) {
    const totalAmount = dto.items.reduce((sum, item) => sum + item.amount, 0);

    return this.prisma.purchaseOrder.create({
      data: {
        tenantId,
        orderNo: `PO${Date.now()}`,
        orderDate: new Date(dto.orderDate),
        supplierId: dto.supplierId,
        warehouseId: dto.warehouseId,
        contact: dto.contact,
        phone: dto.phone,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
        remark: dto.remark,
        totalAmount,
        items: {
          create: dto.items.map(item => ({
            tenantId,
            productId: item.productId,
            warehouseId: item.warehouseId || dto.warehouseId,
            quantity: item.quantity,
            price: item.price,
            amount: item.amount,
            taxRate: item.taxRate || 0,
            taxAmount: item.taxAmount || 0,
            remark: item.remark,
          })),
        },
      },
      include: { items: true, supplier: true, warehouse: true },
    });
  }

  async findOrders(tenantId: string, query: PurchaseOrderQueryDto) {
    const { keyword, supplierId, warehouseId, status, startDate, endDate, page = 1, pageSize = 20 } = query;

    const where: any = { tenantId };
    if (keyword) {
      where.OR = [{ orderNo: { contains: keyword } }];
    }
    if (supplierId) where.supplierId = supplierId;
    if (warehouseId) where.warehouseId = warehouseId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate);
      if (endDate) where.orderDate.lte = new Date(endDate);
    }

    const [list, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        include: { supplier: true, warehouse: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return { list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async findOrderById(tenantId: string, id: string) {
    return this.prisma.purchaseOrder.findFirst({
      where: { id, tenantId },
      include: { items: { include: { product: true } }, supplier: true, warehouse: true },
    });
  }

  async updateOrder(tenantId: string, id: string, dto: UpdatePurchaseOrderDto) {
    const order = await this.prisma.purchaseOrder.findFirst({ where: { id, tenantId } });
    if (!order) throw new BadRequestException('订单不存在');
    if (order.status !== 'pending') throw new BadRequestException('只能编辑待审核订单');

    const totalAmount = dto.items.reduce((sum, item) => sum + item.amount, 0);

    // 删除旧明细，创建新明细
    await this.prisma.purchaseOrderItem.deleteMany({ where: { orderId: id } });

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        orderDate: new Date(dto.orderDate),
        supplierId: dto.supplierId,
        warehouseId: dto.warehouseId,
        contact: dto.contact,
        phone: dto.phone,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
        remark: dto.remark,
        totalAmount,
        items: {
          create: dto.items.map(item => ({
            tenantId,
            productId: item.productId,
            warehouseId: item.warehouseId || dto.warehouseId,
            quantity: item.quantity,
            price: item.price,
            amount: item.amount,
            taxRate: item.taxRate || 0,
            taxAmount: item.taxAmount || 0,
          })),
        },
      },
      include: { items: true },
    });
  }

  async auditOrder(tenantId: string, id: string, userId: string) {
    const order = await this.prisma.purchaseOrder.findFirst({ where: { id, tenantId } });
    if (!order) throw new BadRequestException('订单不存在');
    if (order.status !== 'pending') throw new BadRequestException('只能审核待审核订单');

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'approved', auditedById: userId, auditedAt: new Date() },
    });
  }

  async cancelOrder(tenantId: string, id: string) {
    const order = await this.prisma.purchaseOrder.findFirst({ where: { id, tenantId } });
    if (!order) throw new BadRequestException('订单不存在');
    if (order.status === 'completed') throw new BadRequestException('已完成订单无法取消');

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }

  async deleteOrder(tenantId: string, id: string) {
    const order = await this.prisma.purchaseOrder.findFirst({ where: { id, tenantId } });
    if (!order) throw new BadRequestException('订单不存在');
    if (order.status !== 'pending' && order.status !== 'cancelled') {
      throw new BadRequestException('只能删除待审核或已取消订单');
    }

    await this.prisma.purchaseOrderItem.deleteMany({ where: { orderId: id } });
    await this.prisma.purchaseOrder.delete({ where: { id } });
  }

  // ========== 采购入库 ==========
  async createStockIn(tenantId: string, dto: CreatePurchaseStockInDto) {
    const totalAmount = dto.items.reduce((sum, item) => sum + item.amount, 0);

    const result = await this.prisma.$transaction(async (tx) => {
      const stockIn = await tx.purchaseStockIn.create({
        data: {
          tenantId,
          orderNo: `PSI${Date.now()}`,
          stockInDate: new Date(dto.stockInDate),
          supplierId: dto.supplierId,
          warehouseId: dto.warehouseId,
          remark: dto.remark,
          totalAmount,
          items: {
            create: dto.items.map(item => ({
              tenantId,
              productId: item.productId,
              purchaseOrderId: item.purchaseOrderId,
              purchaseOrderItemId: item.purchaseOrderItemId,
              quantity: item.quantity,
              price: item.price,
              amount: item.amount,
            })),
          },
        },
        include: { items: true },
      });

      // 更新库存
      for (const item of dto.items) {
        await tx.inventory.upsert({
          where: {
            tenantId_productId_warehouseId: {
              tenantId,
              productId: item.productId,
              warehouseId: dto.warehouseId,
            },
          },
          create: {
            tenantId,
            productId: item.productId,
            warehouseId: dto.warehouseId,
            quantity: item.quantity,
            avgCostPrice: item.price,
            lastInPrice: item.price,
          },
          update: {
            quantity: { increment: item.quantity },
            avgCostPrice: item.price, // 简化处理
            lastInPrice: item.price,
          },
        });

        // 库存变动日志
        await tx.inventoryLog.create({
          data: {
            tenantId,
            productId: item.productId,
            warehouseId: dto.warehouseId,
            businessType: 'purchase_in',
            businessId: stockIn.id,
            businessNo: stockIn.orderNo,
            quantity: item.quantity,
            beforeQuantity: 0, // 简化
            afterQuantity: item.quantity,
            price: item.price,
            amount: item.amount,
          },
        });
      }

      return stockIn;
    });

    return result;
  }

  async findStockIns(tenantId: string, query: PurchaseStockInQueryDto) {
    const { keyword, supplierId, warehouseId, status, startDate, endDate, page = 1, pageSize = 20 } = query;

    const where: any = { tenantId };
    if (keyword) where.OR = [{ orderNo: { contains: keyword } }];
    if (supplierId) where.supplierId = supplierId;
    if (warehouseId) where.warehouseId = warehouseId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.stockInDate = {};
      if (startDate) where.stockInDate.gte = new Date(startDate);
      if (endDate) where.stockInDate.lte = new Date(endDate);
    }

    const [list, total] = await Promise.all([
      this.prisma.purchaseStockIn.findMany({
        where,
        include: { supplier: true, warehouse: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.purchaseStockIn.count({ where }),
    ]);

    return { list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async findStockInById(tenantId: string, id: string) {
    return this.prisma.purchaseStockIn.findFirst({
      where: { id, tenantId },
      include: { items: { include: { product: true } }, supplier: true, warehouse: true },
    });
  }

  async auditStockIn(tenantId: string, id: string, userId: string) {
    const stockIn = await this.prisma.purchaseStockIn.findFirst({ where: { id, tenantId } });
    if (!stockIn) throw new BadRequestException('入库单不存在');
    if (stockIn.status !== 'pending') throw new BadRequestException('只能审核待审核入库单');

    return this.prisma.purchaseStockIn.update({
      where: { id },
      data: { status: 'approved', auditedById: userId, auditedAt: new Date() },
    });
  }

  // ========== 采购退货 ==========
  async createReturn(tenantId: string, dto: CreatePurchaseReturnDto) {
    const totalAmount = dto.items.reduce((sum, item) => sum + item.amount, 0);

    const result = await this.prisma.$transaction(async (tx) => {
      const returnOrder = await tx.purchaseStockIn.create({
        data: {
          tenantId,
          orderNo: `PR${Date.now()}`, // 后续优化为编号规则
          stockInDate: new Date(dto.returnDate),
          supplierId: dto.supplierId,
          warehouseId: dto.warehouseId,
          remark: dto.remark,
          totalAmount: -totalAmount,
          status: 'pending',
          items: {
            create: dto.items.map(item => ({
              tenantId,
              productId: item.productId,
              purchaseOrderId: item.purchaseOrderId,
              quantity: -item.quantity, // 负数表示退货
              price: item.price,
              amount: -item.amount,
            })),
          },
        },
        include: { items: true },
      });

      // 减少库存
      for (const item of dto.items) {
        await tx.inventory.update({
          where: {
            tenantId_productId_warehouseId: {
              tenantId,
              productId: item.productId,
              warehouseId: dto.warehouseId,
            },
          },
          data: { quantity: { decrement: item.quantity } },
        });

        await tx.inventoryLog.create({
          data: {
            tenantId,
            productId: item.productId,
            warehouseId: dto.warehouseId,
            businessType: 'purchase_return',
            businessId: returnOrder.id,
            businessNo: returnOrder.orderNo,
            quantity: -item.quantity,
            price: item.price,
            amount: -item.amount,
          },
        });
      }

      return returnOrder;
    });

    return result;
  }

  async findReturns(tenantId: string, query: PurchaseReturnQueryDto) {
    const { keyword, supplierId, status, page = 1, pageSize = 20 } = query;

    const where: any = {
      tenantId,
      totalAmount: { lt: 0 }, // 退货单金额为负
    };
    if (keyword) where.OR = [{ orderNo: { contains: keyword } }];
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;

    const [list, total] = await Promise.all([
      this.prisma.purchaseStockIn.findMany({
        where,
        include: { supplier: true, warehouse: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.purchaseStockIn.count({ where }),
    ]);

    return { list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async auditReturn(tenantId: string, id: string, userId: string) {
    const returnOrder = await this.prisma.purchaseStockIn.findFirst({ where: { id, tenantId } });
    if (!returnOrder) throw new BadRequestException('退货单不存在');
    if (returnOrder.status !== 'pending') throw new BadRequestException('只能审核待审核退货单');

    return this.prisma.purchaseStockIn.update({
      where: { id },
      data: { status: 'approved', auditedById: userId, auditedAt: new Date() },
    });
  }
}
