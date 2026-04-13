import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { IsString, MinLength } from 'class-validator';
import { Request as ExpressRequest } from 'express';

class LoginDto {
  @IsString()
  @MinLength(1)
  username: string;

  @IsString()
  @MinLength(1)
  password: string;
}

class RefreshDto {
  @IsString()
  refreshToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.username, dto.password);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout() {
    return { message: '登出成功' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('current-user')
  async getCurrentUser(@Request() req: ExpressRequest & { user: { userId: string } }) {
    return this.authService.getCurrentUser(req.user.userId);
  }
}
