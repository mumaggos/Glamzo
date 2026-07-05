import fs from 'fs';
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const regex = /\{userCoords && \(\s*<AdvancedMarker position=\{userCoords\}>\s*<div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md animate-pulse"><\/div>\s*<\/AdvancedMarker>\s*\)\}/;
content = content.replace(regex, '');

fs.writeFileSync('src/pages/Home.tsx', content);

