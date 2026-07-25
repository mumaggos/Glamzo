import React, { useEffect } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function LanguageUpdater() {
  const { lang } = useParams<{ lang?: string }>();
  const { i18n } = useTranslation();

  useEffect(() => {
    const supportedLangs = ['pt', 'en', 'es', 'fr'];
    if (lang && supportedLangs.includes(lang)) {
      if (i18n.language !== lang) {
        i18n.changeLanguage(lang);
      }
    } else if (!lang) {
      // If there's no language in the URL, default to pt if not already
      // Or we can let i18n detector decide. We will rely on detector, but if we wanted to enforce / for pt:
      if (i18n.language !== 'pt' && !i18n.language.startsWith('pt')) {
        i18n.changeLanguage('pt');
      }
    }
  }, [lang, i18n]);

  return <Outlet />;
}
