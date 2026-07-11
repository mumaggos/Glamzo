import fs from 'fs';
let content = fs.readFileSync('src/pages/Explore.tsx', 'utf-8');

const targetContentStart = `export default function Explore() {`;

const parts = content.split(targetContentStart);

content = parts[0] + `export default function Explore() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewModeMobile, setViewModeMobile] = useState<"list" | "map">("list");
  
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [promotions, setPromotions] = useState<Record<string, { is_promoted: boolean }>>({});

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [localSearchQuery, setLocalSearchQuery] = useState(searchParams.get("q") || "");
  const [searchLocation, setSearchLocation] = useState(searchParams.get("city") || "");
  const [localSearchLocation, setLocalSearchLocation] = useState(searchParams.get("city") || "");

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(localSearchQuery);
      setSearchLocation(localSearchLocation);
    }, 800);
    return () => clearTimeout(handler);
  }, [localSearchQuery, localSearchLocation]);

  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") || "All");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(searchParams.get("subcategory") || "All");
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number; } | null>(null);
  const [geoLocating, setGeoLocating] = useState(false);
  const [useNearMe, setUseNearMe] = useState(searchParams.get("nearMe") === "true");
  
  const [nearMeRadius, setNearMeRadius] = useState<number>(20);
  const [minRating, setMinRating] = useState<number>(0);
  const [priceLevel, setPriceLevel] = useState<string>("All");
  const [filterHomeService, setFilterHomeService] = useState(false);
  const [filterPremiumPartner, setFilterPremiumPartner] = useState(false);
  const [filterAvailableToday, setFilterAvailableToday] = useState(false);
  
  const [itemsLimit, setItemsLimit] = useState(12);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
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

  const fetchExploreData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [bizRes, servRes, realRev, hoursRes] = await Promise.all([
        supabase.from("businesses").select("*").eq("status", "active"),
        supabase.from("services").select("*").eq("is_active", true),
        fetchAllReviews(),
        supabase.from("business_hours").select("*"),
      ]);
      let loadedBiz = (bizRes.data || []).filter(b => b.public_page_enabled !== false);
      let loadedServices = servRes.data || [];
      let loadedReviews = realRev || [];
      let loadedHours = hoursRes.data || [];
      
      setBusinesses(loadedBiz);
      setServices(loadedServices);
      setReviews(loadedReviews || []);
      (window as any).__exploreBusinessHours = loadedHours || [];
      
      const promoMap: Record<string, { is_promoted: boolean }> = {};
      const now = Date.now();
      loadedBiz.forEach((b) => {
        const isPromoted = !!b.is_promoted;
        const endsAt = b.promotion_ends_at;
        promoMap[b.id] = { is_promoted: isPromoted && (!endsAt || new Date(endsAt).getTime() > now) };
      });
      setPromotions(promoMap);
    } catch (err: any) {
      setErrorMsg("Falha ao carregar diretório. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExploreData();
  }, []);

  useEffect(() => {
    if (user?.id) fetchCustomerFavorites(user.id).then(setUserFavorites);
    else setUserFavorites([]);
  }, [user]);

  const handleToggleFavorite = async (businessId: string) => {
    if (!user) {
      alert("Por favor, inicie sessão para guardar favoritos!");
      return;
    }
    const isNowFav = await toggleFavorite(user.id, businessId);
    setUserFavorites((prev) => isNowFav ? [...prev, businessId] : prev.filter((id) => id !== businessId));
  };

  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchQuery.trim()) params.q = searchQuery.trim();
    if (searchLocation.trim() && !useNearMe) params.city = searchLocation.trim();
    if (selectedCategory !== "All") params.category = selectedCategory;
    if (selectedSubcategory !== "All") params.subcategory = selectedSubcategory;
    if (useNearMe) params.nearMe = "true";
    setSearchParams(params, { replace: true });
  }, [searchQuery, searchLocation, selectedCategory, selectedSubcategory, useNearMe]);

  const handleNearMeToggle = () => {
    if (useNearMe) {
      setUseNearMe(false);
      setLocalSearchLocation("");
    } else {
      if (!userCoords && navigator.geolocation) {
        setGeoLocating(true);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
            setLocalSearchLocation("Perto de Mim");
            setUseNearMe(true);
            setGeoLocating(false);
          },
          () => {
            alert("Ative a localização no seu dispositivo.");
            setGeoLocating(false);
          }
        );
      } else if (userCoords) {
        setLocalSearchLocation("Perto de Mim");
        setUseNearMe(true);
      }
    }
  };

  const handleClearFilters = () => {
    setLocalSearchQuery(""); setSearchQuery("");
    setLocalSearchLocation(""); setSearchLocation("");
    setUseNearMe(false); setUserCoords(null);
    setSelectedCategory("All"); setSelectedSubcategory("All");
    setMinRating(0); setPriceLevel("All");
    setFilterHomeService(false); setFilterPremiumPartner(false); setFilterAvailableToday(false);
    setItemsLimit(12);
  };

  const processedBusinesses = businesses.map((b) => {
    const lat = b.latitude ?? getCoordinatesForCity(b.district, b.city).latitude;
    const lng = b.longitude ?? getCoordinatesForCity(b.district, b.city).longitude;
    let distance: number | null = null;
    if (userCoords) {
      distance = calculateDistanceInKm(userCoords.latitude, userCoords.longitude, lat, lng);
    }
    const bizReviews = reviews.filter((r) => r.business_id === b.id);
    let rating = bizReviews.length > 0 ? bizReviews.reduce((sum, r) => sum + r.rating, 0) / bizReviews.length : 0;
    let reviewsCount = bizReviews.length;
    const bServices = services.filter((s) => s.business_id === b.id);
    let realStartPrice = 0;
    let hasRealPromotion = !!promotions[b.id]?.is_promoted || !!b.is_promoted;
    
    // Simplification for the rewrite
    const isOpenNow = true; 
    const isPremiumVal = !!b.is_premium || (rating >= 4.5 && reviewsCount >= 1 && b.is_verified);
    return { ...b, lat, lng, distance, rating, reviewsCount, startPrice: realStartPrice, isOpenNow, is_promoted: hasRealPromotion, is_premium: isPremiumVal };
  });

  const filteredBusinesses = processedBusinesses.filter((b) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.name.toLowerCase().includes(q);
      const matchCat = b.category.toLowerCase().includes(q);
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
    if (useNearMe && userCoords && b.distance !== null) {
      if (b.distance > nearMeRadius) return false;
    }
    if (selectedCategory !== "All" && b.category !== selectedCategory) return false;
    if (selectedSubcategory !== "All" && b.subcategory !== selectedSubcategory) return false;
    if (filterHomeService) {
      const isDomicil = b.category === "Ao domicílio" || (b.description || "").toLowerCase().includes("domicílio");
      if (!isDomicil) return false;
    }
    if (filterPremiumPartner && !b.is_verified) return false;
    if (minRating > 0 && b.rating < minRating) return false;
    return true;
  });

  const sortedBusinesses = [...filteredBusinesses].sort((x, y) => {
    if (x.is_promoted && !y.is_promoted) return -1;
    if (!x.is_promoted && y.is_promoted) return 1;
    if (useNearMe && x.distance !== null && y.distance !== null) return x.distance - y.distance;
    if (x.is_verified && !y.is_verified) return -1;
    if (!x.is_verified && y.is_verified) return 1;
    return y.rating - x.rating;
  });

  const paginatedBusinesses = sortedBusinesses.slice(0, itemsLimit);
  const mapApiKey = (import.meta as any).env.VITE_GOOGLE_MAPS_PLATFORM_KEY || "";

  const BusinessCard: React.FC<{ b: any }> = ({ b }) => (
    <Link to={\`/business/\${b.slug}\`} className="group flex flex-col w-full cursor-pointer bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all font-['Inter']">
      <div className="relative aspect-[16/10] w-full bg-slate-100">
        <img loading="lazy" 
          src={b.cover_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600"} 
          alt={b.name}  
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {b.is_promoted && (
            <span className="bg-white text-[#0f172a] text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg">Destaque</span>
          )}
        </div>
        <button onClick={(e) => { e.preventDefault(); handleToggleFavorite(b.id); }} aria-label={userFavorites.includes(b.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"} className="absolute top-3 right-3 p-1.5 rounded-full text-white hover:scale-110 transition-transform drop-shadow-md z-10">
          <Heart className={\`w-6 h-6 stroke-[1.5] transition-colors \${userFavorites.includes(b.id) ? "fill-rose-500 stroke-rose-500" : "fill-black/20 stroke-white"}\`} />
        </button>
      </div>
      <div className="p-4 flex flex-col gap-1.5">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-[#0f172a] text-base line-clamp-1 font-['Outfit']">{b.name}</h3>
          <div className="flex items-center gap-1 text-sm font-semibold text-[#0f172a] shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{b.rating > 0 ? b.rating.toFixed(1) : "Novo"}</span>
          </div>
        </div>
        <p className="text-xs font-medium text-purple-600 truncate">{b.category}</p>
        <p className="text-xs text-slate-500 truncate">{b.city} {b.distance && \`(\${b.distance.toFixed(1)}km)\`}</p>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Barra de Filtros Topo */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 overflow-x-auto custom-scrollbar pb-1">
            <button onClick={() => setSelectedCategory("All")} className={\`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors \${selectedCategory === "All" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}\`}>Todos</button>
            {MAIN_CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={\`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors \${selectedCategory === cat ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}\`}>{getCategoryDisplayName(cat)}</button>
            ))}
          </div>
          <div className="ml-4 pl-4 border-l border-slate-200 hidden md:flex items-center gap-3">
             <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" value={localSearchQuery} onChange={(e) => setLocalSearchQuery(e.target.value)} placeholder="Pesquisar loja..." className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-purple-500" />
             </div>
             <button onClick={() => setIsDrawerOpen(true)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
               <SlidersHorizontal className="w-4 h-4" /> Mais Filtros
             </button>
          </div>
          <div className="md:hidden ml-2 flex items-center">
             <button onClick={() => setIsDrawerOpen(true)} className="p-2 bg-slate-100 rounded-lg text-slate-700">
               <SlidersHorizontal className="w-5 h-5" />
             </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex w-full relative">
        {/* Lado Esquerdo - Lista (Mostrado em Mobile se list, Desktop sempre) */}
        <div className={\`w-full lg:w-[55%] xl:w-[50%] flex-col h-[calc(100vh-65px)] overflow-y-auto custom-scrollbar bg-slate-50 p-4 lg:p-6 \${viewModeMobile === 'map' ? 'hidden lg:flex' : 'flex'}\`}>
           <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 font-['Outfit']">Explorar ({sortedBusinesses.length})</h2>
           </div>
           
           {loading ? (
              <div className="flex flex-col items-center justify-center flex-1 py-20">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
                <p className="text-sm font-medium text-slate-500">A carregar lojas...</p>
              </div>
            ) : sortedBusinesses.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {paginatedBusinesses.map((b) => <BusinessCard key={b.id} b={b} />)}
                </div>
                {sortedBusinesses.length > itemsLimit && (
                  <div className="text-center pt-8 pb-12">
                    <button onClick={() => setItemsLimit(itemsLimit + 12)} className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold transition-colors shadow-sm">
                      Carregar mais
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white p-12 border border-slate-200 rounded-3xl text-center flex flex-col items-center mt-10">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Nenhum espaço encontrado</h3>
                <p className="text-xs text-slate-500 mt-2 max-w-sm">Tente limpar os filtros ou pesquisar noutra zona.</p>
                <button onClick={handleClearFilters} className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold">Limpar Tudo</button>
              </div>
            )}
        </div>

        {/* Lado Direito - Mapa (Escondido em Mobile se list, Desktop sempre) */}
        <div className={\`w-full lg:w-[45%] xl:w-[50%] lg:h-[calc(100vh-65px)] lg:sticky lg:top-[65px] bg-slate-200 \${viewModeMobile === 'list' ? 'hidden lg:block' : 'block h-[calc(100vh-65px)]'}\`}>
           {mapApiKey ? (
             <APIProvider apiKey={mapApiKey}>
               <Map defaultCenter={userCoords ? { lat: userCoords.latitude, lng: userCoords.longitude } : { lat: 39.3999, lng: -8.2245 }} defaultZoom={userCoords ? 11 : 6} disableDefaultUI styles={mapStyles} options={{ styles: mapStyles }}>
                 {userCoords && <Marker position={{ lat: userCoords.latitude, lng: userCoords.longitude }} icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png" />}
                 {sortedBusinesses.slice(0, 50).map((b) => (
                   <Marker key={b.id} position={{ lat: b.lat, lng: b.lng }} icon={{ url: getCustomMarkerIcon(b.rating), anchor: { x: 20, y: 50 } }} onClick={() => navigate(\`/business/\${b.slug}\`)} />
                 ))}
               </Map>
             </APIProvider>
           ) : (
             <div className="flex flex-col items-center justify-center h-full bg-slate-100 text-slate-500 p-8 text-center">
                <MapPin className="w-8 h-8 mb-3 opacity-50" />
                <p className="text-sm font-bold">Mapa Indisponível</p>
                <p className="text-xs mt-1">Configure a API Key do Google Maps.</p>
             </div>
           )}
        </div>
      </div>

      {/* Mobile Floating Toggle Button */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
         <button 
           onClick={() => setViewModeMobile(viewModeMobile === 'list' ? 'map' : 'list')}
           className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl text-xs font-bold flex items-center gap-2 hover:bg-black transition-colors"
         >
           {viewModeMobile === 'list' ? (
             <><MapIcon className="w-4 h-4" /> Mostrar Mapa</>
           ) : (
             <><List className="w-4 h-4" /> Mostrar Lista</>
           )}
         </button>
      </div>

      {/* Gaveta Mobile para Filtros (Simplificada) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setIsDrawerOpen(false)} />
          <div className="w-full max-w-sm bg-white h-full shadow-2xl relative flex flex-col animate-slide-in-right font-['Inter']">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 font-['Outfit']">Filtros</h2>
              <button onClick={() => setIsDrawerOpen(false)} aria-label="Fechar" className="p-2 bg-slate-100 rounded-full"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               <div>
                 <label className="block text-xs font-bold text-slate-700 mb-2">Localização</label>
                 <div className="relative mb-2">
                   <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                   <input type="text" value={localSearchLocation} onChange={(e) => setLocalSearchLocation(e.target.value)} placeholder="Ex: Lisboa..." className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                 </div>
                 <button onClick={handleNearMeToggle} className={\`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors \${useNearMe ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}\`}>
                    <Navigation className="w-4 h-4" /> Usar a minha localização
                 </button>
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Pontuação Mínima</label>
                  <div className="flex gap-2">
                    {[0, 3, 4, 4.5].map(r => (
                      <button key={r} onClick={() => setMinRating(r)} className={\`flex-1 py-2 text-xs font-bold rounded-lg border \${minRating === r ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white border-slate-200 text-slate-600'}\`}>
                        {r === 0 ? "Todas" : \`\${r}+\`}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
            <div className="p-5 border-t border-slate-100">
               <button onClick={() => setIsDrawerOpen(false)} className="w-full py-3.5 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-md">Aplicar Filtros</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;
fs.writeFileSync('src/pages/Explore.tsx', content);
