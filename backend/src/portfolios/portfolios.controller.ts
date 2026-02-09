import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';
import { CreatePortfolioDto, UpdatePortfolioDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountType } from '@prisma/client';

@Controller('portfolios')
@UseGuards(JwtAuthGuard)
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @Post()
  create(@Request() req, @Body() createPortfolioDto: CreatePortfolioDto) {
    return this.portfoliosService.create(req.user.id, createPortfolioDto);
  }

  @Get()
  findAll(@Request() req, @Query('accountType') accountType?: AccountType) {
    return this.portfoliosService.findAll(req.user.id, accountType);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.portfoliosService.findOne(req.user.id, id);
  }

  @Get(':id/stats')
  getStats(@Request() req, @Param('id') id: string) {
    return this.portfoliosService.getStats(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updatePortfolioDto: UpdatePortfolioDto,
  ) {
    return this.portfoliosService.update(req.user.id, id, updatePortfolioDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.portfoliosService.remove(req.user.id, id);
  }

  @Post(':id/assign-unassigned-trades')
  assignUnassignedTrades(@Request() req, @Param('id') id: string) {
    return this.portfoliosService.assignUnassignedTrades(req.user.id, id);
  }

  @Get('unassigned-trades/count')
  getUnassignedTradesCount(@Request() req) {
    return this.portfoliosService.getUnassignedTradesCount(req.user.id);
  }

  @Post(':fromId/move-trades-to/:toId')
  moveTradesTo(
    @Request() req,
    @Param('fromId') fromId: string,
    @Param('toId') toId: string,
  ) {
    return this.portfoliosService.moveTradesTo(req.user.id, fromId, toId);
  }
}
