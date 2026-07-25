import React, { useEffect } from 'react';
import { useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function LanguageUpdater() {
  const location = useLocation();
  const navigate = useNavigate();
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
      const currentLang = i18n.language || 'pt';
      if (!currentLang.startsWith('pt')) {
        navigate(`/${currentLang}${location.pathname === '/' ? '' : location.pathname}${location.search}${location.hash}`, { replace: true });
      }
    }
  }, [location.pathname, i18n, navigate, location.search, location.hash]);

  return <Outlet />;
}
