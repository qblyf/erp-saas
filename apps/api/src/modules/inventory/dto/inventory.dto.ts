import { IsString, IsOptional, IsNumber, IsUUID, IsArray, ValidateNested, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class StockCheckItemDto {
  @IsUUID()
  productId: string;

  @Type(() => Number)
  @IsNumber()
  bookQuantity: number;

  @Type(() => Number)
  @IsNumber()
  checkQuantity: number;

  @Type(() => Number)
  @IsNumber()
  diffQuantity: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  costPrice?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  diffAmount?: number;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class CreateStockCheckDto {
  @IsString()
  @MinLength(1)
  checkDate: string;

  @IsUUID()
  warehouseId: string;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockCheckItemDto)
  items: StockCheckItemDto[];
}

export class StockCheckQueryDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @IsUUID()
  @IsOptional()
  warehouseId?: string;

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

// 库存调拨
export class StockTransferItemDto {
  @IsUUID()
  productId: string;

  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  costPrice?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  amount?: number;
}

export class CreateStockTransferDto {
  @IsString()
  @MinLength(1)
  transferDate: string;

  @IsUUID()
  fromWarehouseId: string;

  @IsUUID()
  toWarehouseId: string;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockTransferItemDto)
  items: StockTransferItemDto[];
}

export class StockTransferQueryDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @IsUUID()
  @IsOptional()
  fromWarehouseId?: string;

  @IsUUID()
  @IsOptional()
  toWarehouseId?: string;

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

// 库存查询
export class InventoryQueryDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @IsUUID()
  @IsOptional()
  productId?: string;

  @IsUUID()
  @IsOptional()
  warehouseId?: string;

  @IsString()
  @IsOptional()
  stockStatus?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  pageSize?: number = 20;
}
