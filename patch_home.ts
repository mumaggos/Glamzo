import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

content = content.replace(
  '           className="absolute top-3 right-3 p-1.5 rounded-full text-white hover:scale-110 transition-transform drop-shadow-md z-10"',
  '           aria-label="Adicionar aos favoritos"\n           className="absolute top-3 right-3 p-1.5 rounded-full text-white hover:scale-110 transition-transform drop-shadow-md z-10"'
);

fs.writeFileSync('src/pages/Home.tsx', content);
