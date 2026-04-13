import { IsString, IsOptional, IsNumber, IsUUID, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  code: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  spec?: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  purchasePrice?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  salePrice?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  costPrice?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  minStock?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  maxStock?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateProductDto extends CreateProductDto {
  @IsString()
  @IsOptional()
  status?: string;
}

export class ProductQueryDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  pageSize?: number = 20;
}
