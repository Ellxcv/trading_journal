/**
 * Parser for MetaTrader HTML export files
 * Parses trading history from MT4 and MT5 HTML exports
 * MT4: "Closed Transactions" table with Ticket/Open Time headers
 * MT5: "Positions" section with Time/Position/Symbol headers
 */

export interface ParsedTrade {
  symbol: string;
  direction: 'LONG' | 'SHORT';
  openDate: string;
  closeDate?: string;
  entryPrice: number;
  exitPrice?: number;
  lots: number;
  commission?: number;
  swap?: number;
  netPnL?: number;
  stopLoss?: number;
  takeProfit?: number;
}

export class TradeHTMLParser {
  /**
   * Parse HTML content from MetaTrader export
   */
  static parseHTML(htmlContent: string): ParsedTrade[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Auto-detect MT5 vs MT4 format
    const pageText = doc.body?.textContent || '';
    const isMT5 = pageText.includes('Trade History Report') || pageText.includes('Positions');
    
    if (isMT5) {
      const mt5Trades = this.parseMT5HTML(doc);
      if (mt5Trades.length > 0) return mt5Trades;
    }
    
    // Fall back to MT4 parsing
    return this.parseMT4HTML(doc);
  }
  
  /**
   * Parse MT4 HTML format ("Closed Transactions" section)
   */
  private static parseMT4HTML(doc: Document): ParsedTrade[] {
    const trades: ParsedTrade[] = [];
    const tables = doc.querySelectorAll('table');
    
    for (const table of Array.from(tables)) {
      const rows = Array.from(table.querySelectorAll('tr'));
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const headerText = row.textContent?.trim() || '';
        
        // Find header row for closed transactions
        if (headerText.includes('Ticket') && headerText.includes('Open Time')) {
          for (let j = i + 1; j < rows.length; j++) {
            const dataRow = rows[j];
            const cells = Array.from(dataRow.querySelectorAll('td'))
              .map(cell => cell.textContent?.trim() || '');
            
            if (cells.length < 10) continue;
            if (cells[0] === '' || cells[0] === '\u00a0') continue;
            if (cells.some(cell => cell.includes('Closed P/L') || cell.includes('No transactions'))) break;
            
            try {
              const trade = this.parseMetaTraderRow(cells);
              if (trade) trades.push(trade);
            } catch (error) {
              console.warn('Failed to parse MT4 row:', error);
              continue;
            }
          }
          break;
        }
      }
    }
    
