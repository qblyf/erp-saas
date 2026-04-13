import { IsString, IsArray, IsOptional, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStoreTransferItemDto {
  @IsString()
  productId: string;

  @IsString() @IsOptional()
  fromWarehouseId?: string;

  @IsString() @IsOptional()
  toWarehouseId?: string;

  @IsInt() @Min(1)
  quantity: number;
}

export class CreateStoreTransferDto {
  @IsString()
  fromStoreId: string;

  @IsString()
  toStoreId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStoreTransferItemDto)
  items: CreateStoreTransferItemDto[];

  @IsString() @IsOptional()
  remark?: string;
}

export class UpdateStoreTransferDto {
  @IsString() @IsOptional()
  status?: string;

  @IsString() @IsOptional()
  remark?: string;
}
