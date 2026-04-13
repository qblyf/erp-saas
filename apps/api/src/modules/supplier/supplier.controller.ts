import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto, UpdateSupplierDto, SupplierQueryDto } from './dto/supplier.dto';

@Controller('suppliers')
@UseGuards(AuthGuard('jwt'))
export class SupplierController {
  constructor(private supplierService: SupplierService) {}

  @Post()
  create(@Body() dto: CreateSupplierDto & { tenantId: string }) {
    return this.supplierService.create(dto.tenantId, dto);
  }

  @Get()
  findAll(@Query() query: SupplierQueryDto, @Body('tenantId') tenantId: string) {
    return this.supplierService.findAll(tenantId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Body('tenantId') tenantId: string) {
    return this.supplierService.findOne(tenantId, id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto & { tenantId: string }) {
    return this.supplierService.update(dto.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Body('tenantId') tenantId: string) {
    return this.supplierService.remove(tenantId, id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { tenantId: string; status: string }) {
    return this.supplierService.updateStatus(body.tenantId, id, body.status);
  }
}
