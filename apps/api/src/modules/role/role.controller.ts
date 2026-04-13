import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  create(@Body('tenantId') tenantId: string, @Body() dto: CreateRoleDto) {
    return this.roleService.create(tenantId, dto);
  }

  @Get()
  list(@Query('tenantId') tenantId: string) {
    return this.roleService.list(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.roleService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.roleService.delete(id);
  }
}
