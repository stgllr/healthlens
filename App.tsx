
import React, { useState, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import AnalysisResult from './components/AnalysisResult';
import ChatInterface from './components/ChatInterface';
import MedicationList from './components/MedicationList';
import { analyzeMedicationImage, fileToGenerativePart } from './services/geminiService';
import { AnalysisState, SavedMedication, MedicationAnalysis } from './types';
import { Loader2 } from 'lucide-react';

type View = 'home' | 'scan_result' | 'chat' | 'list';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: 'idle',
    data: null,
    error: null,
    imageUrl: null,
  });
  
  // Persist saved medications (in memory for this demo, could be localStorage)
  const [savedMedications, setSavedMedications] = useState<SavedMedication[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImage(e.target.files[0]);
    }
  };

  const processImage = async (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setAnalysisState({
      status: 'analyzing',
      data: null,
      error: null,
      imageUrl,
    });
    setCurrentView('scan_result');

    try {
      const base64Data = await fileToGenerativePart(file);
      const result = await analyzeMedicationImage(base64Data, file.type);
      
      setAnalysisState({
        status: 'success',
        data: result,
        error: null,
        imageUrl,
      });
    } catch (err: any) {
      console.error(err);
      setAnalysisState({
        status: 'error',
        data: null,
        error: err.message || "Something went wrong. Please try again.",
        imageUrl,
      });
    }
  };

  const triggerScan = () => {
    fileInputRef.current?.click();
  };

  const saveMedication = (data: MedicationAnalysis) => {
    if (!analysisState.imageUrl) return;

    // Basic duplicate check using the name of the first medication found
    // A robust app would use a deep comparison or unique IDs from backend
    if (savedMedications.some(m => 
        m.medications.length === data.medications.length &&
        m.medications[0]?.name === data.medications[0]?.name
    )) {
      return;
    }

    const newMed: SavedMedication = {
      ...data,
      id: crypto.randomUUID(),
      dateScanned: new Date().toISOString(),
      imageUrl: analysisState.imageUrl
    };
    
    setSavedMedications(prev => [newMed, ...prev]);
  };

  const navigateHome = () => {
    setCurrentView('home');
  };

  const viewSavedMedication = (med: SavedMedication) => {
    setAnalysisState({
      status: 'success',
      data: med,
      error: null,
      imageUrl: med.imageUrl || null,
    });
    setCurrentView('scan_result');
  };

  const isSaved = analysisState.data 
    ? savedMedications.some(m => 
        m.medications.length === analysisState.data?.medications.length &&
        m.medications[0]?.name === analysisState.data?.medications[0]?.name
      )
    : false;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <Header 
        onBack={navigateHome} 
        showBack={currentView !== 'home'} 
      />

      <main className="flex-grow flex flex-col">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
        />

        {currentView === 'home' && (
          <Home 
            onScanPrescription={triggerScan}
            onScanMedication={triggerScan}
            onOpenChat={() => setCurrentView('chat')}
            onOpenList={() => setCurrentView('list')}
          />
        )}

        {currentView === 'chat' && (
          <ChatInterface />
        )}

        {currentView === 'list' && (
          <MedicationList 
            medications={savedMedications}
            onSelect={viewSavedMedication}
            onGoHome={navigateHome}
          />
        )}

        {currentView === 'scan_result' && (
          <>
            {analysisState.status === 'analyzing' && (
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-teal-600 animate-pulse" />
                  </div>
                </div>
                <h3 className="mt-8 text-2xl font-bold text-slate-800">Analyzing Image...</h3>
                <p className="text-slate-500 mt-2 max-w-md">Our AI is reading the prescription details. This usually takes about 5-10 seconds.</p>
              </div>
            )}

            {analysisState.status === 'error' && (
              <div className="flex-grow flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-red-100 text-center">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">⚠️</span>
                  </div>
                  <h3 className="text-2xl font-bold text-red-900 mb-2">Analysis Failed</h3>
                  <p className="text-red-600 mb-8 text-lg">{analysisState.error}</p>
                  <div className="space-y-3">
                    <button 
                      onClick={triggerScan}
                      className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                    >
                      Try Again
                    </button>
                    <button 
                      onClick={navigateHome}
                      className="w-full py-4 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                    >
                      Back to Home
                    </button>
                  </div>
                </div>
              </div>
            )}

            {analysisState.status === 'success' && analysisState.data && (
              <AnalysisResult 
                data={analysisState.data} 
                imageUrl={analysisState.imageUrl}
                onReset={() => {
                  setAnalysisState({ status: 'idle', data: null, error: null, imageUrl: null });
                  triggerScan();
                }}
                onSave={saveMedication}
                isSaved={isSaved}
              />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
