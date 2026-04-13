import { IsString, IsOptional, IsNumber, IsUUID, IsArray, ValidateNested, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class VoucherItemDto {
  @IsUUID()
  accountId: string;

  @IsString()
  direction: string; // debit/credit

  @Type(() => Number)
  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  summary?: string;
}

export class CreateVoucherDto {
  @IsString()
  @MinLength(1)
  voucherDate: string;

  @IsString()
  @IsOptional()
  voucherType?: string;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VoucherItemDto)
  items: VoucherItemDto[];
}

export class UpdateVoucherDto extends CreateVoucherDto {
  @IsString()
  @IsOptional()
  status?: string;
}

export class VoucherQueryDto {
  @IsString()
  @IsOptional()
  keyword?: string;

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

// 收付款
export class CreatePaymentDto {
  @IsString()
  @MinLength(1)
  paymentDate: string;

  @IsString()
  @MinLength(1)
  paymentType: string; // receipt/payment/other

  @Type(() => Number)
  @IsNumber()
  amount: number;

  @IsUUID()
  accountId: string;

  @IsUUID()
  @IsOptional()
  customerId?: string;

  @IsUUID()
  @IsOptional()
  supplierId?: string;

  @IsString()
  @IsOptional()
  relateBusinessType?: string;

  @IsUUID()
  @IsOptional()
  relateBusinessId?: string;

  @IsString()
  @IsOptional()
  relateBusinessNo?: string;

  @IsString()
  @IsOptional()
  remark?: string;
}

export class PaymentQueryDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @IsString()
  @IsOptional()
  paymentType?: string;

  @IsUUID()
  @IsOptional()
  accountId?: string;

  @IsUUID()
  @IsOptional()
  customerId?: string;

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

// 会计科目
export class CreateAccountSubjectDto {
  @IsString()
  @MinLength(1)
  code: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  direction?: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;
}

export class AccountSubjectQueryDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @IsString()
  @IsOptional()
  type?: string;
}
