import React, { useState } from 'react';
import { Plus, Upload, TrendingUp, TrendingDown, Activity, DollarSign, Target } from 'lucide-react';
import { Trade, TradeFilters as TradeFiltersType, TradeFormData } from '../types/trade';
import { TradeFilters, TradesTable, TradeDetailModal, TradeFormModal, TradeImport } from '../components/trades';
import { StatCard } from '../components/dashboard';
import { Button, Modal } from '../components/ui';
import { ParsedTrade } from '../utils/tradeParser';

// Mock data - will be replaced with real API calls
const mockTrades: Trade[] = [
  {
    id: 1,
    symbol: 'EURUSD',
    direction: 'LONG',
    status: 'CLOSED',
    openDate: '2026-01-28T09:30:00',
    closeDate: '2026-01-28T15:45:00',
    entryPrice: 1.08450,
    exitPrice: 1.08720,
    stopLoss: 1.08200,
    takeProfit: 1.08800,
    lots: 0.10,
    commission: 5.00,
    swap: 0,
    grossPnL: 270.00,
    netPnL: 265.00,
    pnlPercentage: 24.42,
    riskRewardRatio: 1.4,
    pips: 27.0,
    setup: 'Breakout',
    entryReason: 'Clean breakout above resistance with strong momentum',
    exitReason: 'Hit target at previous high',
    tags: ['Scalp', 'Trend'],
    createdAt: '2026-01-28T09:30:00',
    updatedAt: '2026-01-28T15:45:00',
  },
  {
    id: 2,
    symbol: 'GBPUSD',
    direction: 'SHORT',
    status: 'CLOSED',
    openDate: '2026-01-27T14:15:00',
    closeDate: '2026-01-27T16:30:00',
    entryPrice: 1.27850,
    exitPrice: 1.27950,
    stopLoss: 1.28100,
    takeProfit: 1.27500,
    lots: 0.15,
    commission: 7.50,
    swap: -2.50,
    grossPnL: -150.00,
    netPnL: -160.00,
    pnlPercentage: -11.76,
    riskRewardRatio: 0.4,
    pips: -10.0,
    setup: 'Reversal',
    entryReason: 'Double top formation at resistance',
    exitReason: 'Stop loss hit - trend too strong',
    mistakes: 'Traded against the trend, should have waited for confirmation',
    lessonsLearned: 'Never trade reversals in strong trends without multiple confirmations',
    tags: ['Loss', 'Reversal'],
    createdAt: '2026-01-27T14:15:00',
    updatedAt: '2026-01-27T16:30:00',
  },
  {
    id: 3,
    symbol: 'USDJPY',
    direction: 'LONG',
    status: 'OPEN',
    openDate: '2026-01-31T08:00:00',
    entryPrice: 149.250,
    stopLoss: 148.900,
    takeProfit: 150.000,
    lots: 0.20,
    setup: 'Pullback',
    entryReason: 'Pullback to support in uptrend, bullish engulfing candle',
    tags: ['Open', 'Swing'],
    createdAt: '2026-01-31T08:00:00',
    updatedAt: '2026-01-31T08:00:00',
  },
  {
    id: 4,
    symbol: 'AUDUSD',
    direction: 'LONG',
    status: 'CLOSED',
    openDate: '2026-01-26T11:00:00',
    closeDate: '2026-01-26T17:20:00',
    entryPrice: 0.64850,
    exitPrice: 0.65120,
    stopLoss: 0.64600,
    takeProfit: 0.65200,
    lots: 0.12,
    commission: 6.00,
    swap: 0,
    grossPnL: 324.00,
    netPnL: 318.00,
    pnlPercentage: 41.60,
    riskRewardRatio: 1.08,
    pips: 27.0,
    setup: 'Channel Trading',
    entryReason: 'Bounce from bottom of ascending channel',
    exitReason: '90% of target reached, secured profit',
    tags: ['Swing', 'Channel'],
    createdAt: '2026-01-26T11:00:00',
    updatedAt: '2026-01-26T17:20:00',
  },
  {
    id: 5,
    symbol: 'NZDUSD',
    direction: 'SHORT',
    status: 'CLOSED',
    openDate: '2026-01-25T13:45:00',
    closeDate: '2026-01-25T14:30:00',
    entryPrice: 0.58950,
    exitPrice: 0.58880,
    stopLoss: 0.59100,
    takeProfit: 0.58600,
    lots: 0.08,
    commission: 4.00,
    swap: 0,
    grossPnL: 56.00,
    netPnL: 52.00,
    pnlPercentage: 11.86,
    riskRewardRatio: 0.47,
    pips: 7.0,
    setup: 'Scalp',
    entryReason: 'Quick scalp on rejection from resistance',
    exitReason: 'Partial target hit, trend weakening',
    tags: ['Scalp', 'Quick'],
    createdAt: '2026-01-25T13:45:00',
    updatedAt: '2026-01-25T14:30:00',
  },
];

