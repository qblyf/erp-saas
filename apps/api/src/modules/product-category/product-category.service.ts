import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductCategoryDto, UpdateProductCategoryDto } from './dto/product-category.dto';

@Injectable()
export class ProductCategoryService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateProductCategoryDto) {
    if (dto.parentId) {
      // 验证父分类存在
      const parent = await this.prisma.productCategory.findFirst({
        where: { id: dto.parentId, tenantId },
      });
      if (!parent) {
        throw new BadRequestException('父分类不存在');
      }
    }

    return this.prisma.productCategory.create({
      data: {
        tenantId,
        ...dto,
      },
    });
  }

  async findAll(tenantId: string) {
    // 返回树形结构
    const categories = await this.prisma.productCategory.findMany({
      where: { tenantId },
      orderBy: { sortOrder: 'asc' },
    });

    return this.buildTree(categories);
  }

  private buildTree(categories: any[]) {
    const map = new Map<string, any>();
    const roots: any[] = [];

    categories.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    categories.forEach((cat) => {
      const node = map.get(cat.id);
      if (cat.parentId && map.has(cat.parentId)) {
        map.get(cat.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.productCategory.findFirst({
      where: { id, tenantId },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateProductCategoryDto) {
    const exists = await this.prisma.productCategory.findFirst({
      where: { id, tenantId },
    });
    if (!exists) {
      throw new BadRequestException('分类不存在');
    }

    return this.prisma.productCategory.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    // 检查是否有子分类
    const children = await this.prisma.productCategory.findMany({
      where: { parentId: id, tenantId },
    });
    if (children.length > 0) {
      throw new BadRequestException('请先删除子分类');
    }

    // 检查是否有商品使用此分类
    const products = await this.prisma.product.findMany({
      where: { categoryId: id, tenantId },
    });
    if (products.length > 0) {
      throw new BadRequestException('该分类下有商品，无法删除');
    }

    await this.prisma.productCategory.delete({
      where: { id },
    });
  }
}
