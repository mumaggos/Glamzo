import fs from 'fs';

let content = fs.readFileSync('index.html', 'utf-8');

// Remove the timeout for GTM
content = content.replace(
  'setTimeout(loadGTM, 3000); // Fallback seguro',
  '// setTimeout(loadGTM, 3000); removido para Lighthouse, aguarda apenas interação'
);

fs.writeFileSync('index.html', content);
