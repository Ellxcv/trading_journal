import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioDto, UpdatePortfolioDto } from './dto';
import { AccountType } from '@prisma/client';

@Injectable()
export class PortfoliosService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePortfolioDto) {
    const portfolio = await this.prisma.portfolio.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        initialBalance: dto.initialBalance,
        currentBalance: dto.initialBalance, // Start with initial balance
        currency: dto.currency || 'USD',
        accountType: dto.accountType || AccountType.DEMO,
      },
      include: {
        _count: {
          select: { trades: true },
        },
      },
    });

    return portfolio;
  }

  async findAll(userId: string, accountType?: AccountType) {
    const where: any = { userId };
    
    if (accountType) {
      where.accountType = accountType;
    }

    const portfolios = await this.prisma.portfolio.findMany({
      where,
      include: {
        _count: {
          select: { trades: true },
        },
        trades: {
          select: {
            netProfitLoss: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate current balance from trades P&L
    return portfolios.map(portfolio => {
      const totalPnL = portfolio.trades
        .filter(t => t.status === 'CLOSED')
        .reduce((sum, t) => sum + (t.netProfitLoss?.toNumber() || 0), 0);
      
      const currentBalance = portfolio.initialBalance.toNumber() + totalPnL;

      // Return portfolio with calculated currentBalance
      const { trades, ...portfolioData } = portfolio;
      return {
        ...portfolioData,
        currentBalance,
        _count: portfolio._count,
      };
    });
  }

  async findOne(userId: string, id: string) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id },
      include: {
        _count: {
          select: { trades: true },
        },
        trades: {
          select: {
            id: true,
            symbol: true,
            type: true,
            status: true,
            entryDate: true,
            exitDate: true,
            netProfitLoss: true,
          },
          orderBy: {
            entryDate: 'desc',
          },
          take: 10, // Last 10 trades
        },
      },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    if (portfolio.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return portfolio;
  }

  async update(userId: string, id: string, dto: UpdatePortfolioDto) {
    // Check ownership
    const existing = await this.prisma.portfolio.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Portfolio not found');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const portfolio = await this.prisma.portfolio.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        initialBalance: dto.initialBalance,
        currentBalance: dto.currentBalance,
        currency: dto.currency,
        accountType: dto.accountType,
      },
      include: {
        _count: {
          select: { trades: true },
        },
      },
    });

    return portfolio;
  }

  async remove(userId: string, id: string) {
    // Check ownership
    const existing = await this.prisma.portfolio.findUnique({
      where: { id },
      include: {
        _count: {
          select: { trades: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Portfolio not found');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Prevent deletion if portfolio has trades
    if (existing._count.trades > 0) {
      throw new ForbiddenException(
        `Cannot delete portfolio with ${existing._count.trades} assigned trade(s). Please reassign or delete the trades first.`
      );
    }

    await this.prisma.portfolio.delete({
      where: { id },
    });

    return { message: 'Portfolio deleted successfully' };
  }

  // Calculate portfolio statistics
  async getStats(userId: string, id: string) {
    const portfolio = await this.findOne(userId, id);

    const trades = await this.prisma.trade.findMany({
      where: {
        portfolioId: id,
        status: 'CLOSED',
      },
    });

    // Calculate statistics from trades
    const totalTrades = trades.length;
    const winningTrades = trades.filter(t => Number(t.netProfitLoss) > 0);
    const losingTrades = trades.filter(t => Number(t.netProfitLoss) < 0);
    const totalPnL = trades.reduce((sum, t) => sum + Number(t.netProfitLoss || 0), 0);
    const totalGrossPnL = trades.reduce((sum, t) => sum + Number(t.profitLoss || 0), 0);
    const totalCommission = trades.reduce((sum, t) => sum + Number(t.commission || 0), 0);
    
    const totalWins = winningTrades.reduce((sum, t) => sum + Number(t.netProfitLoss), 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + Number(t.netProfitLoss), 0));
    
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : (totalWins > 0 ? Infinity : 0);

    // Calculate current balance = initial balance + total P&L
    const currentBalance = Number(portfolio.initialBalance) + totalPnL;

    return {
      portfolio: {
        ...portfolio,
        currentBalance, // Use calculated balance instead of stored value
      },
      stats: {
        totalTrades,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        winRate: totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0,
        totalPnL: Math.round(totalPnL * 100) / 100,
        totalGrossPnL: Math.round(totalGrossPnL * 100) / 100,
        totalCommission: Math.round(totalCommission * 100) / 100,
        profitFactor: profitFactor === Infinity ? 'Infinity' : Math.round(profitFactor * 100) / 100,
        averagePnL: totalTrades > 0 ? Math.round((totalPnL / totalTrades) * 100) / 100 : 0,
      },
    };
  }

  // Bulk assign unassigned trades to a portfolio
  async assignUnassignedTrades(userId: string, portfolioId: string) {
    // Verify ownership
    const portfolio = await this.findOne(userId, portfolioId);

    // Get count of unassigned trades
    const unassignedCount = await this.prisma.trade.count({
      where: {
        userId,
        portfolioId: null,
      },
    });

    if (unassignedCount === 0) {
      return {
        message: 'No unassigned trades found',
        count: 0,
      };
    }

    // Update all unassigned trades
    const result = await this.prisma.trade.updateMany({
      where: {
        userId,
        portfolioId: null,
      },
      data: {
        portfolioId,
      },
    });

    return {
      message: `Successfully assigned ${result.count} trades to ${portfolio.name}`,
      count: result.count,
    };
  }

  // Get count of unassigned trades for user
  async getUnassignedTradesCount(userId: string) {
    const count = await this.prisma.trade.count({
      where: {
        userId,
        portfolioId: null,
      },
    });
    return { count };
  }

  // Move all trades from one portfolio to another
  async moveTradesTo(userId: string, fromPortfolioId: string, toPortfolioId: string) {
    // Verify ownership of both portfolios
    const fromPortfolio = await this.findOne(userId, fromPortfolioId);
    const toPortfolio = await this.findOne(userId, toPortfolioId);

    // Get count of trades to be moved
    const tradeCount = await this.prisma.trade.count({
      where: {
        userId,
        portfolioId: fromPortfolioId,
      },
    });

    if (tradeCount === 0) {
      return {
        message: 'No trades to move',
        count: 0,
      };
    }

    // Move all trades
    const result = await this.prisma.trade.updateMany({
      where: {
        userId,
        portfolioId: fromPortfolioId,
      },
      data: {
        portfolioId: toPortfolioId,
      },
    });

    return {
      message: `Successfully moved ${result.count} trade(s) from ${fromPortfolio.name} to ${toPortfolio.name}`,
      count: result.count,
    };
  }
}