export const TradesPage: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>(mockTrades);
  const [filters, setFilters] = useState<TradeFiltersType>({
    search: '',
    status: 'ALL',
    direction: 'ALL',
    profitLoss: 'ALL',
    tags: [],
  });
  
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  // Filter trades based on filters
  const filteredTrades = trades.filter(trade => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        trade.symbol.toLowerCase().includes(searchLower) ||
        trade.entryReason?.toLowerCase().includes(searchLower) ||
        trade.exitReason?.toLowerCase().includes(searchLower) ||
        trade.tags?.some(tag => tag.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status !== 'ALL' && trade.status !== filters.status) {
      return false;
    }

    // Direction filter
    if (filters.direction !== 'ALL' && trade.direction !== filters.direction) {
      return false;
    }

    // Profit/Loss filter
    if (filters.profitLoss !== 'ALL') {
      if (filters.profitLoss === 'PROFIT' && (!trade.netPnL || trade.netPnL <= 0)) {
        return false;
      }
      if (filters.profitLoss === 'LOSS' && (!trade.netPnL || trade.netPnL >= 0)) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateFrom) {
      const tradeDate = new Date(trade.closeDate || trade.openDate);
      const fromDate = new Date(filters.dateFrom);
      if (tradeDate < fromDate) return false;
    }

    if (filters.dateTo) {
      const tradeDate = new Date(trade.closeDate || trade.openDate);
      const toDate = new Date(filters.dateTo);
      if (tradeDate > toDate) return false;
    }

    return true;
  });

  // Calculate quick stats
  const stats = {
    totalTrades: filteredTrades.length,
    openTrades: filteredTrades.filter(t => t.status === 'OPEN').length,
    winningTrades: filteredTrades.filter(t => t.netPnL && t.netPnL > 0).length,
    totalPnL: filteredTrades.reduce((sum, t) => sum + (t.netPnL || 0), 0),
  };

  const winRate = stats.totalTrades > 0 
    ? ((stats.winningTrades / filteredTrades.filter(t => t.status === 'CLOSED').length) * 100) 
    : 0;

  // Handlers
  const handleViewTrade = (trade: Trade) => {
    setSelectedTrade(trade);
    setIsDetailModalOpen(true);
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setFormMode('edit');
    setIsFormModalOpen(true);
  };

  const handleDeleteTrade = (trade: Trade) => {
    setTrades(trades.filter(t => t.id !== trade.id));
  };

  const handleAddTrade = () => {
    setEditingTrade(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleSubmitTrade = (formData: TradeFormData) => {
    if (formMode === 'create') {
      // Create new trade
      const newTrade: Trade = {
        id: Math.max(...trades.map(t => t.id), 0) + 1,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTrades([newTrade, ...trades]);
    } else if (editingTrade) {
      // Update existing trade
      setTrades(trades.map(t => 
        t.id === editingTrade.id 
          ? { ...t, ...formData, updatedAt: new Date().toISOString() }
          : t
      ));
    }
  };

  const handleImportTrades = (parsedTrades: ParsedTrade[]) => {
    // Convert parsed trades to Trade objects
    const newTrades: Trade[] = parsedTrades.map((parsed, index) => ({
      id: Math.max(...trades.map(t => t.id), 0) + index + 1,
      symbol: parsed.symbol,
      direction: parsed.direction,
      status: parsed.closeDate ? 'CLOSED' : 'OPEN',
      openDate: parsed.openDate,
      closeDate: parsed.closeDate,
      entryPrice: parsed.entryPrice,
      exitPrice: parsed.exitPrice,
      stopLoss: parsed.stopLoss,
      takeProfit: parsed.takeProfit,
      lots: parsed.lots,
      commission: parsed.commission,
      swap: parsed.swap,
      netPnL: parsed.netPnL,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    setTrades([...newTrades, ...trades]);
    setIsImportModalOpen(false);
    
    // Show success message (in real app, use toast notification)
    alert(`Successfully imported ${newTrades.length} trade(s)!`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[var(--color-text-muted)] text-sm">
            Manage and track all your trades
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setIsImportModalOpen(true)}>
            <Upload size={18} />
            Import from Broker
          </Button>
          <Button variant="primary" onClick={handleAddTrade}>
            <Plus size={18} />
            Add New Trade
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Trades"
          value={stats.totalTrades}
          icon={<Activity size={20} className="text-[var(--color-primary)]" />}
        />
        
        <StatCard
          title="Open Trades"
          value={stats.openTrades}
          icon={<TrendingUp size={20} className="text-[var(--color-primary)]" />}
        />
        
        <StatCard
          title="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          trend={winRate >= 50 ? 'up' : 'down'}
          change={winRate >= 50 ? `+${(winRate - 50).toFixed(1)}%` : `${(winRate - 50).toFixed(1)}%`}
          icon={<Target size={20} className={winRate >= 50 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'} />}
        />
        
        <StatCard
          title="Total P&L"
          value={`$${stats.totalPnL.toFixed(2)}`}
          trend={stats.totalPnL >= 0 ? 'up' : 'down'}
          change={stats.totalPnL >= 0 ? `+${stats.totalPnL.toFixed(2)}` : `${stats.totalPnL.toFixed(2)}`}
          icon={<DollarSign size={20} className={stats.totalPnL >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'} />}
        />
      </div>

      {/* Filters */}
      <TradeFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableTags={['Scalp', 'Swing', 'Trend', 'Reversal', 'Breakout', 'Channel']}
      />

      {/* Trades Table */}
      <TradesTable
        trades={filteredTrades}
        onViewTrade={handleViewTrade}
        onEditTrade={handleEditTrade}
        onDeleteTrade={handleDeleteTrade}
      />

      {/* Trade Detail Modal */}
      <TradeDetailModal
        trade={selectedTrade}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={handleEditTrade}
        onDelete={handleDeleteTrade}
      />

      {/* Trade Form Modal */}
      <TradeFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSubmitTrade}
        initialData={editingTrade || undefined}
        mode={formMode}
      />

      {/* Import Modal */}
      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} size="xl">
        <TradeImport
          onImport={handleImportTrades}
          onCancel={() => setIsImportModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
