import * as fs from 'fs';

let content = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

content = content.replace(
  /const \[geoLocating, setGeoLocating\] = useState\(false\);/,
  `const [geoLocating, setGeoLocating] = useState(false);
  const [mapZoom, setMapZoom] = useState<number>(6);
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number} | null>(null);`
);

fs.writeFileSync('src/pages/Explore.tsx', content);
