
import React from 'react';
import { StructuredDeepInsight } from '../types';

interface FinancialInsightsProps {
  insights: StructuredDeepInsight;
}

const IconMap: Record<string, React.ReactNode> = {
  wallet: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  chart: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 00-2 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  'trend-up': <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  alert: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  lightning: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
};

export const FinancialInsights: React.FC<FinancialInsightsProps> = ({ insights }) => {
  return (
    <div className="space-y-8 sm:space-y-10 lg:space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Executive Summary Card */}
      <div className="bg-gradient-to-br from-[#1e1b4b] to-[#312e81] text-white rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-2xl p-8 sm:p-10 lg:px-10 lg:py-8 shadow-2xl relative overflow-hidden border border-indigo-900/50">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 opacity-10 blur-3xl w-96 h-96 bg-indigo-400 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 opacity-5 blur-3xl w-80 h-80 bg-emerald-400 rounded-full"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-4 sm:space-x-5 mb-6 sm:mb-8 lg:mb-5">
            <div className="bg-indigo-500/20 p-4 sm:p-5 lg:p-3.5 rounded-xl sm:rounded-2xl lg:rounded-xl border border-indigo-500/30 backdrop-blur-md">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-8 lg:h-8 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl lg:text-2xl font-black tracking-tight leading-none">AI Insights</h3>
              <p className="text-indigo-200 text-xs sm:text-sm font-bold uppercase tracking-widest mt-1">Financial Intelligence</p>
            </div>
          </div>
          <p className="text-lg sm:text-xl lg:text-lg text-indigo-50 leading-relaxed font-medium opacity-90 max-w-5xl">
            {insights.executiveSummary}
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-4">
        {insights.metrics.map((m, i) => (
          <div key={i} className="bg-white p-5 sm:p-6 lg:p-5 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group hover:-translate-y-1">
            <div className="bg-slate-50 w-12 h-12 sm:w-14 sm:h-14 lg:w-12 lg:h-12 rounded-[1rem] sm:rounded-[1.25rem] lg:rounded-lg flex items-center justify-center text-slate-400 mb-4 sm:mb-6 lg:mb-3 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors shadow-sm">
              {IconMap[m.icon] || IconMap['chart']}
            </div>
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-400 mb-2 sm:mb-3 lg:mb-1.5">{m.label}</p>
            <p className="text-xl sm:text-2xl lg:text-xl font-black text-slate-900 tabular-nums tracking-tight">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Tips & Risk Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-6">
        {/* Actionable Tips */}
        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-2xl p-8 sm:p-10 lg:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <h4 className="text-xl sm:text-2xl lg:text-xl font-black text-slate-900 mb-8 sm:mb-10 lg:mb-6 flex items-center">
            <span className="bg-emerald-100 text-emerald-600 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl mr-3 sm:mr-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            </span>
            Strategic Opportunities
          </h4>
          <div className="space-y-6 sm:space-y-8 lg:space-y-5">
            {insights.tips.map((tip, i) => (
              <div key={i} className="group relative pl-6 sm:pl-8 border-l-[3px] border-slate-100 hover:border-emerald-400 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2 sm:mb-3">
                  <h5 className="font-black text-base sm:text-lg text-slate-800 tracking-tight">{tip.title}</h5>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 sm:px-3 py-1 rounded-lg w-fit ${tip.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'
                    }`}>
                    {tip.priority}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-medium">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Analysis */}
        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-2xl p-8 sm:p-10 lg:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <h4 className="text-xl sm:text-2xl lg:text-xl font-black text-slate-900 mb-8 sm:mb-10 lg:mb-6 flex items-center">
            <span className="bg-rose-100 text-rose-600 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl mr-3 sm:mr-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </span>
            Risk Indicators
          </h4>
          <ul className="space-y-4 sm:space-y-6 lg:space-y-4">
            {insights.redFlags.map((flag, i) => (
              <li key={i} className="flex items-start bg-rose-50/50 p-4 sm:p-5 lg:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-rose-100/50">
                <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 mr-4 sm:mr-5 flex-shrink-0 shadow-sm shadow-rose-200"></div>
                <p className="text-sm sm:text-base text-slate-800 font-bold leading-relaxed">{flag}</p>
              </li>
            ))}
            {insights.redFlags.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 sm:h-48 bg-slate-50/50 rounded-[1.5rem] sm:rounded-[2rem] border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold text-sm sm:text-base">No anomalies detected</p>
                <p className="text-slate-300 text-xs mt-1 uppercase tracking-widest">All Clear</p>
              </div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
