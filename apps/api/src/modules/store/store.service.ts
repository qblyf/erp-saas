import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateStoreDto, UpdateStoreDto, AssignUserStoreDto } from './dto/store.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateStoreDto) {
    // 检查编码唯一性
    const exists = await this.prisma.store.findUnique({
      where: { tenantId_code: { tenantId, code: dto.code } },
    });
    if (exists) throw new BadRequestException('门店编码已存在');

    return this.prisma.store.create({
      data: { tenantId, ...dto },
      include: { warehouses: true },
    });
  }

  async findAll(tenantId: string, keyword?: string, status?: string) {
    return this.prisma.store.findMany({
      where: {
        tenantId,
        ...(keyword ? { OR: [
          { name: { contains: keyword } },
          { code: { contains: keyword } },
        ]} : {}),
        ...(status ? { status } : {}),
      },
      include: {
        warehouses: true,
        _count: { select: { userStores: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        warehouses: true,
        userStores: { include: { user: { select: { id: true, username: true, realName: true } } } },
      },
    });
    if (!store) throw new NotFoundException('门店不存在');
    return store;
  }

  async update(id: string, dto: UpdateStoreDto) {
    const store = await this.prisma.store.findUnique({ where: { id } });
    if (!store) throw new NotFoundException('门店不存在');
    return this.prisma.store.update({
      where: { id },
      data: dto,
      include: { warehouses: true },
    });
  }

  async remove(id: string) {
    const store = await this.prisma.store.findUnique({ where: { id } });
    if (!store) throw new NotFoundException('门店不存在');

    // 检查是否有仓库归属
    const warehouseCount = await this.prisma.warehouse.count({ where: { storeId: id } });
    if (warehouseCount > 0) {
      throw new BadRequestException(`该门店下有 ${warehouseCount} 个仓库，请先删除或转移仓库`);
    }

    return this.prisma.store.delete({ where: { id } });
  }

  // === 用户归属门店 ===
  async assignUser(tenantId: string, dto: AssignUserStoreDto) {
    // 验证门店属于该租户
    const store = await this.prisma.store.findFirst({
      where: { id: dto.storeId, tenantId },
    });
    if (!store) throw new NotFoundException('门店不存在');

    // 检查用户属于该租户
    const user = await this.prisma.user.findFirst({
      where: { id: dto.userId, tenantId },
    });
    if (!user) throw new NotFoundException('用户不存在');

    return this.prisma.userStore.upsert({
      where: { userId_storeId: { userId: dto.userId, storeId: dto.storeId } },
      create: { userId: dto.userId, storeId: dto.storeId, role: dto.role || 'staff' },
      update: { role: dto.role || 'staff' },
      include: { store: true, user: { select: { id: true, username: true, realName: true } } },
    });
  }

  async unassignUser(tenantId: string, userId: string, storeId: string) {
    // 验证门店属于该租户
    const store = await this.prisma.store.findFirst({ where: { id: storeId, tenantId } });
    if (!store) throw new NotFoundException('门店不存在');

    return this.prisma.userStore.deleteMany({
      where: { userId, storeId },
    });
  }

  async getUserStores(tenantId: string, userId: string) {
    return this.prisma.userStore.findMany({
      where: { userId },
      include: {
        store: {
          include: { warehouses: { where: { status: 'active' } } },
        },
      },
    });
  }

  // 获取门店统计数据
  async getStoreStats(tenantId: string, storeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // 获取该门店的所有仓库ID
    const warehouses = await this.prisma.warehouse.findMany({
      where: { storeId },
      select: { id: true },
    });
    const warehouseIds = warehouses.map((w) => w.id);

    const [todaySales, monthSales, inventoryCount, staffCount] = await Promise.all([
      // 今日销售额（通过仓库ID过滤）
      warehouseIds.length > 0
        ? this.prisma.saleOrder.aggregate({
            where: { tenantId, status: 'completed', warehouseId: { in: warehouseIds }, createdAt: { gte: today } },
            _sum: { totalAmount: true },
          })
        : Promise.resolve({ _sum: { totalAmount: null } }),
      // 本月销售额
      warehouseIds.length > 0
        ? this.prisma.saleOrder.aggregate({
            where: { tenantId, status: 'completed', warehouseId: { in: warehouseIds }, createdAt: { gte: monthStart } },
            _sum: { totalAmount: true },
          })
        : Promise.resolve({ _sum: { totalAmount: null } }),
      // 库存商品数
      this.prisma.inventory.count({
        where: { tenantId, warehouse: { storeId }, quantity: { gt: 0 } },
      }),
      // 店员数
      this.prisma.userStore.count({ where: { storeId } }),
    ]);

    return {
      todaySales: Number(todaySales._sum.totalAmount) || 0,
      monthSales: Number(monthSales._sum.totalAmount) || 0,
      inventoryCount,
      staffCount,
    };
  }
}
