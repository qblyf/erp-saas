import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SaleService } from './sale.service';
import {
  CreateSaleOrderDto, UpdateSaleOrderDto, SaleOrderQueryDto,
  CreateSaleStockOutDto, SaleStockOutQueryDto,
  CreateSaleReturnDto, SaleReturnQueryDto
} from './dto/sale.dto';

@Controller('sale')
@UseGuards(AuthGuard('jwt'))
export class SaleController {
  constructor(private saleService: SaleService) {}

  // ========== 销售订单 ==========
  @Post('orders')
  createOrder(@Body() dto: CreateSaleOrderDto & { tenantId: string }) {
    return this.saleService.createOrder(dto.tenantId, dto);
  }

  @Get('orders')
  findOrders(@Query() query: SaleOrderQueryDto, @Body('tenantId') tenantId: string) {
    return this.saleService.findOrders(tenantId, query);
  }

  @Get('orders/:id')
  findOrderById(@Param('id') id: string, @Body('tenantId') tenantId: string) {
    return this.saleService.findOrderById(tenantId, id);
  }

  @Put('orders/:id')
  updateOrder(@Param('id') id: string, @Body() dto: UpdateSaleOrderDto & { tenantId: string }) {
    return this.saleService.updateOrder(dto.tenantId, id, dto);
  }

  @Patch('orders/:id/audit')
  auditOrder(@Param('id') id: string, @Body() body: { tenantId: string; userId: string }) {
    return this.saleService.auditOrder(body.tenantId, id, body.userId);
  }

  @Patch('orders/:id/cancel')
  cancelOrder(@Param('id') id: string, @Body('tenantId') tenantId: string) {
    return this.saleService.cancelOrder(tenantId, id);
  }

  @Delete('orders/:id')
  deleteOrder(@Param('id') id: string, @Body('tenantId') tenantId: string) {
    return this.saleService.deleteOrder(tenantId, id);
  }

  // ========== 销售出库 ==========
  @Post('stock-outs')
  createStockOut(@Body() dto: CreateSaleStockOutDto & { tenantId: string }) {
    return this.saleService.createStockOut(dto.tenantId, dto);
  }

  @Get('stock-outs')
  findStockOuts(@Query() query: SaleStockOutQueryDto, @Body('tenantId') tenantId: string) {
    return this.saleService.findStockOuts(tenantId, query);
  }

  @Get('stock-outs/:id')
  findStockOutById(@Param('id') id: string, @Body('tenantId') tenantId: string) {
    return this.saleService.findStockOutById(tenantId, id);
  }

  @Patch('stock-outs/:id/audit')
  auditStockOut(@Param('id') id: string, @Body() body: { tenantId: string; userId: string }) {
    return this.saleService.auditStockOut(body.tenantId, id, body.userId);
  }

  // ========== 销售退货 ==========
  @Post('returns')
  createReturn(@Body() dto: CreateSaleReturnDto & { tenantId: string }) {
    return this.saleService.createReturn(dto.tenantId, dto);
  }

  @Get('returns')
  findReturns(@Query() query: SaleReturnQueryDto, @Body('tenantId') tenantId: string) {
    return this.saleService.findReturns(tenantId, query);
  }

  @Patch('returns/:id/audit')
  auditReturn(@Param('id') id: string, @Body() body: { tenantId: string; userId: string }) {
    return this.saleService.auditReturn(body.tenantId, id, body.userId);
  }
}
