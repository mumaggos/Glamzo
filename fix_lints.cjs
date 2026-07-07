const fs = require('fs');

// Explore.tsx
let exploreCode = fs.readFileSync('src/pages/Explore.tsx', 'utf8');
if (!exploreCode.includes('Sliders,')) {
  exploreCode = exploreCode.replace(/import \{ Search,/, 'import { Search, Sliders,');
}
fs.writeFileSync('src/pages/Explore.tsx', exploreCode);

// AgendaTab.tsx
let agendaCode = fs.readFileSync('src/pages/partner/tabs/AgendaTab.tsx', 'utf8');
agendaCode = agendaCode.replace(/let startH = Math\.min\(\.\.\.businessHours/, 'const startH2 = Math.min(...businessHours');
agendaCode = agendaCode.replace(/let endH = Math\.max\(\.\.\.businessHours/, 'const endH2 = Math.max(...businessHours');
agendaCode = agendaCode.replace(/Array\.from\(\{ length: \(endH - startH\) \+ 1 \}\)\.map\(\(\_, i\) => startH \+ i\)/, 'Array.from({ length: (endH2 - startH2) + 1 }).map((_, i) => startH2 + i)');
fs.writeFileSync('src/pages/partner/tabs/AgendaTab.tsx', agendaCode);

// Also we should run tsc again
