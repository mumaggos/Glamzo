const fs = require('fs');

let code = fs.readFileSync('src/components/GlamzoClubModal.tsx', 'utf8');

code = code.replace(/label: 'Meus Pontos'/g, "label: t('club_my_points') || 'Meus Pontos'");
code = code.replace(/label: 'Trocar Pontos'/g, "label: t('club_exchange') || 'Trocar Pontos'");
code = code.replace(/label: 'Afiliados'/g, "label: t('club_affiliates') || 'Afiliados'");
code = code.replace(/label: 'Levantamentos'/g, "label: t('club_withdrawals') || 'Levantamentos'");

fs.writeFileSync('src/components/GlamzoClubModal.tsx', code);
