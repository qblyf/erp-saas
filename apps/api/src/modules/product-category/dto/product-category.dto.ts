import { IsString, IsOptional, IsNumber, IsUUID, MinLength, MaxLength } from 'class-validator';

export class CreateProductCategoryDto {
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class UpdateProductCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class ProductCategoryQueryDto {
  @IsString()
  @IsOptional()
  keyword?: string;
}
