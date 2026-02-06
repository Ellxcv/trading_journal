import React, { useState } from 'react';
import { Plus, Upload, TrendingUp, Activity, DollarSign, Target } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trade, TradeFilters as TradeFiltersType, TradeFormData } from '../types/trade';
import { TradeFilters, TradesTable, TradeDetailModal, TradeFormModal, TradeImport } from '../components/trades';
import { StatCard } from '../components/dashboard';
import { Button, Modal } from '../components/ui';
import { ParsedTrade } from '../utils/tradeParser';
import { tradesApi } from '../services/tradesApi';

export const TradesPage: React.FC = () => {
  const queryClient = useQueryClient();
  
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch trades with filters
  const { data: trades = [], isLoading, error, isFetching } = useQuery({
    queryKey: ['trades', filters],
    queryFn: () => tradesApi.getAll(filters),
    retry: 1,
    staleTime: 30000, // Data stays fresh for 30 seconds
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    placeholderData: (previousData) => previousData, // Keep previous data visible while fetching
  });

  // Create trade mutation
  const createTradeMutation = useMutation({
    mutationFn: tradesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['trades-statistics'] });
      setIsFormModalOpen(false);
    },
    onError: (error: any) => {
      alert(`Failed to create trade: ${error.response?.data?.message || error.message}`);
    },
  });

  // Update trade mutation
  const updateTradeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<TradeFormData> }) =>
      tradesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['trades-statistics'] });
      setIsFormModalOpen(false);
      setIsDetailModalOpen(false);
    },
    onError: (error: any) => {
      alert(`Failed to update trade: ${error.response?.data?.message || error.message}`);
    },
  });

  // Delete trade mutation
  const deleteTradeMutation = useMutation({
    mutationFn: tradesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['trades-statistics'] });
      setIsDetailModalOpen(false);
    },
    onError: (error: any) => {
      alert(`Failed to delete trade: ${error.response?.data?.message || error.message}`);
    },
  });

  // Bulk import mutation
  const bulkImportMutation = useMutation({
    mutationFn: tradesApi.bulkImport,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['trades-statistics'] });
      setIsImportModalOpen(false);
      
      const { summary } = result;
      let message = `Import Summary:\n`;
      message += `✅ Created: ${summary.created} trade(s)\n`;
      if (summary.skipped > 0) {
        message += `⏭️ Skipped: ${summary.skipped} duplicate(s)\n`;
      }
      if (summary.failed > 0) {
        message += `❌ Failed: ${summary.failed} trade(s)\n`;
      }
      message += `\nTotal processed: ${summary.total} trade(s)`;
      
      alert(message);
    },
    onError: (error: any) => {
      alert(`Failed to import trades: ${error.response?.data?.message || error.message}`);
    },
  });


  // Calculate statistics based on filtered trades
  const totalTrades = trades.length;
  const openTrades = trades.filter((t: Trade) => t.status === 'OPEN').length;
  const closedTrades = trades.filter((t: Trade) => t.status === 'CLOSED');
  const winningTrades = closedTrades.filter((t: Trade) => (t.netPnL || 0) > 0).length;
  const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0;
  const totalPnL = trades.reduce((sum: number, t: Trade) => sum + (t.netPnL || 0), 0);

  // Pagination calculations
  const totalPages = Math.ceil(trades.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTrades = trades.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Handlers
  const handleViewTrade = (trade: Trade) => {
    setSelectedTrade(trade);
    setIsDetailModalOpen(true);
  };

  const handleAddTrade = () => {
    setEditingTrade(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setFormMode('edit');
    setIsFormModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleDeleteTrade = (trade: Trade) => {
    if (window.confirm(`Are you sure you want to delete this ${trade.symbol} trade?`)) {
      deleteTradeMutation.mutate(trade.id);
    }
  };

  const handleSubmitTrade = (formData: TradeFormData) => {
    // Transform frontend field names to backend DTO format
    const backendData: any = {
      symbol: formData.symbol,
      type: formData.direction, // Backend: 'type', Frontend: 'direction'
      status: formData.status,
      // Convert datetime-local to full ISO-8601 format
      entryDate: formData.openDate ? new Date(formData.openDate).toISOString() : undefined,
      entryPrice: formData.entryPrice,
      quantity: formData.lots, // Backend: 'quantity', Frontend: 'lots'
    };

    // Add optional fields only if they have values
    if (formData.closeDate) backendData.exitDate = new Date(formData.closeDate).toISOString();
    if (formData.exitPrice !== undefined && formData.exitPrice !== null) backendData.exitPrice = formData.exitPrice;
    if (formData.stopLoss !== undefined && formData.stopLoss !== null) backendData.stopLoss = formData.stopLoss;
    if (formData.takeProfit !== undefined && formData.takeProfit !== null) backendData.takeProfit = formData.takeProfit;
    if (formData.commission !== undefined && formData.commission !== null) backendData.commission = formData.commission;
    if (formData.swap !== undefined && formData.swap !== null) backendData.swap = formData.swap;
    if (formData.portfolioId) backendData.portfolioId = formData.portfolioId;
    
    // Include strategy and notes fields
    if (formData.setup) backendData.strategy = formData.setup;
    if (formData.entryReason) backendData.notes = formData.entryReason;
    if (formData.exitReason) backendData.exitReason = formData.exitReason;
    if (formData.mistakes) backendData.mistakes = formData.mistakes;
    if (formData.lessonsLearned) backendData.lessonsLearned = formData.lessonsLearned;
    
    // For edit mode, preserve existing P&L to prevent recalculation
    if (formMode === 'edit' && editingTrade) {
      if (editingTrade.netPnL !== undefined) backendData.netProfitLoss = editingTrade.netPnL;
      if (editingTrade.grossPnL !== undefined) backendData.profitLoss = editingTrade.grossPnL;
    }

    console.log('Sending to backend:', backendData);

    if (formMode === 'create') {
      createTradeMutation.mutate(backendData);
    } else if (editingTrade) {
      console.log('Updating trade ID:', editingTrade.id);
      updateTradeMutation.mutate({ id: editingTrade.id, data: backendData });
    }
  };

  const handleImportTrades = (parsedTrades: ParsedTrade[]) => {
    // Convert parsed trades to backend DTO format
    const tradesToImport: Partial<TradeFormData>[] = parsedTrades.map((parsed) => ({
      symbol: parsed.symbol,
      type: parsed.direction, // Backend expects 'type' not 'direction'
      status: parsed.closeDate ? 'CLOSED' : 'OPEN',
      entryDate: parsed.openDate, // Backend expects 'entryDate' not 'openDate'
      exitDate: parsed.closeDate, // Backend expects 'exitDate' not 'closeDate'
      entryPrice: parsed.entryPrice,
      exitPrice: parsed.exitPrice,
      stopLoss: parsed.stopLoss,
      takeProfit: parsed.takeProfit,
      quantity: parsed.lots, // Backend expects 'quantity' not 'lots'
      commission: parsed.commission,
      swap: parsed.swap,
      netProfitLoss: parsed.netPnL, // Backend expects 'netProfitLoss' not 'netPnL'
    }));

    bulkImportMutation.mutate(tradesToImport);
  };

  const handleFilterChange = (newFilters: TradeFiltersType) => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[var(--color-text-muted)]">Loading trades...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="text-[var(--color-error)] text-lg">Failed to load trades</div>
        <div className="text-[var(--color-text-muted)] text-sm">
          {(error as any)?.response?.status === 401 
            ? 'Please log in to view your trades'
            : (error as any)?.message || 'An error occurred'}
        </div>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

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
          value={totalTrades.toString()}
          icon={<Activity className="text-[var(--color-primary)]" size={24} />}
          trend={totalTrades > 0 ? 'up' : undefined}
        />
        <StatCard
          title="Open Trades"
          value={openTrades.toString()}
          icon={<Target className="text-[var(--color-warning)]" size={24} />}
        />
        <StatCard
          title="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          icon={<TrendingUp className="text-[var(--color-success)]" size={24} />}
          trend={winRate >= 50 ? 'up' : winRate > 0 ? 'down' : undefined}
        />
        <StatCard
          title="Total P&L"
          value={`$${totalPnL.toFixed(2)}`}
          icon={<DollarSign className="text-[var(--color-accent)]" size={24} />}
          trend={totalPnL > 0 ? 'up' : totalPnL < 0 ? 'down' : undefined}
        />
      </div>

      {/* Filters */}
      <TradeFilters
        filters={filters}
        onFiltersChange={handleFilterChange}
        availableTags={[]}
      />

      {/* Trades Table with Loading Overlay */}
      <div className="relative">
        {isFetching && !isLoading && (
          <div className="absolute inset-0 bg-[var(--color-surface)] bg-opacity-50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-light)] rounded-lg border border-[var(--color-border)]">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--color-primary)] border-t-transparent"></div>
              <span className="text-[var(--color-text-muted)] text-sm">Updating...</span>
            </div>
          </div>
        )}
        <TradesTable
          trades={paginatedTrades}
          onViewTrade={handleViewTrade}
          onEditTrade={handleEditTrade}
          onDeleteTrade={handleDeleteTrade}
        />
      </div>

      {/* Pagination Controls */}
      {trades.length > itemsPerPage &&(
        <div className="glass-card p-4 flex items-center justify-between">
          <div className="text-sm text-[var(--color-text-muted)]">
            Showing {startIndex + 1} to {Math.min(endIndex, trades.length)} of {trades.length} trades
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-[var(--color-surface-light)] hover:bg-[var(--color-surface)] 
                text-[var(--color-text-primary)] rounded-lg transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--color-surface-light)]"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-[var(--color-surface-light)] hover:bg-[var(--color-surface)] text-[var(--color-text-primary)]'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return <span key={page} className="text-[var(--color-text-muted)]">...</span>;
                }
                return null;
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-[var(--color-surface-light)] hover:bg-[var(--color-surface)] 
                text-[var(--color-text-primary)] rounded-lg transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--color-surface-light)]"
            >
              Next
            </button>
          </div>
        </div>
      )}

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
