
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
    <div className="flex flex-col items-center justify-center py-8 px-4 w-full max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          How can I help you?
        </h2>
        <p className="text-lg text-slate-500">Select an option below to get started.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl">
        <HomeButton 
          icon={<Camera className="w-8 h-8" />}
          title="Scan Prescription"
          description="Upload or take a photo of your paper prescription"
          color="teal"
          onClick={onScanPrescription}
        />
        <HomeButton 
          icon={<Pill className="w-8 h-8" />}
          title="Scan Medication"
          description="Identify pills, bottles, or boxes"
          color="indigo"
          onClick={onScanMedication}
        />
        <HomeButton 
          icon={<Mic className="w-8 h-8" />}
          title="Ask a Question"
          description="Chat about side effects, safety, and more"
          color="rose"
          onClick={onOpenChat}
        />
        <HomeButton 
          icon={<ClipboardList className="w-8 h-8" />}
          title="My Medications"
          description="View your saved history"
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
    teal: 'bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white',
    indigo: 'bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white',
    rose: 'bg-rose-50 text-rose-700 group-hover:bg-rose-600 group-hover:text-white',
    amber: 'bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white',
  };

  const borderClasses = {
    teal: 'border-teal-100 hover:border-teal-200',
    indigo: 'border-indigo-100 hover:border-indigo-200',
    rose: 'border-rose-100 hover:border-rose-200',
    amber: 'border-amber-100 hover:border-amber-200',
  };

  return (
    <button 
      onClick={onClick}
      className={`group flex flex-col items-center p-8 bg-white rounded-3xl border-2 shadow-sm hover:shadow-xl transition-all duration-300 text-center ${borderClasses[color]}`}
    >
      <div className={`p-5 rounded-2xl mb-4 transition-colors duration-300 ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm font-medium">{description}</p>
    </button>
  );
};

export default Home;
