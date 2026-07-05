import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { fetchAllReviews } from "../utils/reviewsHelper";
import {
  Search, MapPin, Clock, Navigation, 
  ChevronRight, ChevronLeft, Map as MapIcon, 
  ShieldCheck, Loader2, ArrowRight, Heart, CalendarCheck, Sparkles, Star
} from "lucide-react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { getCoordinatesForCity, calculateDistanceInKm } from "../utils/geoData";

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "";

// Categorias Imersivas (Estilo Treatwell)
const HOME_CATEGORIES = [
  { name: "Cabeleireiro", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80", url: "/explore?category=Cabelo %26 Barbearia" },
  { name: "Barbearia", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80", url: "/explore?category=Cabelo %26 Barbearia&subcategory=Barbearia" },
  { name: "Nails & Beauty", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400&q=80", url: "/explore?category=Nails %26 Beauty" },
  { name: "Estética", image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=400&q=80", url: "/explore?category=Estética" },
  { name: "Wellness & Spa", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=400&q=80", url: "/explore?category=Wellness" },
  { name: "Noivas", image: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=400&q=80", url: "/explore?category=Noivas %26 Eventos" }
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
  const bgColor = "#7c3aed";
  const strokeColor = "#ffffff";
  const textColor = "#ffffff";

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
  const [searchParams] = useSearchParams();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Estados de Pesquisa Simplificados
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [searchLocation, setSearchLocation] = useState(searchParams.get("city") || "");
  const [showLocSuggestions, setShowLocSuggestions] = useState(false);

  // Estados de Dados e Localização
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      if (direction === 'right') scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      else scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
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
        
        let srvData = srvRes.data || [];
        let loadedBiz = (bizRes.data || []).filter(b => b.public_page_enabled !== false);
        let revDataFinal = revData || [];

        if (loadedBiz.length === 0 || bizRes.error) {
          const { FALLBACK_BUSINESSES, FALLBACK_SERVICES, FALLBACK_REVIEWS } = await import("../utils/fallbackData");
          loadedBiz = FALLBACK_BUSINESSES;
          srvData = FALLBACK_SERVICES;
          revDataFinal = FALLBACK_REVIEWS;
        }
        
        const now = new Date();
        
        const processed = loadedBiz.map(b => {
          // 1. AVALIAÇÕES REAIS
          const bReviews = revDataFinal.filter((r: any) => r.business_id === b.id);
          const rating = bReviews.length > 0 
            ? bReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / bReviews.length 
            : 0;
          
          // 2. PREÇOS E PROMOÇÕES DO SETUP WIZARD
          const bServices = srvData.filter((s: any) => s.business_id === b.id);
          let realStartPrice = 0;
          let hasRealPromotion = b.is_promoted || false;

          if (bServices.length > 0) {
            const prices = bServices.map((s: any) => {
              const hasDiscount = (s.discount_price != null && s.discount_price > 0 && s.discount_price < s.price) || 
                                  (s.price_promotion != null && s.price_promotion > 0);
              if (hasDiscount) {
                hasRealPromotion = true;
                return s.discount_price || s.price_promotion;
              }
              return s.price;
            }).filter((p: number) => p != null && !isNaN(p));

            if (prices.length > 0) {
              realStartPrice = Math.min(...prices);
            }
          }

          // 3. DISTÂNCIA REAL
          const lat = b.latitude ?? getCoordinatesForCity(b.district, b.city).latitude;
          const lng = b.longitude ?? getCoordinatesForCity(b.district, b.city).longitude;
          let distance = null;
          if (userCoords) {
            distance = calculateDistanceInKm(userCoords.lat, userCoords.lng, lat, lng);
          }

          return { 
            ...b, 
            rating, 
            reviewsCount: bReviews.length, 
            startPrice: realStartPrice, 
            lat, lng, distance, 
            isNew: (now.getTime() - new Date(b.created_at).getTime()) < 15 * 24 * 60 * 60 * 1000, 
            services: bServices,
            is_promoted: hasRealPromotion 
          }; 
        });
        
        setBusinesses(processed);
      } catch (e) {
        console.error("Erro ao carregar dados", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userCoords]);

  const handleSearchSubmit = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery);
    if (searchLocation.trim()) {
      if (searchLocation === "Perto de Mim") params.set("nearMe", "true");
      else params.set("city", searchLocation);
    }
    navigate(`/explore?${params.toString()}`);
  };

  // Cálculos das Secções Inteligentes
  const locaisProximos = useMemo(() => {
    if (!userCoords) return [];
    return [...businesses]
      .filter(b => b.distance !== null && b.distance < 20)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, 10);
  }, [businesses, userCoords]);

  const topPartners = useMemo(() => businesses.filter(b => b.is_premium || b.is_verified), [businesses]);
  const promocoes = useMemo(() => businesses.filter(b => b.is_promoted), [businesses]);
  const recomendados = useMemo(() => [...businesses].sort((a, b) => b.rating - a.rating || (a.distance || 0) - (b.distance || 0)).slice(0, 10), [businesses]);
  const novasLojas = useMemo(() => [...businesses].filter(b => b.isNew).slice(0, 10), [businesses]);

  const mapBusinesses = useMemo(() => {
    if (userCoords) return businesses.filter(b => b.distance !== null && b.distance <= 20);
    return recomendados;
  }, [businesses, userCoords, recomendados]);

  // Cartão Minimalista de Espaços (Estilo Airbnb)
  const BusinessCard: React.FC<{ b: any }> = ({ b }) => (
    <Link to={`/business/${b.slug}`} className="group flex flex-col min-w-[260px] max-w-[280px] shrink-0 cursor-pointer">
      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden mb-3 bg-slate-100">
        <img 
          src={b.cover_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600"} 
          alt={b.name} 
          loading="lazy" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
        />
        
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {b.is_promoted && (
            <span className="bg-white text-slate-900 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg">
              Destaque
            </span>
          )}
        </div>
        
        <button 
          onClick={(e) => { e.preventDefault(); /* Integrar Favoritos no futuro */ }} 
          className="absolute top-3 right-3 p-1.5 rounded-full text-white hover:scale-110 transition-transform drop-shadow-md"
        >
          <Heart className="w-6 h-6 fill-black/20 stroke-white stroke-[1.5]" />
        </button>
      </div>

      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="font-bold text-slate-900 text-base line-clamp-1">{b.name}</h3>
          <p className="text-sm text-slate-500 mt-0.5 truncate">{b.category} · {b.city}</p>
        </div>
        
        <div className="flex items-center gap-1 text-sm font-semibold text-slate-900 shrink-0">
          <Star className="w-3.5 h-3.5 fill-slate-900" />
          {b.rating > 0 ? b.rating.toFixed(1) : "Novo"}
        </div>
      </div>
      
      <div className="mt-1">
        <span className="font-semibold text-slate-900">{b.startPrice}€</span>
        <span className="text-sm text-slate-500 ml-1">preço base</span>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-purple-100 selection:text-purple-900 flex flex-col">
      
      {/* 1. HERO SECTION & PESQUISA (DESIGN PREMIUM) */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden flex flex-col justify-center min-h-[70vh] sm:min-h-[60vh]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center -z-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-slate-950/90 -z-10" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center sm:text-left max-w-3xl mb-10">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-extrabold tracking-tight text-white leading-[1.1] mb-5 drop-shadow-lg">
              Tempo para cuidar <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-rose-300">
                de si.
              </span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-200 font-medium drop-shadow-md">
              Descubra e reserve online os melhores salões de beleza, barbearias e spas ao seu redor. Instantâneo e sem complicações.
            </p>
          </div>

          <div className="w-full bg-white p-2 rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative z-20 flex flex-col md:flex-row items-stretch gap-1 border border-white/20">
            <div className="flex-1 relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <div className="px-12 py-3.5 hover:bg-slate-50 rounded-xl sm:rounded-2xl transition-colors cursor-text h-full flex flex-col justify-center">
                <label className="block text-[10px] font-extrabold text-slate-800 uppercase tracking-widest mb-0.5">Tratamento ou Salão</label>
                <input
                  type="text"
                  placeholder="Ex: Corte, Manicure..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none w-full text-sm font-medium text-slate-600 placeholder-slate-400 focus:outline-none p-0"
                />
              </div>
            </div>

            <div className="hidden md:block w-px bg-slate-200 my-3" />
            <div className="block md:hidden h-px bg-slate-100 mx-4" />

            <div className="flex-1 relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="px-12 py-3.5 hover:bg-slate-50 rounded-xl sm:rounded-2xl transition-colors cursor-text h-full flex flex-col justify-center">
                <label className="block text-[10px] font-extrabold text-slate-800 uppercase tracking-widest mb-0.5">Localização</label>
                <input
                  type="text"
                  placeholder="Onde se encontra?"
                  value={searchLocation}
                  onChange={(e) => { setSearchLocation(e.target.value); setShowLocSuggestions(true); }}
                  onFocus={() => setShowLocSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowLocSuggestions(false), 200)}
                  className="bg-transparent border-none w-full text-sm font-medium text-slate-600 placeholder-slate-400 focus:outline-none p-0"
                />
              </div>
              
              {showLocSuggestions && (
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-2xl z-30 py-2 text-left overflow-hidden">
                  <button onMouseDown={() => { setSearchLocation("Perto de Mim"); setShowLocSuggestions(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-blue-600 text-sm font-bold flex items-center gap-2 border-b border-slate-50 transition-colors">
                    <Navigation className="w-4 h-4" /> Usar a minha localização atual
                  </button>
                  {CITIES.filter(c => c.toLowerCase().includes(searchLocation.toLowerCase())).slice(0, 4).map(city => (
                    <button key={city} onMouseDown={() => { setSearchLocation(city); setShowLocSuggestions(false); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 text-sm font-medium flex items-center gap-2 transition-colors">
                      <MapPin className="w-4 h-4 text-slate-300" /> {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden lg:block w-px bg-slate-200 my-3" />
            <div className="block md:hidden h-px bg-slate-100 mx-4" />

            <div className="hidden lg:block flex-1 relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <Clock className="w-5 h-5" />
              </div>
              <div className="px-12 py-3.5 hover:bg-slate-50 rounded-2xl transition-colors cursor-text h-full flex flex-col justify-center">
                <label className="block text-[10px] font-extrabold text-slate-800 uppercase tracking-widest mb-0.5">Data</label>
                <input
                  type="text"
                  placeholder="Qualquer data"
                  readOnly
                  className="bg-transparent border-none w-full text-sm font-medium text-slate-600 placeholder-slate-400 focus:outline-none p-0 cursor-pointer"
                />
              </div>
            </div>

            <button 
              onClick={handleSearchSubmit} 
              className="w-full md:w-auto bg-slate-900 hover:bg-purple-600 text-white font-bold text-sm sm:text-base py-4 sm:py-0 px-8 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg mt-2 md:mt-0"
            >
              Pesquisar
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Pagamentos Seguros</span>
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-500" />
            <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-400" /> +10.000 Avaliações Verificadas</span>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIAS VISUAIS PREMIUM */}
      <section className="pb-12 pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-extrabold text-slate-900">O que procura hoje?</h2>
        </div>
        <div className="relative group">
          <button onClick={() => scrollCategories('left')} className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div ref={scrollContainerRef} className="flex overflow-x-auto gap-4 sm:gap-6 pb-4 no-scrollbar snap-x scroll-smooth">
            {HOME_CATEGORIES.map((cat) => (
              <button 
                key={cat.name} 
                onClick={() => navigate(cat.url)} 
                className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-2xl overflow-hidden group shrink-0 snap-start shadow-sm hover:shadow-xl transition-all"
              >
                <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                <span className="absolute bottom-3 left-3 right-3 text-left text-sm font-bold text-white leading-tight drop-shadow-md">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
          <button onClick={() => scrollCategories('right')} className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* 3. CONTEÚDO E SEÇÕES DA PÁGINA INICIAL */}
      <div className="space-y-16 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : (
          <>
            {locaisProximos.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-display font-extrabold text-slate-900">📍 Perto de si</h2>
                  <p className="text-sm text-slate-500 mt-1">A menos de 20 minutos de distância da sua localização.</p>
                </div>
                <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar snap-x">
                  {locaisProximos.map(b => <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>)}
                </div>
              </section>
            )}

            {recomendados.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-display font-extrabold text-slate-900">❤️ Recomendados para si</h2>
                  <p className="text-sm text-slate-500 mt-1">Os espaços com melhores avaliações no Glamzo.</p>
                </div>
                <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar snap-x">
                  {recomendados.map(b => <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>)}
                </div>
              </section>
            )}

            {novasLojas.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-display font-extrabold text-slate-900">🆕 Acabaram de chegar</h2>
                  <p className="text-sm text-slate-500 mt-1">As mais recentes adições à plataforma.</p>
                </div>
                <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar snap-x">
                  {novasLojas.map(b => <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>)}
                </div>
              </section>
            )}

            {topPartners.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-display font-extrabold text-slate-900">💎 Top Partner</h2>
                  <p className="text-sm text-slate-500 mt-1">Profissionais verificados pela plataforma.</p>
                </div>
                <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar snap-x">
                  {topPartners.map(b => <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>)}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* 4. PROPOSTA DE VALOR */}
      <section className="py-16 sm:py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 mb-4">Porquê marcar com o Glamzo?</h2>
            <p className="text-slate-500 text-base">A plataforma líder em Portugal que revoluciona a forma como cuida de si.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <CalendarCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Marcações 24/7</h3>
              <p className="text-slate-600 leading-relaxed">Não espere que o salão abra para ligar. Encontre horários disponíveis em tempo real e reserve a qualquer hora do dia ou da noite.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Profissionais de Topo</h3>
              <p className="text-slate-600 leading-relaxed">Leia avaliações 100% verificadas de clientes reais. Saiba exatamente a qualidade do serviço antes de se sentar na cadeira.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Segurança Total</h3>
              <p className="text-slate-600 leading-relaxed">Sem custos ocultos e com a garantia de que o seu lugar está reservado. Altere ou cancele a sua marcação facilmente na aplicação.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MAPA INTELIGENTE */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-display font-extrabold text-slate-900 flex items-center justify-center sm:justify-start gap-2.5">
              🌍 Explorar no Mapa
            </h2>
            <p className="text-slate-500 mt-2">
              {userCoords ? "Veja as lojas ao seu redor." : "Explore geograficamente as opções disponíveis."}
            </p>
          </div>
          <button 
            onClick={() => navigate('/explore?view=map')} 
            className="text-sm font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-5 py-2.5 rounded-xl transition-colors"
          >
            Ver Mapa Completo
          </button>
        </div>

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
                {mapBusinesses.map((b: any) => (
                  <Marker 
                    key={b.id} 
                    position={{ lat: b.lat, lng: b.lng }}
                    title={b.name}
                    icon={{
                      url: getCustomMarkerIcon(b.rating || 0),
                      anchor: { x: 29, y: 32 }
                    }}
                    onClick={() => navigate("/business/" + b.slug)}
                  />
                ))}
              </Map>
            </APIProvider>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 font-medium bg-slate-50 p-4 text-center">
              <MapIcon className="w-10 h-10 mb-2 text-slate-300 animate-pulse" /> 
              <span className="text-sm font-bold text-slate-700">Mapa de Lojas</span>
              <span className="text-xs text-slate-500 mt-1 max-w-xs">Chave da API do Google Maps não configurada.</span>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
