import { IsOptional, IsString, IsEnum, IsDateString, IsIn } from 'class-validator';
import { TradeType, TradeStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class FilterTradesDto {
  @IsOptional()
  @IsString()
  symbol?: string;

  @IsOptional()
  @IsEnum(TradeType)
  type?: TradeType;

  @IsOptional()
  @IsEnum(TradeStatus)
  status?: TradeStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  strategy?: string;

  @IsOptional()
  @IsString()
  portfolioId?: string;

  @IsOptional()
  @IsIn(['winning', 'losing'])
  profitability?: 'winning' | 'losing';

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsIn(['entryDate', 'exitDate', 'profitLoss', 'createdAt'])
  sortBy?: string = 'entryDate';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
