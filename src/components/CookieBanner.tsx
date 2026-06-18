import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('glamzo_cookie_consent');
    if (!hasConsented) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('glamzo_cookie_consent', 'all');
    setIsVisible(false);
  };

  const acceptEssential = () => {
    localStorage.setItem('glamzo_cookie_consent', 'essential');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-sm pointer-events-auto"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="text-2xl mt-1">🍪</div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Valorizamos a sua privacidade</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Utilizamos cookies essenciais para o funcionamento seguro da plataforma. Poderemos usar também cookies analíticos para melhorar a sua experiência. 
                  Consulte a nossa <Link to="/politica-de-cookies" className="text-purple-600 font-medium hover:underline">Política de Cookies</Link>.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={acceptAll}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Aceitar todos os cookies
              </button>
              <button
                onClick={acceptEssential}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
              >
                Apenas cookies essenciais
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