    return trades;
  }
  
  /**
   * Parse MT5 HTML format ("Positions" section)
   * MT5 columns: Time | Position | Symbol | Type | [hidden comment] | Volume | Price | S/L | T/P | Time | Price | Commission | Swap | Profit
   * Hidden cells with class="hidden" must be filtered out
   */
  private static parseMT5HTML(doc: Document): ParsedTrade[] {
    const trades: ParsedTrade[] = [];
    const tables = doc.querySelectorAll('table');
    
    for (const table of Array.from(tables)) {
      const rows = Array.from(table.querySelectorAll('tr'));
      
      let inPositionsSection = false;
      let foundPositionsHeader = false;
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowText = row.textContent?.trim() || '';
        
        // Detect "Positions" section header
        if (rowText === 'Positions') {
          inPositionsSection = true;
          continue;
        }
        
        // If we hit "Orders" or "Deals" section, stop parsing positions
        if (inPositionsSection && (rowText === 'Orders' || rowText === 'Deals')) {
          break;
        }
        
        // Find the column header row within Positions section
        if (inPositionsSection && !foundPositionsHeader && rowText.includes('Position') && rowText.includes('Symbol')) {
          foundPositionsHeader = true;
          continue;
        }
        
        // Parse data rows after the header
        if (inPositionsSection && foundPositionsHeader) {
          // Get only visible cells (filter out class="hidden")
          const allCells = Array.from(row.querySelectorAll('td'));
          const visibleCells = allCells.filter(cell => !cell.classList.contains('hidden'));
          const cellValues = visibleCells.map(cell => cell.textContent?.trim() || '');
          
          // Skip empty/spacer rows
          if (cellValues.length < 10) continue;
          if (cellValues[0] === '' || cellValues[0] === '\u00a0') continue;
          
          try {
            const trade = this.parseMT5Row(cellValues);
            if (trade) trades.push(trade);
          } catch (error) {
            console.warn('Failed to parse MT5 row:', error);
            continue;
          }
        }
      }
    }
    
    return trades;
  }
  
  /**
   * Parse a single MT5 Positions row
   * Visible column order: Time(open) | Position | Symbol | Type | Volume | Price(open) | S/L | T/P | Time(close) | Price(close) | Commission | Swap | Profit
   */
  private static parseMT5Row(cells: string[]): ParsedTrade | null {
    if (cells.length < 13) return null;
    
    const openTime = cells[0];
    // cells[1] = Position ID (not needed)
    const symbol = cells[2];
    const type = cells[3].toLowerCase();
    const volume = cells[4];
    const openPrice = cells[5];
    const sl = cells[6];
    const tp = cells[7];
    const closeTime = cells[8];
    const closePrice = cells[9];
    const commission = cells[10];
    const swap = cells[11];
    const profit = cells[12];
    
    // Validate: must be buy or sell
    if (!type.includes('buy') && !type.includes('sell')) return null;
    if (!symbol || symbol === '') return null;
    
    const direction: 'LONG' | 'SHORT' = type.includes('buy') ? 'LONG' : 'SHORT';
    
    const parseNum = (value: string): number | undefined => {
      if (!value || value === '' || value === '0.00' || value === '0') return undefined;
      const cleaned = value.replace(/[,\s]/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) || num === 0 ? undefined : num;
    };
    
    const trade: ParsedTrade = {
      symbol: symbol.replace(/#/g, '').toUpperCase(),
      direction,
      openDate: this.parseDate(openTime)?.toISOString() || new Date().toISOString(),
      closeDate: this.parseDate(closeTime)?.toISOString(),
      entryPrice: parseNum(openPrice) || 0,
      exitPrice: parseNum(closePrice),
      lots: parseNum(volume) || 0.01,
      stopLoss: parseNum(sl),
      takeProfit: parseNum(tp),
      netPnL: parseNum(profit),
      commission: parseNum(commission),
      swap: parseNum(swap),
    };
    
    return trade;
  }
  
  /**
   * Parse a MetaTrader row
   * Column order: Ticket | Open Time | Type | Size | Item | Price | S/L | T/P | Close Time | Price | Commission | Taxes | Swap | Profit
   */
  private static parseMetaTraderRow(cells: string[]): ParsedTrade | null {
    // Ensure we have enough cells
    if (cells.length < 14) return null;
    
    // Extract fields based on column positions
    // cells[0] = ticket (not used)
    const openTime = cells[1];
    const type = cells[2].toLowerCase();
    const size = cells[3];
    const item = cells[4];
    const openPrice = cells[5];
    const sl = cells[6];
    const tp = cells[7];
    const closeTime = cells[8];
    const closePrice = cells[9];
    const commission = cells[10];
    // cells[11] = taxes (not used)
    const swap = cells[12];
    const profit = cells[13];
    
    // Validate essential fields
    if (!type.includes('buy') && !type.includes('sell')) return null;
    if (!item || item === '') return null;
    
    // Determine direction
    const direction: 'LONG' | 'SHORT' = type.includes('buy') ? 'LONG' : 'SHORT';
    
    // Helper to parse number
    const parseNum = (value: string): number | undefined => {
      if (!value || value === '' || value === '0.00' || value === '0') return undefined;
      const cleaned = value.replace(/[,\s]/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) || num === 0 ? undefined : num;
    };
    
    // Build trade object
    const trade: ParsedTrade = {
      symbol: item.replace('#', '').toUpperCase(), // Remove # suffix from symbols
      direction: direction,
      openDate: this.parseDate(openTime)?.toISOString() || new Date().toISOString(),
      closeDate: this.parseDate(closeTime)?.toISOString(),
      entryPrice: parseNum(openPrice) || 0,
      exitPrice: parseNum(closePrice),
      lots: parseNum(size) || 0.01,
      stopLoss: parseNum(sl),
      takeProfit: parseNum(tp),
      netPnL: parseNum(profit),
      commission: parseNum(commission),
      swap: parseNum(swap),
    };
    
    return trade;
  }
  
  /**
   * Try to parse date from string
   */
  private static parseDate(dateStr: string): Date | null {
    if (!dateStr || dateStr.trim() === '' || dateStr === '&nbsp;') return null;
    
    // MT4/MT5 typically uses format: YYYY.MM.DD HH:MM:SS or YYYY.MM.DD HH:MM
    const date = new Date(dateStr.replace(/\./g, '-'));
    return !isNaN(date.getTime()) ? date : null;
  }
  
  /**
   * Parse CSV content (alternative format)
   */
  static parseCSV(csvContent: string): ParsedTrade[] {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const trades: ParsedTrade[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      try {
        const trade = this.parseCSVRow(headers, values);
        if (trade) trades.push(trade);
      } catch (error) {
        console.warn('Failed to parse CSV row:', error);
      }
    }
    
    return trades;
  }
  
  /**
   * Parse a single CSV row
   */
  private static parseCSVRow(headers: string[], values: string[]): ParsedTrade | null {
    const getField = (fieldNames: string[]): string | undefined => {
      for (const name of fieldNames) {
        const idx = headers.findIndex(h => h.includes(name));
        if (idx !== -1 && values[idx]) return values[idx];
      }
      return undefined;
    };
    
    const getNumber = (fieldNames: string[]): number | undefined => {
      const value = getField(fieldNames);
      return value ? parseFloat(value.replace(/[,\s]/g, '')) : undefined;
    };
    
    // Extract fields
    const typeField = getField(['type', 'action', 'side', 'cmd']);
    if (!typeField) return null;
    
    const direction: 'LONG' | 'SHORT' = 
      typeField.toLowerCase().includes('buy') || typeField.toLowerCase().includes('long') 
        ? 'LONG' 
        : 'SHORT';
    
    const trade: ParsedTrade = {
      symbol: getField(['symbol', 'pair', 'instrument', 'item']) || 'UNKNOWN',
      direction,
      openDate: getField(['open time', 'open date', 'time open', 'open']) || new Date().toISOString(),
      closeDate: getField(['close time', 'close date', 'time close', 'close']),
      entryPrice: getNumber(['open price', 'entry', 'price open', 'price']) || 0,
      exitPrice: getNumber(['close price', 'exit', 'price close']),
      lots: getNumber(['volume', 'lots', 'size']) || 0.01,
      commission: getNumber(['commission', 'comm']),
      swap: getNumber(['swap', 'overnight']),
      netPnL: getNumber(['profit', 'pnl', 'p/l', 'net']),
      stopLoss: getNumber(['sl', 'stop loss', 's/l', 's / l']),
      takeProfit: getNumber(['tp', 'take profit', 't/p', 't / p']),
    };
    
    return trade;
  }
}
