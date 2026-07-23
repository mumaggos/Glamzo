sed -i "s/import { Outlet/import { useTranslation } from 'react-i18next';\nimport { Outlet/g" src/components/partner/PartnerLayout.tsx
sed -i "s/export default function PartnerLayout() {/export default function PartnerLayout() {\n  const { t } = useTranslation();/g" src/components/partner/PartnerLayout.tsx
sed -i "s/>Resumo</>{t('summary') || 'Resumo'}</g" src/components/partner/PartnerLayout.tsx
sed -i "s/>Agenda</>{t('agenda') || 'Agenda'}</g" src/components/partner/PartnerLayout.tsx
sed -i "s/>Reservas</>{t('bookings') || 'Reservas'}</g" src/components/partner/PartnerLayout.tsx
sed -i "s/>Clientes</>{t('clients') || 'Clientes'}</g" src/components/partner/PartnerLayout.tsx
sed -i "s/>Equipa</>{t('team') || 'Equipa'}</g" src/components/partner/PartnerLayout.tsx
sed -i "s/>Serviços</>{t('services') || 'Serviços'}</g" src/components/partner/PartnerLayout.tsx
sed -i "s/>Horários</>{t('hours') || 'Horários'}</g" src/components/partner/PartnerLayout.tsx
sed -i "s/>Avaliações</>{t('reviews') || 'Avaliações'}</g" src/components/partner/PartnerLayout.tsx
sed -i "s/>Marketing</>{t('marketing') || 'Marketing'}</g" src/components/partner/PartnerLayout.tsx
sed -i "s/>Financeiro</>{t('financial') || 'Financeiro'}</g" src/components/partner/PartnerLayout.tsx
sed -i "s/>Tablet de Balcão</>{t('counter_tablet') || 'Tablet de Balcão'}</g" src/components/partner/PartnerLayout.tsx
sed -i "s/>Perfil da Loja</>{t('store_profile') || 'Perfil da Loja'}</g" src/components/partner/PartnerLayout.tsx
sed -i "s/>Configurações</>{t('settings') || 'Configurações'}</g" src/components/partner/PartnerLayout.tsx
sed -i "s/>Sair</>{t('logout') || 'Sair'}</g" src/components/partner/PartnerLayout.tsx
