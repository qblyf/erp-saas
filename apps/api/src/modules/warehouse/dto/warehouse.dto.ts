import { IsString, IsOptional, IsNumber, MinLength, MaxLength } from 'class-validator';
import { Prisma } from '@prisma/client';

export class CreateWarehouseDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  principal?: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class UpdateWarehouseDto extends CreateWarehouseDto {
  @IsString()
  @IsOptional()
  status?: string;
}

export class WarehouseQueryDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  pageSize?: number = 20;
}

export const warehouseSelect = {
  id: true,
  code: true,
  name: true,
  address: true,
  principal: true,
  sortOrder: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;
