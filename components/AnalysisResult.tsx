import React from 'react';
import { MedicationAnalysis, IdentifiedMedication, Interaction } from '../types';
import { Pill, AlertCircle, Clock, CheckCircle2, ShieldAlert, AlertTriangle, Calendar, BellRing, Save, Snowflake, MessageCircleQuestion, Check, ClipboardList } from 'lucide-react';

interface AnalysisResultProps {
  data: MedicationAnalysis;
  imageUrl: string | null;
  onReset: () => void;
  onSave: (data: MedicationAnalysis) => void;
  isSaved?: boolean;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, imageUrl, onReset, onSave, isSaved = false }) => {
  if (!data.isMedication || data.medications.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow-sm border border-slate-200 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 mb-6">
          <AlertCircle className="w-10 h-10 text-amber-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-3">Could Not Identify Medication</h3>
        <p className="text-slate-600 mb-8 text-lg">
          We couldn't clearly detect a medication or prescription in this image. Please try taking a clearer photo with good lighting.
        </p>
        <button
          onClick={onReset}
          className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 transition-colors w-full sm:w-auto"
        >
          Try Another Photo
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header & Save Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Analysis Result</h2>
            <p className="text-slate-500">
                Found {data.medications.length} medication{data.medications.length !== 1 ? 's' : ''}
            </p>
        </div>
        <button 
            onClick={() => onSave(data)}
            disabled={isSaved}
            className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${
                isSaved 
                ? 'bg-teal-100 text-teal-700 cursor-default' 
                : 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-md'
            }`}
        >
            <Save className={`w-5 h-5 mr-2 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? 'Saved to List' : 'Save Results'}
        </button>
      </div>

      {/* Interactions Section - Priority Display */}
      {data.interactions && data.interactions.length > 0 && (
        <div className="mb-8 space-y-3">
          <div className="grid gap-3">
            {data.interactions.map((interaction, idx) => (
               <InteractionCard key={idx} interaction={interaction} />
            ))}
          </div>
        </div>
      )}

      {/* Medication Cards */}
      <div className="space-y-8">
        {data.medications.map((med, index) => (
            <MedicationCard key={index} med={med} index={index} total={data.medications.length} />
        ))}
      </div>

      {/* General Advice & Reminders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 mb-10">
         {data.generalAdvice && (
             <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                 <div className="flex items-center mb-3 text-slate-800">
                    <ClipboardList className="w-6 h-6 text-teal-600 mr-2" />
                    <h3 className="font-bold text-lg">Additional Instructions</h3>
                 </div>
                 <p className="text-slate-600 leading-relaxed">{data.generalAdvice}</p>
             </div>
         )}
         
         <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 shadow-sm">
             <div className="flex items-center mb-3 text-indigo-900">
                <BellRing className="w-6 h-6 text-indigo-600 mr-2" />
                <h3 className="font-bold text-lg">📱 Set reminders?</h3>
             </div>
             <p className="text-indigo-800 leading-relaxed font-medium">
                 {data.reminderSuggestion}
             </p>
             <button className="mt-4 text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center bg-white px-4 py-2 rounded-lg border border-indigo-200 shadow-sm">
                 Create Reminder <span className="ml-1">→</span>
             </button>
         </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
        <button
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 border border-slate-200 text-lg font-bold rounded-full text-slate-600 bg-white hover:bg-slate-50 shadow-sm hover:shadow-md transition-all"
        >
          Scan Another Item
        </button>
      </div>
    </div>
  );
};

const InteractionCard: React.FC<{ interaction: Interaction }> = ({ interaction }) => {
    const styles = {
        safe: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-800',
            icon: <Check className="w-5 h-5 text-white" />,
            iconBg: 'bg-green-500',
            title: 'Safe combination'
        },
        caution: {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            text: 'text-amber-900',
            icon: <AlertTriangle className="w-5 h-5 text-white" />,
            iconBg: 'bg-amber-500',
            title: 'Caution'
        },
        warning: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-900',
            icon: <ShieldAlert className="w-5 h-5 text-white" />,
            iconBg: 'bg-red-600',
            title: 'Warning'
        }
    };

    const currentStyle = styles[interaction.severity] || styles.caution;

    return (
        <div className={`${currentStyle.bg} border ${currentStyle.border} rounded-xl p-4 flex items-start shadow-sm`}>
            <div className={`${currentStyle.iconBg} p-1.5 rounded-full mr-3 mt-0.5 flex-shrink-0`}>
                {currentStyle.icon}
            </div>
            <div>
                <h4 className={`font-bold text-sm uppercase mb-1 ${currentStyle.text}`}>
                    {currentStyle.title}
                </h4>
                <p className={`${currentStyle.text} font-medium text-base`}>
                    {interaction.description}
                </p>
            </div>
        </div>
    );
};

const MedicationCard: React.FC<{ med: IdentifiedMedication; index: number; total: number }> = ({ med, index, total }) => {
    return (
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden relative">
             <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                 <Pill className="w-24 h-24 rotate-12" />
             </div>

            {/* Header Area */}
            <div className="bg-slate-900 text-white p-6 sm:p-8">
                 {total > 1 && (
                    <span className="inline-block px-3 py-1 rounded-full bg-slate-700 text-xs font-bold text-slate-300 mb-2">
                        Medication {index + 1}
                    </span>
                )}
                <h3 className="text-3xl font-extrabold tracking-tight mb-1">{med.name}</h3>
                {med.genericName && med.genericName !== med.name && (
                    <p className="text-slate-400 font-medium text-lg">({med.genericName})</p>
                )}
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 space-y-6">
                
                {/* 💊 What it's for */}
                <div className="flex items-start gap-4">
                    <div className="bg-teal-100 p-2 rounded-lg shrink-0">
                        <Pill className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 text-lg">What it's for</h4>
                        <p className="text-slate-600 text-lg leading-relaxed">{med.purpose}</p>
                    </div>
                </div>

                 {/* 📋 How to take */}
                 <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-lg shrink-0">
                        <ClipboardList className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="w-full">
                        <h4 className="font-bold text-slate-900 text-lg mb-1">How to take</h4>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                             <div className="grid grid-cols-2 gap-4 mb-2">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase">Dosage</span>
                                    <p className="font-bold text-slate-800">{med.dosage} {med.strength && `(${med.strength})`}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase">Frequency</span>
                                    <p className="font-bold text-slate-800">{med.frequency}</p>
                                </div>
                             </div>
                             <p className="text-slate-700 mt-2">{med.instructions}</p>
                        </div>
                    </div>
                </div>

                {/* ⏰ Best time */}
                <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 p-2 rounded-lg shrink-0">
                        <Clock className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 text-lg">Best time</h4>
                        <p className="text-slate-600 font-medium">{med.bestTime}</p>
                    </div>
                </div>

                {/* ⚠️ Side effects */}
                <div className="flex items-start gap-4">
                     <div className="bg-amber-100 p-2 rounded-lg shrink-0">
                        <AlertCircle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                         <h4 className="font-bold text-slate-900 text-lg">Side effects</h4>
                         <p className="text-slate-600 mb-2">Common side effects to watch for:</p>
                         <div className="flex flex-wrap gap-2">
                            {med.sideEffects.map((s, i) => (
                                <span key={i} className="px-3 py-1 bg-amber-50 text-amber-900 rounded-full text-sm font-medium border border-amber-100">
                                    {s}
                                </span>
                            ))}
                         </div>
                    </div>
                </div>

                {/* 🚨 Important warnings */}
                <div className="flex items-start gap-4">
                    <div className="bg-red-100 p-2 rounded-lg shrink-0">
                        <ShieldAlert className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="w-full">
                         <h4 className="font-bold text-slate-900 text-lg">Important warnings</h4>
                         <ul className="mt-2 space-y-2">
                            {med.warnings.map((w, i) => (
                                <li key={i} className="flex items-start text-sm text-red-800 bg-red-50 p-3 rounded-lg border border-red-100">
                                    <span className="mr-2 font-bold">•</span> {w}
                                </li>
                            ))}
                            {med.symbolExplanations && med.symbolExplanations.map((sym, i) => (
                                <li key={`sym-${i}`} className="flex items-start text-sm text-slate-700 bg-slate-100 p-3 rounded-lg border border-slate-200">
                                    <span className="mr-2 mt-0.5">⚠️</span> 
                                    <span className="font-medium">{sym}</span>
                                </li>
                            ))}
                         </ul>
                    </div>
                </div>

                 {/* Packaging Extra Info (if available) */}
                 {(med.expiryDate || med.storage) && (
                     <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                         {med.expiryDate && (
                             <div>
                                 <span className={`text-xs font-bold uppercase ${med.expiryWarning ? 'text-red-500' : 'text-slate-400'}`}>Expiry Date</span>
                                 <p className={`font-bold ${med.expiryWarning ? 'text-red-600' : 'text-slate-700'}`}>
                                     {med.expiryDate} 
                                     {med.expiryWarning && <span className="block text-xs">{med.expiryWarning}</span>}
                                 </p>
                             </div>
                         )}
                         {med.storage && (
                             <div>
                                 <span className="text-xs font-bold uppercase text-slate-400">Storage</span>
                                 <p className="font-bold text-slate-700 flex items-center">
                                     <Snowflake className="w-3 h-3 mr-1 text-blue-400" />
                                     {med.storage}
                                 </p>
                             </div>
                         )}
                     </div>
                 )}

            </div>
            
             <div className="bg-teal-50 px-6 py-4 text-center border-t border-teal-100">
                 <button className="text-teal-700 font-bold hover:text-teal-900 transition-colors text-sm flex items-center justify-center w-full">
                     <MessageCircleQuestion className="w-4 h-4 mr-2" />
                     Would you like detailed information about this medication?
                 </button>
             </div>
        </div>
    );
};

export default AnalysisResult;