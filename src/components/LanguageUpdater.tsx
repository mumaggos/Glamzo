import React, { useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function LanguageUpdater() {
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    const supportedLangs = ['pt', 'en', 'es', 'fr'];
    const pathParts = location.pathname.split('/');
    const urlLang = pathParts[1];

    if (urlLang && supportedLangs.includes(urlLang)) {
      if (i18n.language !== urlLang) {
        i18n.changeLanguage(urlLang);
      }
    } else {
      // Se não há prefixo de idioma suportado no URL (ex: /explore, /), forçar 'pt'
      if (i18n.language !== 'pt' && !i18n.language.startsWith('pt')) {
        i18n.changeLanguage('pt');
      }
    }
  }, [location.pathname, i18n]);

  return <Outlet />;
}
