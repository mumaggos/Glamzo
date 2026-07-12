import * as fs from 'fs';

let content = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

// 1. Add viewLayout and searchRadius state
content = content.replace(
  /const \[viewModeMobile, setViewModeMobile\] = useState<"list" \| "map">"list"\);/,
  `const [viewModeMobile, setViewModeMobile] = useState<"list" | "map">("list");
  const [viewLayout, setViewLayout] = useState<"list" | "grid">("list");
  const [searchRadius, setSearchRadius] = useState<number | null>(null);`
);

// 2. Map state (zoom and center) to react to radius
content = content.replace(
  /const \[geoLocating, setGeoLocating\] = useState\(false\);/,
  `const [geoLocating, setGeoLocating] = useState(false);
  const [mapZoom, setMapZoom] = useState<number>(6);
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number} | null>(null);`
);

// 3. Effect for radius zoom
content = content.replace(
  /const handleNearMeToggle = \(\) => \{/,
  `useEffect(() => {
    if (userCoords) {
      setMapCenter({ lat: userCoords.latitude, lng: userCoords.longitude });
      if (searchRadius === null) setMapZoom(6);
      else if (searchRadius <= 5) setMapZoom(12);
      else if (searchRadius <= 10) setMapZoom(11);
      else if (searchRadius <= 25) setMapZoom(10);
      else if (searchRadius <= 50) setMapZoom(9);
    }
  }, [searchRadius, userCoords]);

  const handleNearMeToggle = () => {`
);

// 4. filteredBusinesses for radius
content = content.replace(
  /if \(searchLocation\.trim\(\) && !useNearMe\) \{/,
  `if (searchRadius !== null && b.distance !== null && b.distance > searchRadius) {
      return false;
    }
    if (searchLocation.trim() && !useNearMe) {`
);

// 5. BusinessCard props and styling
const businessCardSearch = `const BusinessCard: React.FC<{ b: any }> = ({ b }) => {
    const isHighlighted = clickedPinId === b.id || hoveredShopId === b.id;`;

const businessCardReplace = `const BusinessCard: React.FC<{ b: any, viewMode?: "list" | "grid" }> = ({ b, viewMode = "list" }) => {
    const isHighlighted = clickedPinId === b.id || hoveredShopId === b.id;`;

content = content.replace(businessCardSearch, businessCardReplace);

const businessCardDivSearch = `className={\`group flex flex-col w-full cursor-pointer bg-white rounded-2xl overflow-hidden transition-all font-['Inter'] \${isHighlighted ? 'ring-2 ring-purple-600 shadow-xl scale-[1.02] z-10' : 'border border-slate-100 shadow-sm hover:shadow-md'}\`}`;
const businessCardDivReplace = `className={\`group flex \${viewMode === 'list' ? 'flex-col sm:flex-row' : 'flex-col'} w-full cursor-pointer bg-white rounded-2xl overflow-hidden transition-all font-['Inter'] \${isHighlighted ? 'ring-2 ring-purple-600 shadow-xl scale-[1.02] z-10' : 'border border-slate-100 shadow-sm hover:shadow-md'}\`}`;
content = content.replace(businessCardDivSearch, businessCardDivReplace);

const businessCardImgContainerSearch = `className="relative aspect-[16/10] w-full bg-slate-100"`;
const businessCardImgContainerReplace = `className={\`relative \${viewMode === 'list' ? 'w-full sm:w-2/5 aspect-[16/10] sm:aspect-[4/3]' : 'w-full aspect-[16/10]'} bg-slate-100 shrink-0\`}`;
content = content.replace(businessCardImgContainerSearch, businessCardImgContainerReplace);

const businessCardContentSearch = `className="p-4 flex flex-col gap-1.5"`;
const businessCardContentReplace = `className={\`p-4 flex flex-col gap-1.5 flex-1 \${viewMode === 'grid' ? 'justify-between' : 'justify-center'}\`}`;
content = content.replace(businessCardContentSearch, businessCardContentReplace);

const businessCardDesc = `// Use slots directly from the RPC response`;
const businessCardDescReplace = `const isGrid = viewMode === 'grid';
    // Use slots directly from the RPC response`;
content = content.replace(businessCardDesc, businessCardDescReplace);


// 6. Top controls (List/Grid toggles and Search Radius)
const topControlsSearch = `<div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 font-['Outfit']">Explorar ({sortedBusinesses.length})</h2>
           </div>`;

const topControlsReplace = `<div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-black text-slate-900 font-['Outfit']">Explorar ({sortedBusinesses.length})</h2>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                  <button onClick={() => setViewLayout('list')} className={\`p-1.5 rounded-md transition-colors \${viewLayout === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}\`}>
                    <List className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewLayout('grid')} className={\`p-1.5 rounded-md transition-colors \${viewLayout === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}\`}>
                    <Grid className="w-4 h-4" />
                  </button>
                </div>
              </div>
           </div>`;
content = content.replace(topControlsSearch, topControlsReplace);

// 7. Grid/List Container
const gridContainerSearch = `<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {paginatedBusinesses.map((b) => <BusinessCard key={b.id} b={b} />)}
                </div>`;
const gridContainerReplace = `<div className={viewLayout === 'list' ? "flex flex-col gap-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"}>
                  {paginatedBusinesses.map((b) => <BusinessCard key={b.id} b={b} viewMode={viewLayout} />)}
                </div>`;
content = content.replace(gridContainerSearch, gridContainerReplace);

// 8. Filters Drawer / Top Filter Bar: Add Search Radius
const filterBarSearch = `<select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-purple-500">
        <option value="recomendados">Recomendados</option>
        <option value="distancia">Mais Próximo (Km)</option>
        <option value="preco_asc">Preço: Mais barato primeiro</option>
        <option value="rating">Melhor Avaliação</option>
      </select>`;
const filterBarReplace = `<select value={searchRadius !== null ? searchRadius.toString() : ""} onChange={(e) => setSearchRadius(e.target.value ? Number(e.target.value) : null)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-purple-500">
        <option value="">Raio: Todos</option>
        <option value="5">Até 5 km</option>
        <option value="10">Até 10 km</option>
        <option value="25">Até 25 km</option>
        <option value="50">Até 50 km</option>
      </select>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-purple-500">
        <option value="recomendados">Recomendados</option>
        <option value="distancia">Distância: Mais Próximo</option>
        <option value="preco_asc">Preço: Mais barato primeiro</option>
        <option value="rating">Melhor Avaliação</option>
      </select>`;
content = content.replace(filterBarSearch, filterBarReplace);

// Filter Drawer Mobile: Add Search Radius
const mobileFilterSearch = `<label className="block text-xs font-bold text-slate-700 mb-2">Ordenação</label>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-purple-500 mb-4">
        <option value="recomendados">Recomendados</option>
        <option value="distancia">Mais Próximo (Km)</option>
        <option value="preco_asc">Preço: Mais barato primeiro</option>
        <option value="rating">Melhor Avaliação</option>
      </select>`;
const mobileFilterReplace = `<label className="block text-xs font-bold text-slate-700 mb-2">Raio de Pesquisa</label>
      <select value={searchRadius !== null ? searchRadius.toString() : ""} onChange={(e) => setSearchRadius(e.target.value ? Number(e.target.value) : null)} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-purple-500 mb-4">
        <option value="">Todos</option>
        <option value="5">Até 5 km</option>
        <option value="10">Até 10 km</option>
        <option value="25">Até 25 km</option>
        <option value="50">Até 50 km</option>
      </select>
      <label className="block text-xs font-bold text-slate-700 mb-2">Ordenação</label>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-purple-500 mb-4">
        <option value="recomendados">Recomendados</option>
        <option value="distancia">Distância: Mais Próximo</option>
        <option value="preco_asc">Preço: Mais barato primeiro</option>
        <option value="rating">Melhor Avaliação</option>
      </select>`;
content = content.replace(mobileFilterSearch, mobileFilterReplace);

// Update Map defaultCenter and defaultZoom to controlled ones if they exist, wait let's use controlled zoom/center.
// Actually in @vis.gl/react-google-maps we can pass `zoom` and `center` to control it.
const mapSearch = `<Map 
     defaultCenter={userCoords ? { lat: userCoords.latitude, lng: userCoords.longitude } : { lat: 39.3999, lng: -8.2245 }} 
     defaultZoom={userCoords ? 11 : 6} 
     disableDefaultUI 
     styles={mapStyles} 
     options={{ styles: mapStyles }}
     onBoundsChanged={(e) => {`;
const mapReplace = `<Map 
     center={mapCenter || (userCoords ? { lat: userCoords.latitude, lng: userCoords.longitude } : { lat: 39.3999, lng: -8.2245 })} 
     zoom={mapZoom} 
     disableDefaultUI 
     styles={mapStyles} 
     options={{ styles: mapStyles }}
     onCameraChanged={(e) => {
        setMapCenter(e.detail.center);
        setMapZoom(e.detail.zoom);
     }}
     onBoundsChanged={(e) => {`;
content = content.replace(mapSearch, mapReplace);

fs.writeFileSync('src/pages/Explore.tsx', content);
