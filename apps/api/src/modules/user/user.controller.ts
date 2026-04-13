import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto/user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body('tenantId') tenantId: string, @Body() dto: CreateUserDto) {
    return this.userService.create(tenantId, dto);
  }

  @Get()
  list(@Query('tenantId') tenantId: string, @Query() query: UserQueryDto) {
    return this.userService.list(tenantId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Post(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.userService.updateStatus(id, status);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }

  @Post(':id/reset-password')
  resetPassword(@Param('id') id: string, @Body('password') password: string) {
    return this.userService.resetPassword(id, password);
  }
}
