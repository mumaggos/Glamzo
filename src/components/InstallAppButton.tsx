import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, Share, PlusSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const InstallAppButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    
    // Check if app is already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    
    if (isIosDevice && !isStandalone) {
      setIsIos(true);
      setIsInstallable(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosInstructions(true);
      return;
    }

    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast.success('App instalada com sucesso!');
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs sm:text-sm font-medium rounded-full hover:shadow-lg hover:shadow-purple-500/30 transition-all active:scale-95"
      >
        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">Instalar App</span>
        <span className="sm:hidden">Instalar</span>
      </button>

      {showIosInstructions && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Instalar no iPhone</h3>
            <p className="text-slate-600 text-sm mb-6">
              Para instalar a app Glamzo no seu iPhone, siga estes passos simples:
            </p>
            
            <ol className="space-y-4 mb-6">
              <li className="flex items-center gap-3 text-slate-700">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm shrink-0">1</div>
                <div>Toque no ícone <Share className="inline w-5 h-5 mx-1 text-blue-500" /> na barra do Safari</div>
              </li>
              <li className="flex items-center gap-3 text-slate-700">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm shrink-0">2</div>
                <div>Deslize para baixo e toque em <strong>"Ecrã principal"</strong> <PlusSquare className="inline w-5 h-5 mx-1 text-slate-500" /></div>
              </li>
              <li className="flex items-center gap-3 text-slate-700">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm shrink-0">3</div>
                <div>Toque em <strong>"Adicionar"</strong> no canto superior direito</div>
              </li>
            </ol>
            
            <button
              onClick={() => setShowIosInstructions(false)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium rounded-xl transition-colors shrink-0 mt-2"
            >
              Entendi
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
