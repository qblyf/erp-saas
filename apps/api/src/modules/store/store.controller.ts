import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StoreService } from './store.service';
import { CreateStoreDto, UpdateStoreDto, AssignUserStoreDto } from './dto/store.dto';

@Controller('store')
@UseGuards(AuthGuard('jwt'))
export class StoreController {
  constructor(private storeService: StoreService) {}

  @Post()
  create(@Body('tenantId') tenantId: string, @Body() dto: CreateStoreDto) {
    return this.storeService.create(tenantId, dto);
  }

  @Get()
  findAll(
    @Query('tenantId') tenantId: string,
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
  ) {
    return this.storeService.findAll(tenantId, keyword, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storeService.findOne(id);
  }

  @Get(':id/stats')
  getStats(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.storeService.getStoreStats(tenantId, id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStoreDto) {
    return this.storeService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storeService.remove(id);
  }

  // === 用户归属 ===
  @Post('assign')
  assignUser(@Body('tenantId') tenantId: string, @Body() dto: AssignUserStoreDto) {
    return this.storeService.assignUser(tenantId, dto);
  }

  @Delete('unassign')
  unassignUser(
    @Query('tenantId') tenantId: string,
    @Query('userId') userId: string,
    @Query('storeId') storeId: string,
  ) {
    return this.storeService.unassignUser(tenantId, userId, storeId);
  }

  @Get('user/:userId/stores')
  getUserStores(
    @Param('userId') userId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.storeService.getUserStores(tenantId, userId);
  }
}
