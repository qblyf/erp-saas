import { IsString, IsOptional, IsNumber, MinLength, MaxLength, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAccountDto {
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
  type?: string;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  bankAccount?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  initialBalance?: number;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateAccountDto extends CreateAccountDto {
  @IsString()
  @IsOptional()
  status?: string;
}

export class AccountQueryDto {
  @IsString()
  @IsOptional()
  keyword?: string;

  @IsString()
  @IsOptional()
  type?: string;

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
