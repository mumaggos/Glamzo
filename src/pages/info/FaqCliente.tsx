import React from 'react';
import { useTranslation } from 'react-i18next';
import DynamicLegalPage from '../../components/DynamicLegalPage';

export default function FaqCliente() {
  const { t } = useTranslation();
  
  return (
    <DynamicLegalPage 
      slug="faq-cliente"
      defaultTitle={t('info.faqClient.title')}
      defaultContent={
        <>
          <p>{t('info.faqClient.intro')}</p>

          <h2>{t('info.faqClient.q1')}</h2>
          <p>
            {t('info.faqClient.a1')}
          </p>

          <h2>{t('info.faqClient.q2')}</h2>
          <p>
            {t('info.faqClient.a2')}
          </p>
          
          <h2>{t('info.faqClient.q3')}</h2>
          <p>
            {t('info.faqClient.a3')}
          </p>

          <h2>{t('info.faqClient.q4')}</h2>
          <p>
            {t('info.faqClient.a4')}
          </p>
        </>
      }
    />
  );
}

