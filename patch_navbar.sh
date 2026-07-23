sed -i "s/Ver Marketplace Clientes/{t('view_marketplace') || 'Ver Marketplace Clientes'}/g" src/components/Navbar.tsx
sed -i "s/Explorar Parceiros/{t('explore_partners') || 'Explorar Parceiros'}/g" src/components/Navbar.tsx
sed -i "s/ÁREA PARCEIRO/{t('partner_area') || 'ÁREA PARCEIRO'}/g" src/components/Navbar.tsx
sed -i "s/Painel do Salão/{t('salon_panel') || 'Painel do Salão'}/g" src/components/Navbar.tsx
sed -i "s/Terminar Sessão/{t('sign_out') || 'Terminar Sessão'}/g" src/components/Navbar.tsx
sed -i "s/Entrar/{t('login') || 'Entrar'}/g" src/components/Navbar.tsx
sed -i 's/"Registar" : "Criar Conta"/t("register") || "Registar" : t("create_account") || "Criar Conta"/g' src/components/Navbar.tsx
