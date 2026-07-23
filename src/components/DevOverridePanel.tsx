import React from 'react';
import { useDevOverride, MOCK_LOCATIONS } from '../contexts/DevOverrideContext';
import { Settings, X, MapPin, Globe, DollarSign } from 'lucide-react';

export default function DevOverridePanel() {
  const {
    overrideLocation, setOverrideLocation,
    overrideCurrency, setOverrideCurrency,
    overrideLanguage, setOverrideLanguage,
    isDevPanelOpen, setIsDevPanelOpen
  } = useDevOverride();

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const loc = MOCK_LOCATIONS.find(l => l.id === e.target.value);
    setOverrideLocation(loc || null);
    if (loc) {
      setTimeout(() => window.location.reload(), 500); // Reload to apply geo hack
    }
  };

  if (!isDevPanelOpen) {
    return (
      <button 
        onClick={() => setIsDevPanelOpen(true)}
        className="fixed bottom-4 left-4 bg-slate-900 text-white p-3 rounded-full shadow-2xl hover:bg-slate-800 transition-all z-[9999]"
        title="Developer Override Panel"
      >
        <Settings className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 z-[9999] animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-4 h-4 text-purple-600" /> Dev Override
        </h3>
        <button onClick={() => setIsDevPanelOpen(false)} className="text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* GPS Override */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-2">
            <MapPin className="w-3 h-3" /> GPS Location
          </label>
          <select 
            value={overrideLocation?.id || ''} 
            onChange={handleLocationChange}
            className="w-full text-sm p-2 border border-slate-300 rounded-lg bg-slate-50 focus:border-purple-500 outline-none"
          >
            <option value="">Native (Browser)</option>
            {MOCK_LOCATIONS.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>

        {/* Currency Override */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-2">
            <DollarSign className="w-3 h-3" /> Currency
          </label>
          <select 
            value={overrideCurrency || ''} 
            onChange={(e) => setOverrideCurrency((e.target.value as 'EUR' | 'USD') || null)}
            className="w-full text-sm p-2 border border-slate-300 rounded-lg bg-slate-50 focus:border-purple-500 outline-none"
          >
            <option value="">Auto (IP)</option>
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
          </select>
        </div>

        {/* Language Override */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-2">
            <Globe className="w-3 h-3" /> Language (i18n)
          </label>
          <select 
            value={overrideLanguage || ''} 
            onChange={(e) => setOverrideLanguage((e.target.value as 'pt-PT' | 'en-US') || null)}
            className="w-full text-sm p-2 border border-slate-300 rounded-lg bg-slate-50 focus:border-purple-500 outline-none"
          >
            <option value="">System Default</option>
            <option value="pt-PT">Português (PT-PT)</option>
            <option value="en-US">English (EN-US)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
