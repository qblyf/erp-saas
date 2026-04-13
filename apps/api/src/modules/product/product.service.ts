import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateProductDto) {
    const exists = await this.prisma.product.findFirst({
      where: { tenantId, code: dto.code },
    });
    if (exists) {
      throw new BadRequestException('商品编码已存在');
    }

    if (dto.categoryId) {
      const category = await this.prisma.productCategory.findFirst({
        where: { id: dto.categoryId, tenantId },
      });
      if (!category) {
        throw new BadRequestException('商品分类不存在');
      }
    }

    return this.prisma.product.create({
      data: {
        tenantId,
        ...dto,
      },
    });
  }

  async findAll(tenantId: string, query: ProductQueryDto) {
    const { keyword, categoryId, status, page = 1, pageSize = 20 } = query;

    const where: any = { tenantId };
    if (keyword) {
      where.OR = [
        { code: { contains: keyword } },
        { name: { contains: keyword } },
        { spec: { contains: keyword } },
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (status) {
      where.status = status;
    }

    const [list, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      list,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.product.findFirst({
      where: { id, tenantId },
      include: { category: true },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateProductDto) {
    const exists = await this.prisma.product.findFirst({
      where: { id, tenantId },
    });
    if (!exists) {
      throw new BadRequestException('商品不存在');
    }

    if (dto.code && dto.code !== exists.code) {
      const codeExists = await this.prisma.product.findFirst({
        where: { tenantId, code: dto.code, id: { not: id } },
      });
      if (codeExists) {
        throw new BadRequestException('商品编码已存在');
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    // 检查库存
    const inventory = await this.prisma.inventory.findFirst({
      where: { productId: id, tenantId, quantity: { gt: 0 } },
    });
    if (inventory) {
      throw new BadRequestException('商品有库存，无法删除');
    }

    await this.prisma.product.delete({
      where: { id, tenantId },
    });
  }

  async updateStatus(tenantId: string, id: string, status: string) {
    return this.prisma.product.update({
      where: { id, tenantId },
      data: { status },
    });
  }
}
