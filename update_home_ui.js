import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// Fix horizontal scroll
content = content.replace(
  '<section className="pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-6">',
  '<section className="pb-16 max-w-7xl mx-auto relative z-20 -mt-6">'
);

content = content.replace(
  'className="flex overflow-x-auto gap-3 sm:gap-4 no-scrollbar snap-x pb-4 pt-2 px-1 after:content-[\'\'] after:w-4 after:shrink-0"',
  'className="flex overflow-x-auto gap-3 sm:gap-4 no-scrollbar snap-x pb-4 pt-2 px-4 sm:px-6 lg:px-8 after:content-[\'\'] after:w-4 sm:after:w-6 lg:after:w-8 after:shrink-0"'
);

// Fix Section Headers
content = content.replace(
  '<ShieldCheck className="w-7 h-7 text-amber-500" /> Parceiros Top',
  '💎 Top Partner'
);

content = content.replace(
  '<ThumbsUp className="w-7 h-7 text-purple-500" /> Recomendados para si',
  '❤️ Recomendados para si'
);

content = content.replace(
  '<Tag className="w-7 h-7 text-rose-500" /> Promoções Ativas',
  '🎁 Promoções'
);

content = content.replace(
  '<Sparkles className="w-7 h-7 text-emerald-500" /> Acabaram de Chegar',
  '🆕 Acabaram de chegar'
);

fs.writeFileSync('src/pages/Home.tsx', content);

