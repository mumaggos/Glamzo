import fs from 'fs';

let content = fs.readFileSync('src/pages/Explore.tsx', 'utf-8');

// 1. Replace getCustomMarkerIcon
content = content.replace(
/const getCustomMarkerIcon = \(rating: number\) => \{[\s\S]*?return `data:image\/svg\+xml;.*?\};\n/s,
`const getCustomMarkerIcon = (rating: number) => {
  const finalRating = rating > 0 ? rating : 5.0;
  const ratingText = \`\${finalRating.toFixed(1)}\`;
  const bgColor = "#9333ea"; 
  const textColor = "#ffffff";
  const svg = \`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
      <g filter="drop-shadow(0px 4px 4px rgba(0,0,0,0.25))">
        <path d="M20 0C8.954 0 0 8.954 0 20c0 15 20 30 20 30s20-15 20-30C40 8.954 31.046 0 20 0z" fill="\${bgColor}" stroke="#ffffff" stroke-width="1.5"/>
        <text x="20" y="21" fill="\${textColor}" font-size="12px" font-family="Outfit, system-ui, sans-serif" font-weight="900" text-anchor="middle">
          \${ratingText}
        </text>
        <text x="20" y="28" fill="\${textColor}" font-size="7px" font-family="Outfit, system-ui, sans-serif" font-weight="bold" text-anchor="middle">
          ★
        </text>
      </g>
    </svg>
  \`;
  return \`data:image/svg+xml;charset=UTF-8,\${encodeURIComponent(svg.trim())}\`;
};
`);

content = content.replace(/anchor: \{ x: 29, y: 32 \}/g, 'anchor: { x: 20, y: 50 }');

// 2. Auto-locate on mount if map view or anytime
// In Explore.tsx, there's `const [userCoords, setUserCoords] = useState<{latitude: number, longitude: number} | null>(null);`
// And `useNearMe` state.

// Let's add the effect
const autoLocationEffect = `
  useEffect(() => {
    // Auto-locate user on mount
    if (navigator.geolocation) {
      setGeoLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          setLocalSearchLocation("Perto de Mim");
          setUseNearMe(true);
          setGeoLocating(false);
        },
        () => {
          setGeoLocating(false);
        }
      );
    }
  }, []);
`;

content = content.replace(
  /const \[geoLocating, setGeoLocating\] = useState\(false\);\n/,
  `const [geoLocating, setGeoLocating] = useState(false);\n${autoLocationEffect}\n`
);

fs.writeFileSync('src/pages/Explore.tsx', content);

