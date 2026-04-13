import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StoreTransferService } from './store-transfer.service';
import { CreateStoreTransferDto, UpdateStoreTransferDto } from './dto/store-transfer.dto';

@Controller('store-transfer')
@UseGuards(AuthGuard('jwt'))
export class StoreTransferController {
  constructor(private service: StoreTransferService) {}

  @Post()
  create(
    @Body('tenantId') tenantId: string,
    @Body('creatorId') creatorId: string,
    @Body() dto: CreateStoreTransferDto,
  ) {
    return this.service.create(tenantId, creatorId, dto);
  }

  @Get()
  findAll(@Query('tenantId') tenantId: string, @Query('status') status?: string) {
    return this.service.findAll(tenantId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStoreTransferDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/execute')
  execute(@Param('id') id: string) {
    return this.service.execute(id);
  }
}
