const fs = require('fs');
let code = fs.readFileSync('src/components/HomeBelowFold.tsx', 'utf8');

const observerCode = `
  const mapRef = useRef<HTMLDivElement>(null);
  const [loadMap, setLoadMap] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);
`;

// Insert the observer after const navigate = useNavigate();
code = code.replace(
  'const navigate = useNavigate();',
  'const navigate = useNavigate();\n' + observerCode
);

// Add ref to the section and conditional rendering
code = code.replace(
  '<section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full font-[\'Inter\']">',
  '<section ref={mapRef} className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full font-[\'Inter\']">'
);

code = code.replace(
  `        <Suspense fallback={<div className="h-[450px] sm:h-[500px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm bg-slate-100 flex items-center justify-center"><Loader2 className="w-8 h-8 text-purple-600 animate-spin" /></div>}>
          <HomeMap userCoords={userCoords} mapBusinesses={mapBusinesses} currentLangCode={currentLangCode} />
        </Suspense>`,
  `        <Suspense fallback={<div className="h-[450px] sm:h-[500px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm bg-slate-100 flex items-center justify-center"><Loader2 className="w-8 h-8 text-purple-600 animate-spin" /></div>}>
          {loadMap ? <HomeMap userCoords={userCoords} mapBusinesses={mapBusinesses} currentLangCode={currentLangCode} /> : <div className="h-[450px] sm:h-[500px] rounded-3xl bg-slate-100 animate-pulse" />}
        </Suspense>`
);

fs.writeFileSync('src/components/HomeBelowFold.tsx', code);
