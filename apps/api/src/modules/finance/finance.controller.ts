import { Controller, Get, Post, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FinanceService } from './finance.service';
import { CreateVoucherDto, UpdateVoucherDto, VoucherQueryDto,
  CreatePaymentDto, PaymentQueryDto,
  CreateAccountSubjectDto, AccountSubjectQueryDto } from './dto/finance.dto';

@Controller('finance')
@UseGuards(AuthGuard('jwt'))
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  // ========== 会计科目 ==========
  @Get('subjects')
  findSubjects(@Query() query: AccountSubjectQueryDto, @Body('tenantId') tenantId: string) {
    return this.financeService.findSubjects(tenantId, query);
  }

  @Post('subjects')
  createSubject(@Body() dto: CreateAccountSubjectDto & { tenantId: string }) {
    return this.financeService.createSubject(dto.tenantId, dto);
  }

  @Post('subjects/init')
  initSubjects(@Body('tenantId') tenantId: string) {
    return this.financeService.initDefaultSubjects(tenantId);
  }

  // ========== 凭证管理 ==========
  @Post('vouchers')
  createVoucher(@Body() dto: CreateVoucherDto & { tenantId: string }) {
    return this.financeService.createVoucher(dto.tenantId, dto);
  }

  @Get('vouchers')
  findVouchers(@Query() query: VoucherQueryDto, @Body('tenantId') tenantId: string) {
    return this.financeService.findVouchers(tenantId, query);
  }

  @Get('vouchers/:id')
  findVoucherById(@Param('id') id: string, @Body('tenantId') tenantId: string) {
    return this.financeService.findVoucherById(tenantId, id);
  }

  @Patch('vouchers/:id/audit')
  auditVoucher(@Param('id') id: string, @Body() body: { tenantId: string; userId: string }) {
    return this.financeService.auditVoucher(body.tenantId, id, body.userId);
  }

  @Patch('vouchers/:id/post')
  postVoucher(@Param('id') id: string, @Body() body: { tenantId: string; userId: string }) {
    return this.financeService.postVoucher(body.tenantId, id, body.userId);
  }

  @Delete('vouchers/:id')
  deleteVoucher(@Param('id') id: string, @Body('tenantId') tenantId: string) {
    return this.financeService.deleteVoucher(tenantId, id);
  }

  // ========== 收付款 ==========
  @Post('payments')
  createPayment(@Body() dto: CreatePaymentDto & { tenantId: string }) {
    return this.financeService.createPayment(dto.tenantId, dto);
  }

  @Get('payments')
  findPayments(@Query() query: PaymentQueryDto, @Body('tenantId') tenantId: string) {
    return this.financeService.findPayments(tenantId, query);
  }

  @Patch('payments/:id/audit')
  auditPayment(@Param('id') id: string, @Body() body: { tenantId: string; userId: string }) {
    return this.financeService.auditPayment(body.tenantId, id, body.userId);
  }

  // ========== 财务报表 ==========
  @Get('reports/profit')
  getProfitStatement(
    @Query('tenantId') tenantId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.financeService.getProfitStatement(tenantId, startDate, endDate);
  }
}
