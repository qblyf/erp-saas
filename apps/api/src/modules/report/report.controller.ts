import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportService } from './report.service';

@Controller('report')
@UseGuards(AuthGuard('jwt'))
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Get('dashboard')
  getDashboardStats(@Query('tenantId') tenantId: string) {
    return this.reportService.getDashboardStats(tenantId);
  }

  @Get('sales-summary')
  getSalesSummary(
    @Query('tenantId') tenantId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportService.getSalesSummary(tenantId, startDate, endDate);
  }

  @Get('sales-ranking')
  getSalesRanking(
    @Query('tenantId') tenantId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportService.getSalesRanking(tenantId, startDate, endDate);
  }
}
