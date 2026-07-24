import { create } from 'zustand';
import i18n from '../i18n';

type SupportedLanguage = 'pt' | 'en' | 'es' | 'fr' | 'de';

const getInitialLanguage = (): SupportedLanguage => {
  const detected = i18n.language ? i18n.language.split('-')[0] : 'en';
  const supported: SupportedLanguage[] = ['pt', 'en', 'es', 'fr', 'de'];
  if (supported.includes(detected as SupportedLanguage)) {
    return detected as SupportedLanguage;
  }
  return 'en';
};

interface GlobalState {
  language: SupportedLanguage;
  currency: 'EUR' | 'USD';
  userLocation: { lat: number; lng: number } | null;
  setLanguage: (lang: SupportedLanguage) => void;
  setCurrency: (currency: 'EUR' | 'USD') => void;
  setUserLocation: (loc: { lat: number; lng: number } | null) => void;
}

export const useGlobalStore = create<GlobalState>((set) => {
  // Listen for language changes from i18next (e.g. from the detector)
  i18n.on('languageChanged', (lng) => {
    const shortLng = lng.split('-')[0];
    const supported: SupportedLanguage[] = ['pt', 'en', 'es', 'fr', 'de'];
    if (supported.includes(shortLng as SupportedLanguage)) {
      set({ language: shortLng as SupportedLanguage });
    }
  });

  return {
    language: getInitialLanguage(),
    currency: 'EUR',
    userLocation: null,
    setLanguage: (lang) => {
      i18n.changeLanguage(lang);
      set({ language: lang });
    },
    setCurrency: (currency) => set({ currency: currency }),
    setUserLocation: (loc) => set({ userLocation: loc }),
  };
});
