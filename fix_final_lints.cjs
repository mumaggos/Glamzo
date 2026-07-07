const fs = require('fs');

// Explore.tsx
let exploreCode = fs.readFileSync('src/pages/Explore.tsx', 'utf8');
exploreCode = exploreCode.replace(/<Sliders className=/g, '<SlidersHorizontal className=');
fs.writeFileSync('src/pages/Explore.tsx', exploreCode);

// AgendaTab.tsx
let agendaCode = fs.readFileSync('src/pages/partner/tabs/AgendaTab.tsx', 'utf8');
agendaCode = agendaCode.replace(/if \(inputHour < startH \|\| inputHour >= endH\) \{/g, 'if (inputHour < startLimit || inputHour >= endLimit) {');
fs.writeFileSync('src/pages/partner/tabs/AgendaTab.tsx', agendaCode);

