import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductCategoryService } from './product-category.service';
import { CreateProductCategoryDto, UpdateProductCategoryDto } from './dto/product-category.dto';

@Controller('product-categories')
@UseGuards(AuthGuard('jwt'))
export class ProductCategoryController {
  constructor(private categoryService: ProductCategoryService) {}

  @Post()
  create(@Body() dto: CreateProductCategoryDto & { tenantId: string }) {
    return this.categoryService.create(dto.tenantId, dto);
  }

  @Get()
  findAll(@Query('tenantId') tenantId: string) {
    return this.categoryService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('tenantId') tenantId: string) {
    return this.categoryService.findOne(tenantId, id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductCategoryDto & { tenantId: string },
  ) {
    return this.categoryService.update(dto.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('tenantId') tenantId: string) {
    return this.categoryService.remove(tenantId, id);
  }
}
