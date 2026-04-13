import { Module } from '@nestjs/common';
import { StoreTransferController } from './store-transfer.controller';
import { StoreTransferService } from './store-transfer.service';

@Module({
  controllers: [StoreTransferController],
  providers: [StoreTransferService],
  exports: [StoreTransferService],
})
export class StoreTransferModule {}
