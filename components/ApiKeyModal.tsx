import React, { useState } from 'react';
import { setApiKey } from '../services/apiKeyService';

const GET_KEY_URL = 'https://aistudio.google.com/apikey';

interface ApiKeyModalProps {
  onClose: () => void;
  onSaved: () => void;
  showClose?: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose, onSaved, showClose = true }) => {
  const [key, setKey] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = key.trim();
    if (!trimmed) {
      setError('Please enter the code from Google.');
      return;
    }
    setApiKey(trimmed);
    onSaved();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300"
      onClick={showClose ? onClose : undefined}
    >
      <div
        className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl max-w-md w-full p-8 sm:p-12 animate-in zoom-in-95 border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 mb-6 sm:mb-8 mx-auto">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 text-center">Connect with Google</h3>
        <p className="text-slate-500 text-sm sm:text-base mb-6 text-center leading-relaxed">
          FinSight needs a free code from Google to work. Get yours in about 30 seconds — no account setup required.
        </p>
        <div className="space-y-4 mb-6">
          <a
            href={GET_KEY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 px-4 rounded-xl border-2 border-indigo-200 bg-indigo-50 text-indigo-700 font-bold text-base hover:bg-indigo-100 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Step 1: Get your free code from Google
          </a>
          <p className="text-slate-400 text-xs text-center">
            A new tab will open. Click the button to create a key, then copy the code that appears.
          </p>
        </div>
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 text-center">{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider mb-2">
            Step 2: Enter the code here
          </label>
          <input
            autoFocus
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter the code from Google"
            className="w-full px-4 py-3 sm:py-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm sm:text-base"
            autoComplete="off"
          />
          <div className={`flex gap-3 mt-6 ${showClose ? '' : 'flex-col'}`}>
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 sm:py-4 rounded-xl text-slate-500 font-black uppercase tracking-wider text-[10px] sm:text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className={`py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-black uppercase tracking-wider text-[10px] sm:text-xs hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg ${showClose ? 'flex-[2]' : 'w-full'}`}
            >
              Save & Continue
            </button>
          </div>
        </form>
        <p className="text-slate-400 text-[10px] sm:text-xs mt-6 text-center">
          Your code is saved in this browser only. We never send it anywhere.
        </p>
      </div>
    </div>
  );
};
