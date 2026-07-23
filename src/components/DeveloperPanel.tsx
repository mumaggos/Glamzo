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
    <div className="fixed bottom-4 left-4 z-[99999] bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 w-[calc(100vw-32px)] sm:w-80 max-h-[85vh] overflow-y-auto overscroll-contain pb-6 pointer-events-auto font-sans" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2 border-b border-slate-100">
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
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors touch-manipulation ${
                language === 'pt' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-slate-50 text-slate-600 active:bg-slate-200 sm:hover:bg-slate-100'
              }`}
            >
              PT
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors touch-manipulation ${
                language === 'en' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-slate-50 text-slate-600 active:bg-slate-200 sm:hover:bg-slate-100'
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
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors touch-manipulation ${
                currency === 'EUR' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-600 active:bg-slate-200 sm:hover:bg-slate-100'
              }`}
            >
              EUR (€)
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors touch-manipulation ${
                currency === 'USD' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-600 active:bg-slate-200 sm:hover:bg-slate-100'
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
          <div className="flex flex-col gap-2 pb-12">
            <button
              onClick={() => setUserLocation({ lat: 38.7223, lng: -9.1393 })} // Lisbon
              className="w-full text-left px-4 py-3 text-sm font-bold bg-slate-50 text-slate-700 active:bg-slate-200 sm:hover:bg-slate-100 rounded-lg touch-manipulation cursor-pointer"
            >
              📍 Lisboa
            </button>
            <button
              onClick={() => setUserLocation({ lat: 41.1579, lng: -8.6291 })} // Porto
              className="w-full text-left px-4 py-3 text-sm font-bold bg-slate-50 text-slate-700 active:bg-slate-200 sm:hover:bg-slate-100 rounded-lg touch-manipulation cursor-pointer"
            >
              📍 Porto
            </button>
            <button
              onClick={() => setUserLocation({ lat: 40.7128, lng: -74.0060 })} // New York
              className="w-full text-left px-4 py-3 text-sm font-bold bg-slate-50 text-slate-700 active:bg-slate-200 sm:hover:bg-slate-100 rounded-lg touch-manipulation cursor-pointer"
            >
              📍 Nova Iorque
            </button>
             <button
              onClick={() => setUserLocation(null)}
              className="w-full text-left px-4 py-3 text-sm font-bold bg-rose-50 text-rose-700 active:bg-rose-200 sm:hover:bg-rose-100 rounded-lg mt-1 touch-manipulation cursor-pointer"
            >
              Limpar Localização
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
