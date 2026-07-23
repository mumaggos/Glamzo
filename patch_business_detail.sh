sed -i "s/>Avaliações</>{t('reviews') || 'Avaliações'}</g" src/pages/BusinessDetail.tsx
sed -i "s/>Profissionais</>{t('professionals') || 'Profissionais'}</g" src/pages/BusinessDetail.tsx
sed -i "s/>Sobre Nós</>{t('about_us') || 'Sobre Nós'}</g" src/pages/BusinessDetail.tsx
sed -i "s/>Serviços</>{t('services') || 'Serviços'}</g" src/pages/BusinessDetail.tsx
sed -i "s/>Informações</>{t('information') || 'Informações'}</g" src/pages/BusinessDetail.tsx
sed -i "s/Inicie sessão para guardar nos favoritos/{t('login_favorite') || 'Inicie sessão para guardar nos favoritos!'}/g" src/pages/BusinessDetail.tsx
sed -i "s/Avaliação submetida com sucesso/{t('review_submitted') || 'Avaliação submetida com sucesso! Obrigado.'}/g" src/pages/BusinessDetail.tsx
