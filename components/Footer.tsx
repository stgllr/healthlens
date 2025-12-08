
import React from 'react';
import { AlertTriangle, Trash2, Info } from 'lucide-react';
import { storageService } from '../services/storageService';

interface FooterProps {
  onOpenAbout?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenAbout }) => {
  const handleDeleteData = async () => {
    if (window.confirm("Are you sure you want to delete ALL your saved medication history? This cannot be undone.")) {
       await storageService.clearAllData();
       window.location.reload();
    }
  };

  return (
    <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-auto transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 flex items-center justify-center space-x-3 text-center sm:text-left sm:justify-start">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-900 dark:text-amber-200 font-medium">
             ⚕️ Disclaimer: This is for informational purposes only. Always consult your healthcare provider.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <p className="text-center text-slate-400 dark:text-slate-500 text-xs">
            © {new Date().getFullYear()} HealthLens.
            </p>

            <div className="flex items-center gap-6">
              {onOpenAbout && (
                <button 
                  onClick={onOpenAbout}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 flex items-center transition-colors font-medium"
                >
                  <Info className="w-3 h-3 mr-1" />
                  About HealthLens
                </button>
              )}

              <button 
                onClick={handleDeleteData}
                className="text-xs text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 flex items-center transition-colors"
              >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete My Data
              </button>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;