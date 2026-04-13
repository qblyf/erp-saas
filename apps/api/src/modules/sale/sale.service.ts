import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSaleOrderDto, UpdateSaleOrderDto, SaleOrderQueryDto,
  CreateSaleStockOutDto, SaleStockOutQueryDto,
  CreateSaleReturnDto, SaleReturnQueryDto } from './dto/sale.dto';

@Injectable()
export class SaleService {
  constructor(private prisma: PrismaService) {}

  // ========== 销售订单 ==========
  async createOrder(tenantId: string, dto: CreateSaleOrderDto) {
    const totalAmount = dto.items.reduce((sum, item) => sum + item.amount, 0);

    return this.prisma.saleOrder.create({
      data: {
        tenantId,
        orderNo: `SO${Date.now()}`,
        orderDate: new Date(dto.orderDate),
        customerId: dto.customerId,
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
      include: { items: true, customer: true, warehouse: true },
    });
  }

  async findOrders(tenantId: string, query: SaleOrderQueryDto) {
    const { keyword, customerId, warehouseId, status, startDate, endDate, page = 1, pageSize = 20 } = query;

    const where: any = { tenantId };
    if (keyword) where.OR = [{ orderNo: { contains: keyword } }];
    if (customerId) where.customerId = customerId;
    if (warehouseId) where.warehouseId = warehouseId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate);
      if (endDate) where.orderDate.lte = new Date(endDate);
    }

