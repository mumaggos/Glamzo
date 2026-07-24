import React from 'react';
import { useTranslation } from 'react-i18next';
import DynamicLegalPage from '../../components/DynamicLegalPage';

export default function FaqParceiro() {
  const { t } = useTranslation();

  return (
    <DynamicLegalPage 
      slug="faq-parceiro"
      defaultTitle={t('info.faqPartner.title')}
      defaultContent={
        <>
          <p>{t('info.faqPartner.intro')}</p>

          <h2>{t('info.faqPartner.q1')}</h2>
          <p>
            {t('info.faqPartner.a1')}
          </p>

          <h2>{t('info.faqPartner.q2')}</h2>
          <p>
            {t('info.faqPartner.a2')}
          </p>

          <h2>{t('info.faqPartner.q3')}</h2>
          <p>
            {t('info.faqPartner.a3')}
          </p>

          <h2>{t('info.faqPartner.q4')}</h2>
          <p>
            {t('info.faqPartner.a4_1')} <strong>glamzo.suporte@gmail.com</strong>
          </p>
        </>
      }
    />
  );
}
