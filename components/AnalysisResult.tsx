
import React, { useState } from 'react';
import { MedicationAnalysis, IdentifiedMedication, Interaction } from '../types';
import { Pill, AlertCircle, Clock, CheckCircle2, ShieldAlert, AlertTriangle, Calendar, BellRing, Save, Snowflake, MessageCircleQuestion, Check, ClipboardList, X, Share2 } from 'lucide-react';

interface AnalysisResultProps {
  data: MedicationAnalysis;
  imageUrl: string | null;
  onReset: () => void;
  onSave: (data: MedicationAnalysis) => void;
  isSaved?: boolean;
  onChat: () => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, imageUrl, onReset, onSave, isSaved = false, onChat }) => {
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [isShared, setIsShared] = useState(false);
  
  // UI Translations
  const t = (key: string) => {
      const labels: Record<string, Record<string, string>> = {
          en: {
              title: "Analysis Result",
              found: "Found",
              medications: "medication(s)",
              save: "Save Results",
              saved: "Saved to List",
              share: "Share",
              shared: "Copied!",
              additional: "Additional Instructions",
              reminderTitle: "Set reminders?",
              reminderBtn: "Create Reminder",
              scanAnother: "Scan Another Item",
              whatFor: "What it's for",
              howToTake: "How to take",
              bestTime: "Best time",
              sideEffects: "Side effects",
              warnings: "Important warnings",
              expiry: "Expiry Date",
              storage: "Storage",
              moreInfo: "Ask a question about this medication",
              dosage: "Dosage",
              frequency: "Frequency",
              commonEffects: "Common side effects to watch for:"
          },
          tr: {
              title: "Analiz Sonucu",
              found: "Bulunan",
              medications: "ilaç",
              save: "Sonuçları Kaydet",
              saved: "Listeye Kaydedildi",
              share: "Paylaş",
              shared: "Kopyalandı!",
              additional: "Ek Talimatlar",
              reminderTitle: "Hatırlatıcı?",
              reminderBtn: "Hatırlatıcı Oluştur",
              scanAnother: "Başka Ürün Tara",
              whatFor: "Ne için kullanılır",
              howToTake: "Nasıl kullanılır",
              bestTime: "En iyi zaman",
              sideEffects: "Yan etkiler",
              warnings: "Önemli uyarılar",
              expiry: "Son Kullanma Tarihi",
              storage: "Saklama Koşulları",
              moreInfo: "Bu ilaç hakkında soru sorun",
              dosage: "Dozaj",
              frequency: "Sıklık",
              commonEffects: "Dikkat edilmesi gereken yan etkiler:"
          },
          es: {
              title: "Resultado del Análisis",
              found: "Encontrado",
              medications: "medicamento(s)",
              save: "Guardar Resultados",
              saved: "Guardado en la lista",
              share: "Compartir",
              shared: "¡Copiado!",
              additional: "Instrucciones Adicionales",
              reminderTitle: "¿Recordatorios?",
              reminderBtn: "Crear Recordatorio",
              scanAnother: "Escanear Otro Artículo",
              whatFor: "Para qué sirve",
              howToTake: "Cómo tomarlo",
              bestTime: "Mejor momento",
              sideEffects: "Efectos secundarios",
              warnings: "Advertencias importantes",
              expiry: "Fecha de Caducidad",
              storage: "Almacenamiento",
              moreInfo: "Hacer una pregunta sobre este medicamento",
              dosage: "Dosis",
              frequency: "Frecuencia",
              commonEffects: "Efectos secundarios comunes:"
          },
      };
      
      const lang = data.languageDetected?.toLowerCase().substring(0, 2) || 'en';
      return labels[lang]?.[key] || labels['en'][key];
  };

  const handleShare = async () => {
    const med = data.medications[0];
    if (!med) return;

    let text = `🏥 HealthLens Analysis\n\n`;
    text += `💊 ${med.name}\n`;
    if (med.strength) text += `Strength: ${med.strength}\n`;
    text += `\n📋 Purpose: ${med.purpose}\n`;
    text += `⚡ Dosage: ${med.dosage} (${med.frequency})\n`;
    text += `⏰ Best Time: ${med.bestTime}\n`;
    text += `\n⚠️ Instructions: ${med.instructions}\n`;
    
    if (med.warnings && med.warnings.length > 0) {
        text += `\n🚨 Warnings: ${med.warnings.join(', ')}\n`;
    }

    text += `\nAnalyzed by HealthLens AI`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: `HealthLens: ${med.name}`,
                text: text,
            });
        } catch (err) {
            console.error('Error sharing:', err);
        }
    } else {
        // Fallback to clipboard
        try {
            await navigator.clipboard.writeText(text);
            setIsShared(true);
            setTimeout(() => setIsShared(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }
  };


  if (!data.isMedication || data.medications.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-6">
          <AlertCircle className="w-10 h-10 text-amber-600 dark:text-amber-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">Could Not Identify Medication</h3>
        <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg">
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
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{t('title')}</h2>
            <p className="text-slate-500 dark:text-slate-400">
                {t('found')} {data.medications.length} {t('medications')}
            </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
                onClick={handleShare}
                className="flex-1 sm:flex-none flex items-center justify-center px-4 py-3 rounded-xl font-bold transition-all shadow-sm bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 active:scale-95 border border-indigo-100 dark:border-indigo-800"
            >
                {isShared ? (
                    <>
                        <Check className="w-5 h-5 mr-2" />
                        {t('shared')}
                    </>
                ) : (
                    <>
                        <Share2 className="w-5 h-5 mr-2" />
                        {t('share')}
                    </>
                )}
            </button>

            <button 
                onClick={() => onSave(data)}
                disabled={isSaved}
                className={`flex-1 sm:flex-none flex items-center justify-center px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${
                    isSaved 
                    ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 cursor-default' 
                    : 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-md active:scale-95'
                }`}
            >
                <Save className={`w-5 h-5 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? t('saved') : t('save')}
            </button>
        </div>
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
            <MedicationCard 
              key={index} 
              med={med} 
              index={index} 
              total={data.medications.length} 
              t={t} 
              onChat={onChat}
            />
        ))}
      </div>

      {/* General Advice & Reminders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 mb-10">
         {data.generalAdvice && (
             <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                 <div className="flex items-center mb-3 text-slate-800 dark:text-slate-100">
                    <ClipboardList className="w-6 h-6 text-teal-600 dark:text-teal-400 mr-2" />
                    <h3 className="font-bold text-lg">{t('additional')}</h3>
                 </div>
                 <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{data.generalAdvice}</p>
             </div>
         )}
         
         <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800/50 shadow-sm relative overflow-hidden">
             <div className="flex items-center mb-3 text-indigo-900 dark:text-indigo-100 relative z-10">
                <BellRing className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-2" />
                <h3 className="font-bold text-lg">📱 {t('reminderTitle')}</h3>
             </div>
             <p className="text-indigo-800 dark:text-indigo-200 leading-relaxed font-medium relative z-10">
                 {data.reminderSuggestion}
             </p>
             <button 
                onClick={() => setShowReminderModal(true)}
                className="mt-4 relative z-10 text-sm font-bold text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-100 active:text-indigo-900 flex items-center bg-white dark:bg-indigo-900/50 px-4 py-2.5 rounded-lg border border-indigo-200 dark:border-indigo-700 shadow-sm active:bg-indigo-50 active:scale-95 transition-all touch-manipulation select-none"
             >
                 {t('reminderBtn')} <span className="ml-1">→</span>
             </button>
         </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
        <button
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 border border-slate-200 dark:border-slate-600 text-lg font-bold rounded-full text-slate-600 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          {t('scanAnother')}
        </button>
      </div>

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 h-[100dvh]">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
             onClick={() => setShowReminderModal(false)}
           ></div>
           
           {/* Modal Content */}
           <div className="relative bg-white dark:bg-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl transform transition-all animate-in slide-in-from-bottom-full duration-300 sm:duration-200 sm:zoom-in-95 flex flex-col max-h-[85vh]">
              <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full">
                        <BellRing className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Set Reminder</h3>
                 </div>
                 <button 
                    onClick={() => setShowReminderModal(false)} 
                    className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 active:bg-slate-300 transition-colors"
                 >
                    <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                 </button>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-700/50 p-5 rounded-xl mb-6 border border-slate-100 dark:border-slate-700 overflow-y-auto">
                 <p className="text-slate-500 dark:text-slate-400 font-bold mb-2 text-xs uppercase tracking-wide">Suggested Schedule</p>
                 <p className="text-slate-800 dark:text-slate-200 font-medium text-lg leading-relaxed">{data.reminderSuggestion}</p>
              </div>

              <div className="space-y-3 mt-auto">
                 <button 
                    onClick={() => {
                        alert("In a full app, this would open your calendar!"); 
                        setShowReminderModal(false);
                    }} 
                    className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 transition-transform flex items-center justify-center"
                 >
                    <Calendar className="w-5 h-5 mr-2" />
                    Add to Calendar
                 </button>
                 <button 
                    onClick={() => setShowReminderModal(false)} 
                    className="w-full py-4 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 active:bg-slate-100 transition-colors"
                 >
                    Cancel
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const InteractionCard: React.FC<{ interaction: Interaction }> = ({ interaction }) => {
    const styles = {
        safe: {
            bg: 'bg-green-50 dark:bg-green-900/20',
            border: 'border-green-200 dark:border-green-800/50',
            text: 'text-green-800 dark:text-green-300',
            icon: <Check className="w-5 h-5 text-white" />,
            iconBg: 'bg-green-500',
            title: 'Safe combination'
        },
        caution: {
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            border: 'border-amber-200 dark:border-amber-800/50',
            text: 'text-amber-900 dark:text-amber-200',
            icon: <AlertTriangle className="w-5 h-5 text-white" />,
            iconBg: 'bg-amber-500',
            title: 'Caution'
        },
        warning: {
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-200 dark:border-red-800/50',
            text: 'text-red-900 dark:text-red-200',
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

const MedicationCard: React.FC<{ 
    med: IdentifiedMedication; 
    index: number; 
    total: number; 
    t: (key: string) => string;
    onChat: () => void;
}> = ({ med, index, total, t, onChat }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden relative transition-colors duration-300">
             <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                 <Pill className="w-24 h-24 rotate-12 dark:text-slate-500" />
             </div>

            {/* Header Area */}
            <div className="bg-slate-900 dark:bg-slate-950 text-white p-6 sm:p-8">
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
                    <div className="bg-teal-100 dark:bg-teal-900/30 p-2 rounded-lg shrink-0">
                        <Pill className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg">{t('whatFor')}</h4>
                        <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">{med.purpose}</p>
                    </div>
                </div>

                 {/* 📋 How to take */}
                 <div className="flex items-start gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg shrink-0">
                        <ClipboardList className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="w-full">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-1">{t('howToTake')}</h4>
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                             <div className="grid grid-cols-2 gap-4 mb-2">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase">{t('dosage')}</span>
                                    <p className="font-bold text-slate-800 dark:text-slate-200">{med.dosage} {med.strength && `(${med.strength})`}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase">{t('frequency')}</span>
                                    <p className="font-bold text-slate-800 dark:text-slate-200">{med.frequency}</p>
                                </div>
                             </div>
                             <p className="text-slate-700 dark:text-slate-300 mt-2">{med.instructions}</p>
                        </div>
                    </div>
                </div>

                {/* ⏰ Best time */}
                <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg shrink-0">
                        <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg">{t('bestTime')}</h4>
                        <p className="text-slate-600 dark:text-slate-300 font-medium">{med.bestTime}</p>
                    </div>
                </div>

                {/* ⚠️ Side effects */}
                <div className="flex items-start gap-4">
                     <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg shrink-0">
                        <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                    </div>
                    <div>
                         <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg">{t('sideEffects')}</h4>
                         <p className="text-slate-600 dark:text-slate-300 mb-2">{t('commonEffects')}</p>
                         <div className="flex flex-wrap gap-2">
                            {med.sideEffects.map((s, i) => (
                                <span key={i} className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200 rounded-full text-sm font-medium border border-amber-100 dark:border-amber-800/50">
                                    {s}
                                </span>
                            ))}
                         </div>
                    </div>
                </div>

                {/* 🚨 Important warnings */}
                <div className="flex items-start gap-4">
                    <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg shrink-0">
                        <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="w-full">
                         <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg">{t('warnings')}</h4>
                         <ul className="mt-2 space-y-2">
                            {med.warnings.map((w, i) => (
                                <li key={i} className="flex items-start text-sm text-red-800 dark:text-red-200 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800/50">
                                    <span className="mr-2 font-bold">•</span> {w}
                                </li>
                            ))}
                            {med.symbolExplanations && med.symbolExplanations.map((sym, i) => (
                                <li key={`sym-${i}`} className="flex items-start text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <span className="mr-2 mt-0.5">⚠️</span> 
                                    <span className="font-medium">{sym}</span>
                                </li>
                            ))}
                         </ul>
                    </div>
                </div>

                 {/* Packaging Extra Info (if available) */}
                 {(med.expiryDate || med.storage) && (
                     <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-4">
                         {med.expiryDate && (
                             <div>
                                 <span className={`text-xs font-bold uppercase ${med.expiryWarning ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>{t('expiry')}</span>
                                 <p className={`font-bold ${med.expiryWarning ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                     {med.expiryDate} 
                                     {med.expiryWarning && <span className="block text-xs">{med.expiryWarning}</span>}
                                 </p>
                             </div>
                         )}
                         {med.storage && (
                             <div>
                                 <span className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">{t('storage')}</span>
                                 <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center">
                                     <Snowflake className="w-3 h-3 mr-1 text-blue-400" />
                                     {med.storage}
                                 </p>
                             </div>
                         )}
                     </div>
                 )}

            </div>
            
             <div className="bg-teal-50 dark:bg-teal-900/20 px-6 py-4 text-center border-t border-teal-100 dark:border-teal-900/50">
                 <button 
                    onClick={onChat}
                    className="text-teal-700 dark:text-teal-300 font-bold hover:text-teal-900 dark:hover:text-teal-200 transition-colors text-sm flex items-center justify-center w-full"
                 >
                     <MessageCircleQuestion className="w-4 h-4 mr-2" />
                     {t('moreInfo')}
                 </button>
             </div>
        </div>
    );
};

export default AnalysisResult;
