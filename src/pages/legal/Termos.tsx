import React from 'react';
import { useTranslation } from 'react-i18next';
import DynamicLegalPage from '../../components/DynamicLegalPage';

export default function Termos() {
  const { t } = useTranslation();

  return (
    <DynamicLegalPage 
      slug="termos-e-condicoes"
      defaultTitle={t('legal.terms.title')}
      defaultLastUpdated="18 de Junho de 2026"
      defaultContent={
        <>
          <p>{t('legal.terms.intro')}</p>

          <h2>{t('legal.terms.q1')}</h2>
          <p>{t('legal.terms.a1')}</p>

          <h2>{t('legal.terms.q2')}</h2>
          <p>{t('legal.terms.a2')}</p>

          <h2>{t('legal.terms.q3')}</h2>
          <p>{t('legal.terms.a3')}</p>

          <h2>{t('legal.terms.q4')}</h2>
          <p>{t('legal.terms.a4')}</p>

          <h2>{t('legal.terms.q5')}</h2>
          <p>{t('legal.terms.a5')}</p>

          <h2>{t('legal.terms.q6')}</h2>
          <p>{t('legal.terms.a6')}</p>

          <h2>{t('legal.terms.q7')}</h2>
          <p>{t('legal.terms.a7')}</p>

          <h2>{t('legal.terms.q8')}</h2>
          <p>{t('legal.terms.a8')}</p>

          <h2>{t('legal.terms.q9')}</h2>
          <p>{t('legal.terms.a9')}</p>

          <h2>{t('legal.terms.q10')}</h2>
          <p>{t('legal.terms.a10')}</p>
        </>
      }
    />
  );
}
