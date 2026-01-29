
import React, { useMemo } from 'react';
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
    <div className="space-y-12">
      {/* Visual: Multi-Currency Total Reconciliation */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-indigo-50/50 border border-slate-100 overflow-hidden">
        <div className="px-10 py-8 bg-indigo-600 flex items-center justify-between">
          <h3 className="text-xl font-black text-white tracking-widest uppercase">Verified Totals</h3>
          <div className="flex items-center space-x-2">
            <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider">{summaries.length} Statement{summaries.length !== 1 ? 's' : ''}</span>
            <div className="px-4 py-1.5 bg-white/20 rounded-full text-[10px] font-black text-white uppercase tracking-widest backdrop-blur-sm">
              Tally Check
            </div>
          </div>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {summaries.map((s) => (
            <div key={s.id} className={`p-8 rounded-[2.5rem] border transition-all hover:scale-[1.02] ${s.isTally ? 'bg-emerald-50/30 border-emerald-100 shadow-emerald-50' : 'bg-rose-50/30 border-rose-100 shadow-rose-50'}`}>
              <div className="flex justify-between items-center mb-8">
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${s.isTally ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                   {s.currency} {s.isTally ? 'Tally OK' : 'Discrepancy'}
                </span>
                {s.isTally ? (
                   <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                ) : (
                   <svg className="w-6 h-6 text-rose-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Calculated Total</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tighter">
                    {s.calculatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="h-px bg-slate-200/50 relative">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[8px] font-black text-slate-300 uppercase">vs</div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Statement Total</p>
                  <p className="text-2xl font-bold text-slate-500 tracking-tighter">
                    {s.reportedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics per Currency Section */}
      {chartData.map((data, idx) => (
        <div key={data.currency} className="space-y-8 pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000" style={{ animationDelay: `${idx * 200}ms` }}>
           <div className="flex items-center space-x-6">
              <span className="text-sm font-black text-indigo-400 uppercase tracking-[0.4em]">{data.currency} Analysis</span>
              <div className="h-px flex-1 bg-slate-100"></div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                 <h4 className="text-xl font-black text-slate-900 mb-10 tracking-tight">Spending Categories</h4>
                 <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.categoryData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={10}
                        >
                          {data.categoryData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '2rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '1.5rem' }}
                          formatter={(val: number) => [`${data.currency} ${val.toLocaleString()}`, 'Total']}
                        />
                        <Legend iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                 <h4 className="text-xl font-black text-slate-900 mb-10 tracking-tight">Relative Impact</h4>
                 <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.categoryData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '2rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '1.5rem' }}
                          formatter={(val: number) => [`${data.currency} ${val.toLocaleString()}`, 'Volume']}
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
