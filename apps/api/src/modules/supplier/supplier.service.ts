import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSupplierDto, UpdateSupplierDto, SupplierQueryDto } from './dto/supplier.dto';

@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateSupplierDto) {
    const exists = await this.prisma.supplier.findFirst({
      where: { tenantId, code: dto.code },
    });
    if (exists) throw new BadRequestException('供应商编码已存在');

    return this.prisma.supplier.create({ data: { tenantId, ...dto } });
  }

  async findAll(tenantId: string, query: SupplierQueryDto) {
    const { keyword, status, page = 1, pageSize = 20 } = query;

    const where: any = { tenantId };
    if (keyword) {
      where.OR = [
        { code: { contains: keyword } },
        { name: { contains: keyword } },
        { contact: { contains: keyword } },
      ];
    }
    if (status) where.status = status;

    const [list, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return { list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.supplier.findFirst({ where: { id, tenantId } });
  }

  async update(tenantId: string, id: string, dto: UpdateSupplierDto) {
    const exists = await this.prisma.supplier.findFirst({ where: { id, tenantId } });
    if (!exists) throw new BadRequestException('供应商不存在');

    if (dto.code && dto.code !== exists.code) {
      const codeExists = await this.prisma.supplier.findFirst({
        where: { tenantId, code: dto.code, id: { not: id } },
      });
      if (codeExists) throw new BadRequestException('供应商编码已存在');
    }

    return this.prisma.supplier.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.prisma.supplier.delete({ where: { id, tenantId } });
  }

  async updateStatus(tenantId: string, id: string, status: string) {
    return this.prisma.supplier.update({ where: { id, tenantId }, data: { status } });
  }
}
