
import React from 'react';
import { Transaction, StatementSummary } from '../types';
import { downloadTransactionsCsv, formatNumber, formatDateDisplay } from '../utils/downloadExport';

interface TransactionTableProps {
  transactions: Transaction[];
  summaries?: StatementSummary[];
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, summaries = [] }) => {
  if (transactions.length === 0) return null;

  const handleDownload = () => {
    downloadTransactionsCsv(transactions, summaries.length > 0 ? summaries : undefined);
  };

  return (
    <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 border-b border-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Complete Transaction Log</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download CSV
          </button>
          <span className="text-slate-400 text-xs sm:text-sm font-bold bg-slate-50 px-3 py-1.5 rounded-lg uppercase tracking-wider">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em]">
              <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 w-28">Date</th>
              <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">Description</th>
              <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">Category</th>
              <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-right w-32 min-w-[7rem]">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-xs sm:text-sm font-bold text-slate-400 tabular-nums whitespace-nowrap">{formatDateDisplay(t.date)}</td>
                <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-xs sm:text-sm font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                  {t.description}
                </td>
                <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-sm">
                  <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-indigo-50 text-indigo-700 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                    {t.category}
                  </span>
                </td>
                <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-right align-top">
                  <div className="flex flex-col items-end font-mono">
                    <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">{t.currency}</span>
                    <span className="text-base sm:text-lg font-black text-slate-900 tabular-nums tracking-tighter whitespace-nowrap">
                      {formatNumber(t.amount)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
