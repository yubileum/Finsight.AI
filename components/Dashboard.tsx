
import React, { useMemo } from 'react';
import { formatNumber } from '../utils/downloadExport';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Transaction, StatementSummary } from '../types';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#475569'];

interface DashboardProps {
  transactions: Transaction[];
  summaries: StatementSummary[];
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, summaries }) => {
  const chartData = useMemo(() => {
    const groups: Record<string, { currency: string; categoryData: { name: string; value: number }[] }> = {};

    transactions.forEach(t => {
      if (!groups[t.currency]) groups[t.currency] = { currency: t.currency, categoryData: [] };
      const cat = groups[t.currency].categoryData.find(c => c.name === t.category);
      if (cat) cat.value += t.amount;
      else groups[t.currency].categoryData.push({ name: t.category, value: t.amount });
    });

    return Object.values(groups);
  }, [transactions]);

  if (transactions.length === 0) return null;

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Visual: Multi-Currency Total Reconciliation */}
      <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] shadow-xl shadow-indigo-50/50 border border-slate-100 overflow-hidden">
        <div className="px-6 sm:px-8 lg:px-10 py-6 sm:py-8 bg-gradient-to-r from-indigo-600 to-indigo-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <h3 className="text-base sm:text-lg lg:text-xl font-black text-white tracking-widest uppercase">Statement Reconciliation</h3>
          <div className="flex items-center space-x-2">
            <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider">{summaries.length} Statement{summaries.length !== 1 ? 's' : ''}</span>
            <div className="px-3 sm:px-4 py-1 sm:py-1.5 bg-white/20 rounded-full text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest backdrop-blur-sm">
              Verified
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {summaries.map((s) => (
            <div key={s.id} className={`p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] border transition-all hover:scale-[1.02] ${s.isTally ? 'bg-emerald-50/30 border-emerald-100 shadow-emerald-50' : 'bg-rose-50/30 border-rose-100 shadow-rose-50'}`}>
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <span className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-sm ${s.isTally ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                  {s.currency} {s.isTally ? 'Match' : 'Variance'}
                </span>
                {s.isTally ? (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Calculated Total</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tabular-nums tracking-tighter font-mono">
                    {formatNumber(s.calculatedTotal)}
                  </p>
                </div>
                <div className="h-px bg-slate-200/50 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[8px] font-black text-slate-300 uppercase">vs</div>
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Statement Total</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-500 tabular-nums tracking-tighter font-mono">
                    {formatNumber(s.reportedTotal)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics per Currency Section */}
      {chartData.map((data, idx) => (
        <div key={data.currency} className="space-y-6 sm:space-y-8 pt-6 sm:pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000" style={{ animationDelay: `${idx * 200}ms` }}>
          <div className="flex items-center space-x-4 sm:space-x-6">
            <span className="text-xs sm:text-sm font-black text-indigo-400 uppercase tracking-[0.3em] sm:tracking-[0.4em]">{data.currency} Insights</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white p-8 sm:p-10 lg:p-12 rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-lg sm:text-xl font-black text-slate-900 mb-8 sm:mb-10 tracking-tight">Spending Distribution</h4>
              <div className="h-[280px] sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={10}
                    >
                      {data.categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '1rem' }}
                      formatter={(val: number) => [`${data.currency} ${formatNumber(val)}`, 'Total']}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 sm:p-10 lg:p-12 rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-lg sm:text-xl font-black text-slate-900 mb-8 sm:mb-10 tracking-tight">Category Breakdown</h4>
              <div className="h-[280px] sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.categoryData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '1rem' }}
                      formatter={(val: number) => [`${data.currency} ${formatNumber(val)}`, 'Amount']}
                    />
                    <Bar dataKey="value" fill="#6366f1" radius={[16, 16, 0, 0]} barSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
