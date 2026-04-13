import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWarehouseDto, UpdateWarehouseDto, WarehouseQueryDto } from './dto/warehouse.dto';

@Injectable()
export class WarehouseService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateWarehouseDto) {
    // 检查编码唯一性
    const exists = await this.prisma.warehouse.findFirst({
      where: { tenantId, code: dto.code },
    });
    if (exists) {
      throw new BadRequestException('仓库编码已存在');
    }

    return this.prisma.warehouse.create({
      data: {
        tenantId,
        ...dto,
      },
    });
  }

  async findAll(tenantId: string, query: WarehouseQueryDto) {
    const { keyword, status, page = 1, pageSize = 20 } = query;

    const where: any = { tenantId };
    if (keyword) {
      where.OR = [
        { code: { contains: keyword } },
        { name: { contains: keyword } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const [list, total] = await Promise.all([
      this.prisma.warehouse.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.warehouse.count({ where }),
    ]);

    return {
      list,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.warehouse.findFirst({
      where: { id, tenantId },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateWarehouseDto) {
    const exists = await this.prisma.warehouse.findFirst({
      where: { id, tenantId },
    });
    if (!exists) {
      throw new BadRequestException('仓库不存在');
    }

    // 检查编码唯一性（排除自己）
    if (dto.code && dto.code !== exists.code) {
      const codeExists = await this.prisma.warehouse.findFirst({
        where: { tenantId, code: dto.code, id: { not: id } },
      });
      if (codeExists) {
        throw new BadRequestException('仓库编码已存在');
      }
    }

    return this.prisma.warehouse.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.prisma.warehouse.delete({
      where: { id, tenantId },
    });
  }

  async updateStatus(tenantId: string, id: string, status: string) {
    return this.prisma.warehouse.update({
      where: { id, tenantId },
      data: { status },
    });
  }
}
