
import React from 'react';
import { SavedMedication } from '../types';
import { Pill, ChevronRight, Calendar, AlertTriangle } from 'lucide-react';

interface MedicationListProps {
  medications: SavedMedication[];
  onSelect: (med: SavedMedication) => void;
  onGoHome: () => void;
}

const MedicationList: React.FC<MedicationListProps> = ({ medications, onSelect, onGoHome }) => {
  if (medications.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-8 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Pill className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">No Medications Saved Yet</h3>
        <p className="text-slate-500 mb-8 text-lg">
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
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
        <span className="bg-teal-100 text-teal-800 p-2 rounded-lg mr-3">
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

            return (
              <button
                key={med.id}
                onClick={() => onSelect(med)}
                className="group w-full text-left bg-white p-5 rounded-2xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all duration-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {med.imageUrl ? (
                    <img 
                      src={med.imageUrl} 
                      alt={title} 
                      className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-teal-50 flex items-center justify-center">
                      <Pill className="w-8 h-8 text-teal-500" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                      {title}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-1">{subtitle}</p>
                    <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center text-xs text-slate-400">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(med.dateScanned).toLocaleDateString()}
                        </div>
                        {hasAlert && (
                             <div className="flex items-center text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Interaction
                            </div>
                        )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-2 rounded-full group-hover:bg-teal-50 transition-colors ml-2 flex-shrink-0">
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600" />
                </div>
              </button>
            );
        })}
      </div>
    </div>
  );
};

export default MedicationList;
