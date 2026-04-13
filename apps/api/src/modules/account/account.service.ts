import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAccountDto, UpdateAccountDto, AccountQueryDto } from './dto/account.dto';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateAccountDto) {
    const exists = await this.prisma.account.findFirst({
      where: { tenantId, code: dto.code },
    });
    if (exists) throw new BadRequestException('账户编码已存在');

    // 如果是默认账户，先取消其他默认
    if (dto.isDefault) {
      await this.prisma.account.updateMany({
        where: { tenantId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.account.create({ data: { tenantId, ...dto } });
  }

  async findAll(tenantId: string, query: AccountQueryDto) {
    const { keyword, type, status, page = 1, pageSize = 20 } = query;

    const where: any = { tenantId };
    if (keyword) {
      where.OR = [{ code: { contains: keyword } }, { name: { contains: keyword } }];
    }
    if (type) where.type = type;
    if (status) where.status = status;

    const [list, total] = await Promise.all([
      this.prisma.account.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.account.count({ where }),
    ]);

    return { list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.account.findFirst({ where: { id, tenantId } });
  }

  async findAllSimple(tenantId: string) {
    return this.prisma.account.findMany({
      where: { tenantId, status: 'active' },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateAccountDto) {
    const exists = await this.prisma.account.findFirst({ where: { id, tenantId } });
    if (!exists) throw new BadRequestException('账户不存在');

    if (dto.code && dto.code !== exists.code) {
      const codeExists = await this.prisma.account.findFirst({
        where: { tenantId, code: dto.code, id: { not: id } },
      });
      if (codeExists) throw new BadRequestException('账户编码已存在');
    }

    // 如果设置为默认，先取消其他默认
    if (dto.isDefault) {
      await this.prisma.account.updateMany({
        where: { tenantId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.account.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.prisma.account.delete({ where: { id, tenantId } });
  }

  async updateStatus(tenantId: string, id: string, status: string) {
    return this.prisma.account.update({ where: { id, tenantId }, data: { status } });
  }
}
