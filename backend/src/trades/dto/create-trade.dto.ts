import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDateString,
  IsArray,
  Min,
} from 'class-validator';
import { TradeType, TradeStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateTradeDto {
  @IsString()
  symbol: string;

  @IsEnum(TradeType)
  type: TradeType;

  @IsEnum(TradeStatus)
  @IsOptional()
  status?: TradeStatus;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  entryPrice: number;

  @IsDateString()
  entryDate: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  quantity: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  exitPrice?: number;

  @IsDateString()
  @IsOptional()
  exitDate?: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  stopLoss?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  takeProfit?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  commission?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  swap?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  profitLoss?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  netProfitLoss?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  strategy?: string;

  @IsString()
  @IsOptional()
  timeframe?: string;

  @IsString()
  @IsOptional()
  exitReason?: string;

  @IsString()
  @IsOptional()
  mistakes?: string;

  @IsString()
  @IsOptional()
  lessonsLearned?: string;

  @IsString()
  @IsOptional()
  portfolioId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  screenshots?: string[];
}
