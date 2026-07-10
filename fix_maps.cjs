const fs = require('fs');

let homeText = fs.readFileSync('src/pages/Home.tsx', 'utf8');
homeText = homeText.replace(
`const API_KEY = 
  process.env.GOOGLE_MAPS_PLATFORM_KEY || 
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || 
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY || 
  "";`,
`const API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || "";`
);
fs.writeFileSync('src/pages/Home.tsx', homeText);

let exploreText = fs.readFileSync('src/pages/Explore.tsx', 'utf8');
exploreText = exploreText.replace(
`  const mapApiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || "";`,
`  const mapApiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || "";`
);
fs.writeFileSync('src/pages/Explore.tsx', exploreText);
