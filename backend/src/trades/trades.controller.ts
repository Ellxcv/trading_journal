import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TradesService } from './trades.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { FilterTradesDto } from './dto/filter-trades.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('trades')
@UseGuards(JwtAuthGuard)
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createTradeDto: CreateTradeDto) {
    return this.tradesService.create(user.id, createTradeDto);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query() filterDto: FilterTradesDto) {
    return this.tradesService.findAll(user.id, filterDto);
  }

  @Get('statistics')
  getStatistics(@CurrentUser() user: any) {
    return this.tradesService.getStatistics(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tradesService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateTradeDto: UpdateTradeDto,
  ) {
    return this.tradesService.update(user.id, id, updateTradeDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tradesService.remove(user.id, id);
  }
}
