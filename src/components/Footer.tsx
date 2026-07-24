import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, ChevronUp } from 'lucide-react';

export default function Footer() {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (lng: string) => { 
    i18n.changeLanguage(lng); 
    setIsLangOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const languages = [
    { code: 'pt', label: 'PT (Português)' },
    { code: 'en', label: 'EN (English)' },
    { code: 'es', label: 'ES (Español)' },
    { code: 'fr', label: 'FR (Français)' },
  ];

  const currentLangCode = (i18n.language || 'pt').split('-')[0].toLowerCase();
  const currentLang = languages.find(l => l.code === currentLangCode) || languages[0];

  const isDashboardOrAdmin = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff') || location.pathname.startsWith('/partner/dashboard') || location.pathname.startsWith('/chamadas');
  
  if (isDashboardOrAdmin) return null;
  return (
    <footer className="border-t border-slate-100 mt-auto bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900 mb-4 whitespace-nowrap">Glamzo</h2>
            <p className="text-sm text-slate-600 mb-4 pr-4">
              {t('footer.description')}
            </p>
            {/* Botão Trustpilot */}
            <div className="mt-6">
              <a 
                href="https://pt.trustpilot.com/review/glamzo.pt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition group"
              >
                <div className="w-8 h-8 bg-[#00B67A] rounded flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg viewBox="0 0 512 512" className="w-5 h-5 text-white" fill="currentColor">
                    <path d="M256 36.8l56.5 174.1h183.1L347.5 318.5l56.5 174.1L256 384.9 108 492.6l56.5-174.1L16.4 210.9h183.1L256 36.8z"/>
                  </svg>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">{t('footer.rateUs')}</span>
                  <span className="text-sm font-black text-slate-900 leading-none mt-1">Trustpilot</span>
                </div>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-slate-900 mb-4">{t('footer.company')}</h3>
            <ul className="flex flex-col gap-2 text-sm text-slate-600">
              <li><Link to="/sobre-nos" className="hover:text-purple-600 focus:outline-none focus:underline">{t('footer.about')}</Link></li>
              <li><Link to="/contactos" className="hover:text-purple-600 focus:outline-none focus:underline">{t('footer.contacts')}</Link></li>
              <li><Link to="/faq-cliente" className="hover:text-purple-600 focus:outline-none focus:underline">{t('footer.faqCustomer')}</Link></li>
              <li><Link to="/faq-parceiro" className="hover:text-purple-600 focus:outline-none focus:underline">{t('footer.faqPartner')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-4">{t('footer.legalSupport')}</h3>
            <ul className="flex flex-col gap-2 text-sm text-slate-600">
              <li><Link to="/termos-e-condicoes" className="hover:text-purple-600 focus:outline-none focus:underline">{t('footer.termsAndConditions')}</Link></li>
              <li><Link to="/politica-de-privacidade" className="hover:text-purple-600 focus:outline-none focus:underline">{t('footer.privacyPolicy')}</Link></li>
              <li><Link to="/politica-de-pagamentos" className="hover:text-purple-600 focus:outline-none focus:underline">{t('footer.paymentTerms')}</Link></li>
              <li><Link to="/politica-de-cancelamentos" className="hover:text-purple-600 focus:outline-none focus:underline">{t('footer.cancellations')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-4">{t('footer.forPartners')}</h3>
            <ul className="flex flex-col gap-2 text-sm text-slate-600">
              <li><Link to="/partner" className="hover:text-purple-600 font-medium text-slate-900 focus:outline-none focus:underline">{t('footer.discoverPro')}</Link></li>
              <li><Link to="/partner/login" className="hover:text-purple-600 focus:outline-none focus:underline">{t('footer.partnerLogin')}</Link></li>
              <li><Link to="/partner/signup" className="hover:text-purple-600 focus:outline-none focus:underline">{t('footer.registerSalon')}</Link></li>
            </ul>
          </div>
        </div>

        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500 font-mono">
          <div>Glamzo © {new Date().getFullYear()}. {t('footer.allRightsReserved')}</div>
          
          <div className="relative" ref={langRef}>
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{currentLang.label}</span>
              {isLangOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            
            {isLangOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-40 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full text-left px-4 py-2.5 text-[12px] font-sans transition-colors ${currentLang.code === lang.code ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
