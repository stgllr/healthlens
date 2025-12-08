
import React from 'react';
import { SavedMedication } from '../types';
import { Pill, ChevronRight, Calendar, AlertTriangle, Smartphone, Laptop, MessageCircle } from 'lucide-react';

interface MedicationListProps {
  medications: SavedMedication[];
  onSelect: (med: SavedMedication) => void;
  onGoHome: () => void;
  onChat: (med: SavedMedication) => void;
}

const MedicationList: React.FC<MedicationListProps> = ({ medications, onSelect, onGoHome, onChat }) => {
  if (medications.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <Pill className="w-10 h-10 text-slate-300 dark:text-slate-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">No Medications Saved Yet</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">
          Scan your prescriptions or medication bottles to add them to your list.
        </p>
        <button
          onClick={onGoHome}
          className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 transition-colors"
        >
          Start Scanning
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4 pb-20">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
        <span className="bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-400 p-2 rounded-lg mr-3">
          <Pill className="w-6 h-6" />
        </span>
        My Medications
      </h2>
      <div className="grid gap-4">
        {medications.map((med) => {
            const isMulti = med.medications.length > 1;
            const primaryMed = med.medications[0];
            
            const title = isMulti 
                ? `${med.medications.length} Medications Detected` 
                : primaryMed?.name || "Unknown Medication";
                
            const subtitle = isMulti 
                ? med.medications.map(m => m.name).join(", ") 
                : (primaryMed?.genericName && primaryMed.genericName !== primaryMed.name)
                   ? `${primaryMed.genericName} • ${primaryMed.purpose}`
                   : primaryMed?.purpose;
            
            const hasAlert = med.interactions?.some(i => i.severity === 'warning' || i.severity === 'caution');
            const hasChatHistory = med.chatHistory && med.chatHistory.length > 0;

            return (
              <button
                key={med.id}
                onClick={() => onSelect(med)}
                className="group w-full text-left bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-md transition-all duration-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {med.imageUrl ? (
                    <img 
                      src={med.imageUrl} 
                      alt={title} 
                      className="w-16 h-16 rounded-xl object-cover bg-slate-100 dark:bg-slate-700 border border-slate-100 dark:border-slate-700 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center flex-shrink-0">
                      <Pill className="w-8 h-8 text-teal-500 dark:text-teal-400" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors truncate">
                      {title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-1 truncate">{subtitle}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                        <div className="flex items-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded-md">
                            {med.deviceType === 'mobile' ? (
                                <Smartphone className="w-3 h-3 mr-1" />
                            ) : (
                                <Laptop className="w-3 h-3 mr-1" />
                            )}
                            {new Date(med.dateScanned).toLocaleDateString()}
                        </div>
                        {hasAlert && (
                             <div className="flex items-center text-xs text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-md border border-amber-100 dark:border-amber-800/50">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Interaction
                            </div>
                        )}
                         {hasChatHistory && (
                             <div className="hidden sm:flex items-center text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-800/50">
                                💬 {med.chatHistory.length} msgs
                            </div>
                        )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onChat(med);
                        }}
                        className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 mr-2 transition-colors"
                        aria-label="Chat about this medication"
                    >
                        <MessageCircle className="w-5 h-5" />
                    </button>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-full group-hover:bg-teal-50 dark:group-hover:bg-teal-900/30 transition-colors ml-2 flex-shrink-0">
                        <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                    </div>
                </div>
              </button>
            );
        })}
      </div>
    </div>
  );
};

export default MedicationList;
