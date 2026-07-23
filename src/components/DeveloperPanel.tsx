import React, { useState } from 'react';
import { Settings, X, Globe, MapPin, Coins } from 'lucide-react';
import { useGlobalStore } from '../store/useGlobalStore';
import { useTranslation } from 'react-i18next';

export default function DeveloperPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, currency, setLanguage, setCurrency, setUserLocation } = useGlobalStore();
  const { t } = useTranslation();

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-[9999] bg-slate-900 text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group"
      >
        <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 w-80 font-sans">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-600" />
          {t('developer_panel') || 'Developer Panel'}
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Language */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4" /> {t('language') || 'Language'}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('pt')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                language === 'pt' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              PT
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                language === 'en' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Currency */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Coins className="w-4 h-4" /> {t('currency') || 'Currency'}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrency('EUR')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                currency === 'EUR' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              EUR (€)
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                currency === 'USD' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              USD ($)
            </button>
          </div>
        </div>

        {/* Location Simulator */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Simular Local
          </label>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setUserLocation({ lat: 38.7223, lng: -9.1393 })} // Lisbon
              className="w-full text-left px-3 py-2 text-sm font-bold bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              📍 Lisboa
            </button>
            <button
              onClick={() => setUserLocation({ lat: 41.1579, lng: -8.6291 })} // Porto
              className="w-full text-left px-3 py-2 text-sm font-bold bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              📍 Porto
            </button>
             <button
              onClick={() => setUserLocation(null)}
              className="w-full text-left px-3 py-2 text-sm font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg mt-1"
            >
              Limpar Localização
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
