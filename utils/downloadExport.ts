import { Transaction, StatementSummary } from '../types';

/** Format number with tidy presentation for display (e.g. 1,234.56) - always 2 decimals for alignment */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/** Format date for export (YYYY-MM-DD) */
export function formatDateExport(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toISOString().slice(0, 10);
}

/** Format date for display (MMM d, YYYY) - tidy readable format */
export function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/** RFC 4180 CSV escape - wrap in quotes, double internal quotes */
function csvEscape(val: string): string {
  return `"${String(val).replace(/"/g, '""')}"`;
}

/** Generate RFC 4180 compliant CSV - Excel-ready, tidy layout */
export function downloadTransactionsCsv(
  transactions: Transaction[],
  summaries?: StatementSummary[]
): void {
  const headers = ['Date', 'Description', 'Category', 'Amount', 'Currency'];
  const EOL = '\r\n';

  // Transactions: plain numbers (no thousands sep) for clean CSV parsing; quoted strings per RFC 4180
  const rows = transactions.map(t => [
    csvEscape(formatDateExport(t.date)),
    csvEscape(t.description),
    csvEscape(t.category),
    t.amount.toFixed(2),
    csvEscape(t.currency)
  ]);

  let csv = headers.map(csvEscape).join(',') + EOL;
  rows.forEach(r => {
    csv += [r[0], r[1], r[2], r[3], r[4]].join(',') + EOL;
  });

  if (summaries && summaries.length > 0) {
    csv += EOL;
    summaries.forEach(s => {
      csv += csvEscape(`Summary (${s.currency})`) + ',,,,' + EOL;
      csv += ',' + csvEscape('Calculated') + ',' + s.calculatedTotal.toFixed(2) + ',' + csvEscape(s.currency) + EOL;
      csv += ',' + csvEscape('Statement Total') + ',' + s.reportedTotal.toFixed(2) + ',' + csvEscape(s.currency) + EOL;
      csv += EOL;
    });
  }

  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `finsight-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
