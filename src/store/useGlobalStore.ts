import { create } from 'zustand';

interface GlobalState {
  language: 'pt' | 'en' | 'es' | 'fr' | 'de';
  currency: 'EUR' | 'USD';
  userLocation: { lat: number; lng: number } | null;
  setLanguage: (lang: 'pt' | 'en' | 'es' | 'fr' | 'de') => void;
  setCurrency: (currency: 'EUR' | 'USD') => void;
  setUserLocation: (loc: { lat: number; lng: number } | null) => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  language: 'pt',
  currency: 'EUR',
  userLocation: null,
  setLanguage: (lang) => set({ language: lang }),
  setCurrency: (currency) => set({ currency: currency }),
  setUserLocation: (loc) => set({ userLocation: loc }),
}));
