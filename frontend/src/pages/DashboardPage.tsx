import React from 'react';
import { DollarSign, Target, TrendingUp, BarChart3 } from 'lucide-react';
import { 
  StatCard, 
  CumulativePnLChart, 
  RecentTradesTable, 
  TradingCalendar 
} from '../components/dashboard';

// Mock data - will be replaced with real API calls
const mockStats = {
  netPnL: 5420.50,
  netPnLChange: '+12.5%',
  profitFactor: 2.35,
  winRate: 68.4,
  winRateChange: '+5.2%',
  avgWinLoss: 2.8,
};

const mockChartData = [
  { date: '01/01', pnl: 0 },
  { date: '01/05', pnl: 245.50 },
  { date: '01/10', pnl: 380.20 },
  { date: '01/15', pnl: 520.80 },
  { date: '01/20', pnl: 1240.30 },
  { date: '01/25', pnl: 2150.60 },
  { date: '01/30', pnl: 3420.90 },
  { date: '02/01', pnl: 5420.50 },
];

const mockRecentTrades = [
  { id: 1, closeDate: '2026-01-28', symbol: 'EURUSD', netPnL: 245.50 },
  { id: 2, closeDate: '2026-01-27', symbol: 'GBPUSD', netPnL: -120.30 },
  { id: 3, closeDate: '2026-01-26', symbol: 'USDJPY', netPnL: 380.75 },
  { id: 4, closeDate: '2026-01-25', symbol: 'AUDUSD', netPnL: 156.20 },
  { id: 5, closeDate: '2026-01-24', symbol: 'NZDUSD', netPnL: -89.50 },
  { id: 6, closeDate: '2026-01-23', symbol: 'EURUSD', netPnL: 420.80 },
  { id: 7, closeDate: '2026-01-22', symbol: 'GBPJPY', netPnL: 198.40 },
];

export const DashboardPage: React.FC = () => {
  const handleMonthChange = (month: number, year: number) => {
    console.log(`Calendar navigated to: ${month + 1}/${year}`);
    // In real app, fetch data for this month/year from API
  };

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
            value={`$${mockStats.netPnL.toLocaleString()}`}
            change={mockStats.netPnLChange}
            trend="up"
            icon={<DollarSign size={24} className="text-[var(--color-success)]" />}
          />
          
          <StatCard
            title="Profit Factor"
            value={mockStats.profitFactor.toFixed(2)}
            trend="neutral"
            icon={<Target size={24} className="text-[var(--color-primary)]" />}
          />
          
          <StatCard
            title="Trade Win %"
            value={`${mockStats.winRate}%`}
            change={mockStats.winRateChange}
            trend="up"
            icon={<TrendingUp size={24} className="text-[var(--color-success)]" />}
          />
          
          <StatCard
            title="Avg. Win/Loss"
            value={`${mockStats.avgWinLoss.toFixed(2)}x`}
            trend="neutral"
            icon={<BarChart3 size={24} className="text-[var(--color-primary)]" />}
          />
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[var(--color-border)]" />

      {/* Section: Performance Chart */}
      <section>
        <CumulativePnLChart data={mockChartData} />
      </section>

      {/* Divider */}
      <div className="border-t border-[var(--color-border)]" />

      {/* Section: Recent Activity */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text-muted)] mb-4 uppercase tracking-wide">
          Recent Activity
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <RecentTradesTable trades={mockRecentTrades} />
          <TradingCalendar 
            initialMonth={1} 
            initialYear={2026}
            onMonthChange={handleMonthChange}
          />
        </div>
      </section>
    </div>
  );
};
