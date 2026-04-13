import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto } from './dto/customer.dto';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateCustomerDto) {
    const exists = await this.prisma.customer.findFirst({
      where: { tenantId, code: dto.code },
    });
    if (exists) {
      throw new BadRequestException('客户编码已存在');
    }

    return this.prisma.customer.create({
      data: { tenantId, ...dto },
    });
  }

  async findAll(tenantId: string, query: CustomerQueryDto) {
    const { keyword, customerType, status, page = 1, pageSize = 20 } = query;

    const where: any = { tenantId };
    if (keyword) {
      where.OR = [
        { code: { contains: keyword } },
        { name: { contains: keyword } },
        { contact: { contains: keyword } },
        { phone: { contains: keyword } },
      ];
    }
    if (customerType) where.customerType = customerType;
    if (status) where.status = status;

    const [list, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      list,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.customer.findFirst({ where: { id, tenantId } });
  }

  async update(tenantId: string, id: string, dto: UpdateCustomerDto) {
    const exists = await this.prisma.customer.findFirst({ where: { id, tenantId } });
    if (!exists) throw new BadRequestException('客户不存在');

    if (dto.code && dto.code !== exists.code) {
      const codeExists = await this.prisma.customer.findFirst({
        where: { tenantId, code: dto.code, id: { not: id } },
      });
      if (codeExists) throw new BadRequestException('客户编码已存在');
    }

    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.prisma.customer.delete({ where: { id, tenantId } });
  }

  async updateStatus(tenantId: string, id: string, status: string) {
    return this.prisma.customer.update({ where: { id, tenantId }, data: { status } });
  }
}
