import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto, UpdateWarehouseDto, WarehouseQueryDto } from './dto/warehouse.dto';

@Controller('warehouses')
@UseGuards(AuthGuard('jwt'))
export class WarehouseController {
  constructor(private warehouseService: WarehouseService) {}

  @Post()
  create(@Body('tenantId') tenantId: string, @Body() dto: CreateWarehouseDto) {
    return this.warehouseService.create(tenantId, dto);
  }

  @Get()
  findAll(@Query() query: WarehouseQueryDto, @Body('tenantId') tenantId: string) {
    return this.warehouseService.findAll(tenantId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Body('tenantId') tenantId: string) {
    return this.warehouseService.findOne(tenantId, id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWarehouseDto & { tenantId: string }) {
    return this.warehouseService.update(dto.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Body('tenantId') tenantId: string) {
    return this.warehouseService.remove(tenantId, id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { tenantId: string; status: string },
  ) {
    return this.warehouseService.updateStatus(body.tenantId, id, body.status);
  }
}
