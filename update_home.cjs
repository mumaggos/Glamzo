const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// 1. Remove map imports
content = content.replace(
  'import { APIProvider, Map, Marker, useMap } from "@vis.gl/react-google-maps";',
  'import { lazy, Suspense } from "react";\nimport { Image } from "../components/Image";'
);

// 2. Remove map helper functions and API key
content = content.replace(/const API_KEY[\s\S]*?const SUGGESTED_CITIES =/m, 'const SUGGESTED_CITIES =');
content = content.replace(/const mapStyles = \[\s*\{ featureType[\s\S]*?optimizeUnsplashUrl =[\s\S]*?return url;\s*\n\};/m, '');

// 3. Add HomeMap lazy import
content = content.replace(
  'import { useTranslation } from "react-i18next";',
  'import { useTranslation } from "react-i18next";\nconst HomeMap = lazy(() => import("../components/HomeMap"));'
);

// 4. Replace <img> with <Image>
content = content.replace(/<img\s+src=\{optimizeUnsplashUrl\(b\.cover_url\)[^>]+>/g, (match) => {
  return match.replace('<img', '<Image').replace('optimizeUnsplashUrl(b.cover_url) || ', 'b.cover_url || ').replace('loading="lazy"', 'fill');
});

content = content.replace(/<img\s+src=\{cat\.image\}[^>]+>/g, (match) => {
  return match.replace('<img', '<Image').replace('loading="lazy"', 'fill');
});

// 5. Replace Map component with Suspense wrapping HomeMap
const mapHtmlPattern = /\{mapVisible \? \([\s\S]*?\) : \(/m;
const newMapHtml = `{mapVisible ? (
          <Suspense fallback={<div className="h-[450px] sm:h-[500px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm bg-slate-100 animate-pulse" />}>
            <HomeMap userCoords={userCoords} mapBusinesses={mapBusinesses} currentLangCode={currentLangCode} />
          </Suspense>
        ) : (`

content = content.replace(mapHtmlPattern, newMapHtml);

fs.writeFileSync('src/pages/Home.tsx', content);
console.log("Updated Home.tsx");
