import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { fetchAllReviews } from "../utils/reviewsHelper";
import {
  Search, MapPin, Star, Clock, Sparkles, Navigation, 
  CheckCircle2, ChevronRight, SlidersHorizontal, Map as MapIcon, 
  ShieldCheck, Zap, ThumbsUp, Home as HomeIcon, X, Loader2, ArrowRight,
  List, CreditCard, Tag
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getCoordinatesForCity, calculateDistanceInKm } from "../utils/geoData";


// Fix leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "";

const SMALL_CATEGORIES = [
  { name: "Barbeiro", icon: "💈" },
  { name: "Cabeleireiro", icon: "💇" },
  { name: "Unhas", icon: "💅" },
  { name: "Sobrancelhas", icon: "👁️" },
  { name: "Pestanas", icon: "👁" },
  { name: "Estética", icon: "🧖" },
  { name: "Medicina Estética", icon: "💉" },
  { name: "Massagens", icon: "💆" },
  { name: "Depilação", icon: "🪒" },
  { name: "Spa", icon: "💆" },
  { name: "Maquilhagem", icon: "💄" },
  { name: "Podologia", icon: "🦶" },
  { name: "Nutrição", icon: "🥗" },
  { name: "Bem-estar", icon: "🧘" },
  { name: "Fisioterapia", icon: "🩺" },
  { name: "Tatuagens", icon: "🎨" },
  { name: "Piercing", icon: "💎" },
];

const CITIES = [
  "Lisboa", "Porto", "Braga", "Coimbra", "Aveiro", "Faro", "Funchal", "Ponta Delgada"
];


const mapStyles = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] }
];

