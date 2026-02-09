import { PartialType } from '@nestjs/mapped-types';
import { CreatePortfolioDto } from './create-portfolio.dto';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdatePortfolioDto extends PartialType(CreatePortfolioDto) {
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentBalance?: number;
}
