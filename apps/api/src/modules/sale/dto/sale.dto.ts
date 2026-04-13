import { IsString, IsOptional, IsNumber, IsUUID, IsArray, ValidateNested, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class SaleOrderItemDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUUID()
  productId: string;

  @IsUUID()
  @IsOptional()
  warehouseId?: string;

  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @Type(() => Number)
  @IsNumber()
  amount: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  taxRate?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  taxAmount?: number;
}

export class CreateSaleOrderDto {
  @IsString()
  @MinLength(1)
  orderDate: string;

  @IsUUID()
  customerId: string;

  @IsUUID()
  warehouseId: string;

  @IsString()
  @IsOptional()
  contact?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  deliveryDate?: string;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleOrderItemDto)
  items: SaleOrderItemDto[];
}

export class UpdateSaleOrderDto extends CreateSaleOrderDto {
  @IsString()
  @IsOptional()
  status?: string;
}

export class SaleOrderQueryDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @IsUUID()
  @IsOptional()
  customerId?: string;

  @IsUUID()
  @IsOptional()
  warehouseId?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  pageSize?: number = 20;
}

// 销售出库
export class SaleStockOutItemDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  @IsOptional()
  saleOrderId?: string;

  @IsUUID()
  @IsOptional()
  saleOrderItemId?: string;

  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @Type(() => Number)
  @IsNumber()
  amount: number;
}

export class CreateSaleStockOutDto {
  @IsString()
  @MinLength(1)
  stockOutDate: string;

  @IsUUID()
  customerId: string;

  @IsUUID()
  warehouseId: string;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleStockOutItemDto)
  items: SaleStockOutItemDto[];
}

export class SaleStockOutQueryDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @IsUUID()
  @IsOptional()
  customerId?: string;

  @IsUUID()
  @IsOptional()
  warehouseId?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  pageSize?: number = 20;
}

// 销售退货
export class CreateSaleReturnDto {
  @IsString()
  @MinLength(1)
  returnDate: string;

  @IsUUID()
  customerId: string;

  @IsUUID()
  warehouseId: string;

  @IsUUID()
  @IsOptional()
  relateStockOutId?: string;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleStockOutItemDto)
  items: SaleStockOutItemDto[];
}

export class SaleReturnQueryDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @IsUUID()
  @IsOptional()
  customerId?: string;

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
