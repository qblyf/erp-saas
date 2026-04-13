import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateStoreDto {
  @IsString() @MinLength(1)
  code: string;

  @IsString() @MinLength(1)
  name: string;

  @IsString() @IsOptional()
  address?: string;

  @IsString() @IsOptional()
  phone?: string;

  @IsString() @IsOptional()
  manager?: string;
}

export class UpdateStoreDto {
  @IsString() @IsOptional()
  name?: string;

  @IsString() @IsOptional()
  address?: string;

  @IsString() @IsOptional()
  phone?: string;

  @IsString() @IsOptional()
  manager?: string;

  @IsString() @IsOptional()
  status?: string;
}

export class StoreQueryDto {
  @IsString() @IsOptional()
  keyword?: string;

  @IsString() @IsOptional()
  status?: string;
}

export class AssignUserStoreDto {
  @IsString()
  userId: string;

  @IsString()
  storeId: string;

  @IsString() @IsOptional()
  role?: string;
}
