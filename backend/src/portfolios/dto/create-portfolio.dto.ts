import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { AccountType } from '@prisma/client';

export class CreatePortfolioDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  initialBalance: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(AccountType)
  accountType?: AccountType;
}
