
export interface IdentifiedMedication {
  name: string;
  genericName?: string; // For packaging
  purpose: string;
  dosage: string;
  strength?: string; // e.g. 500mg
  frequency: string;
  duration: string;
  bestTime: string;
  instructions: string; // How to take
  storage?: string; // How to store
  expiryDate?: string; // If visible
  expiryWarning?: string; // If expired or soon
  sideEffects: string[];
  warnings: string[];
  symbolExplanations?: string[]; // For packaging symbols
}

export type InteractionSeverity = 'safe' | 'caution' | 'warning';

export interface Interaction {
  severity: InteractionSeverity;
  description: string;
}

export interface MedicationAnalysis {
  isMedication: boolean;
  medications: IdentifiedMedication[];
  interactions: Interaction[];
  generalAdvice: string | null;
  reminderSuggestion: string;
  languageDetected: string;
}

export interface AnalysisState {
  status: 'idle' | 'analyzing' | 'success' | 'error';
  data: MedicationAnalysis | null;
  error: string | null;
  imageUrl: string | null;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp?: string;
}

export type DeviceType = 'mobile' | 'web';

export interface SavedMedication extends MedicationAnalysis {
  id: string;
  dateScanned: string;
  imageUrl?: string | null;
  deviceType: DeviceType;
  chatHistory: ChatMessage[];
  lastSynced?: string;
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export type Theme = 'light' | 'dark';