import React from 'react';
import { useTranslation } from 'react-i18next';
import DynamicLegalPage from '../../components/DynamicLegalPage';

export default function Pagamentos() {
  const { t } = useTranslation();

  return (
    <DynamicLegalPage 
      slug="politica-de-pagamentos"
      defaultTitle={t('legal.payments.title')}
      defaultLastUpdated="18 de Junho de 2026"
      defaultContent={
        <>
          <p>{t('legal.payments.intro')}</p>

          <h2>{t('legal.payments.q1')}</h2>
          <p>{t('legal.payments.a1')}</p>

          <h2>{t('legal.payments.q2')}</h2>
          <p>{t('legal.payments.a2')}</p>

          <h2>{t('legal.payments.q3')}</h2>
          <p>{t('legal.payments.a3_1')}</p>
          <ul>
            <li>{t('legal.payments.a3_li1')}</li>
            <li>{t('legal.payments.a3_li2')}</li>
          </ul>

          <h2>{t('legal.payments.q4')}</h2>
          <p>
            {t('legal.payments.a4_1')}<br />
            {t('legal.payments.a4_2')}
          </p>

          <h2>{t('legal.payments.q5')}</h2>
          <p>{t('legal.payments.a5')}</p>
        </>
      }
    />
  );
}