    const [list, total] = await Promise.all([
      this.prisma.saleOrder.findMany({
        where,
        include: { customer: true, warehouse: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.saleOrder.count({ where }),
    ]);

    return { list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async findOrderById(tenantId: string, id: string) {
    return this.prisma.saleOrder.findFirst({
      where: { id, tenantId },
      include: { items: { include: { product: true } }, customer: true, warehouse: true },
    });
  }

  async updateOrder(tenantId: string, id: string, dto: UpdateSaleOrderDto) {
    const order = await this.prisma.saleOrder.findFirst({ where: { id, tenantId } });
    if (!order) throw new BadRequestException('订单不存在');
    if (order.status !== 'pending') throw new BadRequestException('只能编辑待审核订单');

    const totalAmount = dto.items.reduce((sum, item) => sum + item.amount, 0);

    await this.prisma.saleOrderItem.deleteMany({ where: { orderId: id } });

    return this.prisma.saleOrder.update({
      where: { id },
      data: {
        orderDate: new Date(dto.orderDate),
        customerId: dto.customerId,
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
    const order = await this.prisma.saleOrder.findFirst({ where: { id, tenantId } });
    if (!order) throw new BadRequestException('订单不存在');
    if (order.status !== 'pending') throw new BadRequestException('只能审核待审核订单');

    return this.prisma.saleOrder.update({
      where: { id },
      data: { status: 'approved', auditedById: userId, auditedAt: new Date() },
    });
  }

  async cancelOrder(tenantId: string, id: string) {
    const order = await this.prisma.saleOrder.findFirst({ where: { id, tenantId } });
    if (!order) throw new BadRequestException('订单不存在');
    if (order.status === 'completed') throw new BadRequestException('已完成订单无法取消');

    return this.prisma.saleOrder.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }

  async deleteOrder(tenantId: string, id: string) {
    const order = await this.prisma.saleOrder.findFirst({ where: { id, tenantId } });
    if (!order) throw new BadRequestException('订单不存在');
    if (order.status !== 'pending' && order.status !== 'cancelled') {
      throw new BadRequestException('只能删除待审核或已取消订单');
    }

    await this.prisma.saleOrderItem.deleteMany({ where: { orderId: id } });
    await this.prisma.saleOrder.delete({ where: { id } });
  }

  // ========== 销售出库 ==========
  async createStockOut(tenantId: string, dto: CreateSaleStockOutDto) {
    const totalAmount = dto.items.reduce((sum, item) => sum + item.amount, 0);

    const result = await this.prisma.$transaction(async (tx) => {
      const stockOut = await tx.saleStockOut.create({
        data: {
          tenantId,
          orderNo: `SSO${Date.now()}`,
          stockOutDate: new Date(dto.stockOutDate),
          customerId: dto.customerId,
          warehouseId: dto.warehouseId,
          remark: dto.remark,
          totalAmount,
          items: {
            create: dto.items.map(item => ({
              tenantId,
              productId: item.productId,
              saleOrderId: item.saleOrderId,
              saleOrderItemId: item.saleOrderItemId,
              quantity: item.quantity,
              price: item.price,
              amount: item.amount,
            })),
          },
        },
        include: { items: true },
      });

      // 更新库存（减少）
      for (const item of dto.items) {
        const inv = await tx.inventory.findFirst({
          where: {
            tenantId,
            productId: item.productId,
            warehouseId: dto.warehouseId,
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
            businessType: 'sale_out',
            businessId: stockOut.id,
            businessNo: stockOut.orderNo,
            quantity: -item.quantity,
            beforeQuantity: inv.quantity,
            afterQuantity: Number(inv.quantity) - Number(item.quantity),
            price: item.price,
            amount: item.amount,
          },
        });
      }

      return stockOut;
    });

    return result;
  }

  async findStockOuts(tenantId: string, query: SaleStockOutQueryDto) {
    const { keyword, customerId, warehouseId, status, startDate, endDate, page = 1, pageSize = 20 } = query;

    const where: any = { tenantId };
    if (keyword) where.OR = [{ orderNo: { contains: keyword } }];
    if (customerId) where.customerId = customerId;
    if (warehouseId) where.warehouseId = warehouseId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.stockOutDate = {};
      if (startDate) where.stockOutDate.gte = new Date(startDate);
      if (endDate) where.stockOutDate.lte = new Date(endDate);
    }

    const [list, total] = await Promise.all([
      this.prisma.saleStockOut.findMany({
        where,
        include: { customer: true, warehouse: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.saleStockOut.count({ where }),
    ]);

    return { list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async findStockOutById(tenantId: string, id: string) {
    return this.prisma.saleStockOut.findFirst({
      where: { id, tenantId },
      include: { items: { include: { product: true } }, customer: true, warehouse: true },
    });
  }

  async auditStockOut(tenantId: string, id: string, userId: string) {
    const stockOut = await this.prisma.saleStockOut.findFirst({ where: { id, tenantId } });
    if (!stockOut) throw new BadRequestException('出库单不存在');
    if (stockOut.status !== 'pending') throw new BadRequestException('只能审核待审核出库单');

    return this.prisma.saleStockOut.update({
      where: { id },
      data: { status: 'approved', auditedById: userId, auditedAt: new Date() },
    });
  }

  // ========== 销售退货 ==========
  async createReturn(tenantId: string, dto: CreateSaleReturnDto) {
    const totalAmount = dto.items.reduce((sum, item) => sum + item.amount, 0);

    const result = await this.prisma.$transaction(async (tx) => {
      const returnOrder = await tx.saleStockOut.create({
        data: {
          tenantId,
          orderNo: `SR${Date.now()}`,
          stockOutDate: new Date(dto.returnDate),
          customerId: dto.customerId,
          warehouseId: dto.warehouseId,
          remark: dto.remark,
          totalAmount: -totalAmount,
          status: 'pending',
          items: {
            create: dto.items.map(item => ({
              tenantId,
              productId: item.productId,
              saleOrderId: item.saleOrderId,
              quantity: -item.quantity,
              price: item.price,
              amount: -item.amount,
            })),
          },
        },
        include: { items: true },
      });

      // 增加库存
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
            lastOutPrice: item.price,
          },
          update: {
            quantity: { increment: item.quantity },
            lastOutPrice: item.price,
          },
        });

        await tx.inventoryLog.create({
          data: {
            tenantId,
            productId: item.productId,
            warehouseId: dto.warehouseId,
            businessType: 'sale_return',
            businessId: returnOrder.id,
            businessNo: returnOrder.orderNo,
            quantity: item.quantity,
            price: item.price,
            amount: item.amount,
          },
        });
      }

      return returnOrder;
    });

    return result;
  }

  async findReturns(tenantId: string, query: SaleReturnQueryDto) {
    const { keyword, customerId, status, page = 1, pageSize = 20 } = query;

    const where: any = {
      tenantId,
      totalAmount: { lt: 0 },
    };
    if (keyword) where.OR = [{ orderNo: { contains: keyword } }];
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    const [list, total] = await Promise.all([
      this.prisma.saleStockOut.findMany({
        where,
        include: { customer: true, warehouse: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.saleStockOut.count({ where }),
    ]);

    return { list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async auditReturn(tenantId: string, id: string, userId: string) {
    const returnOrder = await this.prisma.saleStockOut.findFirst({ where: { id, tenantId } });
    if (!returnOrder) throw new BadRequestException('退货单不存在');
    if (returnOrder.status !== 'pending') throw new BadRequestException('只能审核待审核退货单');

    return this.prisma.saleStockOut.update({
      where: { id },
      data: { status: 'approved', auditedById: userId, auditedAt: new Date() },
    });
  }
}
