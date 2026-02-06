import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { FilterTradesDto } from './dto/filter-trades.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TradesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createTradeDto: CreateTradeDto) {
    const { tagIds, ...tradeData } = createTradeDto;

    // Use provided P&L values if available (from broker import)
    // Otherwise calculate P&L if exit price is provided
    let profitLoss: number | null = null;
    let netProfitLoss: number | null = null;

    if (tradeData.netProfitLoss !== undefined && tradeData.netProfitLoss !== null) {
      // Use broker-provided P&L (accurate for all instrument types)
      netProfitLoss = Number(tradeData.netProfitLoss);
      profitLoss = tradeData.profitLoss !== undefined ? Number(tradeData.profitLoss) : netProfitLoss;
    } else if (tradeData.exitPrice) {
      // Calculate P&L (for manual entries)
      const priceDiff =
        tradeData.type === 'LONG'
          ? Number(tradeData.exitPrice) - Number(tradeData.entryPrice)
          : Number(tradeData.entryPrice) - Number(tradeData.exitPrice);

      profitLoss = priceDiff * Number(tradeData.quantity);
      // Net P&L includes commission AND swap
      netProfitLoss = profitLoss - (Number(tradeData.commission) || 0) - (Number(tradeData.swap) || 0);
    }

    // Create trade with tags connection
    const trade = await this.prisma.trade.create({
      data: {
        ...tradeData,
        profitLoss,
        netProfitLoss,
        userId,
        tags: tagIds
          ? {
              connect: tagIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        tags: true,
        portfolio: true,
      },
    });

    return trade;
  }

  async findAll(userId: string, filterDto: FilterTradesDto) {
    const {
      symbol,
      type,
      status,
      startDate,
      endDate,
      strategy,
      portfolioId,
      profitability,
      page = 1,
      limit = 10,
      sortBy = 'entryDate',
      sortOrder = 'desc',
    } = filterDto;

    // Build where clause
    const where: Prisma.TradeWhereInput = {
      userId,
      ...(symbol && { symbol: { contains: symbol, mode: 'insensitive' } }),
      ...(type && { type }),
      ...(status && { status }),
      ...(strategy && { strategy: { contains: strategy, mode: 'insensitive' } }),
      ...(portfolioId && { portfolioId }),
      ...(profitability === 'winning' && {
        netProfitLoss: { gt: 0 },
      }),
      ...(profitability === 'losing' && {
        netProfitLoss: { lt: 0 },
      }),
    };

    // Handle date filtering with proper timezone handling
    if (startDate || endDate) {
      where.entryDate = {};
      
      if (startDate) {
        // Start of day for startDate
        const startDateTime = new Date(startDate);
        startDateTime.setHours(0, 0, 0, 0);
        where.entryDate.gte = startDateTime;
      }
      
      if (endDate) {
        // End of day for endDate (23:59:59.999) to include all trades from that day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.entryDate.lte = endDateTime;
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.prisma.trade.count({ where });

    // Get trades
    const trades = await this.prisma.trade.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        tags: true,
        portfolio: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      data: trades,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, id: string) {
    const trade = await this.prisma.trade.findUnique({
      where: { id },
      include: {
        tags: true,
        portfolio: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!trade) {
      throw new NotFoundException('Trade not found');
    }

    // Check ownership
    if (trade.userId !== userId) {
      throw new ForbiddenException('You do not have access to this trade');
    }

    return trade;
  }

  async update(userId: string, id: string, updateTradeDto: UpdateTradeDto) {
    // Check if trade exists and user owns it
    await this.findOne(userId, id);

    const { tagIds, ...tradeData } = updateTradeDto;

    // Recalculate P&L if relevant fields are updated (and P&L not provided)
    let updateData: any = { ...tradeData };

    // Use provided P&L if available (from broker import or manual entry)
    if (updateTradeDto.netProfitLoss !== undefined && updateTradeDto.netProfitLoss !== null) {
      updateData.netProfitLoss = Number(updateTradeDto.netProfitLoss);
      if (updateTradeDto.profitLoss !== undefined) {
        updateData.profitLoss = Number(updateTradeDto.profitLoss);
      }
    } else if (
      updateTradeDto.exitPrice !== undefined ||
      updateTradeDto.entryPrice !== undefined ||
      updateTradeDto.quantity !== undefined ||
      updateTradeDto.type !== undefined
    ) {
      // Get current trade data for calculation
      const currentTrade = await this.prisma.trade.findUnique({
        where: { id },
      });

      if (!currentTrade) {
        throw new NotFoundException('Trade not found');
      }

      const entryPrice = updateTradeDto.entryPrice ?? Number(currentTrade.entryPrice);
      const exitPrice = updateTradeDto.exitPrice ?? (currentTrade.exitPrice ? Number(currentTrade.exitPrice) : null);
      const quantity = updateTradeDto.quantity ?? Number(currentTrade.quantity);
      const tradeType = updateTradeDto.type ?? currentTrade.type;
      const commission = updateTradeDto.commission ?? (currentTrade.commission ? Number(currentTrade.commission) : 0);

      if (exitPrice) {
        const priceDiff =
          tradeType === 'LONG'
            ? exitPrice - entryPrice
            : entryPrice - exitPrice;

        const profitLoss = priceDiff * quantity;
        const swap = updateTradeDto.swap ?? (currentTrade.swap ? Number(currentTrade.swap) : 0);
        const netProfitLoss = profitLoss - commission - swap;

        updateData.profitLoss = profitLoss;
        updateData.netProfitLoss = netProfitLoss;
      }
    }

    // Update trade
    const trade = await this.prisma.trade.update({
      where: { id },
      data: {
        ...updateData,
        ...(tagIds && {
          tags: {
            set: tagIds.map((id) => ({ id })),
          },
        }),
      },
      include: {
        tags: true,
        portfolio: true,
      },
    });

    return trade;
  }

  async remove(userId: string, id: string) {
    // Check if trade exists and user owns it
    await this.findOne(userId, id);

    await this.prisma.trade.delete({
      where: { id },
    });

    return { message: 'Trade deleted successfully' };
  }

  // Get trade statistics for a user
  async getStatistics(userId: string) {
    const trades = await this.prisma.trade.findMany({
      where: {
        userId,
        status: 'CLOSED',
        netProfitLoss: { not: null },
      },
    });

    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalProfitLoss: 0,
        averageWin: 0,
        averageLoss: 0,
        profitFactor: 0,
        largestWin: 0,
        largestLoss: 0,
      };
    }

    const winningTrades = trades.filter((t) => Number(t.netProfitLoss) > 0);
    const losingTrades = trades.filter((t) => Number(t.netProfitLoss) < 0);

    const totalProfitLoss = trades.reduce((sum, t) => sum + Number(t.netProfitLoss), 0);
    const totalWins = winningTrades.reduce((sum, t) => sum + Number(t.netProfitLoss), 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + Number(t.netProfitLoss), 0));

    const averageWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
    const averageLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;

    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;

    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
      totalProfitLoss,
      averageWin,
      averageLoss,
      profitFactor: profitFactor === Infinity ? 0 : profitFactor,
      largestWin: winningTrades.length > 0 ? Math.max(...winningTrades.map((t) => Number(t.netProfitLoss))) : 0,
      largestLoss: losingTrades.length > 0 ? Math.min(...losingTrades.map((t) => Number(t.netProfitLoss))) : 0,
    };
  }

  // Bulk create trades (for importing from broker)
  async bulkCreate(userId: string, createTradeDtos: CreateTradeDto[]) {
    const createdTrades: any[] = [];
    
    for (const createTradeDto of createTradeDtos) {
      try {
        const trade = await this.create(userId, createTradeDto);
        createdTrades.push(trade);
      } catch (error) {
        console.error('Failed to create trade:', error);
        // Continue with other trades even if one fails
      }
    }
    
    return createdTrades;
  }
}
