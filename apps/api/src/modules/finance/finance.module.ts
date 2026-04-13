import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { FinanceStatisticsService } from './finance-statistics.service';

@Module({
  controllers: [FinanceController],
  providers: [FinanceService, FinanceStatisticsService],
  exports: [FinanceService],
})
export class FinanceModule {}
