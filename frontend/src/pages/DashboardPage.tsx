import React, { useMemo } from 'react';
import { DollarSign, Target, TrendingUp, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { 
  StatCard, 
  CumulativePnLChart, 
  RecentTradesTable, 
  TradingCalendar,
  DailyPnLHistogram
} from '../components/dashboard';
import { tradesApi } from '../services/tradesApi';
import { Trade } from '../types/trade';
import { usePortfolio } from '../contexts/PortfolioContext';

export const DashboardPage: React.FC = () => {
  // Get selected portfolio from context
  const { selectedPortfolio } = usePortfolio();

  // Fetch all trades (filtered by portfolio if selected)
  const { data: trades = [], isLoading: tradesLoading } = useQuery({
    queryKey: ['trades', selectedPortfolio?.id],
    queryFn: () => tradesApi.getAll({ search: '', portfolioId: selectedPortfolio?.id }),
    retry: 1,
  });

  // Fetch statistics (filtered by portfolio if selected)
  const { data: statistics, isLoading: statsLoading } = useQuery({
    queryKey: ['trades-statistics', selectedPortfolio?.id],
    queryFn: () => tradesApi.getStatistics({ portfolioId: selectedPortfolio?.id }),
    retry: 1,
  });

  // Calculate cumulative P&L chart data
  const chartData = useMemo(() => {
    const closedTrades = trades
      .filter((t: Trade) => t.status === 'CLOSED' && t.closeDate && t.netPnL !== undefined)
      .sort((a: Trade, b: Trade) => new Date(a.closeDate!).getTime() - new Date(b.closeDate!).getTime());

    if (closedTrades.length === 0) {
      return [{ date: 'No data', pnl: 0 }];
    }

    let cumulativePnL = 0;
    return closedTrades.map((trade: Trade) => {
      cumulativePnL += trade.netPnL || 0;
      const date = new Date(trade.closeDate!);
      return {
        date: `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`,
        pnl: Number(cumulativePnL.toFixed(2)),
      };
    });
  }, [trades]);

  // Get recent trades (last 7 closed trades)
  const recentTrades = useMemo(() => {
    return trades
      .filter((t: Trade) => t.status === 'CLOSED' && t.closeDate)
      .sort((a: Trade, b: Trade) => new Date(b.closeDate!).getTime() - new Date(a.closeDate!).getTime())
      .slice(0, 7)
      .map((t: Trade) => ({
        id: t.id,
        closeDate: t.closeDate!,
        symbol: t.symbol,
        netPnL: t.netPnL || 0,
      }));
  }, [trades]);


  // Calculate additional statistics
  const stats = useMemo(() => {
    const closedTrades = trades.filter((t: Trade) => t.status === 'CLOSED' && t.netPnL !== undefined);
    const winningTrades = closedTrades.filter((t: Trade) => (t.netPnL || 0) > 0);
    const losingTrades = closedTrades.filter((t: Trade) => (t.netPnL || 0) < 0);

    const totalWins = winningTrades.reduce((sum, t: Trade) => sum + (t.netPnL || 0), 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, t: Trade) => sum + (t.netPnL || 0), 0));
    const avgWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;

    return {
      netPnL: statistics?.totalPnL || 0,
      profitFactor: statistics?.profitFactor || 0,
      winRate: statistics?.winRate || 0,
      avgWinLoss: avgLoss > 0 ? avgWin / avgLoss : 0,
    };
  }, [trades, statistics]);

  const handleMonthChange = (month: number, year: number) => {
    console.log(`Calendar navigated to: ${month + 1}/${year}`);
    // In real app, fetch data for this month/year from API
  };

  if (tradesLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[var(--color-text-muted)]">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Section: Key Metrics */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text-muted)] mb-4 uppercase tracking-wide">
          Key Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Net P&L"
            value={`$${stats.netPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            trend={stats.netPnL > 0 ? 'up' : stats.netPnL < 0 ? 'down' : 'neutral'}
            icon={<DollarSign size={24} className="text-[var(--color-success)]" />}
          />
          
          <StatCard
            title="Profit Factor"
            value={stats.profitFactor.toFixed(2)}
            trend={stats.profitFactor > 1.5 ? 'up' : stats.profitFactor > 0 ? 'neutral' : 'down'}
            icon={<Target size={24} className="text-[var(--color-primary)]" />}
          />
          
          <StatCard
            title="Trade Win %"
            value={`${stats.winRate.toFixed(1)}%`}
            trend={stats.winRate >= 50 ? 'up' : stats.winRate > 0 ? 'neutral' : 'down'}
            icon={<TrendingUp size={24} className="text-[var(--color-success)]" />}
          />
          
          <StatCard
            title="Avg. Win/Loss"
            value={`${stats.avgWinLoss.toFixed(2)}x`}
            trend={stats.avgWinLoss > 2 ? 'up' : stats.avgWinLoss > 0 ? 'neutral' : 'down'}
            icon={<BarChart3 size={24} className="text-[var(--color-primary)]" />}
          />
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[var(--color-border)]" />

      {/* Section: Performance Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CumulativePnLChart data={chartData} />
        <DailyPnLHistogram trades={trades} daysToShow={14} />
      </section>

      {/* Divider */}
      <div className="border-t border-[var(--color-border)]" />

      {/* Section: Recent Activity */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text-muted)] mb-4 uppercase tracking-wide">
          Recent Activity
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <RecentTradesTable trades={recentTrades} />
          <TradingCalendar 
            initialMonth={new Date().getMonth()} 
            initialYear={new Date().getFullYear()}
            trades={trades}
            onMonthChange={handleMonthChange}
          />
        </div>
      </section>
    </div>
  );
};
