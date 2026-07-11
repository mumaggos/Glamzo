import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// 1. Replace getCustomMarkerIcon
const oldIconMatch = content.match(/const getCustomMarkerIcon =.*?return \`data:image\/svg\+xml;utf-8,\$\{encodeURIComponent\(svg\.trim\(\)\)\}\`;\n\};/s);

if (oldIconMatch) {
  const newIcon = `const getCustomMarkerIcon = (rating: number) => {
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
};`;
  content = content.replace(oldIconMatch[0], newIcon);
} else {
  // Try another regex if first didn't match
  const oldIconMatch2 = content.match(/const getCustomMarkerIcon =.*?return \`data:image\/svg\+xml;charset=UTF-8,\$\{encodeURIComponent\(svg\)\}\`;\n\};/s);
  if(oldIconMatch2) {
    // replace
  }
}

// Just simpler replacement for the getCustomMarkerIcon
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

// 2. Add auto-location on mount
const autoLocationEffect = `
  useEffect(() => {
    // Auto-locate user on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setSearchLocation("Perto de Mim");
        },
        () => {} // fail silently on auto-locate
      );
    }
  }, []);
`;

// Insert autoLocationEffect inside Home function after states
content = content.replace(
  /const mapRef = useRef<HTMLElement>\(null\);\n/,
  `const mapRef = useRef<HTMLElement>(null);\n${autoLocationEffect}\n`
);

fs.writeFileSync('src/pages/Home.tsx', content);

