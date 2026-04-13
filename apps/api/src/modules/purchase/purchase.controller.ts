import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PurchaseService } from './purchase.service';
import {
  CreatePurchaseOrderDto, UpdatePurchaseOrderDto, PurchaseOrderQueryDto,
  CreatePurchaseStockInDto, PurchaseStockInQueryDto,
  CreatePurchaseReturnDto, PurchaseReturnQueryDto
} from './dto/purchase.dto';

@Controller('purchase')
@UseGuards(AuthGuard('jwt'))
export class PurchaseController {
  constructor(private purchaseService: PurchaseService) {}

  // ========== 采购订单 ==========
  @Post('orders')
  createOrder(@Body() dto: CreatePurchaseOrderDto & { tenantId: string }) {
    return this.purchaseService.createOrder(dto.tenantId, dto);
  }

  @Get('orders')
  findOrders(@Query() query: PurchaseOrderQueryDto, @Body('tenantId') tenantId: string) {
    return this.purchaseService.findOrders(tenantId, query);
  }

  @Get('orders/:id')
  findOrderById(@Param('id') id: string, @Body('tenantId') tenantId: string) {
    return this.purchaseService.findOrderById(tenantId, id);
  }

  @Put('orders/:id')
  updateOrder(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto & { tenantId: string }) {
    return this.purchaseService.updateOrder(dto.tenantId, id, dto);
  }

  @Patch('orders/:id/audit')
  auditOrder(@Param('id') id: string, @Body() body: { tenantId: string; userId: string }) {
    return this.purchaseService.auditOrder(body.tenantId, id, body.userId);
  }

  @Patch('orders/:id/cancel')
  cancelOrder(@Param('id') id: string, @Body('tenantId') tenantId: string) {
    return this.purchaseService.cancelOrder(tenantId, id);
  }

  @Delete('orders/:id')
  deleteOrder(@Param('id') id: string, @Body('tenantId') tenantId: string) {
    return this.purchaseService.deleteOrder(tenantId, id);
  }

  // ========== 采购入库 ==========
  @Post('stock-ins')
  createStockIn(@Body() dto: CreatePurchaseStockInDto & { tenantId: string }) {
    return this.purchaseService.createStockIn(dto.tenantId, dto);
  }

  @Get('stock-ins')
  findStockIns(@Query() query: PurchaseStockInQueryDto, @Body('tenantId') tenantId: string) {
    return this.purchaseService.findStockIns(tenantId, query);
  }

  @Get('stock-ins/:id')
  findStockInById(@Param('id') id: string, @Body('tenantId') tenantId: string) {
    return this.purchaseService.findStockInById(tenantId, id);
  }

  @Patch('stock-ins/:id/audit')
  auditStockIn(@Param('id') id: string, @Body() body: { tenantId: string; userId: string }) {
    return this.purchaseService.auditStockIn(body.tenantId, id, body.userId);
  }

  // ========== 采购退货 ==========
  @Post('returns')
  createReturn(@Body() dto: CreatePurchaseReturnDto & { tenantId: string }) {
    return this.purchaseService.createReturn(dto.tenantId, dto);
  }

  @Get('returns')
  findReturns(@Query() query: PurchaseReturnQueryDto, @Body('tenantId') tenantId: string) {
    return this.purchaseService.findReturns(tenantId, query);
  }

  @Patch('returns/:id/audit')
  auditReturn(@Param('id') id: string, @Body() body: { tenantId: string; userId: string }) {
    return this.purchaseService.auditReturn(body.tenantId, id, body.userId);
  }
}
