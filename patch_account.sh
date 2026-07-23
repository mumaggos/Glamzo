sed -i "s/>Acesso Restrito</>{t('restricted_access') || 'Acesso Restrito'}</g" src/pages/Account.tsx
sed -i "s/>Fazer Login</>{t('login') || 'Fazer Login'}</g" src/pages/Account.tsx
sed -i "s/>O Meu Perfil</>{t('my_profile') || 'O Meu Perfil'}</g" src/pages/Account.tsx
sed -i "s/>Gerir Pontos e Saldo/>{t('manage_points') || 'Gerir Pontos e Saldo'} /g" src/pages/Account.tsx
sed -i "s/>Histórico de Reservas</>{t('booking_history') || 'Histórico de Reservas'}</g" src/pages/Account.tsx
sed -i "s/>As suas marcações ativas e passadas.</>{t('booking_history_desc') || 'As suas marcações ativas e passadas.'}</g" src/pages/Account.tsx
sed -i "s/>Nenhuma marcação</>{t('no_bookings') || 'Nenhuma marcação'}</g" src/pages/Account.tsx
sed -i "s/>Ainda não fez nenhuma reserva no Glamzo.</>{t('no_bookings_desc') || 'Ainda não fez nenhuma reserva no Glamzo.'}</g" src/pages/Account.tsx
sed -i "s/>Explorar Salões</>{t('explore_salons') || 'Explorar Salões'}</g" src/pages/Account.tsx
sed -i "s/>Ver Loja</>{t('view_store') || 'Ver Loja'}</g" src/pages/Account.tsx
sed -i "s/>Abrir Disputa</>{t('open_dispute') || 'Abrir Disputa'}</g" src/pages/Account.tsx
sed -i "s/>Avaliar</>{t('rate') || 'Avaliar'}</g" src/pages/Account.tsx
sed -i "s/>Cancelar</>{t('cancel') || 'Cancelar'}</g" src/pages/Account.tsx
sed -i "s/>Centro de Apoio</>{t('support_center') || 'Centro de Apoio'}</g" src/pages/Account.tsx
sed -i "s/>Editar Dados Pessoais</>{t('edit_personal_data') || 'Editar Dados Pessoais'}</g" src/pages/Account.tsx
