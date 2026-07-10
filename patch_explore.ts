import fs from 'fs';

let content = fs.readFileSync('src/pages/Explore.tsx', 'utf-8');

// Add aria-label to favorite button
content = content.replace(
  '<button onClick={(e) => { e.preventDefault(); handleToggleFavorite(b.id); }} className="absolute',
  '<button onClick={(e) => { e.preventDefault(); handleToggleFavorite(b.id); }} aria-label="Adicionar aos favoritos" className="absolute'
);

// Add aria-label to close button
content = content.replace(
  '<button onClick={() => setIsDrawerOpen(false)} className="p-2"><X className="w-5 h-5" /></button>',
  '<button onClick={() => setIsDrawerOpen(false)} aria-label="Fechar filtros" className="p-2"><X className="w-5 h-5" /></button>'
);

fs.writeFileSync('src/pages/Explore.tsx', content);
