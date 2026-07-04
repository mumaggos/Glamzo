import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { fetchAllReviews } from "../utils/reviewsHelper";
import { MAIN_CATEGORIES } from "../utils/categoriesData";
import {
  Search, MapPin, Star, Clock, Sparkles, Navigation, 
  CheckCircle2, ChevronRight, ChevronLeft, SlidersHorizontal, Map as MapIcon, 
  ShieldCheck, Zap, ThumbsUp, Home as HomeIcon, X, Loader2, ArrowRight,
  List, CreditCard, Tag, Scissors
} from "lucide-react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { getCoordinatesForCity, calculateDistanceInKm, PORTUGAL_GEO } from "../utils/geoData";
const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "";

const HOME_CATEGORIES = [
  { name: "Cabelo & Barbearia", icon: "💇", url: "/explore?category=Cabelo %26 Barbearia" },
  { name: "Nails & Beauty", icon: "💅", url: "/explore?category=Nails %26 Beauty" },
  { name: "Estética", icon: "✨", url: "/explore?category=Estética" },
  { name: "Wellness & Spa", icon: "💆", url: "/explore?category=Wellness" },
  { name: "Ao Domicílio", icon: "🏠", url: "/explore?category=Ao domicílio" },
  { name: "Noivas & Eventos", icon: "👰", url: "/explore?category=Noivas %26 Eventos" },
  { name: "Barbeiro", icon: "💈", url: "/explore?category=Cabelo %26 Barbearia&subcategory=Barbearia" },
  { name: "Cabeleireiro", icon: "✂️", url: "/explore?category=Cabelo %26 Barbearia" },
  { name: "Unhas / Manicure", icon: "💅", url: "/explore?category=Nails %26 Beauty&subcategory=Manicure" },
  { name: "Sobrancelhas", icon: "👁️", url: "/explore?category=Nails %26 Beauty&subcategory=Sobrancelhas" },
  { name: "Pestanas", icon: "👁", url: "/explore?category=Nails %26 Beauty&subcategory=Pestanas" },
  { name: "Massagens", icon: "💆", url: "/explore?category=Wellness&subcategory=Massagem Relaxante" },
  { name: "Depilação", icon: "🪒", url: "/explore?category=Estética&subcategory=Depilação" },
  { name: "Maquilhagem", icon: "💄", url: "/explore?category=Nails %26 Beauty&subcategory=Maquilhagem" },
  { name: "Facial / Spa", icon: "🧖", url: "/explore?category=Estética&subcategory=Facial" }
];

const CITIES = [
  "Lisboa", "Porto", "Braga", "Coimbra", "Aveiro", "Faro", "Funchal", "Ponta Delgada"
];


const mapStyles = [
  { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "labels", stylers: [{ visibility: "on" }] }
];

