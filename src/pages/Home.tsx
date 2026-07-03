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
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { getCoordinatesForCity, calculateDistanceInKm } from "../utils/geoData";

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "";

const SMALL_CATEGORIES = [
  { name: "Barbearias", icon: "💈" },
  { name: "Cabeleireiros", icon: "💇" },
  { name: "Unhas", icon: "💅" },
  { name: "Spa", icon: "💆" },
  { name: "Maquilhagem", icon: "💄" },
  { name: "Pestanas", icon: "👁" },
  { name: "Estética", icon: "🧖" },
  { name: "Medicina Estética", icon: "💉" },
  { name: "Depilação", icon: "🪒" },
  { name: "Massagens", icon: "💆" },
  { name: "Bem-estar", icon: "🏋️" },
  { name: "Fisioterapia", icon: "🩺" },
  { name: "Tatuagens", icon: "🎨" },
  { name: "Piercing", icon: "💎" },
];

export default function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // View States
  const [activeCategory, setActiveCategory] = useState<string | null>(searchParams.get("category"));
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [localSearchQuery, setLocalSearchQuery] = useState(searchParams.get("q") || "");
  const [isSearching, setIsSearching] = useState(false);

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
        const [bizRes, revData] = await Promise.all([
          supabase.from("businesses").select("*").eq("status", "active").eq("public_page_enabled", true),
          fetchAllReviews()
        ]);
        
        const loadedBiz = bizRes.data || [];
        setReviews(revData || []);

        // Process ratings and distance
        const processed = loadedBiz.map(b => {
          const bReviews = (revData || []).filter(r => r.business_id === b.id);
          const rating = bReviews.length ? bReviews.reduce((sum, r) => sum + r.rating, 0) / bReviews.length : (b.is_premium ? 4.8 : 0);
          
          let hash = 0;
          for (let i = 0; i < b.name.length; i++) { hash = b.name.charCodeAt(i) + ((hash << 5) - hash); }
          const derivedPrice = 15 + Math.abs(hash % 8) * 5;

          const lat = b.latitude ?? getCoordinatesForCity(b.district, b.city).latitude;
          const lng = b.longitude ?? getCoordinatesForCity(b.district, b.city).longitude;
          
          let distance = null;
          if (userCoords) {
            distance = calculateDistanceInKm(userCoords.lat, userCoords.lng, lat, lng);
          }

          return { ...b, rating, reviewsCount: bReviews.length || (b.is_premium ? 24 : 0), startPrice: derivedPrice, lat, lng, distance, isOpenNow: true }; // Simplified isOpenNow for UI
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

  const handleClearSearch = () => {
    setActiveCategory(null);
    setSearchQuery("");
    setLocalSearchQuery("");
    setIsSearching(false);
    setSearchParams({});
  };

  // Carousels Data (Home View)
  const melhoresAvaliacoes = [...businesses].sort((a, b) => b.rating - a.rating).slice(0, 10);
  const novasLojas = [...businesses].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
  const maisReservadas = [...businesses].sort((a, b) => b.reviewsCount - a.reviewsCount).slice(0, 10);
  const pertoDeMim = [...businesses].filter(b => b.distance !== null).sort((a, b) => a.distance - b.distance).slice(0, 10);

  // Search/Filter Results
  const getFilteredResults = () => {
    let res = [...businesses];
    
    if (activeCategory) {
      res = res.filter(b => 
        b.category.toLowerCase().includes(activeCategory.toLowerCase()) || 
        (b.description && b.description.toLowerCase().includes(activeCategory.toLowerCase())) ||
        b.name.toLowerCase().includes(activeCategory.toLowerCase())
      );
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      res = res.filter(b => 
        b.name.toLowerCase().includes(q) || 
        b.category.toLowerCase().includes(q) || 
        (b.description && b.description.toLowerCase().includes(q))
      );
    }

    if (filterAbertoHoje) res = res.filter(b => b.isOpenNow);
    if (filterTopPartner) res = res.filter(b => b.is_premium || b.is_verified);
    if (filterPromocoes) res = res.filter(b => b.is_promoted);
    if (filterPagamentoOnline) res = res.filter(b => true); // Assumed true for demo
    
    if (filterMaisPerto && userCoords) res.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    else if (filterMaisBarato) res.sort((a, b) => a.startPrice - b.startPrice);
    else if (filterMelhorAvaliacao) res.sort((a, b) => b.rating - a.rating);

    return res;
  };

  const searchResults = getFilteredResults();

  const BusinessCard = ({ b, horizontal = false }: { b: any, horizontal?: boolean, key?: string | number }) => (
    <Link to={`/business/${b.slug}`} className={`group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex ${horizontal ? 'flex-row h-32' : 'flex-col min-w-[260px] max-w-[280px] shrink-0'}`}>
      <div className={`relative overflow-hidden ${horizontal ? 'w-32 h-full shrink-0' : 'h-40'}`}>
        <img src={b.cover_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600"} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {b.rating > 0 && (
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur text-slate-900 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            {b.rating.toFixed(1)} ({b.reviewsCount})
          </div>
        )}
      </div>
      <div className={`p-4 flex flex-col justify-between flex-1 ${horizontal ? 'py-3' : ''}`}>
        <div>
          <h3 className="font-display font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-purple-600 transition-colors">{b.name}</h3>
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {b.city}, {b.district} {b.distance ? `· ${b.distance.toFixed(1)}km` : ''}
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] font-medium">
          <span className="text-slate-600 bg-slate-50 px-2 py-1 rounded-md">{b.category}</span>
          <span className="text-purple-600 font-bold">A partir de {b.startPrice}€</span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-purple-100 selection:text-purple-900 flex flex-col">
      {/* 1. Beauty Marketplace Hero */}
      {!isSearching && (
        <section className="relative pt-24 pb-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl sm:text-6xl font-display font-medium tracking-tight text-slate-900 leading-[1.1] mb-6">
              Encontre o seu próximo <br />
              <span className="bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text text-transparent italic pr-2">
                profissional de beleza.
              </span>
            </h1>

            {/* Smart Search Bar */}
            <div className="max-w-3xl mx-auto bg-white p-2 sm:p-3 rounded-full border border-slate-200 shadow-lg shadow-slate-200/50 flex items-center relative z-20">
              <Search className="w-5 h-5 text-slate-400 ml-3" />
              <input
                type="text"
                placeholder="Pesquise por salão, serviço, tratamento..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none pl-3 pr-4 py-3 text-sm sm:text-base text-slate-800 focus:outline-none focus:ring-0 placeholder-slate-400 font-medium"
              />
              <button 
                onClick={() => { if(localSearchQuery.trim()) setIsSearching(true); }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-full text-sm tracking-wide transition-all shrink-0"
              >
                Procurar
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. Small Elegant Category Cards */}
      {!isSearching && (
        <section className="pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-5xl mx-auto">
            {SMALL_CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className="flex items-center gap-2 bg-white border border-slate-200/80 hover:border-purple-300 hover:bg-purple-50/30 hover:shadow-md px-4 py-2.5 rounded-full transition-all duration-300 cursor-pointer group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-[13px] font-semibold text-slate-700 group-hover:text-purple-700">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 3. Dynamic Homepage Carousels */}
      {!isSearching && (
        <div className="space-y-16 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-hidden">
          
          {/* Melhores Avaliações */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-medium text-slate-900 flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-500 fill-amber-500" /> Melhores Avaliações
              </h2>
            </div>
            <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x">
              {melhoresAvaliacoes.map(b => (
                <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>
              ))}
            </div>
          </section>

          {/* Novas Lojas */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-medium text-slate-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-rose-500" /> Novas Lojas
              </h2>
            </div>
            <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x">
              {novasLojas.map(b => (
                <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>
              ))}
            </div>
          </section>

          {/* Mais Reservadas */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-medium text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-purple-600" /> Mais Reservadas
              </h2>
            </div>
            <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x">
              {maisReservadas.map(b => (
                <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>
              ))}
            </div>
          </section>

          {/* Perto de Mim + Mapa e Lista Sincronizada (Homepage view) */}
          <section className="bg-slate-50 p-6 sm:p-10 rounded-3xl border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display font-medium text-slate-900 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-blue-500" /> Perto de Mim
              </h2>
              {userCoords && (
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">GPS Ativo</span>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[500px]">
              {/* List */}
              <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                {pertoDeMim.length > 0 ? pertoDeMim.map(b => (
                  <BusinessCard key={b.id} b={b} horizontal />
                )) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <Navigation className="w-8 h-8 mb-3 text-slate-300" />
                    <p className="text-sm">Ative a localização para ver as lojas mais próximas.</p>
                  </div>
                )}
              </div>
              {/* Map */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-200 relative">
                {API_KEY ? (
                  <APIProvider apiKey={API_KEY}>
                    <Map
                      defaultCenter={userCoords || { lat: 38.7223, lng: -9.1393 }}
                      defaultZoom={userCoords ? 13 : 6}
                      mapId="HOME_PERTO_DE_MIM"
                      disableDefaultUI
                    >
                      {pertoDeMim.map(b => (
                        <AdvancedMarker key={b.id} position={{ lat: b.lat, lng: b.lng }}>
                          <Pin background="#3b82f6" borderColor="#2563eb" glyphColor="#fff" />
                        </AdvancedMarker>
                      ))}
                    </Map>
                  </APIProvider>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">Mapa Indisponível</div>
                )}
              </div>
            </div>
          </section>

        </div>
      )}

      {/* 4. Active Search / Category Map View (Fresha Style) */}
      {isSearching && (
        <div className="flex-1 flex flex-col h-[calc(100vh-64px)]">
          {/* Top Search & Filter Bar */}
          <div className="bg-white border-b border-slate-200 shadow-sm z-20 px-4 py-3 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
              <div className="flex items-center gap-2 flex-1 max-w-2xl">
                <button onClick={handleClearSearch} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 shrink-0">
                  <ArrowRight className="w-5 h-5 rotate-180" />
                </button>
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    placeholder="Pesquisar profissionais..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {localSearchQuery && (
                    <button onClick={() => setLocalSearchQuery("")} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-7xl mx-auto w-full pb-1">
              <FilterToggle label="Aberto Hoje" icon={<Clock className="w-3 h-3"/>} active={filterAbertoHoje} onClick={() => setFilterAbertoHoje(!filterAbertoHoje)} />
              <FilterToggle label="Mais perto" icon={<MapPin className="w-3 h-3"/>} active={filterMaisPerto} onClick={() => { setFilterMaisPerto(!filterMaisPerto); setFilterMaisBarato(false); setFilterMelhorAvaliacao(false); }} />
              <FilterToggle label="Mais barato" icon={<Tag className="w-3 h-3"/>} active={filterMaisBarato} onClick={() => { setFilterMaisBarato(!filterMaisBarato); setFilterMaisPerto(false); setFilterMelhorAvaliacao(false); }} />
              <FilterToggle label="Melhor avaliação" icon={<Star className="w-3 h-3"/>} active={filterMelhorAvaliacao} onClick={() => { setFilterMelhorAvaliacao(!filterMelhorAvaliacao); setFilterMaisPerto(false); setFilterMaisBarato(false); }} />
              <FilterToggle label="Top Partner" icon={<ShieldCheck className="w-3 h-3"/>} active={filterTopPartner} onClick={() => setFilterTopPartner(!filterTopPartner)} />
              <FilterToggle label="Pagamento Online" icon={<CreditCard className="w-3 h-3"/>} active={filterPagamentoOnline} onClick={() => setFilterPagamentoOnline(!filterPagamentoOnline)} />
              <FilterToggle label="Promoções" icon={<Sparkles className="w-3 h-3"/>} active={filterPromocoes} onClick={() => setFilterPromocoes(!filterPromocoes)} />
            </div>
          </div>

          {/* Map & List Split */}
          <div className="flex-1 flex overflow-hidden max-w-[1600px] mx-auto w-full">
            {/* Left: List */}
            <div className="w-full md:w-[450px] lg:w-[500px] flex flex-col bg-slate-50 border-r border-slate-200 overflow-y-auto">
              <div className="p-4 border-b border-slate-200/50 flex justify-between items-center bg-white">
                <h3 className="font-bold text-slate-800">Resultados ({searchResults.length})</h3>
                {activeCategory && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-semibold">{activeCategory}</span>}
              </div>
              <div className="p-4 flex flex-col gap-4">
                {searchResults.map(b => (
                  <BusinessCard key={b.id} b={b} horizontal />
                ))}
                {searchResults.length === 0 && (
                  <div className="text-center p-10 text-slate-500">
                    <p>Nenhum resultado encontrado.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Map */}
            <div className="hidden md:block flex-1 relative bg-slate-200">
              {API_KEY ? (
                <APIProvider apiKey={API_KEY}>
                  <Map
                    defaultCenter={userCoords || { lat: 39.3999, lng: -8.2245 }}
                    defaultZoom={userCoords ? 12 : 7}
                    mapId="SEARCH_RESULTS_MAP"
                  >
                    {searchResults.map(b => (
                      <AdvancedMarker key={b.id} position={{ lat: b.lat, lng: b.lng }}>
                        <Link to={`/business/${b.slug}`} className="relative cursor-pointer group">
                          <Pin background="#9333ea" borderColor="#7e22ce" glyphColor="#fff" />
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                            {b.name}
                          </div>
                        </Link>
                      </AdvancedMarker>
                    ))}
                  </Map>
                </APIProvider>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-medium">Google Maps API Key Required</div>
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
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold whitespace-nowrap transition-all ${
      active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
    }`}
  >
    {icon} {label}
  </button>
);
