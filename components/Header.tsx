
import React from 'react';
import { Stethoscope, ArrowLeft, Cloud, CloudOff, RefreshCw, Moon, Sun } from 'lucide-react';
import { SyncStatus, Theme } from '../types';

interface HeaderProps {
  onBack?: () => void;
  showBack?: boolean;
  syncStatus?: SyncStatus;
  theme: Theme;
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBack, showBack = false, syncStatus = 'synced', theme, onToggleTheme }) => {
  
  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return (
          <div className="flex items-center text-indigo-600 dark:text-indigo-400 space-x-1 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full border border-indigo-100 dark:border-indigo-800">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span className="text-xs font-medium">Syncing...</span>
          </div>
        );
      case 'offline':
        return (
          <div className="flex items-center text-slate-500 dark:text-slate-400 space-x-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            <CloudOff className="w-3 h-3" />
            <span className="text-xs font-medium">Offline</span>
          </div>
        );
      case 'error':
         return (
          <div className="flex items-center text-red-500 dark:text-red-400 space-x-1 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full border border-red-100 dark:border-red-800">
            <CloudOff className="w-3 h-3" />
            <span className="text-xs font-medium">Sync Error</span>
          </div>
        );
      default: // synced
        return (
          <div className="flex items-center text-teal-600 dark:text-teal-400 space-x-1 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded-full border border-teal-100 dark:border-teal-800">
            <Cloud className="w-3 h-3" />
            <span className="text-xs font-medium">Synced</span>
          </div>
        );
    }
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showBack && onBack ? (
             <button 
               onClick={onBack}
               className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
               aria-label="Go back"
             >
               <ArrowLeft className="w-6 h-6" />
             </button>
          ) : (
            <div className="bg-teal-500 p-2 rounded-lg shrink-0">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
          )}
          <div className="flex flex-col">
             <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none">
              HealthLens 
            </h1>
            <span className="hidden sm:inline font-normal text-slate-500 dark:text-slate-400 text-xs mt-1">Your Medication Assistant 💊</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <button 
            onClick={onToggleTheme}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* Sync Indicator */}
          <div className="flex items-center">
              {getSyncIcon()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;