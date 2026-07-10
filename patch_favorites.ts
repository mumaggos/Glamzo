import fs from 'fs';

let explore = fs.readFileSync('src/pages/Explore.tsx', 'utf-8');
explore = explore.replace(
  'aria-label="Adicionar aos favoritos"',
  'aria-label={userFavorites.includes(b.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}'
);
fs.writeFileSync('src/pages/Explore.tsx', explore);

let home = fs.readFileSync('src/pages/Home.tsx', 'utf-8');
home = home.replace(
  '<button\n           onClick={(e) => { e.preventDefault(); }}\n           className="absolute top-3 right-3 p-1.5 rounded-full text-white hover:scale-110 transition-transform drop-shadow-md z-10"\n        >',
  '<button\n           onClick={(e) => { e.preventDefault(); }}\n           aria-label="Adicionar aos favoritos"\n           className="absolute top-3 right-3 p-1.5 rounded-full text-white hover:scale-110 transition-transform drop-shadow-md z-10"\n        >'
);
fs.writeFileSync('src/pages/Home.tsx', home);
