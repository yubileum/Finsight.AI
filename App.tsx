
import React, { useState, useRef, useEffect } from 'react';
import { analyzeStatementParts, getDeepInsights, FilePart } from './services/geminiService';
import { Transaction, StatementSummary, StructuredDeepInsight } from './types';
import { Dashboard } from './components/Dashboard';
import { TransactionTable } from './components/TransactionTable';
import { FinancialInsights } from './components/FinancialInsights';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.mjs';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summaries, setSummaries] = useState<StatementSummary[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [deepAnalysis, setDeepAnalysis] = useState<StructuredDeepInsight | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<{data: Uint8Array, type: string} | null>(null);
  const [pdfPassword, setPdfPassword] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadModeRef = useRef<'replace' | 'append'>('replace');

  const processFile = async (data: Uint8Array, mimeType: string, password?: string) => {
    setError(null);
    setIsAnalyzing(true);
    setLoadingProgress('Initializing...');
    setShowPasswordModal(false);
    
    try {
      const parts: FilePart[] = [];

      if (mimeType === 'application/pdf') {
        setLoadingProgress('Decrypting Document...');
        const loadingTask = pdfjsLib.getDocument({
          data: data.slice(),
          password: password
        });

        const pdf = await loadingTask.promise;
        const maxPages = Math.min(pdf.numPages, 12);
        
        setLoadingProgress(`Scanning ${maxPages} pages...`);
        const pagePromises = Array.from({ length: maxPages }, async (_, i) => {
          const pageNum = i + 1;
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2.5 }); 
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) return null;

          canvas.height = viewport.height;
          canvas.width = viewport.width;
          context.fillStyle = 'white';
          context.fillRect(0, 0, canvas.width, canvas.height);
          
          await page.render({ canvasContext: context, viewport }).promise;
          const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
          return {
            inlineData: { mimeType: 'image/jpeg', data: base64 }
          };
        });

        const results = await Promise.all(pagePromises);
        results.forEach(part => {
          if (part) parts.push(part);
        });

      } else {
        const base64 = btoa(
          new Uint8Array(data).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        parts.push({
          inlineData: { mimeType, data: base64 }
        });
      }

      if (parts.length === 0) throw new Error("No readable data found.");

      setLoadingProgress('Analyzing Transactions...');
      const result = await analyzeStatementParts(parts);
      
      const newSummaries = result.summaries.map((s, i) => ({
        ...s,
        id: `summary-${Date.now()}-${i}`
      }));

      const allTally = newSummaries.length > 0 && newSummaries.every(s => s.isTally);
      if (!allTally) {
        const msg = newSummaries.length > 0
          ? `Totals do not match. Calculated sum differs from statement total. Please verify the document and try again.`
          : `Could not reconcile totals. Please ensure the statement is clear and try again.`;
        throw new Error(msg);
      }

      const newTransactions = result.transactions;

      if (uploadModeRef.current === 'append') {
        setTransactions(prev => [...prev, ...newTransactions]);
        setSummaries(prev => [...prev, ...newSummaries]);
        setDeepAnalysis(null); // Reset analysis as data changed
      } else {
        setTransactions(newTransactions);
        setSummaries(newSummaries);
        setDeepAnalysis(null);
      }
      
      setPendingFile(null);
      setPdfPassword('');
    } catch (err: any) {
      console.error('Processing Error:', err);
      
      const isPasswordError = 
        err.name === 'PasswordException' || 
        err.message?.toLowerCase().includes('password') || 
        err.message?.toLowerCase().includes('no password given') ||
        err.code === 1;

      if (isPasswordError) {
        setPendingFile({ data, type: mimeType });
        setShowPasswordModal(true); 
        if (password) {
          setError("Incorrect password. Please try again.");
        }
      } else {
        setError(err.message || 'Analysis failed. Please try a clearer statement.');
      }
    } finally {
      setIsAnalyzing(false);
      setLoadingProgress('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const data = new Uint8Array(reader.result as ArrayBuffer);
      processFile(data, file.type);
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startNewAnalysis = () => {
    uploadModeRef.current = 'replace';
    fileInputRef.current?.click();
  };

  const addStatement = () => {
    uploadModeRef.current = 'append';
    fileInputRef.current?.click();
  };

  const handleDeepAnalysis = async () => {
    if (transactions.length === 0 || isThinking) return;
    setIsThinking(true);
    setError(null);
    try {
      const insights = await getDeepInsights(transactions);
      setDeepAnalysis(insights);
    } catch (err: any) {
      console.error(err);
      setError("Deep analysis encountered an error.");
    } finally {
      setIsThinking(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingFile) processFile(pendingFile.data, pendingFile.type, pdfPassword);
  };

  const handleCancelPassword = () => {
    setShowPasswordModal(false);
    setPendingFile(null);
    setPdfPassword('');
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50 font-['Inter']">
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl max-w-md w-full p-12 animate-in zoom-in-95 border border-slate-100">
            <div className="bg-indigo-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mb-10 rotate-3 shadow-xl shadow-indigo-200/40 mx-auto">
              <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-2 text-center">Unlock PDF</h3>
            <p className="text-slate-500 mb-10 leading-relaxed font-medium text-center">Enter your bank statement password to proceed with analysis.</p>
            {error && <div className="mb-8 p-4 bg-red-50 text-red-600 text-xs font-black rounded-2xl border border-red-100 uppercase tracking-widest text-center">{error}</div>}
            <form onSubmit={handlePasswordSubmit}>
              <input 
                autoFocus
                type="password"
                value={pdfPassword}
                onChange={(e) => setPdfPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-8 py-6 rounded-[2rem] border border-slate-200 focus:ring-8 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all mb-8 text-xl font-bold text-center"
                required
              />
              <div className="flex space-x-4">
                <button type="button" onClick={handleCancelPassword} className="flex-1 px-4 py-6 rounded-[2rem] text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={isAnalyzing} className="flex-[2] px-8 py-6 bg-indigo-600 text-white rounded-[2rem] font-black hover:bg-indigo-700 shadow-2xl transition-all uppercase tracking-[0.2em] text-[10px]">Unlock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex justify-between h-16 sm:h-20 items-center">
          <div className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-200 group-hover:rotate-12 transition-transform">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <span className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">FinSight<span className="text-indigo-600">.AI</span></span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {transactions.length > 0 && (
              <button onClick={addStatement} className="hidden md:flex px-4 sm:px-6 py-2 sm:py-3 border border-indigo-100 bg-indigo-50 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] rounded-xl sm:rounded-2xl text-indigo-700 hover:bg-indigo-100 transition-all shadow-sm items-center gap-1 sm:gap-2">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                <span className="hidden sm:inline">Add Statement</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}
            <button onClick={startNewAnalysis} className="px-3 sm:px-6 py-2 sm:py-3 border border-slate-200 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.3em] rounded-xl sm:rounded-2xl text-slate-700 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-1 sm:gap-2">
               <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
               <span className="hidden sm:inline">{transactions.length > 0 ? 'New Analysis' : 'Upload Statement'}</span>
               <span className="sm:hidden">{transactions.length > 0 ? 'New' : 'Upload'}</span>
            </button>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,application/pdf" className="hidden" />
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12 lg:py-16">
        {error && !showPasswordModal && !isAnalyzing && (
          <div className="mb-12 p-8 bg-red-50 border border-red-100 rounded-[3rem] flex items-center text-red-800 animate-in slide-in-from-top-8 shadow-sm">
            <div className="bg-red-100 p-4 rounded-3xl mr-6"><svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg></div>
            <div><p className="font-black text-2xl tracking-tight">Analysis Alert</p><p className="font-bold opacity-70 text-lg">{error}</p></div>
          </div>
        )}

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-20 sm:py-32 lg:py-40 bg-white rounded-[2rem] sm:rounded-[3rem] lg:rounded-[4rem] border border-slate-100 shadow-lg relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/30 to-transparent pointer-events-none"></div>
            <div className="relative mb-8 sm:mb-12">
               <div className="w-24 h-24 sm:w-32 sm:h-32 border-[8px] sm:border-[12px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center font-bold text-indigo-600 text-xs sm:text-sm">AI</div>
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-3 sm:mb-4 px-4 text-center">Analyzing Your Finances</h3>
            <p className="text-slate-500 font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[10px] sm:text-xs bg-slate-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full animate-pulse">{loadingProgress}</p>
          </div>
        )}

        {!isAnalyzing && transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 sm:py-36 lg:py-48 bg-white rounded-[2rem] sm:rounded-[3rem] lg:rounded-[4rem] border border-slate-100 shadow-lg text-center px-6 sm:px-10 relative overflow-hidden group">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white pointer-events-none"></div>
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-white to-indigo-50 rounded-[2rem] sm:rounded-[3rem] flex items-center justify-center mb-8 sm:mb-12 rotate-3 group-hover:rotate-0 transition-transform shadow-xl shadow-indigo-100/50 border border-indigo-100 relative z-10">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-4 sm:mb-8 tracking-tighter relative z-10">Financial Intelligence Platform</h2>
            <p className="text-slate-400 max-w-xl mb-10 sm:mb-16 text-base sm:text-xl lg:text-2xl font-medium leading-relaxed relative z-10">Upload your bank statement and unlock powerful insights. We analyze every transaction with precision and provide actionable financial intelligence.</p>
            <button onClick={startNewAnalysis} className="relative z-10 px-10 sm:px-16 py-5 sm:py-8 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-[2rem] sm:rounded-[3rem] font-black text-[10px] sm:text-[12px] uppercase tracking-[0.3em] sm:tracking-[0.4em] hover:from-indigo-700 hover:to-indigo-800 shadow-2xl shadow-indigo-300/50 transition-all hover:-translate-y-2 active:scale-95">Get Started</button>
          </div>
        )}

        {transactions.length > 0 && !isAnalyzing && (
          <div className="space-y-10 sm:space-y-16 lg:space-y-8 animate-in fade-in duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-10">
              <div>
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter">Financial Overview</h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mt-3 sm:mt-4">
                  <p className="text-slate-400 text-base sm:text-xl lg:text-2xl font-medium">Complete transaction analysis</p>
                  <button onClick={addStatement} className="flex md:hidden px-4 py-2.5 border border-indigo-100 bg-indigo-50 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] rounded-xl text-indigo-700 hover:bg-indigo-100 transition-all items-center gap-2 w-fit">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                    Add Statement
                  </button>
                </div>
              </div>
              {!deepAnalysis && (
                <button onClick={handleDeepAnalysis} disabled={isThinking} className={`inline-flex items-center px-8 sm:px-12 py-4 sm:py-6 rounded-[2rem] sm:rounded-[3rem] font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] shadow-xl sm:shadow-2xl transition-all hover:-translate-y-1 sm:hover:-translate-y-2 ${isThinking ? 'bg-slate-100 text-slate-400 cursor-wait' : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800'}`}>
                  {isThinking ? (
                    <span className="flex items-center"><span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce mr-2"></span>Analyzing...</span>
                  ) : 'Generate AI Insights'}
                </button>
              )}
            </div>

            {deepAnalysis && (
              <FinancialInsights insights={deepAnalysis} />
            )}

            <Dashboard transactions={transactions} summaries={summaries} />
            <div className="pt-16 lg:pt-10"><TransactionTable transactions={transactions} summaries={summaries} /></div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-100 py-12 sm:py-20 text-center">
        <p className="text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] sm:tracking-[0.6em] px-4">FinSight Financial Intelligence Platform</p>
      </footer>
    </div>
  );
};

export default App;
