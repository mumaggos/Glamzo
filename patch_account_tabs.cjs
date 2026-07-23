const fs = require('fs');

let code = fs.readFileSync('src/pages/Account.tsx', 'utf8');

code = code.replace(/label: 'Minhas Reservas'/g, "label: t('acc_my_reservations') || 'Minhas Reservas'");
code = code.replace(/label: 'Centro de Apoio'/g, "label: t('acc_support_center') || 'Centro de Apoio'");
code = code.replace(/label: 'Editar Dados'/g, "label: t('acc_edit_data') || 'Editar Dados'");
code = code.replace(/label: 'Recompensas'/g, "label: t('acc_rewards') || 'Recompensas'");
code = code.replace(/label: 'Favoritos'/g, "label: t('acc_favorites') || 'Favoritos'");
code = code.replace(/label: 'Reservas'/g, "label: t('acc_my_reservations') || 'Reservas'");
code = code.replace(/label: 'Perfil'/g, "label: t('acc_profile') || 'Perfil'");

fs.writeFileSync('src/pages/Account.tsx', code);