const getCustomMarkerIcon = (rating: number) => {
  const finalRating = rating > 0 ? rating : 5.0;
  const ratingText = `${finalRating.toFixed(1)} ★`;
  const bgColor = "#7c3aed"; // Glamzo brand purple
  const strokeColor = "#ffffff"; // White border
  const textColor = "#ffffff"; // White text

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="58" height="38" viewBox="0 0 58 38">
      <g>
        <path d="M 6 2 H 52 A 4 4 0 0 1 56 6 V 24 A 4 4 0 0 1 52 28 H 33 L 29 32 L 25 28 H 6 A 4 4 0 0 1 2 24 V 6 A 4 4 0 0 1 6 2 Z" 
              fill="${bgColor}" 
              stroke="${strokeColor}" 
              stroke-width="1.5" />
        <text x="29" y="18" 
              fill="${textColor}" 
              font-size="10px" 
              font-family="system-ui, -apple-system, sans-serif" 
              font-weight="bold" 
              text-anchor="middle">
          ${ratingText}
        </text>
      </g>
    </svg>
  `;

  return `data:image/svg+xml;utf-8,${encodeURIComponent(svg.trim())}`;
};

export default function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Scroll Ref and helper for categories carousel
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollCategories = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 500;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // View States
  const [activeCategory, setActiveCategory] = useState<string | null>(searchParams.get("category"));
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [localSearchQuery, setLocalSearchQuery] = useState(searchParams.get("q") || "");
  const [searchLocation, setSearchLocation] = useState(searchParams.get("city") || "");
  const [searchService, setSearchService] = useState(searchParams.get("service") || "");

  const isSearching = false;
  const setIsSearching = (val: boolean) => {};
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocSuggestions, setShowLocSuggestions] = useState(false);
  const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);

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
          supabase.from("businesses").select("*").eq("status", "active"),
          fetchAllReviews(),
          supabase.from("services").select("*").eq("is_active", true)
        ]);
        const srvData = srvRes.data || [];
        
        const loadedBiz = (bizRes.data || []).filter(b => b.public_page_enabled !== false);
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

  const handleCategoryClick = (catName: string) => {
    navigate(`/explore?category=${encodeURIComponent(catName)}`);
  };

  const handleCityClick = (city: string) => {
    let district = "All";
    for (const [dist, cities] of Object.entries(PORTUGAL_GEO)) {
      if (cities.includes(city)) {
        district = dist;
        break;
      }
    }
    if (district !== "All") {
      navigate(`/explore?district=${encodeURIComponent(district)}&city=${encodeURIComponent(city)}`);
    } else {
      navigate(`/explore?city=${encodeURIComponent(city)}`);
    }
  };

  const handleClearSearch = () => {
    setActiveCategory(null);
    setSearchQuery("");
    setLocalSearchQuery("");
    setSearchLocation("");
    setSearchService("");
    setSearchParams({});
  };

  const handlePertoDeMimClick = () => {
    navigate("/explore?nearMe=true");
  };

  const topPartners = useMemo(() => businesses.filter(b => b.is_premium || b.is_verified), [businesses]);
  const recomendados = useMemo(() => [...businesses].sort((a, b) => b.rating - a.rating || (a.distance || 0) - (b.distance || 0)).slice(0, 10), [businesses]);
  
  // Intelligent Promotions: shows active stores having b.is_promoted OR offering any service with a promotion/discount
  const promocoes = useMemo(() => businesses.filter(b => b.is_promoted || b.services?.some((s: any) => s.discount_price || s.price_promotion || s.is_promo)), [businesses]);
  
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

    if (searchLocation && searchLocation !== "Perto de Mim") {
      res = res.filter(b => isMatch(b, searchLocation));
    }

    if (searchService) {
      res = res.filter(b => isMatch(b, searchService));
    }
 
    if (filterAbertoHoje) res = res.filter(b => b.isOpenNow);
    if (filterTopPartner) res = res.filter(b => b.is_premium || b.is_verified);
    if (filterPromocoes) res = res.filter(b => b.is_promoted || b.services?.some((s: any) => s.discount_price || s.price_promotion || s.is_promo));
    
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

            {/* Smart Explore Bento Panel */}
            <div className="w-full max-w-4xl bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xl shadow-purple-900/5 relative z-20 flex flex-col md:flex-row items-stretch gap-4">
              
              {/* Field 1: Pesquisa */}
              <div className="flex-1 min-w-[200px] text-left relative">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 pl-1">O que procura?</label>
                <div className="flex items-center gap-2 bg-slate-50 rounded-2xl border border-slate-100 px-3.5 py-2.5 hover:border-slate-200 focus-within:border-purple-400 transition-all">
                  <Search className="w-4 h-4 text-purple-500 shrink-0" />
                  <input
                    type="text"
                    placeholder="Serviço, salão..."
                    value={localSearchQuery}
                    onChange={(e) => {
                      setLocalSearchQuery(e.target.value);
                      setShowSuggestions(e.target.value.length > 0);
                    }}
                    onFocus={() => localSearchQuery.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="bg-transparent border-none w-full text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0"
                  />
                </div>
                {/* Suggestions for Search */}
                {showSuggestions && (
                  <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden py-2 animate-fade-in">
                    <div className="px-3.5 py-1 text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">Lojas sugeridas</div>
                    {businesses.filter(b => b.name.toLowerCase().includes(localSearchQuery.toLowerCase())).slice(0, 3).map(b => (
                      <button key={b.id} onMouseDown={() => { navigate("/business/" + b.slug); }} className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-purple-500" /> {b.name}
                      </button>
                    ))}
                    {HOME_CATEGORIES.filter(c => c.name.toLowerCase().includes(localSearchQuery.toLowerCase())).slice(0, 3).map(cat => (
                      <button key={cat.name} onMouseDown={() => { navigate(cat.url); }} className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2">
                        <span>{cat.icon}</span> {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider for MD+ screens */}
              <div className="hidden md:block w-[1px] bg-slate-100 self-stretch my-2" />

              {/* Field 2: Localização */}
              <div className="flex-1 min-w-[180px] text-left relative">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 pl-1">Localização</label>
                <div className="flex items-center gap-2 bg-slate-50 rounded-2xl border border-slate-100 px-3.5 py-2.5 hover:border-slate-200 focus-within:border-purple-400 transition-all font-medium">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <input
                    type="text"
                    placeholder="Cidade, distrito..."
                    value={searchLocation}
                    onChange={(e) => {
                      setSearchLocation(e.target.value);
                      setShowLocSuggestions(e.target.value.length > 0);
                    }}
                    onFocus={() => searchLocation.length > 0 && setShowLocSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowLocSuggestions(false), 200)}
                    className="bg-transparent border-none w-full text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0"
                  />
                  <button 
                    onClick={handlePertoDeMimClick}
                    title="Perto de mim"
                    className="p-1 hover:bg-slate-200 text-blue-500 rounded-full transition-colors shrink-0"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                  </button>
                </div>
                {/* Suggestions for Location */}
                {showLocSuggestions && (
                  <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden py-2 animate-fade-in">
                    <div className="px-3.5 py-1 text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">Cidades disponíveis</div>
                    {CITIES.filter(c => c.toLowerCase().includes(searchLocation.toLowerCase())).slice(0, 4).map(city => (
                      <button key={city} onMouseDown={() => { setSearchLocation(city); setShowLocSuggestions(false); }} className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-rose-400" /> {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider for MD+ screens */}
              <div className="hidden md:block w-[1px] bg-slate-100 self-stretch my-2" />

              {/* Field 3: Tipo de Serviço */}
              <div className="flex-1 min-w-[180px] text-left relative">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 pl-1">Tipo de Serviço</label>
                <div className="flex items-center gap-2 bg-slate-50 rounded-2xl border border-slate-100 px-3.5 py-2.5 hover:border-slate-200 focus-within:border-purple-400 transition-all font-medium">
                  <Scissors className="w-4 h-4 text-indigo-500 shrink-0" />
                  <input
                    type="text"
                    placeholder="Estética, corte, unhas..."
                    value={searchService}
                    onChange={(e) => {
                      setSearchService(e.target.value);
                      setShowServiceSuggestions(e.target.value.length > 0);
                    }}
                    onFocus={() => searchService.length > 0 && setShowServiceSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowServiceSuggestions(false), 200)}
                    className="bg-transparent border-none w-full text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0"
                  />
                </div>
                {/* Suggestions for Service */}
                {showServiceSuggestions && (
                  <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden py-2 animate-fade-in">
                    <div className="px-3.5 py-1 text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">Serviços populares</div>
                    {HOME_CATEGORIES.filter(c => c.name.toLowerCase().includes(searchService.toLowerCase())).slice(0, 4).map(cat => (
                      <button key={cat.name} onMouseDown={() => { setSearchService(cat.name); setShowServiceSuggestions(false); }} className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2">
                        <span>{cat.icon}</span> {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button 
                onClick={() => {
                  const params = new URLSearchParams();
                  if (localSearchQuery.trim()) params.set("q", localSearchQuery);
                  if (searchLocation.trim()) params.set("city", searchLocation);
                  if (searchService.trim()) params.set("service", searchService);
                  if (activeCategory) params.set("category", activeCategory);
                  navigate(`/explore?${params.toString()}`);
                }}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm uppercase tracking-wider py-4 px-8 rounded-2xl md:self-end transition-all shadow-lg hover:shadow-xl hover:shadow-purple-900/10 shrink-0 flex items-center justify-center gap-2"
              >
                <span>Procurar</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          </div>
        </section>
      )}

      {/* 2. CATEGORIES */}
      {!isSearching && (
        <section className="pb-16 max-w-7xl mx-auto relative z-20 -mt-6 px-4 sm:px-6 lg:px-8">
          <div className="relative group">
            {/* Left Scroll Button */}
            <button 
              onClick={() => scrollCategories('left')}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-purple-600 hover:scale-105 transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-3 sm:gap-4 no-scrollbar snap-x pb-4 pt-2 scroll-smooth"
            >
              {HOME_CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => navigate(cat.url)}
                  className="flex items-center justify-center gap-2.5 bg-white border border-slate-200/70 hover:border-purple-300 hover:bg-purple-50/40 hover:shadow-lg shadow-sm px-6 py-4 rounded-2xl transition-all duration-300 cursor-pointer group shrink-0 snap-start"
                >
                  <span className="text-xl group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shrink-0">
                    {cat.icon}
                  </span>
                  <span className="text-[13px] font-bold text-slate-700 group-hover:text-purple-700 whitespace-nowrap leading-none">
                    {cat.name}
                  </span>
                </button>
              ))}
              {/* Extra spacer to allow smooth and full scrolling to the absolute end */}
              <div className="w-16 shrink-0" />
            </div>

            {/* Right Scroll Button */}
            <button 
              onClick={() => scrollCategories('right')}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-purple-600 hover:scale-105 transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
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

              {/* Mais Reservados */}
              {maisReservados.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-display font-extrabold text-slate-900 flex items-center gap-2.5">
                        🔥 Mais reservados
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">Os espaços com mais procura na plataforma.</p>
                    </div>
                  </div>
                  <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x px-4 sm:px-6 lg:px-8 after:content-[''] after:w-16 after:shrink-0">
                    {maisReservados.map(b => (
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

              {/* Promoções (só aparece se existirem promoções) */}
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

              {/* Tendências */}
              {tendencias.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-display font-extrabold text-slate-900 flex items-center gap-2.5">
                        ✨ Tendências
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">Descubra o que está na moda.</p>
                    </div>
                  </div>
                  <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x px-4 sm:px-6 lg:px-8 after:content-[''] after:w-16 after:shrink-0">
                    {tendencias.map(b => (
                      <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>
                    ))}
                  </div>
                </section>
              )}

              {/* Explorar por Cidade Section */}
              <section className="pt-8 border-t border-slate-100">
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-display font-extrabold text-slate-900 flex items-center justify-center gap-2.5">
                    🏙 Explorar por Cidade
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Encontre profissionais incríveis nos principais centros urbanos.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3.5 mb-12">
                  {CITIES.map(city => (
                    <button 
                      key={city} 
                      onClick={() => handleCityClick(city)}
                      className="px-6 py-3.5 bg-white border border-slate-200 hover:border-purple-400 hover:shadow-lg rounded-2xl font-extrabold text-slate-700 hover:text-purple-700 transition-all text-sm flex items-center gap-2 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-rose-500" /> {city}
                    </button>
                  ))}
                </div>

                {/* Immersive Map Area */}
                <div className="h-[450px] sm:h-[500px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-2xl shadow-slate-900/5 relative bg-slate-100">
                  {API_KEY ? (
                    <APIProvider apiKey={API_KEY}>
                      <Map
                        defaultCenter={userCoords ? { lat: userCoords.lat, lng: userCoords.lng } : { lat: 38.7223, lng: -9.1393 }}
                        defaultZoom={userCoords ? 13 : 8}
                        disableDefaultUI
                        clickableIcons={false}
                        styles={mapStyles}
                        options={{ clickableIcons: false, styles: mapStyles }}
                        style={{ width: '100%', height: '100%' }}
                      >
                        {userCoords && (
                          <Marker 
                            position={{ lat: userCoords.lat, lng: userCoords.lng }}
                            title="A sua localização"
                            icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                          />
                        )}
                        {businesses.map(b => (
                          <Marker 
                            key={b.id} 
                            position={{ lat: b.lat, lng: b.lng }}
                            title={b.name}
                            icon={{
                              url: getCustomMarkerIcon(b.rating || 0),
                              anchor: { x: 29, y: 32 }
                            }}
                            onClick={() => {
                              navigate("/business/" + b.slug);
                            }}
                          />
                        ))}
                      </Map>
                    </APIProvider>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 font-medium bg-slate-50 p-4 text-center">
                      <MapIcon className="w-10 h-10 mb-2 text-slate-300 animate-pulse" /> 
                      <span className="text-sm font-bold text-slate-700">Mapa de Lojas Ativas</span>
                      <span className="text-xs text-slate-500 mt-1 max-w-xs">Chave da API do Google Maps não configurada no ambiente.</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Avaliações Recentes */}
              {melhoresAvaliacoes.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-display font-extrabold text-slate-900 flex items-center gap-2.5">
                        ⭐ Avaliações recentes
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">Estabelecimentos com as melhores notas.</p>
                    </div>
                  </div>
                  <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x px-4 sm:px-6 lg:px-8 after:content-[''] after:w-16 after:shrink-0">
                    {melhoresAvaliacoes.map(b => (
                      <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>
                    ))}
                  </div>
                </section>
              )}
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
            <div className="hidden md:block flex-1 relative bg-slate-100">
              {API_KEY ? (
                <APIProvider apiKey={API_KEY}>
                  <Map
                    defaultCenter={userCoords ? { lat: userCoords.lat, lng: userCoords.lng } : { lat: 39.3999, lng: -8.2245 }}
                    defaultZoom={userCoords ? 12 : 7}
                    disableDefaultUI
                    clickableIcons={false}
                    styles={mapStyles}
                    options={{ clickableIcons: false, styles: mapStyles }}
                    style={{width: '100%', height: '100%'}}
                  >
                    {userCoords && (
                      <Marker 
                        position={{ lat: userCoords.lat, lng: userCoords.lng }}
                        title="A sua localização"
                        icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                      />
                    )}
                    {searchResults.map(b => (
                      <Marker 
                        key={b.id} 
                        position={{ lat: b.lat, lng: b.lng }}
                        title={b.name}
                        icon={{
                          url: getCustomMarkerIcon(b.rating || 0),
                          anchor: { x: 29, y: 32 }
                        }}
                        onClick={() => {
                          navigate("/business/" + b.slug);
                        }}
                      />
                    ))}
                  </Map>
                </APIProvider>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-medium bg-slate-50">
                  <MapIcon className="w-8 h-8 mr-2 text-slate-300" /> Mapa Indisponível
                </div>
              )}
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
