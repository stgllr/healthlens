
import { SavedMedication, ChatMessage, DeviceType, Theme } from '../types';

const STORAGE_KEY = 'healthlens_data_v1';
const USER_ID_KEY = 'healthlens_user_id';
const THEME_KEY = 'healthlens_theme';

// Helper to detect device type
export const getDeviceType = (): DeviceType => {
  const ua = navigator.userAgent;
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return 'mobile';
  }
  return 'web';
};

// Simulate cloud delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class StorageService {
  private userId: string;

  constructor() {
    let id = localStorage.getItem(USER_ID_KEY);
    if (!id) {
      id = 'user_' + crypto.randomUUID();
      localStorage.setItem(USER_ID_KEY, id);
    }
    this.userId = id;
  }

  // Load all medications from local storage
  getMedications(): SavedMedication[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to load data", e);
      return [];
    }
  }

  // Save a new medication
  async saveMedication(med: SavedMedication): Promise<void> {
    const currentList = this.getMedications();
    // Prepend new item
    const newList = [med, ...currentList];
    this.saveToLocal(newList);
    await this.syncToCloud(newList);
  }

  // Update an existing medication (e.g. adding chat history)
  async updateMedication(id: string, updates: Partial<SavedMedication>): Promise<void> {
    const currentList = this.getMedications();
    const index = currentList.findIndex(m => m.id === id);
    if (index !== -1) {
      currentList[index] = { ...currentList[index], ...updates };
      this.saveToLocal(currentList);
      await this.syncToCloud(currentList);
    }
  }

  // Delete a medication
  async deleteMedication(id: string): Promise<void> {
    const currentList = this.getMedications();
    const newList = currentList.filter(m => m.id !== id);
    this.saveToLocal(newList);
    await this.syncToCloud(newList);
  }

  // Clear all data (Privacy)
  async clearAllData(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
    await delay(500); // Simulate cloud delete
  }

  // Internal helper to save to localStorage
  private saveToLocal(data: SavedMedication[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Mock Cloud Sync
  // In a real app, this would POST to Firebase/Supabase/Drive API
  private async syncToCloud(data: SavedMedication[]): Promise<void> {
    if (!navigator.onLine) {
      throw new Error("Offline");
    }
    // Simulate network latency
    await delay(800 + Math.random() * 1000);
    
    // In a real implementation, we would update the 'lastSynced' timestamp here
    // for the items that were successfully synced.
  }

  // Theme Management
  getTheme(): Theme {
    return (localStorage.getItem(THEME_KEY) as Theme) || 'light';
  }

  saveTheme(theme: Theme) {
    localStorage.setItem(THEME_KEY, theme);
  }
}

export const storageService = new StorageService();