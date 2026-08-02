const fs = require('fs');
let code = fs.readFileSync('src/components/HomeBelowFold.tsx', 'utf8');

// Remove mapVisible state and effect
code = code.replace(/  const \[mapVisible, setMapVisible\] = useState\(false\);\n/g, '');
code = code.replace(/  const mapRef = useRef<HTMLDivElement>\(null\);\n/g, '');
code = code.replace(/  useEffect\(\(\) => \{\n    const observer = new IntersectionObserver\(\(entries\) => \{\n      if \(entries\[0\]\.isIntersecting\) \{\n        setMapVisible\(true\);\n        observer\.disconnect\(\);\n      \}\n    \}, \{ rootMargin: '300px' \}\);\n    if \(mapRef\.current\) observer\.observe\(mapRef\.current\);\n    return \(\) => observer\.disconnect\(\);\n  \}, \[\]\);\n/g, '');

// Replace the conditional render
code = code.replace(/        \{mapVisible \? \(\n          <Suspense fallback=\{<div className="h-\[450px\] sm:h-\[500px\] rounded-3xl overflow-hidden border border-slate-200\/80 shadow-sm bg-slate-100 animate-pulse" \/>\}>\n            <HomeMap userCoords=\{userCoords\} mapBusinesses=\{mapBusinesses\} currentLangCode=\{currentLangCode\} \/>\n          <\/Suspense>\n        \) : \(\n          <div className="h-\[500px\] bg-slate-100 rounded-3xl flex items-center justify-center">\n            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" \/>\n          <\/div>\n        \)\}/g, `        <Suspense fallback={<div className="h-[450px] sm:h-[500px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm bg-slate-100 flex items-center justify-center"><Loader2 className="w-8 h-8 text-purple-600 animate-spin" /></div>}>
          <HomeMap userCoords={userCoords} mapBusinesses={mapBusinesses} currentLangCode={currentLangCode} />
        </Suspense>`);

// Remove ref from section
code = code.replace(/<section ref=\{mapRef\}/g, '<section');

fs.writeFileSync('src/components/HomeBelowFold.tsx', code);
