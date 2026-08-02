const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Remove mapVisible state and mapRef
code = code.replace('  const [mapVisible, setMapVisible] = useState(false);\n', '');
code = code.replace('  const mapRef = useRef<HTMLElement>(null);\n', '');

// Remove the intersection observer effect in Home
code = code.replace(/  useEffect\(\(\) => \{\s+const observer = new IntersectionObserver\(\(entries\) => \{\s+if \(entries\[0\].isIntersecting\) \{\s+setMapVisible\(true\);\s+observer\.disconnect\(\);\s+\}\s+\}, \{ rootMargin: '300px' \}\); \/\/ Carrega 300px antes de chegar ao mapa\s+if \(mapRef\.current\) observer\.observe\(mapRef\.current\);\s+return \(\) => observer\.disconnect\(\);\s+\}, \[\]\);/g, '');

// Remove props passed to HomeBelowFold
code = code.replace('          mapRef={mapRef}\n', '');
code = code.replace('          mapVisible={mapVisible}\n', '');

fs.writeFileSync('src/pages/Home.tsx', code);
