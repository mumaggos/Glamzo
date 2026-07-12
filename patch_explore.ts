import * as fs from 'fs';

let content = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

// Replace sort and filters state variables
content = content.replace(
  /const \[useNearMe, setUseNearMe\].*?;[\s\S]*?const \[itemsLimit, setItemsLimit\]/m,
  `const [useNearMe, setUseNearMe] = useState(searchParams.get("nearMe") === "true");
  const [mapBounds, setMapBounds] = useState<any>(null);
  const [sortBy, setSortBy] = useState<string>("recomendados"); // recomendados, distancia, preco_asc, rating
  const [abertoAgora, setAbertoAgora] = useState(false);
  const [minimo4Estrelas, setMinimo4Estrelas] = useState(false);
  const [itemsLimit, setItemsLimit]`
);

// We need to inject the Map bounds checking logic in `filteredBusinesses` and the `sortedBusinesses`
const filterReplacement = `  const filteredBusinesses = processedBusinesses.filter((b) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (b.name || "").toLowerCase().includes(q);
      const matchCat = (b.category || "").toLowerCase().includes(q);
      const matchServices = services.some(s => s.business_id === b.id && s.name.toLowerCase().includes(q));
      if (!matchName && !matchCat && !matchServices) return false;
    }
    if (searchLocation.trim() && !useNearMe) {
      const locQ = searchLocation.toLowerCase().trim();
      const matchCity = (b.city || "").toLowerCase().includes(locQ);
      const matchDist = (b.district || "").toLowerCase().includes(locQ);
      const matchAddress = (b.address || "").toLowerCase().includes(locQ);
      if (!matchCity && !matchDist && !matchAddress) return false;
    }
    
    // Bounds filtering
    if (mapBounds && viewModeMobile !== 'list') {
      const lat = b.lat;
      const lng = b.lng;
      if (lat < mapBounds.south || lat > mapBounds.north || lng < mapBounds.west || lng > mapBounds.east) {
        return false;
      }
    } else if (useNearMe && userCoords && b.distance !== null) {
      // fallback to radius if no map bounds (e.g. mobile list view without map)
      if (b.distance > 50) return false; // expanded default to 50km
    }

    if (selectedCategory !== "All" && b.category !== selectedCategory) return false;
    if (abertoAgora && !b.isOpenNow) return false;
    if (minimo4Estrelas && b.rating < 4) return false;

    return true;
  });

  const sortedBusinesses = [...filteredBusinesses].sort((x, y) => {
    if (sortBy === 'distancia' && x.distance !== null && y.distance !== null) return x.distance - y.distance;
    if (sortBy === 'preco_asc') return x.startPrice - y.startPrice;
    if (sortBy === 'rating') return y.rating - x.rating;
    
    // Recomendados
    if (x.is_promoted && !y.is_promoted) return -1;
    if (!x.is_promoted && y.is_promoted) return 1;
    if (x.distance !== null && y.distance !== null && useNearMe) return x.distance - y.distance;
    if (x.is_verified && !y.is_verified) return -1;
    if (!x.is_verified && y.is_verified) return 1;
    return y.rating - x.rating;
  });`;

content = content.replace(
  /const filteredBusinesses = processedBusinesses\.filter\(\(b\) => \{[\s\S]*?\}\);\s*const sortedBusinesses = \[\.\.\.filteredBusinesses\]\.sort\(\(x, y\) => \{[\s\S]*?\}\);/m,
  filterReplacement
);

// Map modifications
content = content.replace(
  /<Map defaultCenter=\{.*?\} defaultZoom=\{.*?\} disableDefaultUI styles=\{mapStyles\} options=\{\{ styles: mapStyles \}\}>/m,
  `<Map 
     defaultCenter={userCoords ? { lat: userCoords.latitude, lng: userCoords.longitude } : { lat: 39.3999, lng: -8.2245 }} 
     defaultZoom={userCoords ? 11 : 6} 
     disableDefaultUI 
     styles={mapStyles} 
     options={{ styles: mapStyles }}
     onBoundsChanged={(e) => {
       if (e.detail.bounds) {
         setMapBounds(e.detail.bounds);
       }
     }}
  >`
);

// Now the UI for filters. Let's find the drawer
content = content.replace(
  /<button onClick=\{\(\) => setIsDrawerOpen\(true\)\} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">[\s\S]*?<\/button>/m,
  `<div className="hidden lg:flex items-center gap-2">
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-purple-500">
        <option value="recomendados">Recomendados</option>
        <option value="distancia">Mais Próximo (Km)</option>
        <option value="preco_asc">Preço: Mais barato primeiro</option>
        <option value="rating">Melhor Avaliação</option>
      </select>
      <button onClick={() => setAbertoAgora(!abertoAgora)} className={\`px-3 py-2 rounded-lg text-xs font-bold transition-colors \${abertoAgora ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}\`}>
        Aberto Agora
      </button>
      <button onClick={() => setMinimo4Estrelas(!minimo4Estrelas)} className={\`px-3 py-2 rounded-lg text-xs font-bold transition-colors \${minimo4Estrelas ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}\`}>
        Apenas 4+ ⭐
      </button>
   </div>
   <button onClick={() => setIsDrawerOpen(true)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors lg:ml-2">
     <SlidersHorizontal className="w-4 h-4" /> Filtros
   </button>`
);

content = content.replace(
  /<div>\s*<label className="block text-xs font-bold text-slate-700 mb-2">Pontuação Mínima<\/label>[\s\S]*?<\/div>\s*<\/div>/m,
  `<div>
      <label className="block text-xs font-bold text-slate-700 mb-2">Ordenação</label>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-purple-500 mb-4">
        <option value="recomendados">Recomendados</option>
        <option value="distancia">Mais Próximo (Km)</option>
        <option value="preco_asc">Preço: Mais barato primeiro</option>
        <option value="rating">Melhor Avaliação</option>
      </select>
      <label className="block text-xs font-bold text-slate-700 mb-2">Filtros Rápidos</label>
      <div className="flex gap-2">
        <button onClick={() => setAbertoAgora(!abertoAgora)} className={\`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors \${abertoAgora ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-slate-50 border border-slate-200 text-slate-700'}\`}>
          Aberto Agora
        </button>
        <button onClick={() => setMinimo4Estrelas(!minimo4Estrelas)} className={\`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors \${minimo4Estrelas ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-50 border border-slate-200 text-slate-700'}\`}>
          Apenas 4+ ⭐
        </button>
      </div>
   </div>
</div>`
);

content = content.replace(
  /const handleClearFilters = \(\) => \{[\s\S]*?setItemsLimit\(12\);\s*\};/m,
  `const handleClearFilters = () => {
    setLocalSearchQuery(""); setSearchQuery("");
    setLocalSearchLocation(""); setSearchLocation("");
    setUseNearMe(false); setUserCoords(null);
    setSelectedCategory("All");
    setSortBy("recomendados");
    setAbertoAgora(false);
    setMinimo4Estrelas(false);
    setItemsLimit(12);
  };`
);


fs.writeFileSync('src/pages/Explore.tsx', content);