export default function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // View States
  const [activeCategory, setActiveCategory] = useState<string | null>(searchParams.get("category"));
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [localSearchQuery, setLocalSearchQuery] = useState(searchParams.get("q") || "");
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Data States
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // User Location
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);

  // Filters for Map/List View
  const [filterAbertoHoje, setFilterAbertoHoje] = useState(false);
  const [filterMaisPerto, setFilterMaisPerto] = useState(false);
  const [filterMaisBarato, setFilterMaisBarato] = useState(false);
  const [filterTopPartner, setFilterTopPartner] = useState(false);
  const [filterPagamentoOnline, setFilterPagamentoOnline] = useState(false);
  const [filterPromocoes, setFilterPromocoes] = useState(false);
  const [filterMelhorAvaliacao, setFilterMelhorAvaliacao] = useState(false);

  useEffect(() => {
    // Geolocation for Perto de Mim
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bizRes, revData, srvRes] = await Promise.all([
          supabase.from("businesses").select("*").eq("status", "active").eq("public_page_enabled", true),
          fetchAllReviews(),
          supabase.from("services").select("*").eq("is_active", true)
        ]);
        const srvData = srvRes.data || [];
        
        const loadedBiz = bizRes.data || [];
        setReviews(revData || []);

        const now = new Date();
        const processed = loadedBiz.map(b => {
          const bReviews = (revData || []).filter(r => r.business_id === b.id);
          const rating = bReviews.length ? bReviews.reduce((sum, r) => sum + r.rating, 0) / bReviews.length : (b.is_premium ? 4.8 : 0);
          
          let hash = 0;
          for (let i = 0; i < b.name.length; i++) { hash = b.name.charCodeAt(i) + ((hash << 5) - hash); }
          const derivedPrice = 15 + Math.abs(hash % 8) * 5;
          const bServices = srvData.filter((s: any) => s.business_id === b.id);
          const lat = b.latitude ?? getCoordinatesForCity(b.district, b.city).latitude;
          const lng = b.longitude ?? getCoordinatesForCity(b.district, b.city).longitude;
          
          let distance = null;
          if (userCoords) {
            distance = calculateDistanceInKm(userCoords.lat, userCoords.lng, lat, lng);
          }

          const createdDate = new Date(b.created_at);
          const isNew = (now.getTime() - createdDate.getTime()) < 15 * 24 * 60 * 60 * 1000;

          return { ...b, rating, reviewsCount: bReviews.length || (b.is_premium ? 24 : 0), startPrice: derivedPrice, lat, lng, distance, isOpenNow: true, isNew, services: bServices }; 
        });
        setBusinesses(processed);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userCoords]);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearchQuery);
      if (localSearchQuery.trim().length > 0) {
        setIsSearching(true);
      } else if (!activeCategory) {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearchQuery, activeCategory]);

  const handleCategoryClick = (catName: string) => {
    setActiveCategory(catName);
    setIsSearching(true);
    setSearchParams({ category: catName });
  };

  const handleCityClick = (city: string) => {
    setLocalSearchQuery(city);
    setIsSearching(true);
    setSearchParams({ q: city });
  };

  const handleClearSearch = () => {
    setActiveCategory(null);
    setSearchQuery("");
    setLocalSearchQuery("");
    setIsSearching(false);
    setSearchParams({});
  };

  const handlePertoDeMimClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setFilterMaisPerto(true);
        setIsSearching(true);
      }, () => {
        alert("Ative a localização no seu navegador.");
      });
    }
  };

  const topPartners = useMemo(() => businesses.filter(b => b.is_premium || b.is_verified), [businesses]);
  const recomendados = useMemo(() => [...businesses].sort((a, b) => b.rating - a.rating || (a.distance || 0) - (b.distance || 0)).slice(0, 10), [businesses]);
  const promocoes = useMemo(() => businesses.filter(b => b.is_promoted), [businesses]);
  const melhoresAvaliacoes = useMemo(() => [...businesses].sort((a, b) => b.rating - a.rating).slice(0, 10), [businesses]);
  const novasLojas = useMemo(() => [...businesses].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10), [businesses]);
  
  // New computed arrays
  const maisReservados = useMemo(() => [...businesses].sort((a, b) => (reviews.filter((r: any) => r.business_id === b.id).length > reviews.filter((r: any) => r.business_id === a.id).length ? 1 : -1)).slice(0, 10), [businesses, reviews]);
  const tendencias = useMemo(() => [...businesses].sort((a, b) => ((b.rating * reviews.filter((r: any) => r.business_id === b.id).length) - (a.rating * reviews.filter((r: any) => r.business_id === a.id).length))).slice(0, 10), [businesses, reviews]);
  
  
  // Search/Filter Results
  const getFilteredResults = () => {
    let res = [...businesses];
    
    const normalize = (str: string) => str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
    
    const isMatch = (b: any, term: string) => {
       const q = normalize(term);
       const qStem = q.endsWith('s') ? q.slice(0, -1) : q;
       
       const aliases: Record<string, string[]> = {
         'unha': ['nail', 'unha', 'manic', 'pedic'],
         'nail': ['nail', 'unha', 'manic', 'pedic'],
         'cabel': ['cabel', 'hair', 'barb'],
         'barb': ['barb', 'cabel', 'hair'],
         'maquilh': ['maquilh', 'makeup', 'make up', 'maquiag'],
         'makeup': ['maquilh', 'makeup', 'make up', 'maquiag'],
         'pestana': ['pestana', 'lash', 'cilio'],
         'lash': ['pestana', 'lash', 'cilio'],
         'massag': ['massag', 'massagem', 'massage'],
         'estetic': ['estetic', 'estética']
       };
       let searchTerms = [qStem, q];
       for (const key of Object.keys(aliases)) {
         if (qStem.includes(key)) {
           searchTerms = [...searchTerms, ...aliases[key]];
         }
       }
       
       const bCat = normalize(b.category);
       const bName = normalize(b.name);
       const bDesc = normalize(b.description);
       const bCity = normalize(b.city);
       
       const matchesAny = (text: string) => searchTerms.some(t => text.includes(t));
       if (matchesAny(bCat) || matchesAny(bName) || matchesAny(bDesc) || matchesAny(bCity)) return true;
       
       if (b.services && b.services.length > 0) {
         return b.services.some((s: any) => matchesAny(normalize(s.name)) || matchesAny(normalize(s.description)));
       }
       return false;
    };
    
    if (activeCategory) {
      res = res.filter(b => isMatch(b, activeCategory));
    }
    
    if (searchQuery) {
      res = res.filter(b => isMatch(b, searchQuery));
    }

    if (filterAbertoHoje) res = res.filter(b => b.isOpenNow);
    if (filterTopPartner) res = res.filter(b => b.is_premium || b.is_verified);
    if (filterPromocoes) res = res.filter(b => b.is_promoted);
    
    if (filterMaisPerto && userCoords) res.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    else if (filterMaisBarato) res.sort((a, b) => a.startPrice - b.startPrice);
    else if (filterMelhorAvaliacao) res.sort((a, b) => b.rating - a.rating);

    return res;
  };
  const searchResults = getFilteredResults();

  const BusinessCard: React.FC<{ b: any, horizontal?: boolean }> = ({ b, horizontal = false }) => (
    <Link to={`/business/${b.slug}`} className={`group bg-white rounded-3xl border border-slate-100/60 overflow-hidden hover:shadow-2xl hover:shadow-purple-900/5 transition-all duration-300 flex ${horizontal ? "flex-row h-40" : "flex-col min-w-[280px] max-w-[300px] sm:min-w-[320px] sm:max-w-[340px] shrink-0"}`}>
      <div className={`relative overflow-hidden ${horizontal ? "w-40 h-full shrink-0" : "h-48 sm:h-56"}`}>
        <img src={b.cover_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600"} alt={b.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {b.isNew && (
            <span className="bg-purple-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shadow-md">
              Nova
            </span>
          )}
          {(b.is_premium || b.is_verified) && (
            <span className="bg-slate-900/90 backdrop-blur-sm text-amber-400 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Top Partner
            </span>
          )}
          {b.is_promoted && (
            <span className="bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
              <Tag className="w-3 h-3" /> Promoção
            </span>
          )}
        </div>

        {/* Rating Overlay */}
        {b.rating > 0 && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur text-slate-900 text-[10px] font-black px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-lg">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            {b.rating.toFixed(1)} <span className="font-medium text-slate-500 ml-0.5 font-mono">({b.reviewsCount})</span>
          </div>
        )}
      </div>
      <div className={`p-5 flex flex-col justify-between flex-1 ${horizontal ? "py-4" : ""}`}>
        <div>
          <h3 className="font-display font-bold text-slate-900 text-base line-clamp-1 group-hover:text-purple-600 transition-colors">{b.name}</h3>
          <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-1 flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {b.city}, {b.district} {b.distance ? `· ${b.distance.toFixed(1)}km` : ''}
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between text-[11px] font-semibold border-t border-slate-100/50 pt-3">
          <span className="text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">{b.category}</span>
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">A partir de</span>
            <span className="text-purple-600 font-black text-sm">{b.startPrice}€</span>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-purple-100 selection:text-purple-900 flex flex-col">
      {/* 1. HERO SECTION */}
      {!isSearching && (
        <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
          {/* Subtle gradient background instead of solid image for cleaner premium look */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-white to-rose-50/30 -z-10" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&q=80')] opacity-[0.03] bg-cover bg-center -z-10 mix-blend-multiply" />
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
              Encontre o profissional <br />
              <span className="bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text text-transparent">
                perfeito perto de si.
              </span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-500 max-w-2xl mx-auto mb-10 font-medium">
              Reserve facilmente os melhores barbeiros, cabeleireiros, salões de beleza, spas e clínicas em Portugal.
            </p>

            {/* Smart Search Bar */}
            <div className="w-full max-w-3xl relative">
              <div className={`bg-white p-2.5 sm:p-3 rounded-full border border-slate-200/80 shadow-2xl shadow-purple-900/5 flex items-center relative z-20 transition-all duration-300 ${showSuggestions ? 'rounded-b-none border-b-0 shadow-none' : ''}`}>
                <Search className="w-5 h-5 text-purple-400 ml-4 shrink-0" />
                <input
                  type="text"
                  placeholder="Pesquise por salão, serviço, ou cidade..."
                  value={localSearchQuery}
                  onChange={(e) => {
                    setLocalSearchQuery(e.target.value);
                    if(e.target.value.length > 0) setShowSuggestions(true);
                    else setShowSuggestions(false);
                  }}
                  onFocus={() => localSearchQuery.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full bg-transparent border-none pl-4 pr-4 py-3 text-base text-slate-800 focus:outline-none focus:ring-0 placeholder-slate-400 font-medium"
                />
                
                <button 
                  onClick={handlePertoDeMimClick}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 hover:bg-slate-50 text-slate-600 rounded-full text-xs font-bold transition-all border border-slate-100 shrink-0 mr-2"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-500" /> Perto de Mim
                </button>

                <button 
                  onClick={() => { if(localSearchQuery.trim()) setIsSearching(true); }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 sm:px-8 rounded-full text-sm tracking-wide transition-all shrink-0 shadow-md"
                >
                  Procurar
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 bg-white border border-slate-200/80 border-t-0 rounded-b-3xl shadow-2xl shadow-purple-900/10 z-30 overflow-hidden pt-2 pb-4 px-2">
                  <div className="px-4 py-2 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Sugestões rápidas</div>
                  {CITIES.filter(c => c.toLowerCase().includes(localSearchQuery.toLowerCase())).slice(0, 3).map(city => (
                    <button key={city} onMouseDown={() => handleCityClick(city)} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 text-sm font-medium flex items-center gap-3 rounded-xl transition-colors">
                      <MapPin className="w-4 h-4 text-slate-400" /> {city}
                    </button>
                  ))}
                  {SMALL_CATEGORIES.filter(c => c.name.toLowerCase().includes(localSearchQuery.toLowerCase())).slice(0, 3).map(cat => (
                    <button key={cat.name} onMouseDown={() => handleCategoryClick(cat.name)} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 text-sm font-medium flex items-center gap-3 rounded-xl transition-colors">
                      <span className="text-lg">{cat.icon}</span> {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 2. CATEGORIES */}
      {!isSearching && (
        <section className="pb-16 max-w-7xl mx-auto relative z-20 -mt-6">
          <div className="flex overflow-x-auto gap-3 sm:gap-4 no-scrollbar snap-x pb-4 pt-2 px-4 sm:px-6 lg:px-8 after:content-[''] after:w-16 after:shrink-0">
            {SMALL_CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className="flex items-center justify-center gap-2 bg-white border border-slate-200/60 hover:border-purple-300 hover:bg-purple-50/50 hover:shadow-lg shadow-sm px-6 py-3.5 rounded-2xl transition-all duration-300 cursor-pointer group shrink-0 snap-start"
              >
                <span className="text-xl group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">{cat.icon}</span>
                <span className="text-[13px] font-bold text-slate-700 group-hover:text-purple-700 whitespace-nowrap">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 3. SECTIONS */}
      {!isSearching && (
        <div className="space-y-20 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-hidden">
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
          ) : (
            <>
              {/* Top Partner Section */}
              {topPartners.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-display font-extrabold text-slate-900 flex items-center gap-2.5">
                        💎 Top Partner
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">Os melhores profissionais avaliados pela plataforma.</p>
                    </div>
                  </div>
                  <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x px-4 sm:px-6 lg:px-8 after:content-[''] after:w-16 after:shrink-0">
                    {topPartners.map(b => (
                      <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>
                    ))}
                  </div>
                </section>
              )}

              {/* Recomendados para Si */}
              {recomendados.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-display font-extrabold text-slate-900 flex items-center gap-2.5">
                        ❤️ Recomendados para si
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">Com base na sua localização e avaliações de excelência.</p>
                    </div>
                  </div>
                  <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x px-4 sm:px-6 lg:px-8 after:content-[''] after:w-16 after:shrink-0">
                    {recomendados.map(b => (
                      <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>
                    ))}
                  </div>
                </section>
              )}

              {/* Promoções */}
              {promocoes.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-display font-extrabold text-slate-900 flex items-center gap-2.5">
                        🎁 Promoções
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">Descontos exclusivos por tempo limitado.</p>
                    </div>
                  </div>
                  <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x px-4 sm:px-6 lg:px-8 after:content-[''] after:w-16 after:shrink-0">
                    {promocoes.map(b => (
                      <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>
                    ))}
                  </div>
                </section>
              )}

              {/* Novas Lojas */}
              {novasLojas.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-display font-extrabold text-slate-900 flex items-center gap-2.5">
                        🆕 Acabaram de chegar
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">Conheça as novidades mais recentes no Glamzo.</p>
                    </div>
                  </div>
                  <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x px-4 sm:px-6 lg:px-8 after:content-[''] after:w-16 after:shrink-0">
                    {novasLojas.map(b => (
                      <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>
                    ))}
                  </div>
                </section>
              )}


              {/* Mais Reservados */}
              {maisReservados.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-display font-extrabold text-slate-900 flex items-center gap-2.5">
                        🔥 Mais reservados
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">Os espaços com mais procura na plataforma</p>
                    </div>
                  </div>
                  <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x px-4 sm:px-6 lg:px-8 after:content-[''] after:w-16 after:shrink-0">
                    {maisReservados.map(b => <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>)}
                  </div>
                </section>
              )}

              {/* Tendências */}
              {tendencias.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-display font-extrabold text-slate-900 flex items-center gap-2.5">
                        ✨ Tendências
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">Descubra o que está na moda</p>
                    </div>
                  </div>
                  <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x px-4 sm:px-6 lg:px-8 after:content-[''] after:w-16 after:shrink-0">
                    {tendencias.map(b => <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>)}
                  </div>
                </section>
              )}

              {/* Avaliações Recentes (Using melhoresAvaliacoes for now) */}
              {melhoresAvaliacoes.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-display font-extrabold text-slate-900 flex items-center gap-2.5">
                        ⭐ Avaliações recentes
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">Estabelecimentos com as melhores notas</p>
                    </div>
                  </div>
                  <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x px-4 sm:px-6 lg:px-8 after:content-[''] after:w-16 after:shrink-0">
                    {melhoresAvaliacoes.map(b => <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>)}
                  </div>
                </section>
              )}
\n              {/* Explorar por Cidade */}
              <section className="pt-10 border-t border-slate-100">
                <h2 className="text-2xl font-display font-extrabold text-slate-900 mb-8 text-center">
                  Explorar por Cidade
                </h2>
                <div className="flex flex-wrap justify-center gap-4">
                  {CITIES.map(city => (
                    <button 
                      key={city} 
                      onClick={() => handleCityClick(city)}
                      className="px-6 py-3 bg-white border border-slate-200/80 hover:border-purple-400 hover:shadow-md rounded-xl font-bold text-slate-700 hover:text-purple-700 transition-all text-sm"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </section>

            </>
          )}
        </div>
      )}

      {/* 4. ACTIVE SEARCH VIEW */}
      {isSearching && (
        <div className="flex-1 flex flex-col h-[calc(100vh-64px)]">
          {/* Top Search & Filter Bar */}
          <div className="bg-white border-b border-slate-200/80 shadow-sm z-20 px-4 py-4 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
              <div className="flex items-center gap-3 flex-1 max-w-2xl">
                <button onClick={handleClearSearch} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 shrink-0 transition-colors">
                  <ArrowRight className="w-5 h-5 rotate-180" />
                </button>
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    placeholder="Pesquisar profissionais, serviços, cidades..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-full pl-11 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                  {localSearchQuery && (
                    <button onClick={() => setLocalSearchQuery("")} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-7xl mx-auto w-full pb-1">
              <FilterToggle label="Aberto Hoje" icon={<Clock className="w-3.5 h-3.5"/>} active={filterAbertoHoje} onClick={() => setFilterAbertoHoje(!filterAbertoHoje)} />
              <FilterToggle label="Mais perto" icon={<MapPin className="w-3.5 h-3.5"/>} active={filterMaisPerto} onClick={() => { setFilterMaisPerto(!filterMaisPerto); setFilterMaisBarato(false); setFilterMelhorAvaliacao(false); handlePertoDeMimClick(); }} />
              <FilterToggle label="Mais barato" icon={<Tag className="w-3.5 h-3.5"/>} active={filterMaisBarato} onClick={() => { setFilterMaisBarato(!filterMaisBarato); setFilterMaisPerto(false); setFilterMelhorAvaliacao(false); }} />
              <FilterToggle label="Melhor avaliação" icon={<Star className="w-3.5 h-3.5"/>} active={filterMelhorAvaliacao} onClick={() => { setFilterMelhorAvaliacao(!filterMelhorAvaliacao); setFilterMaisPerto(false); setFilterMaisBarato(false); }} />
              <FilterToggle label="Top Partner" icon={<ShieldCheck className="w-3.5 h-3.5"/>} active={filterTopPartner} onClick={() => setFilterTopPartner(!filterTopPartner)} />
              <FilterToggle label="Pagamento Online" icon={<CreditCard className="w-3.5 h-3.5"/>} active={filterPagamentoOnline} onClick={() => setFilterPagamentoOnline(!filterPagamentoOnline)} />
              <FilterToggle label="Promoções" icon={<Sparkles className="w-3.5 h-3.5"/>} active={filterPromocoes} onClick={() => setFilterPromocoes(!filterPromocoes)} />
            </div>
          </div>

          {/* Map & List Split */}
          <div className="flex-1 flex overflow-hidden max-w-[1600px] mx-auto w-full bg-[#f8f9fb]">
            {/* Left: List */}
            <div className="w-full md:w-[450px] lg:w-[500px] flex flex-col bg-white border-r border-slate-200 overflow-y-auto custom-scrollbar">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
                <h3 className="font-extrabold text-slate-800">Resultados <span className="text-slate-400 font-mono text-sm ml-1">({searchResults.length})</span></h3>
                {activeCategory && <span className="text-[10px] font-bold uppercase tracking-widest bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md">{activeCategory}</span>}
              </div>
              <div className="p-5 flex flex-col gap-5">
                
  {searchResults.map(b => (
                  <BusinessCard key={b.id} b={b} horizontal />
                ))}
                {searchResults.length === 0 && (
                  <div className="text-center p-12 text-slate-500 flex flex-col items-center">
                    <Search className="w-8 h-8 text-slate-300 mb-3" />
                    <p className="font-medium">Nenhum resultado encontrado.</p>
                    <p className="text-sm mt-1">Tente ajustar os filtros ou a pesquisa.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Map */}
            <div className="hidden md:block flex-1 relative bg-slate-100 z-0">
              <MapContainer 
                center={userCoords ? [userCoords.lat, userCoords.lng] : [39.3999, -8.2245]} 
                zoom={userCoords ? 12 : 7} 
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                
                {userCoords && (
                  <Marker position={[userCoords.lat, userCoords.lng]} icon={L.divIcon({
                    className: 'custom-user-marker',
                    html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md animate-pulse"></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                  })}>
                  </Marker>
                )}
                
                {searchResults.map(b => (
                  <Marker 
                    key={b.id} 
                    position={[b.lat, b.lng]}
                    icon={L.divIcon({
                      className: 'custom-business-marker',
                      html: `<div class="bg-slate-900 text-white px-2.5 py-1 rounded-full text-xs font-extrabold shadow-lg border-2 border-white flex items-center justify-center hover:scale-110 transition-transform whitespace-nowrap">${b.rating.toFixed(1)} <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star ml-1 text-amber-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>`,
                      iconSize: [40, 24],
                      iconAnchor: [20, 12]
                    })}
                  >
                    <Popup className="rounded-xl overflow-hidden p-0 border-0 shadow-xl">
                      <div className="flex flex-col w-[240px]">
                         <img src={b.cover_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600"} className="w-full h-24 object-cover" />
                         <div className="p-3">
                           <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{b.name}</h4>
                           <p className="text-xs text-slate-500 mt-1 line-clamp-1">{b.category}</p>
                           <a href={"/business/" + b.slug} className="block w-full mt-3 text-center bg-slate-900 text-white text-xs font-bold py-2 rounded-lg">Ver Detalhes</a>
                         </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const FilterToggle = ({ label, icon, active, onClick }: { label: string, icon: React.ReactNode, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-[11px] font-bold whitespace-nowrap transition-all ${
      active ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
    }`}
  >
    {icon} {label}
  </button>
);
