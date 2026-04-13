import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateRoleDto) {
    const exist = await this.prisma.role.findUnique({
      where: { tenantId_code: { tenantId, code: dto.code } },
    });
    if (exist) throw new BadRequestException('角色编码已存在');

    return this.prisma.role.create({
      data: {
        tenantId,
        name: dto.name,
        code: dto.code,
        description: dto.description,
        permissions: dto.permissions
          ? {
              create: dto.permissions.map((p) => ({ permissionCode: p })),
            }
          : undefined,
      },
      include: { permissions: true },
    });
  }

  async list(tenantId: string) {
    const list = await this.prisma.role.findMany({
      where: { tenantId },
      include: { permissions: true },
      orderBy: { createdAt: 'desc' },
    });
    return list;
  }

  async findOne(id: string) {
    return this.prisma.role.findUnique({ where: { id }, include: { permissions: true } });
  }

  async update(id: string, dto: UpdateRoleDto) {
    // Update basic fields
    const data: any = { name: dto.name, description: dto.description };
    const role = await this.prisma.role.update({ where: { id }, data });

    // Update permissions if provided
    if (dto.permissions) {
      await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
      if (dto.permissions.length > 0) {
        await this.prisma.rolePermission.createMany({
          data: dto.permissions.map((p) => ({ roleId: id, permissionCode: p })),
        });
      }
    }

    return this.prisma.role.findUnique({ where: { id }, include: { permissions: true } });
  }

  async delete(id: string) {
    await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
    await this.prisma.userRole.deleteMany({ where: { roleId: id } });
    await this.prisma.role.delete({ where: { id } });
  }
}
