import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  TrendingDown,
  Target,
  DollarSign,
  BarChart3,
  Activity,
  Calendar
} from 'lucide-react';
import { tradesApi } from '../services/tradesApi';
import { StatCard } from '../components/dashboard';
import { 
  EquityCurve, 
  MonthlyPnLChart, 
  WinLossDistribution,
  TradeDurationScatter,
  TimeOfDayHeatmap,
  DayOfWeekChart,
  HourTradesModal
} from '../components/analytics';
import { usePortfolio } from '../contexts/PortfolioContext';

type TimePeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';

export const AnalyticsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  // Get selected portfolio from context
  const { selectedPortfolio } = usePortfolio();

  // Fetch all trades (filtered by portfolio if selected)
  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['trades', selectedPortfolio?.id],
    queryFn: () => tradesApi.getAll({ search: '', portfolioId: selectedPortfolio?.id }),
  });

  // Calculate performance metrics based on selected period
  const performanceMetrics = useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        totalReturn: 0,
        winRate: 0,
        profitFactor: 0,
        avgRR: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        totalTrades: 0,
      };
    }

    // Filter trades by period
    const now = new Date();
    const startDate = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate.setFullYear(2000); // Far past date to include all
        break;
    }

    const filteredTrades = trades.filter(trade => {
      const tradeDate = new Date(trade.closeDate || trade.openDate);
      return tradeDate >= startDate;
    });

    const closedTrades = filteredTrades.filter(t => t.status === 'CLOSED');
    
    if (closedTrades.length === 0) {
      return {
        totalReturn: 0,
        winRate: 0,
        profitFactor: 0,
        avgRR: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        totalTrades: 0,
      };
    }

    // Total Return (sum of net P&L)
    const totalReturn = closedTrades.reduce((sum, t) => sum + (Number(t.netPnL) || 0), 0);

    // Win Rate
    const winningTrades = closedTrades.filter(t => (Number(t.netPnL) || 0) > 0);
    const winRate = (winningTrades.length / closedTrades.length) * 100;

    // Profit Factor (gross profit / gross loss)
    const grossProfit = winningTrades.reduce((sum, t) => sum + (Number(t.netPnL) || 0), 0);
    const losingTrades = closedTrades.filter(t => (Number(t.netPnL) || 0) < 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (Number(t.netPnL) || 0), 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;

    // Average R:R (from trades that have both TP and SL)
    const tradesWithRR = closedTrades.filter(t => 
      t.takeProfit !== null && t.stopLoss !== null
    );
    
    let avgRR = 0;
    if (tradesWithRR.length > 0) {
      const totalRR = tradesWithRR.reduce((sum, t) => {
        const entry = Number(t.entryPrice);
        const tp = Number(t.takeProfit);
        const sl = Number(t.stopLoss);
        const reward = Math.abs(tp - entry);
        const risk = Math.abs(entry - sl);
        return sum + (risk > 0 ? reward / risk : 0);
      }, 0);
      avgRR = totalRR / tradesWithRR.length;
    }

    // Max Drawdown (simplified version - consecutive losses)
    let maxDrawdown = 0;
    let currentDrawdown = 0;
    closedTrades.forEach(trade => {
      const pnl = Number(trade.netPnL) || 0;
      if (pnl < 0) {
        currentDrawdown += pnl;
        maxDrawdown = Math.min(maxDrawdown, currentDrawdown);
      } else {
        currentDrawdown = 0;
      }
    });

    // Sharpe Ratio (simplified - using returns std dev)
    const returns = closedTrades.map(t => Number(t.netPnL) || 0);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0; // Annualized

    return {
      totalReturn,
      winRate,
      profitFactor,
      avgRR,
      maxDrawdown,
      sharpeRatio,
      totalTrades: closedTrades.length,
    };
  }, [trades, selectedPeriod]);

  // Get period-filtered trades for modal
  const periodFilteredTrades = useMemo(() => {
    if (!trades || trades.length === 0) return [];
    
    const now = new Date();
    const startDate = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate.setFullYear(2000);
        break;
    }
    
    return trades.filter(trade => {
      const tradeDate = new Date(trade.closeDate || trade.openDate);
      return tradeDate >= startDate;
    });
  }, [trades, selectedPeriod]);

  // Prepare Equity Curve Data
  const equityCurveData = useMemo(() => {
    if (!trades || trades.length === 0) return [];
    
    const closedTrades = trades
      .filter(t => t.status === 'CLOSED' && t.closeDate)
      .sort((a, b) => new Date(a.closeDate!).getTime() - new Date(b.closeDate!).getTime());
    
    let cumulative = 0;
    return closedTrades.map(trade => {
      cumulative += Number(trade.netPnL) || 0;
      return {
        date: new Date(trade.closeDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        equity: cumulative
      };
    });
  }, [trades]);

  // Prepare Monthly P&L Data
  const monthlyPnLData = useMemo(() => {
    if (!trades || trades.length === 0) return [];
    
    const monthlyData = new Map<string, { pnl: number; trades: number }>();
    
    trades
      .filter(t => t.status === 'CLOSED' && t.closeDate)
      .forEach(trade => {
        const date = new Date(trade.closeDate!);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const existing = monthlyData.get(monthKey) || { pnl: 0, trades: 0 };
        monthlyData.set(monthKey, {
          pnl: existing.pnl + (Number(trade.netPnL) || 0),
          trades: existing.trades + 1
        });
      });
    
    return Array.from(monthlyData.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12) // Last 12 months
      .map(([key, data]) => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          pnl: data.pnl,
          trades: data.trades
        };
      });
  }, [trades]);

  // Prepare Win/Loss Distribution Data
  const winLossDistributionData = useMemo(() => {
    if (!trades || trades.length === 0) return [];
    
    const closedTrades = trades.filter(t => t.status === 'CLOSED');
    const total = closedTrades.length;
    
    if (total === 0) return [];
    
    // Define P&L ranges
    const ranges = [
      { min: -Infinity, max: -1000, label: '< -$1000' },
      { min: -1000, max: -500, label: '-$1000 to -$500' },
      { min: -500, max: -100, label: '-$500 to -$100' },
      { min: -100, max: -10, label: '-$100 to -$10' },
      { min: -10, max: 0, label: '-$10 to $0' },
      { min: 0, max: 10, label: '$0 to $10' },
      { min: 10, max: 100, label: '$10 to $100' },
      { min: 100, max: 500, label: '$100 to $500' },
      { min: 500, max: 1000, label: '$500 to $1000' },
      { min: 1000, max: Infinity, label: '> $1000' },
    ];
    
    return ranges.map(range => {
      const count = closedTrades.filter(t => {
        const pnl = Number(t.netPnL) || 0;
        return pnl > range.min && pnl <= range.max;
      }).length;
      
      return {
        range: range.label,
        count,
        percentage: (count / total) * 100
      };
    }).filter(item => item.count > 0); // Only show ranges with data
  }, [trades]);

  // Prepare Trade Duration Data
  const tradeDurationData = useMemo(() => {
    if (!trades || trades.length === 0) return [];
    
    return trades
      .filter(t => t.status === 'CLOSED' && t.openDate && t.closeDate)
      .map(trade => {
        const openTime = new Date(trade.openDate).getTime();
        const closeTime = new Date(trade.closeDate!).getTime();
        const durationHours = (closeTime - openTime) / (1000 * 60 * 60);
        
        return {
          duration: durationHours,
          pnl: Number(trade.netPnL) || 0,
          symbol: trade.symbol
        };
      });
  }, [trades]);

  // Prepare Time of Day Data
  const timeOfDayData = useMemo(() => {
    if (!trades || trades.length === 0) return [];
    
    // Initialize all 24 hours
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      trades: 0,
      totalPnL: 0,
      avgPnL: 0
    }));
    
    trades
      .filter(t => t.status === 'CLOSED' && t.openDate)
      .forEach(trade => {
        const hour = new Date(trade.openDate).getHours();
        hourlyData[hour].trades++;
        hourlyData[hour].totalPnL += Number(trade.netPnL) || 0;
      });
    
    // Calculate averages
    hourlyData.forEach(data => {
      if (data.trades > 0) {
        data.avgPnL = data.totalPnL / data.trades;
      }
    });
    
    return hourlyData;
  }, [trades]);

  // Prepare Day of Week Data
  const dayOfWeekData = useMemo(() => {
    if (!trades || trades.length === 0) return [];
    
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const weeklyData = daysOfWeek.map((day, index) => ({
      day,
      dayIndex: index,
      trades: 0,
      totalPnL: 0,
      avgPnL: 0
    }));
    
    trades
      .filter(t => t.status === 'CLOSED' && t.openDate)
      .forEach(trade => {
        const dayIndex = new Date(trade.openDate).getDay();
        weeklyData[dayIndex].trades++;
        weeklyData[dayIndex].totalPnL += Number(trade.netPnL) || 0;
      });
    
    // Calculate averages
    weeklyData.forEach(data => {
      if (data.trades > 0) {
        data.avgPnL = data.totalPnL / data.trades;
      }
    });
    
    return weeklyData.filter(d => d.trades > 0); // Only show days with trades
  }, [trades]);

  const periodOptions: { value: TimePeriod; label: string }[] = [
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'quarter', label: 'Last 3 Months' },
    { value: 'year', label: 'Last Year' },
    { value: 'all', label: 'All Time' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[var(--color-text-muted)]">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Analytics</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            Detailed performance analytics and insights
          </p>
        </div>
      </div>

      {/* Performance Overview Section */}
      <div className="glass-card p-6 space-y-6">
        {/* Section Header with Time Period Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-[var(--color-primary)]" size={24} />
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
              Performance Overview
            </h2>
          </div>

          {/* Time Period Selector */}
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[var(--color-text-muted)]" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as TimePeriod)}
              className="px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg
                text-[var(--color-text-primary)] text-sm font-medium
                focus:outline-none focus:border-[var(--color-primary)] transition-colors cursor-pointer"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Total Return */}
          <StatCard
            title="Total Return"
            value={`$${performanceMetrics.totalReturn.toFixed(2)}`}
            icon={<DollarSign className="text-[var(--color-primary)]" size={24} />}
            trend={performanceMetrics.totalReturn >= 0 ? 'up' : 'down'}
          />

          {/* Win Rate */}
          <StatCard
            title="Win Rate"
            value={`${performanceMetrics.winRate.toFixed(1)}%`}
            icon={<Target className="text-[var(--color-success)]" size={24} />}
            trend={performanceMetrics.winRate >= 50 ? 'up' : performanceMetrics.winRate > 0 ? 'down' : undefined}
          />

          {/* Profit Factor */}
          <StatCard
            title="Profit Factor"
            value={performanceMetrics.profitFactor >= 999 ? '∞' : performanceMetrics.profitFactor.toFixed(2)}
            icon={<TrendingUp className="text-[var(--color-accent)]" size={24} />}
            trend={performanceMetrics.profitFactor >= 1.5 ? 'up' : performanceMetrics.profitFactor >= 1 ? undefined : 'down'}
          />

          {/* Average R:R */}
          <StatCard
            title="Avg R:R"
            value={performanceMetrics.avgRR > 0 ? `1:${performanceMetrics.avgRR.toFixed(2)}` : 'N/A'}
            icon={<Activity className="text-[var(--color-warning)]" size={24} />}
            trend={performanceMetrics.avgRR >= 2 ? 'up' : performanceMetrics.avgRR >= 1 ? undefined : 'down'}
          />

          {/* Max Drawdown */}
          <StatCard
            title="Max Drawdown"
            value={`$${Math.abs(performanceMetrics.maxDrawdown).toFixed(2)}`}
            icon={<TrendingDown className="text-[var(--color-danger)]" size={24} />}
            trend={performanceMetrics.maxDrawdown === 0 ? undefined : 'down'}
          />

          {/* Sharpe Ratio */}
          <StatCard
            title="Sharpe Ratio"
            value={performanceMetrics.sharpeRatio.toFixed(2)}
            icon={<BarChart3 className="text-[var(--color-info)]" size={24} />}
            trend={performanceMetrics.sharpeRatio >= 1 ? 'up' : performanceMetrics.sharpeRatio >= 0 ? undefined : 'down'}
          />
        </div>

        {/* Summary Info */}
        <div className="pt-4 border-t border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-text-muted)]">
            Based on <span className="font-semibold text-[var(--color-text-primary)]">
              {performanceMetrics.totalTrades}
            </span> closed trades in the selected period
          </p>
        </div>
      </div>

      {/* Charts & Visualizations Section */}
      <div className="glass-card p-6 space-y-6">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          📊 Charts & Visualizations
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Equity Curve */}
          <div className="glass-card p-6">
            <EquityCurve data={equityCurveData} />
          </div>

          {/* Monthly P&L */}
          <div className="glass-card p-6">
            <MonthlyPnLChart data={monthlyPnLData} />
          </div>
        </div>

        {/* Win/Loss Distribution - Full Width */}
        <div className="glass-card p-6">
          <WinLossDistribution data={winLossDistributionData} />
        </div>
      </div>

      {/* Time & Duration Analysis Section */}
      <div className="glass-card p-6 space-y-6">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          ⏰ Time & Duration Analysis
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trade Duration Scatter */}
          <div className="glass-card p-6">
            <TradeDurationScatter data={tradeDurationData} />
          </div>

          {/* Time of Day Heatmap */}
          <div className="glass-card p-6">
            <TimeOfDayHeatmap 
              data={timeOfDayData} 
              onHourClick={(hour) => setSelectedHour(hour)}
            />
          </div>
        </div>

        {/* Day of Week - Full Width */}
        <div className="glass-card p-6">
          <DayOfWeekChart data={dayOfWeekData} />
        </div>
      </div>

      {/* Hour Trades Modal */}
      <HourTradesModal
        isOpen={selectedHour !== null}
        onClose={() => setSelectedHour(null)}
        hour={selectedHour ?? 0}
        trades={selectedHour !== null ? periodFilteredTrades.filter((trade: any) => {
          const hour = new Date(trade.openDate).getHours();
          return hour === selectedHour;
        }) : []}
      />
    </div>
  );
};
