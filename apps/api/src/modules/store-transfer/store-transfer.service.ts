import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateStoreTransferDto, UpdateStoreTransferDto } from './dto/store-transfer.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class StoreTransferService {
  constructor(private prisma: PrismaService) {}

  private generateNo(): string {
    return `ST${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  }

  async create(tenantId: string, creatorId: string, dto: CreateStoreTransferDto) {
    if (dto.fromStoreId === dto.toStoreId) {
      throw new BadRequestException('调出门店和调入门店不能相同');
    }
    if (!dto.items?.length) {
      throw new BadRequestException('请至少添加一个调拨商品');
    }

    return this.prisma.storeTransfer.create({
      data: {
        tenantId,
        transferNo: this.generateNo(),
        fromStoreId: dto.fromStoreId,
        toStoreId: dto.toStoreId,
        status: 'pending',
        remark: dto.remark,
        creatorId,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            fromWarehouseId: item.fromWarehouseId,
            toWarehouseId: item.toWarehouseId,
            quantity: item.quantity,
            status: 'pending',
          })),
        },
      },
      include: {
        fromStore: true,
        toStore: true,
        items: true,
      },
    });
  }

  async findAll(tenantId: string, status?: string) {
    return this.prisma.storeTransfer.findMany({
      where: { tenantId, ...(status ? { status } : {}) },
      include: {
        fromStore: { select: { id: true, name: true } },
        toStore: { select: { id: true, name: true } },
        items: { include: { product: { select: { id: true, name: true, code: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const transfer = await this.prisma.storeTransfer.findUnique({
      where: { id },
      include: {
        fromStore: { include: { warehouses: true } },
        toStore: { include: { warehouses: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });
    if (!transfer) throw new NotFoundException('调拨单不存在');
    return transfer;
  }

  async update(id: string, dto: UpdateStoreTransferDto) {
    const transfer = await this.prisma.storeTransfer.findUnique({ where: { id } });
    if (!transfer) throw new NotFoundException('调拨单不存在');
    if (transfer.status !== 'pending' && dto.status === 'cancelled') {
      throw new BadRequestException('该单据无法取消');
    }

    return this.prisma.storeTransfer.update({
      where: { id },
      data: {
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.remark ? { remark: dto.remark } : {}),
      },
      include: {
        fromStore: true,
        toStore: true,
        items: true,
      },
    });
  }

  // 执行调拨：减少源门店库存，增加目标门店库存
  async execute(id: string) {
    const transfer = await this.prisma.storeTransfer.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!transfer) throw new NotFoundException('调拨单不存在');
    if (transfer.status !== 'pending') {
      throw new BadRequestException('该调拨单已执行或已取消');
    }

    // 执行调拨（事务）
    return this.prisma.$transaction(async (tx) => {
      // 更新调拨单状态
      await tx.storeTransfer.update({
        where: { id },
        data: { status: 'in_transit' },
      });

      // 对每个商品：
      // 1. 从源仓库扣库存（找默认仓库）
      // 2. 增加到目标仓库（找默认仓库）
      const fromWarehouse = await tx.warehouse.findFirst({
        where: { storeId: transfer.fromStoreId, status: 'active' },
      });
      const toWarehouse = await tx.warehouse.findFirst({
        where: { storeId: transfer.toStoreId, status: 'active' },
      });

      if (!fromWarehouse || !toWarehouse) {
        throw new BadRequestException('调出或调入门店的仓库未找到');
      }

      for (const item of transfer.items) {
        // 扣减源仓库
        const fromInv = await tx.inventory.findFirst({
          where: { tenantId: transfer.tenantId, warehouseId: fromWarehouse.id, productId: item.productId },
        });
        if (!fromInv || Number(fromInv.quantity) < item.quantity) {
          throw new BadRequestException(
            `商品 ${item.productId} 在源仓库库存不足，当前库存：${fromInv?.quantity || 0}`
          );
        }
        await tx.inventory.update({
          where: { id: fromInv.id },
          data: { quantity: { decrement: item.quantity } },
        });

        // 增加目标仓库
        const toInv = await tx.inventory.findFirst({
          where: { tenantId: transfer.tenantId, warehouseId: toWarehouse.id, productId: item.productId },
        });
        if (toInv) {
          await tx.inventory.update({
            where: { id: toInv.id },
            data: { quantity: { increment: item.quantity } },
          });
        } else {
          await tx.inventory.create({
            data: {
              tenantId: transfer.tenantId,
              warehouseId: toWarehouse.id,
              productId: item.productId,
              quantity: item.quantity,
            },
          });
        }

        // 更新调拨明细状态
        await tx.storeTransferItem.update({
          where: { id: item.id },
          data: { status: 'completed', fromWarehouseId: fromWarehouse.id, toWarehouseId: toWarehouse.id },
        });
      }

      return tx.storeTransfer.update({
        where: { id },
        data: { status: 'completed' },
        include: { items: true },
      });
    });
  }
}
