import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type LocationOverride = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export const MOCK_LOCATIONS: LocationOverride[] = [
  { id: 'lisbon', name: 'Lisboa', lat: 38.7223, lng: -9.1393 },
  { id: 'ny', name: 'Nova Iorque', lat: 40.7128, lng: -74.0060 },
  { id: 'london', name: 'Londres', lat: 51.5074, lng: -0.1278 },
];

type DevOverrideContextType = {
  overrideLocation: LocationOverride | null;
  setOverrideLocation: (loc: LocationOverride | null) => void;
  overrideCurrency: 'EUR' | 'USD' | null;
  setOverrideCurrency: (curr: 'EUR' | 'USD' | null) => void;
  overrideLanguage: 'pt-PT' | 'en-US' | null;
  setOverrideLanguage: (lang: 'pt-PT' | 'en-US' | null) => void;
  isDevPanelOpen: boolean;
  setIsDevPanelOpen: (open: boolean) => void;
};

const DevOverrideContext = createContext<DevOverrideContextType | undefined>(undefined);

export function DevOverrideProvider({ children }: { children: ReactNode }) {
  const [overrideLocation, setOverrideLocation] = useState<LocationOverride | null>(null);
  const [overrideCurrency, setOverrideCurrency] = useState<'EUR' | 'USD' | null>(null);
  const [overrideLanguage, setOverrideLanguage] = useState<'pt-PT' | 'en-US' | null>(null);
  const [isDevPanelOpen, setIsDevPanelOpen] = useState(false);

  useEffect(() => {
    const storedLoc = localStorage.getItem('dev_override_loc');
    const storedCur = localStorage.getItem('dev_override_cur');
    const storedLang = localStorage.getItem('dev_override_lang');
    
    if (storedLoc) {
      try {
        setOverrideLocation(JSON.parse(storedLoc));
      } catch (e) {
        console.error(e);
      }
    }
    if (storedCur) setOverrideCurrency(storedCur as 'EUR' | 'USD');
    if (storedLang) setOverrideLanguage(storedLang as 'pt-PT' | 'en-US');
  }, []);

  useEffect(() => {
    if (overrideLocation) {
      localStorage.setItem('dev_override_loc', JSON.stringify(overrideLocation));
      // Intercept navigator.geolocation
      if (typeof window !== 'undefined' && navigator.geolocation) {
        const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
        navigator.geolocation.getCurrentPosition = (success, error, options) => {
          console.log('[Dev Override] Intercepted geolocation.getCurrentPosition', overrideLocation);
          success({
            coords: {
              latitude: overrideLocation.lat,
              longitude: overrideLocation.lng,
              accuracy: 100,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
              toJSON: () => ({})
            },
            timestamp: Date.now(),
            toJSON: () => ({})
          } as GeolocationPosition);
        };
        // Also could intercept watchPosition if needed
      }
    } else {
      localStorage.removeItem('dev_override_loc');
      // Ideally restore original but browser reload is enough for now when removed
    }
  }, [overrideLocation]);

  useEffect(() => {
    if (overrideCurrency) localStorage.setItem('dev_override_cur', overrideCurrency);
    else localStorage.removeItem('dev_override_cur');
  }, [overrideCurrency]);

  useEffect(() => {
    if (overrideLanguage) localStorage.setItem('dev_override_lang', overrideLanguage);
    else localStorage.removeItem('dev_override_lang');
  }, [overrideLanguage]);

  return (
    <DevOverrideContext.Provider value={{
      overrideLocation, setOverrideLocation,
      overrideCurrency, setOverrideCurrency,
      overrideLanguage, setOverrideLanguage,
      isDevPanelOpen, setIsDevPanelOpen
    }}>
      {children}
    </DevOverrideContext.Provider>
  );
}

export function useDevOverride() {
  const context = useContext(DevOverrideContext);
  if (context === undefined) {
    throw new Error('useDevOverride must be used within a DevOverrideProvider');
  }
  return context;
}
