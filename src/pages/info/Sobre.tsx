import React from 'react';
import { useTranslation } from 'react-i18next';
import DynamicLegalPage from '../../components/DynamicLegalPage';

export default function Sobre() {
  const { t } = useTranslation();

  return (
    <DynamicLegalPage 
      slug="sobre-nos"
      defaultTitle={t('info.about.title')}
      defaultContent={
        <>
          <p className="lead text-xl text-slate-700 font-medium pb-4">
            {t('info.about.intro')}
          </p>

          <h2>{t('info.about.whatWeDo')}</h2>
          <p>
            {t('info.about.whatWeDoDesc')}
          </p>

          <h2>{t('info.about.benefits')}</h2>
          <ul>
            <li>
              <strong>{t('info.about.forClients')}</strong> {t('info.about.forClientsDesc')}
            </li>
            <li>
              <strong>{t('info.about.forPartners')}</strong> {t('info.about.forPartnersDesc')}
            </li>
          </ul>

          <h2>{t('info.about.missionVisionValues')}</h2>
          <p>
            <strong>{t('info.about.mission')}</strong> {t('info.about.missionDesc')}
          </p>
          <p>
            <strong>{t('info.about.vision')}</strong> {t('info.about.visionDesc')}
          </p>
          <p>
            <strong>{t('info.about.values')}</strong> {t('info.about.valuesDesc')}
          </p>

          <h2>{t('info.about.techSecurity')}</h2>
          <p>
            {t('info.about.techSecurityDesc')}
          </p>
        </>
      }
    />
  );
}
