import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// Replace Top Partner section
content = content.replace(
  '<ShieldCheck className="w-7 h-7 text-amber-500" /> Parceiros Top',
  '💎 Top Partner'
);

// Replace Recomendados
content = content.replace(
  '<ThumbsUp className="w-7 h-7 text-purple-500" /> Recomendados para si',
  '❤️ Recomendados para si'
);

// Replace Promoções
content = content.replace(
  '<Tag className="w-7 h-7 text-rose-500" /> Promoções Ativas',
  '🎁 Promoções'
);

// Replace Novas Lojas
content = content.replace(
  '<Sparkles className="w-7 h-7 text-emerald-500" /> Acabaram de Chegar',
  '🆕 Acabaram de chegar'
);

// We need to add "Mais reservados", "Tendências", "Avaliações recentes", "Explorar por Cidade"
// We can rename Melhores Avaliações to "⭐ Avaliações recentes" (or highest rated).
// Let's create a snippet to insert these.
// Since we don't know the exact lines, we can add a new section after "Acabaram de chegar".
