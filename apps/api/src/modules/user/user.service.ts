import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateUserDto) {
    const exist = await this.prisma.user.findUnique({
      where: { tenantId_username: { tenantId, username: dto.username } },
    });
    if (exist) throw new BadRequestException('用户名已存在');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        tenantId,
        username: dto.username,
        passwordHash,
        realName: dto.realName,
        phone: dto.phone,
        email: dto.email,
      },
    });
  }

  async list(tenantId: string, query: any) {
    const { keyword, status, page = 1, pageSize = 20 } = query;
    const where: any = { tenantId };
    if (keyword) where.OR = [{ username: { contains: keyword } }, { realName: { contains: keyword } }];
    if (status) where.status = status;

    const [list, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { list, pagination: { current: page, pageSize, total } };
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.user.update({ where: { id }, data: { status } });
  }

  async delete(id: string) {
    await this.prisma.user.delete({ where: { id } });
  }

  async resetPassword(id: string, newPassword: string) {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    return this.prisma.user.update({ where: { id }, data: { passwordHash } });
  }
}
