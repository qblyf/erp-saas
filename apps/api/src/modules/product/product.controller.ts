import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';

@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post()
  create(@Body() dto: CreateProductDto & { tenantId: string }) {
    return this.productService.create(dto.tenantId, dto);
  }

  @Get()
  findAll(@Query() query: ProductQueryDto, @Body('tenantId') tenantId: string) {
    return this.productService.findAll(tenantId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Body('tenantId') tenantId: string) {
    return this.productService.findOne(tenantId, id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto & { tenantId: string }) {
    return this.productService.update(dto.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Body('tenantId') tenantId: string) {
    return this.productService.remove(tenantId, id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { tenantId: string; status: string },
  ) {
    return this.productService.updateStatus(body.tenantId, id, body.status);
  }
}
