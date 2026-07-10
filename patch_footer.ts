import fs from 'fs';

let content = fs.readFileSync('src/components/Footer.tsx', 'utf-8');

content = content.replace(
  '<h4 className="font-bold text-slate-900 mb-4 whitespace-nowrap">Glamzo</h4>',
  '<h2 className="font-bold text-slate-900 mb-4 whitespace-nowrap">Glamzo</h2>'
);

// Any other h4s in footer?
content = content.replace(
  /<h4 /g,
  '<h3 '
).replace(
  /<\/h4>/g,
  '</h3>'
);

fs.writeFileSync('src/components/Footer.tsx', content);
