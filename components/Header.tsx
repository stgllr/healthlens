
import React from 'react';
import { Stethoscope, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  onBack?: () => void;
  showBack?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onBack, showBack = false }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showBack && onBack ? (
             <button 
               onClick={onBack}
               className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
               aria-label="Go back"
             >
               <ArrowLeft className="w-6 h-6" />
             </button>
          ) : (
            <div className="bg-teal-500 p-2 rounded-lg">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            HealthLens <span className="hidden sm:inline font-normal text-slate-500 text-lg">- Your Medication Assistant 💊</span>
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
