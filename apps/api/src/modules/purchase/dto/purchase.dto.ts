import { IsString, IsOptional, IsNumber, IsUUID, IsArray, ValidateNested, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class PurchaseOrderItemDto {
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

  @IsString()
  @IsOptional()
  remark?: string;
}

export class CreatePurchaseOrderDto {
  @IsString()
  @MinLength(1)
  orderDate: string;

  @IsUUID()
  supplierId: string;

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
  @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[];
}

export class UpdatePurchaseOrderDto extends CreatePurchaseOrderDto {
  @IsString()
  @IsOptional()
  status?: string;
}

export class PurchaseOrderQueryDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @IsUUID()
  @IsOptional()
  supplierId?: string;

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

// 采购入库
export class PurchaseStockInItemDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  @IsOptional()
  purchaseOrderId?: string;

  @IsUUID()
  @IsOptional()
  purchaseOrderItemId?: string;

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

export class CreatePurchaseStockInDto {
  @IsString()
  @MinLength(1)
  stockInDate: string;

  @IsUUID()
  supplierId: string;

  @IsUUID()
  warehouseId: string;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseStockInItemDto)
  items: PurchaseStockInItemDto[];
}

export class PurchaseStockInQueryDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @IsUUID()
  @IsOptional()
  supplierId?: string;

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

// 采购退货
export class CreatePurchaseReturnDto {
  @IsString()
  @MinLength(1)
  returnDate: string;

  @IsUUID()
  supplierId: string;

  @IsUUID()
  warehouseId: string;

  @IsUUID()
  @IsOptional()
  relateStockInId?: string;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseStockInItemDto)
  items: PurchaseStockInItemDto[];
}

export class PurchaseReturnQueryDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @IsUUID()
  @IsOptional()
  supplierId?: string;

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
