import React from 'react';
import { useTranslation } from 'react-i18next';
import DynamicLegalPage from '../../components/DynamicLegalPage';

export default function Cancelamentos() {
  const { t } = useTranslation();

  return (
    <DynamicLegalPage 
      slug="politica-de-cancelamentos"
      defaultTitle={t('legal.cancellations.title')}
      defaultLastUpdated="18 de Junho de 2026"
      defaultContent={
        <>
          <p>{t('legal.cancellations.intro')}</p>

          <h2>{t('legal.cancellations.q1')}</h2>
          <p>
            {t('legal.cancellations.a1')}
          </p>

          <h2>{t('legal.cancellations.q2')}</h2>
          <p>
            {t('legal.cancellations.a2_1')} <strong>{t('legal.cancellations.a2_2')}</strong> {t('legal.cancellations.a2_3')}
          </p>

          <h2>{t('legal.cancellations.q3')}</h2>
          <p>
            {t('legal.cancellations.a3')}
          </p>

          <h2>{t('legal.cancellations.q4')}</h2>
          <p>
            {t('legal.cancellations.a4_1')}
          </p>
          <ul>
            <li>{t('legal.cancellations.a4_li1')}</li>
            <li>{t('legal.cancellations.a4_li2')}</li>
          </ul>
        </>
      }
    />
  );
}
