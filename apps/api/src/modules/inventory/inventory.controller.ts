import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InventoryService } from './inventory.service';
import { CreateStockCheckDto, StockCheckQueryDto,
  CreateStockTransferDto, StockTransferQueryDto,
  InventoryQueryDto } from './dto/inventory.dto';

@Controller('inventory')
@UseGuards(AuthGuard('jwt'))
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  // ========== 库存查询 ==========
  @Get()
  findInventories(@Query() query: InventoryQueryDto, @Body('tenantId') tenantId: string) {
    return this.inventoryService.findInventories(tenantId, query);
  }

  @Get('summary')
  getSummary(@Body('tenantId') tenantId: string) {
    return this.inventoryService.getInventorySummary(tenantId);
  }

  // ========== 库存预警 ==========
  @Get('warnings')
  getWarnings(@Body('tenantId') tenantId: string) {
    return this.inventoryService.getWarnings(tenantId);
  }

  // ========== 库存盘点 ==========
  @Post('checks')
  createStockCheck(@Body() dto: CreateStockCheckDto & { tenantId: string }) {
    return this.inventoryService.createStockCheck(dto.tenantId, dto);
  }

  @Get('checks')
  findStockChecks(@Query() query: StockCheckQueryDto, @Body('tenantId') tenantId: string) {
    return this.inventoryService.findStockChecks(tenantId, query);
  }

  @Get('checks/:id')
  findStockCheckById(@Param('id') id: string, @Body('tenantId') tenantId: string) {
    return this.inventoryService.findStockCheckById(tenantId, id);
  }

  @Patch('checks/:id/audit')
  auditStockCheck(@Param('id') id: string, @Body() body: { tenantId: string; userId: string }) {
    return this.inventoryService.auditStockCheck(body.tenantId, id, body.userId);
  }

  @Patch('checks/:id/approve')
  approveStockCheck(@Param('id') id: string, @Body() body: { tenantId: string; userId: string }) {
    return this.inventoryService.approveStockCheck(body.tenantId, id, body.userId);
  }

  // ========== 库存调拨 ==========
  @Post('transfers')
  createStockTransfer(@Body() dto: CreateStockTransferDto & { tenantId: string }) {
    return this.inventoryService.createStockTransfer(dto.tenantId, dto);
  }

  @Get('transfers')
  findStockTransfers(@Query() query: StockTransferQueryDto, @Body('tenantId') tenantId: string) {
    return this.inventoryService.findStockTransfers(tenantId, query);
  }

  @Get('transfers/:id')
  findStockTransferById(@Param('id') id: string, @Body('tenantId') tenantId: string) {
    return this.inventoryService.findStockTransferById(tenantId, id);
  }

  @Patch('transfers/:id/audit')
  auditStockTransfer(@Param('id') id: string, @Body() body: { tenantId: string; userId: string }) {
    return this.inventoryService.auditStockTransfer(body.tenantId, id, body.userId);
  }
}
