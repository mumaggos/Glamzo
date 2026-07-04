import fs from 'fs';
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// Ensure all sections are explicitly there
const requiredSections = ['💎 Top Partner', '❤️ Recomendados para si', '🎁 Promoções', '🆕 Acabaram de chegar', '🔥 Mais reservados', '✨ Tendências', '⭐ Avaliações recentes', '🏙 Explorar por Cidade'];

const missing = requiredSections.filter(sec => !content.includes(sec));
if (missing.length > 0) {
  console.log("Missing sections:", missing);
} else {
  console.log("All sections are present.");
}

