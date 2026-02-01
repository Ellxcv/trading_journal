import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { TradeHTMLParser, ParsedTrade } from '../../utils/tradeParser';
import { Button } from '../ui';

interface TradeImportProps {
  onImport: (trades: ParsedTrade[]) => void;
  onCancel: () => void;
}

export const TradeImport: React.FC<TradeImportProps> = ({ onImport, onCancel }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedTrades, setParsedTrades] = useState<ParsedTrade[]>([]);
  const [error, setError] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  const handleFileSelect = async (file: File) => {
    setError('');
    setFileName(file.name);

    try {
      const content = await file.text();
      let trades: ParsedTrade[] = [];

      // Detect file type and parse accordingly
      if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
        trades = TradeHTMLParser.parseHTML(content);
      } else if (file.name.endsWith('.csv')) {
        trades = TradeHTMLParser.parseCSV(content);
      } else {
        // Try both formats
        trades = TradeHTMLParser.parseHTML(content);
        if (trades.length === 0) {
          trades = TradeHTMLParser.parseCSV(content);
        }
      }

      if (trades.length === 0) {
        setError('No trades found in file. Please check the file format.');
        return;
      }

      setParsedTrades(trades);
    } catch (err) {
      setError('Failed to parse file. Please ensure it\'s a valid MetaTrader export.');
      console.error('Parse error:', err);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleImport = () => {
    if (parsedTrades.length > 0) {
      onImport(parsedTrades);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
            Import Trades from Broker
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Upload your MetaTrader HTML or CSV export file
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-[var(--color-surface-light)] rounded-lg transition-colors"
        >
          <X size={20} className="text-[var(--color-text-muted)]" />
        </button>
      </div>

      {/* Upload Area */}
      {parsedTrades.length === 0 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={handleFileDrop}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-colors duration-200
            ${isDragging 
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' 
              : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
            }
          `}
        >
          <Upload className="mx-auto mb-4 text-[var(--color-text-muted)]" size={48} />
          <p className="text-lg text-[var(--color-text-primary)] mb-2">
            <span className="text-[var(--color-primary)] font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            HTML or CSV file from MetaTrader (MT4/MT5)
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.htm,.csv"
            onChange={handleFileInput}
            className="hidden"
          />

          {/* Instructions */}
          <div className="mt-6 p-4 bg-[var(--color-surface-light)] rounded-lg text-left max-w-md mx-auto">
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
              How to export from MetaTrader:
            </h4>
            <ol className="text-xs text-[var(--color-text-muted)] space-y-1">
              <li>1. Open MetaTrader 4/5</li>
              <li>2. Go to "Account History" tab</li>
              <li>3. Right-click → "Save as Report"</li>
              <li>4. Choose "Open HTML" or "CSV"</li>
              <li>5. Save and upload here</li>
            </ol>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 rounded-lg">
          <AlertCircle size={20} className="text-[var(--color-danger)] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--color-danger)]">{error}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Please ensure the file is a valid export from MetaTrader.
            </p>
          </div>
        </div>
      )}

      {/* Success Preview */}
      {parsedTrades.length > 0 && (
        <div className="space-y-4">
          {/* Success Header */}
          <div className="flex items-start gap-3 p-4 bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 rounded-lg">
            <CheckCircle size={20} className="text-[var(--color-success)] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--color-success)]">
                Successfully parsed {parsedTrades.length} trade{parsedTrades.length > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                From: {fileName}
              </p>
            </div>
          </div>

          {/* Trades Preview */}
          <div className="glass-card max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="text-left py-2 px-3 font-semibold text-[var(--color-text-primary)]">#</th>
                  <th className="text-left py-2 px-3 font-semibold text-[var(--color-text-primary)]">Symbol</th>
                  <th className="text-left py-2 px-3 font-semibold text-[var(--color-text-primary)]">Type</th>
                  <th className="text-right py-2 px-3 font-semibold text-[var(--color-text-primary)]">Lots</th>
                  <th className="text-right py-2 px-3 font-semibold text-[var(--color-text-primary)]">Entry</th>
                  <th className="text-right py-2 px-3 font-semibold text-[var(--color-text-primary)]">Exit</th>
                  <th className="text-right py-2 px-3 font-semibold text-[var(--color-text-primary)]">P&L</th>
                </tr>
              </thead>
              <tbody>
                {parsedTrades.map((trade, index) => (
                  <tr key={index} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-light)]">
                    <td className="py-2 px-3 text-[var(--color-text-muted)]">{index + 1}</td>
                    <td className="py-2 px-3 font-medium text-[var(--color-text-primary)]">{trade.symbol}</td>
                    <td className="py-2 px-3">
                      <span className={trade.direction === 'LONG' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}>
                        {trade.direction}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-[var(--color-text-secondary)]">{trade.lots.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-mono text-[var(--color-text-secondary)]">{trade.entryPrice.toFixed(5)}</td>
                    <td className="py-2 px-3 text-right font-mono text-[var(--color-text-secondary)]">
                      {trade.exitPrice ? trade.exitPrice.toFixed(5) : '-'}
                    </td>
                    <td className={`py-2 px-3 text-right font-bold ${
                      trade.netPnL && trade.netPnL >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
                    }`}>
                      {trade.netPnL ? `$${trade.netPnL.toFixed(2)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Info Note */}
          <div className="p-4 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-lg">
            <FileText size={16} className="text-[var(--color-primary)] inline mr-2" />
            <span className="text-sm text-[var(--color-text-secondary)]">
              All trades will be imported. You can add <strong>strategy notes</strong> and <strong>tags</strong> for each trade later.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleImport}>
              Import {parsedTrades.length} Trade{parsedTrades.length > 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
