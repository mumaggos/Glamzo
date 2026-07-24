import React from 'react';
import { useTranslation } from 'react-i18next';
import DynamicLegalPage from '../../components/DynamicLegalPage';

export default function Privacidade() {
  const { t } = useTranslation();

  return (
    <DynamicLegalPage 
      slug="politica-de-privacidade"
      defaultTitle={t('legal.privacy.title')}
      defaultLastUpdated="18 de Junho de 2026"
      defaultContent={
        <>
          <p>{t('legal.privacy.intro')}</p>

          <h2>{t('legal.privacy.q1')}</h2>
          <p>{t('legal.privacy.a1')}</p>
          <ul>
            <li><strong>{t('legal.privacy.idData')}</strong> {t('legal.privacy.idDataDesc')}</li>
            <li><strong>{t('legal.privacy.profileData')}</strong> {t('legal.privacy.profileDataDesc')}</li>
            <li><strong>{t('legal.privacy.bookingData')}</strong> {t('legal.privacy.bookingDataDesc')}</li>
            <li><strong>{t('legal.privacy.techData')}</strong> {t('legal.privacy.techDataDesc')}</li>
          </ul>

          <h2>{t('legal.privacy.q2')}</h2>
          <p>{t('legal.privacy.a2')}</p>
          <ul>
            <li>{t('legal.privacy.purpose1')}</li>
            <li>{t('legal.privacy.purpose2')}</li>
            <li>{t('legal.privacy.purpose3')}</li>
            <li>{t('legal.privacy.purpose4')}</li>
            <li>{t('legal.privacy.purpose5')}</li>
          </ul>

          <h2>{t('legal.privacy.q3')}</h2>
          <p>
            {t('legal.privacy.a3_1')} <strong>{t('legal.privacy.a3_2')}</strong> {t('legal.privacy.a3_3')} <strong>{t('legal.privacy.a3_4')}</strong> {t('legal.privacy.a3_5')} <strong>{t('legal.privacy.a3_6')}</strong> {t('legal.privacy.a3_7')} <strong>{t('legal.privacy.a3_8')}</strong> {t('legal.privacy.a3_9')}
          </p>

          <h2>{t('legal.privacy.q4')}</h2>
          <p>{t('legal.privacy.a4')}</p>

          <h2>{t('legal.privacy.q5')}</h2>
          <p>{t('legal.privacy.a5')}</p>
          <ul>
            <li><strong>{t('legal.privacy.third1')}</strong> {t('legal.privacy.third1Desc')}</li>
            <li><strong>{t('legal.privacy.third2')}</strong> {t('legal.privacy.third2Desc')}</li>
            <li><strong>{t('legal.privacy.third3')}</strong> {t('legal.privacy.third3Desc')}</li>
          </ul>

          <h2>{t('legal.privacy.q6')}</h2>
          <p>{t('legal.privacy.a6')}</p>
          <ul>
            <li><strong>{t('legal.privacy.right1')}</strong> {t('legal.privacy.right1Desc')}</li>
            <li><strong>{t('legal.privacy.right2')}</strong> {t('legal.privacy.right2Desc')}</li>
            <li><strong>{t('legal.privacy.right3')}</strong> {t('legal.privacy.right3Desc')}</li>
            <li><strong>{t('legal.privacy.right4')}</strong> {t('legal.privacy.right4Desc')}</li>
          </ul>

          <h2>{t('legal.privacy.q7')}</h2>
          <p>{t('legal.privacy.a7')}</p>

          <h2>{t('legal.privacy.q8')}</h2>
          <p>
            {t('legal.privacy.a8_1')} <strong>glamzo.suporte@gmail.com</strong> {t('legal.privacy.a8_2')}
          </p>
        </>
      }
    />
  );
}
