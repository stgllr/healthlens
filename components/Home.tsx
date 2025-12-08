
import React from 'react';
import { Camera, Pill, Mic, ClipboardList } from 'lucide-react';

interface HomeProps {
  onScanPrescription: () => void;
  onScanMedication: () => void;
  onOpenChat: () => void;
  onOpenList: () => void;
}

const Home: React.FC<HomeProps> = ({ 
  onScanPrescription, 
  onScanMedication, 
  onOpenChat, 
  onOpenList 
}) => {
  return (
    // Removed overflow-y-auto to allow native browser scrolling on mobile
    <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-col items-center flex-grow">
      
      <div className="text-center mb-8 w-full max-w-lg shrink-0">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
          HealthLens
        </h2>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
          Your personal medication assistant.
        </p>
      </div>

      {/* 
         Mobile-First Grid Layout:
         1. Single column (grid-cols-1) for mobile to ensure vertical stacking
         2. Two columns (sm:grid-cols-2) for tablet/desktop
         3. 16px gap (gap-4)
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl pb-8">
        <HomeButton 
          icon={<Camera className="w-8 h-8" />}
          title="Scan Prescription"
          description="Read doctor's notes"
          color="teal"
          onClick={onScanPrescription}
        />
        <HomeButton 
          icon={<Pill className="w-8 h-8" />}
          title="Scan Medication"
          description="Identify pills & boxes"
          color="indigo"
          onClick={onScanMedication}
        />
        <HomeButton 
          icon={<Mic className="w-8 h-8" />}
          title="Ask a Question"
          description="Voice Q&A support"
          color="rose"
          onClick={onOpenChat}
        />
        <HomeButton 
          icon={<ClipboardList className="w-8 h-8" />}
          title="My Medications"
          description="View saved history"
          color="amber"
          onClick={onOpenList}
        />
      </div>
    </div>
  );
};

interface HomeButtonProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'teal' | 'indigo' | 'rose' | 'amber';
  onClick: () => void;
}

const HomeButton: React.FC<HomeButtonProps> = ({ icon, title, description, color, onClick }) => {
  const colorClasses = {
    teal: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 group-hover:bg-teal-600 group-hover:text-white dark:group-hover:bg-teal-600 dark:group-hover:text-white',
    indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-600 dark:group-hover:text-white',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white dark:group-hover:bg-rose-600 dark:group-hover:text-white',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white dark:group-hover:bg-amber-600 dark:group-hover:text-white',
  };

  const borderClasses = {
    teal: 'border-teal-100 dark:border-teal-900/50 hover:border-teal-200 dark:hover:border-teal-700',
    indigo: 'border-indigo-100 dark:border-indigo-900/50 hover:border-indigo-200 dark:hover:border-indigo-700',
    rose: 'border-rose-100 dark:border-rose-900/50 hover:border-rose-200 dark:hover:border-rose-700',
    amber: 'border-amber-100 dark:border-amber-900/50 hover:border-amber-200 dark:hover:border-amber-700',
  };

  return (
    <button 
      onClick={onClick}
      className={`group w-full flex items-center p-5 bg-white dark:bg-slate-800 rounded-2xl border-2 shadow-sm hover:shadow-lg transition-all duration-200 text-left ${borderClasses[color]} min-h-[90px]`}
    >
      <div className={`p-4 rounded-xl mr-5 shrink-0 transition-colors duration-200 ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 leading-tight">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal truncate">{description}</p>
      </div>
    </button>
  );
};

export default Home;