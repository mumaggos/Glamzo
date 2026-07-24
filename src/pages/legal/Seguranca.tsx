import React from 'react';
import { useTranslation } from 'react-i18next';
import DynamicLegalPage from '../../components/DynamicLegalPage';

export default function Seguranca() {
  const { t } = useTranslation();

  return (
    <DynamicLegalPage 
      slug="seguranca-e-protecao-de-dados"
      defaultTitle={t('legal.security.title')}
      defaultLastUpdated="18 de Junho de 2026"
      defaultContent={
        <>
          <p>{t('legal.security.intro')}</p>

          <h2>{t('legal.security.q1')}</h2>
          <p>{t('legal.security.a1')}</p>
          <ul>
            <li>{t('legal.security.a1_li1')}</li>
            <li>{t('legal.security.a1_li2')}</li>
          </ul>

          <h2>{t('legal.security.q2')}</h2>
          <p>{t('legal.security.a2')}</p>

          <h2>{t('legal.security.q3')}</h2>
          <p>{t('legal.security.a3')}</p>
        </>
      }
    />
  );
}
