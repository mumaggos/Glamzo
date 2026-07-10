import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// Remove geolocation from useEffect
content = content.replace(
`    if (navigator.geolocation) { 
      const gpsTimer = setTimeout(() => {
        navigator.geolocation.getCurrentPosition((pos) => { 
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); 
        }); 
      }, 300);
      return () => clearTimeout(gpsTimer);
    } `,
"");

// Add aria-labels to buttons
content = content.replace(
  `onClick={() => scrollCategories('left')} className="absolute`,
  `onClick={() => scrollCategories('left')} aria-label="Ver categorias anteriores" className="absolute`
);
content = content.replace(
  `onClick={() => scrollCategories('right')} className="absolute`,
  `onClick={() => scrollCategories('right')} aria-label="Ver próximas categorias" className="absolute`
);

// Remove redundant alt text from category images
content = content.replace(
  `alt={cat.name} loading="lazy"`,
  `alt="" loading="lazy"`
);

// We need a way to get user location manually
const handleGetLocationFunction = `
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setSearchLocation("Perto de Mim");
          setShowLocSuggestions(false);
        },
        () => {
          alert("Não foi possível aceder à localização. Por favor, pesquise manualmente.");
          setShowLocSuggestions(false);
        }
      );
    }
  };
`;

content = content.replace(
  "const handleSearchSubmit = () => {",
  handleGetLocationFunction + "\n  const handleSearchSubmit = () => {"
);

content = content.replace(
  `<button onMouseDown={() => { setSearchLocation("Perto de Mim"); setShowLocSuggestions(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-blue-600 text-sm font-bold flex items-center gap-2 border-b border-slate-50 transition-colors">`,
  `<button onMouseDown={handleGetLocation} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-blue-600 text-sm font-bold flex items-center gap-2 border-b border-slate-50 transition-colors">`
);

fs.writeFileSync('src/pages/Home.tsx', content);
