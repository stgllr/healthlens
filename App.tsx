
import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import AnalysisResult from './components/AnalysisResult';
import ChatInterface from './components/ChatInterface';
import MedicationList from './components/MedicationList';
import About from './components/About';
import { analyzeMedicationImage, fileToGenerativePart } from './services/geminiService';
import { storageService, getDeviceType } from './services/storageService';
import { AnalysisState, SavedMedication, MedicationAnalysis, SyncStatus, ChatMessage, Theme } from './types';
import { Loader2, RefreshCcw, Home as HomeIcon, AlertOctagon } from 'lucide-react';

type View = 'home' | 'scan_result' | 'chat' | 'list' | 'about';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: 'idle',
    data: null,
    error: null,
    imageUrl: null,
  });
  
  const [savedMedications, setSavedMedications] = useState<SavedMedication[]>([]);
  const [activeContext, setActiveContext] = useState<SavedMedication | undefined>(undefined);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [theme, setTheme] = useState<Theme>('light');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data and theme on mount
  useEffect(() => {
    const loadData = () => {
        const meds = storageService.getMedications();
        setSavedMedications(meds);
        
        const savedTheme = storageService.getTheme();
        setTheme(savedTheme);
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };
    loadData();

    // Check online status
    const updateOnlineStatus = () => {
        setSyncStatus(navigator.onLine ? 'synced' : 'offline');
    };
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    storageService.saveTheme(newTheme);
    if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImage(e.target.files[0]);
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
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

      // Create a temporary context immediately so users can chat about it
      const tempId = crypto.randomUUID();
      const tempContext: SavedMedication = {
          ...result,
          id: tempId,
          dateScanned: new Date().toISOString(),
          imageUrl: imageUrl,
          deviceType: getDeviceType(),
          chatHistory: []
      };
      setActiveContext(tempContext);

    } catch (err: any) {
      console.error(err);
      
      let friendlyError = "We couldn't analyze this image. Please try again with a clearer photo.";
      
      if (err.message) {
          if (err.message.includes("403") || err.message.includes("API_KEY")) {
              friendlyError = "Service configuration error. Please check your API connection.";
          } else if (err.message.includes("fetch") || err.message.includes("network")) {
              friendlyError = "Network connection failed. Please check your internet.";
          } else {
              friendlyError = err.message;
          }
      }

      setAnalysisState({
        status: 'error',
        data: null,
        error: friendlyError,
        imageUrl,
      });
    }
  };

  const triggerScan = () => {
    fileInputRef.current?.click();
  };

  const saveMedication = async (data: MedicationAnalysis) => {
    if (!analysisState.imageUrl) return;

    if (savedMedications.some(m => 
        m.medications.length === data.medications.length &&
        m.medications[0]?.name === data.medications[0]?.name
    )) {
      // If already saved, just switch to it as context
      const existing = savedMedications.find(m => m.medications[0]?.name === data.medications[0]?.name);
      if (existing) setActiveContext(existing);
      return;
    }

    // If we have an active context that matches this data, preserve its chat history
    // This happens when user scans -> chats -> saves
    const chatHistoryToSave = (activeContext && activeContext.medications.length > 0 && data.medications.length > 0 && activeContext.medications[0].name === data.medications[0].name)
        ? activeContext.chatHistory
        : [];

    const newMed: SavedMedication = {
      ...data,
      id: crypto.randomUUID(),
      dateScanned: new Date().toISOString(),
      imageUrl: analysisState.imageUrl,
      deviceType: getDeviceType(),
      chatHistory: chatHistoryToSave
    };
    
    // Optimistic UI update
    setSavedMedications(prev => [newMed, ...prev]);
    setActiveContext(newMed);
    
    // Sync to storage
    try {
        setSyncStatus('syncing');
        await storageService.saveMedication(newMed);
        setSyncStatus('synced');
    } catch (e) {
        console.error("Sync failed", e);
        setSyncStatus(navigator.onLine ? 'error' : 'offline');
    }
  };

  // Handle chat messages update (Saving chat history to storage)
  const handleChatUpdate = async (messages: ChatMessage[]) => {
      if (activeContext) {
          // Update local state first
          const updatedContext = { ...activeContext, chatHistory: messages };
          setActiveContext(updatedContext);

          // Update storage only if it's a saved medication (exists in list)
          // We check by ID against saved list or simply if it has been saved before.
          // For temp contexts (just scanned, not saved), we don't persist to storage yet.
          const isSaved = savedMedications.some(m => m.id === activeContext.id);
          
          if (isSaved) {
            try {
               await storageService.updateMedication(activeContext.id, { chatHistory: messages });
            } catch (e) {
               console.error("Failed to save chat history", e);
            }
          }
      }
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
    setActiveContext(med);
    setCurrentView('scan_result');
  };

  const isSaved = analysisState.data 
    ? savedMedications.some(m => 
        m.medications.length === analysisState.data?.medications.length &&
        m.medications[0]?.name === analysisState.data?.medications[0]?.name
      )
    : false;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header 
        onBack={navigateHome} 
        showBack={currentView !== 'home'}
        syncStatus={syncStatus}
        theme={theme}
        onToggleTheme={toggleTheme}
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

        {/* 
            Keep Chat mounted but hidden to preserve state if not using persistent context 
            OR remount it with context props. 
            Since we now have persistence, we can remount it safely passing initialMessages.
        */}
        {currentView === 'chat' && (
          <ChatInterface 
             activeContext={activeContext}
             initialMessages={activeContext?.chatHistory}
             onMessagesUpdate={handleChatUpdate}
          />
        )}

        {currentView === 'list' && (
          <MedicationList 
            medications={savedMedications}
            onSelect={viewSavedMedication}
            onGoHome={navigateHome}
            onChat={(med) => {
                setActiveContext(med);
                setCurrentView('chat');
            }}
          />
        )}

        {currentView === 'about' && (
          <About onBack={navigateHome} />
        )}

        {currentView === 'scan_result' && (
          <>
            {analysisState.status === 'analyzing' && (
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                <div className="relative mb-8">
                  <div className="w-24 h-24 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin dark:border-slate-700"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-teal-600 dark:text-teal-400 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Analyzing Image...</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">Our AI is reading the details securely. This usually takes about 5-10 seconds.</p>
              </div>
            )}

            {analysisState.status === 'error' && (
              <div className="flex-grow flex flex-col items-center justify-center p-4 animate-in slide-in-from-bottom-4 duration-500">
                <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg border border-red-100 dark:border-red-900/30 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
                  
                  <div className="w-20 h-20 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertOctagon className="w-10 h-10 text-red-500" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Analysis Failed</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                    {analysisState.error}
                  </p>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={triggerScan}
                      className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 active:scale-95 transition-all shadow-md shadow-red-200 dark:shadow-none flex items-center justify-center"
                    >
                      <RefreshCcw className="w-5 h-5 mr-2" />
                      Try Again
                    </button>
                    <button 
                      onClick={navigateHome}
                      className="w-full py-4 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-600 active:bg-slate-100 transition-colors flex items-center justify-center"
                    >
                      <HomeIcon className="w-5 h-5 mr-2" />
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
                  setActiveContext(undefined);
                  triggerScan();
                }}
                onSave={saveMedication}
                isSaved={isSaved}
                onChat={() => setCurrentView('chat')}
              />
            )}
          </>
        )}
      </main>

      <Footer onOpenAbout={() => setCurrentView('about')} />
    </div>
  );
}

export default App;
