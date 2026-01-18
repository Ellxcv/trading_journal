import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOverview(userId: string) {
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

    const totalProfitLoss = trades.reduce(
      (sum, t) => sum + Number(t.netProfitLoss),
      0,
    );
    const totalWins = winningTrades.reduce(
      (sum, t) => sum + Number(t.netProfitLoss),
      0,
    );
    const totalLosses = Math.abs(
      losingTrades.reduce((sum, t) => sum + Number(t.netProfitLoss), 0),
    );

    const averageWin =
      winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
    const averageLoss =
      losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;

    const profitFactor =
      totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 0 : 0;

    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate:
        trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
      totalProfitLoss,
      averageWin,
      averageLoss,
      profitFactor,
      largestWin:
        winningTrades.length > 0
          ? Math.max(...winningTrades.map((t) => Number(t.netProfitLoss)))
          : 0,
      largestLoss:
        losingTrades.length > 0
          ? Math.min(...losingTrades.map((t) => Number(t.netProfitLoss)))
          : 0,
    };
  }

  async getPerformanceChart(userId: string) {
    const trades = await this.prisma.trade.findMany({
      where: {
        userId,
        status: 'CLOSED',
        netProfitLoss: { not: null },
      },
      orderBy: {
        exitDate: 'asc',
      },
    });

    let cumulativePnL = 0;
    const chartData = trades.map((trade) => {
      cumulativePnL += Number(trade.netProfitLoss);
      return {
        date: trade.exitDate,
        cumulativePnL,
        tradePnL: Number(trade.netProfitLoss),
      };
    });

    return chartData;
  }

  async getMonthlyPerformance(userId: string) {
    const trades = await this.prisma.trade.findMany({
      where: {
        userId,
        status: 'CLOSED',
        netProfitLoss: { not: null },
      },
    });

    const monthlyData = trades.reduce((acc, trade) => {
      if (!trade.exitDate) return acc;
      const date = new Date(trade.exitDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          pnl: 0,
          trades: 0,
          wins: 0,
          losses: 0,
        };
      }

      acc[monthKey].pnl += Number(trade.netProfitLoss);
      acc[monthKey].trades += 1;

      if (Number(trade.netProfitLoss) > 0) {
        acc[monthKey].wins += 1;
      } else if (Number(trade.netProfitLoss) < 0) {
        acc[monthKey].losses += 1;
      }

      return acc;
    }, {});

    return Object.values(monthlyData).sort((a: any, b: any) =>
      a.month.localeCompare(b.month),
    );
  }
}
