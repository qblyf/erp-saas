import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CustomerService } from './customer.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto } from './dto/customer.dto';

@Controller('customers')
@UseGuards(AuthGuard('jwt'))
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @Post()
  create(@Body() dto: CreateCustomerDto & { tenantId: string }) {
    return this.customerService.create(dto.tenantId, dto);
  }

  @Get()
  findAll(@Query() query: CustomerQueryDto, @Body('tenantId') tenantId: string) {
    return this.customerService.findAll(tenantId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Body('tenantId') tenantId: string) {
    return this.customerService.findOne(tenantId, id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto & { tenantId: string }) {
    return this.customerService.update(dto.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Body('tenantId') tenantId: string) {
    return this.customerService.remove(tenantId, id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { tenantId: string; status: string }) {
    return this.customerService.updateStatus(body.tenantId, id, body.status);
  }
}
