import React from 'react';
import { AlertTriangle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-100 border-t border-slate-200 py-6 mt-auto">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-center space-x-3 text-center sm:text-left sm:justify-start">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-900 font-medium">
             ⚕️ Disclaimer: This is for informational purposes only. Always consult your healthcare provider.
          </p>
        </div>
        <p className="text-center text-slate-400 text-xs mt-4">
          © {new Date().getFullYear()} HealthLens.
        </p>
      </div>
    </footer>
  );
};

export default Footer;