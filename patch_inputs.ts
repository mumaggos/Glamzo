import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

content = content.replace(
  '<label className="block text-[10px] font-extrabold text-[#0f172a] uppercase tracking-widest mb-0.5 text-left">Tratamento ou Salão</label>\n                <input',
  '<label htmlFor="search-treatment" className="block text-[10px] font-extrabold text-[#0f172a] uppercase tracking-widest mb-0.5 text-left">Tratamento ou Salão</label>\n                <input id="search-treatment"'
);

content = content.replace(
  '<label className="block text-[10px] font-extrabold text-[#0f172a] uppercase tracking-widest mb-0.5 text-left">Localização</label>\n                <input',
  '<label htmlFor="search-location" className="block text-[10px] font-extrabold text-[#0f172a] uppercase tracking-widest mb-0.5 text-left">Localização</label>\n                <input id="search-location"'
);

fs.writeFileSync('src/pages/Home.tsx', content);
