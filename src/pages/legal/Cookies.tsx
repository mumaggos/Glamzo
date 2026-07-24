import React from 'react';
import { useTranslation } from 'react-i18next';
import DynamicLegalPage from '../../components/DynamicLegalPage';

export default function Cookies() {
  const { t } = useTranslation();

  return (
    <DynamicLegalPage 
      slug="politica-de-cookies"
      defaultTitle={t('legal.cookies.title')}
      defaultLastUpdated="18 de Junho de 2026"
      defaultContent={
        <>
          <p>{t('legal.cookies.intro')}</p>

          <h2>{t('legal.cookies.whatAreCookies')}</h2>
          <p>{t('legal.cookies.whatAreCookiesDesc')}</p>

          <h2>{t('legal.cookies.howWeUse')}</h2>
          <ul>
            <li><strong>{t('legal.cookies.essential')}</strong> {t('legal.cookies.essentialDesc')}</li>
            <li><strong>{t('legal.cookies.performance')}</strong> {t('legal.cookies.performanceDesc')}</li>
            <li><strong>{t('legal.cookies.functional')}</strong> {t('legal.cookies.functionalDesc')}</li>
          </ul>

          <h2>{t('legal.cookies.manage')}</h2>
          <p>{t('legal.cookies.manageDesc')}</p>

          <h2>{t('legal.cookies.updates')}</h2>
          <p>{t('legal.cookies.updatesDesc')}</p>
        </>
      }
    />
  );
}
