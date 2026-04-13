import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccountService } from './account.service';
import { CreateAccountDto, UpdateAccountDto, AccountQueryDto } from './dto/account.dto';

@Controller('accounts')
@UseGuards(AuthGuard('jwt'))
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Post()
  create(@Body() dto: CreateAccountDto & { tenantId: string }) {
    return this.accountService.create(dto.tenantId, dto);
  }

  @Get()
  findAll(@Query() query: AccountQueryDto, @Body('tenantId') tenantId: string) {
    return this.accountService.findAll(tenantId, query);
  }

  @Get('simple')
  findAllSimple(@Body('tenantId') tenantId: string) {
    return this.accountService.findAllSimple(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Body('tenantId') tenantId: string) {
    return this.accountService.findOne(tenantId, id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAccountDto & { tenantId: string }) {
    return this.accountService.update(dto.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Body('tenantId') tenantId: string) {
    return this.accountService.remove(tenantId, id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { tenantId: string; status: string }) {
    return this.accountService.updateStatus(body.tenantId, id, body.status);
  }
}
