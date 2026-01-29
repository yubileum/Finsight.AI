
import React from 'react';
import { Transaction } from '../types';

interface TransactionTableProps {
  transactions: Transaction[];
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  if (transactions.length === 0) return null;

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-8 py-8 border-b border-slate-50 flex items-center justify-between">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Transaction Ledger</h3>
        <span className="text-slate-400 text-sm font-bold bg-slate-50 px-3 py-1 rounded-lg uppercase tracking-wider">
          {transactions.length} items
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <th className="px-8 py-5">Date</th>
              <th className="px-8 py-5">Merchant / Description</th>
              <th className="px-8 py-5">Classification</th>
              <th className="px-8 py-5 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6 text-sm font-bold text-slate-400 tabular-nums">{t.date}</td>
                <td className="px-8 py-6 text-sm font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                  {t.description}
                </td>
                <td className="px-8 py-6 text-sm">
                  <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    {t.category}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">{t.currency}</span>
                    <span className="text-lg font-black text-slate-900 tabular-nums tracking-tighter">
                      {t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
