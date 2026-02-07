import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayTradesModal } from './DayTradesModal';
import { Trade as TradeType } from '../../types/trade';

interface CalendarDay {
  date: string;
  dayOfMonth: number;
  pnl: number | null; // null means no trade
  isCurrentMonth: boolean;
}

interface Trade {
  id: string | number;
  closeDate?: string;
  netPnL?: number;
  status: string;
}

interface TradingCalendarProps {
  initialMonth?: number; // 0-11
  initialYear?: number;
  trades?: Trade[]; // Real trade data
  onMonthChange?: (month: number, year: number) => void;
}

export const TradingCalendar: React.FC<TradingCalendarProps> = ({ 
  initialMonth = new Date().getMonth(), 
  initialYear = new Date().getFullYear(),
  trades = [],
  onMonthChange 
}) => {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
      onMonthChange?.(11, currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
      onMonthChange?.(currentMonth - 1, currentYear);
    }
  };

  // Navigate to next month
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
      onMonthChange?.(0, currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
      onMonthChange?.(currentMonth + 1, currentYear);
    }
  };

  // Calculate daily P&L from trades
  const dailyPnL = useMemo(() => {
    const pnlMap: Record<string, number> = {};
    
    trades
      .filter(t => t.status === 'CLOSED' && t.closeDate && t.netPnL !== undefined)
      .forEach(trade => {
        // Use local date instead of UTC to match user's timezone
        const date = new Date(trade.closeDate!);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const closeDate = `${year}-${month}-${day}`;
        
        if (!pnlMap[closeDate]) {
          pnlMap[closeDate] = 0;
        }
        pnlMap[closeDate] += trade.netPnL || 0;
      });
    
    return pnlMap;
  }, [trades]);

  // Generate calendar data for current month
  const generateCalendarData = (): CalendarDay[] => {
    const data: CalendarDay[] = [];
    
    // Get first day of month and total days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    
    // Fill previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(daysInPrevMonth - i).padStart(2, '0')}`;
      
      data.push({
        date: dateStr,
        dayOfMonth: daysInPrevMonth - i,
        pnl: dailyPnL[dateStr] || null,
        isCurrentMonth: false,
      });
    }
    
    // Fill current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      data.push({
        date: dateStr,
        dayOfMonth: day,
        pnl: dailyPnL[dateStr] || null,
        isCurrentMonth: true,
      });
    }
    
    // Fill next month's leading days to complete the grid
    const totalCells = Math.ceil(data.length / 7) * 7;
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    
    for (let day = 1; data.length < totalCells; day++) {
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      data.push({
        date: dateStr,
        dayOfMonth: day,
        pnl: dailyPnL[dateStr] || null,
        isCurrentMonth: false,
      });
    }
    
    return data;
  };

  const calendarData = generateCalendarData();

  const getCellColor = (pnl: number | null) => {
    if (pnl === null) return 'bg-[var(--color-surface-light)]'; // No trade
    if (pnl > 0) return 'bg-[var(--color-success)]/30 border-[var(--color-success)]'; // Profit
    if (pnl < 0) return 'bg-[var(--color-danger)]/30 border-[var(--color-danger)]'; // Loss
    return 'bg-[var(--color-surface-light)]'; // Breakeven
  };

  const getCellTextColor = (pnl: number | null) => {
    if (pnl === null) return 'text-[var(--color-text-muted)]';
    if (pnl > 0) return 'text-[var(--color-success)]';
    if (pnl < 0) return 'text-[var(--color-danger)]';
    return 'text-[var(--color-text-muted)]';
  };

  return (
    <div className="glass-card p-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          Trading Calendar
        </h2>
        
        <div className="flex items-center gap-3">
          {/* Previous month button */}
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg hover:bg-[var(--color-surface-light)] transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} className="text-[var(--color-text-secondary)]" />
          </button>

          {/* Current month/year display */}
          <span className="text-base font-semibold text-[var(--color-text-primary)] min-w-[140px] text-center">
            {monthNames[currentMonth]} {currentYear}
          </span>

          {/* Next month button */}
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-[var(--color-surface-light)] transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={20} className="text-[var(--color-text-secondary)]" />
          </button>
        </div>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-[var(--color-text-muted)] py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarData.map((day, index) => (
          <div
            key={index}
            className={`
              aspect-square rounded-lg border-2 border-transparent
              flex flex-col items-center justify-center
              transition-all duration-200 hover:scale-105
              ${getCellColor(day.pnl)}
              ${day.isCurrentMonth ? 'opacity-100' : 'opacity-30'}
              group cursor-pointer relative
            `}
            onClick={() => day.pnl !== null && setSelectedDate(day.date)}
          >
            <span className={`text-sm font-semibold ${getCellTextColor(day.pnl)}`}>
              {day.dayOfMonth}
            </span>
            {day.pnl !== null && (
              <span className={`text-xs font-medium ${getCellTextColor(day.pnl)} mt-1`}>
                ${Math.abs(day.pnl).toFixed(0)}
              </span>
            )}

            {/* Tooltip on hover */}
            {day.pnl !== null && (
              <div className="
                absolute bottom-full mb-2 px-3 py-2
                bg-[var(--color-surface)] border border-[var(--color-border)]
                rounded-lg shadow-lg
                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                transition-all duration-200
                whitespace-nowrap z-10
                pointer-events-none
              ">
                <p className="text-xs text-[var(--color-text-muted)]">{day.date}</p>
                <p className={`text-sm font-bold ${getCellTextColor(day.pnl)}`}>
                  ${day.pnl.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Day Trades Modal */}
      <DayTradesModal
        isOpen={selectedDate !== null}
        onClose={() => setSelectedDate(null)}
        date={selectedDate || ''}
        trades={(trades as TradeType[]).filter(t => {
          if (!selectedDate || t.status !== 'CLOSED' || !t.closeDate) return false;
          const tradeDate = new Date(t.closeDate);
          const tradeDateStr = `${tradeDate.getFullYear()}-${String(tradeDate.getMonth() + 1).padStart(2, '0')}-${String(tradeDate.getDate()).padStart(2, '0')}`;
          return tradeDateStr === selectedDate;
        })}
      />

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[var(--color-success)]/30 border-2 border-[var(--color-success)]" />
          <span className="text-sm text-[var(--color-text-muted)]">Profit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[var(--color-danger)]/30 border-2 border-[var(--color-danger)]" />
          <span className="text-sm text-[var(--color-text-muted)]">Loss</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[var(--color-surface-light)]" />
          <span className="text-sm text-[var(--color-text-muted)]">No Trade</span>
        </div>
      </div>
    </div>
  );
};
