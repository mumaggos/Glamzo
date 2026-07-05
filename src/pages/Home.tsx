import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { fetchAllReviews } from "../utils/reviewsHelper";
import {
  Search, MapPin, Star, Navigation, 
  ChevronRight, ChevronLeft, Map as MapIcon, 
  ShieldCheck, Tag, Loader2, ArrowRight
} from "lucide-react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { getCoordinatesForCity, calculateDistanceInKm } from "../utils/geoData";

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
  { name: "Cabeleireiro", icon: "✂️", url: "/explore?category=Cabelo %26 Barbearia" }
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

  // Mapa Inteligente (Só mostra >20km se tivermos localização, senão mostra destaques)
  const mapBusinesses = useMemo(() => {
    if (userCoords) return businesses.filter(b => b.distance !== null && b.distance <= 20);
    return recomendados;
  }, [businesses, userCoords, recomendados]);

  // Cartão Reutilizável de Espaços
  const BusinessCard: React.FC<{ b: any }> = ({ b }) => (
    <Link to={`/business/${b.slug}`} className="group bg-white rounded-3xl border border-slate-100/60 overflow-hidden hover:shadow-2xl hover:shadow-purple-900/5 transition-all duration-300 flex flex-col min-w-[280px] max-w-[300px] shrink-0">
      <div className="relative overflow-hidden h-48 sm:h-56">
        <img src={b.cover_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600"} alt={b.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
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

        {b.rating > 0 && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur text-slate-900 text-[10px] font-black px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-lg">
            <Star className="w-3 h-3 text-purple-600 fill-purple-600" />
            {b.rating.toFixed(1)} <span className="font-medium text-slate-500 ml-0.5 font-mono">({b.reviewsCount})</span>
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col justify-between flex-1">
        <div>
          <h3 className="font-display font-bold text-slate-900 text-base line-clamp-1 group-hover:text-purple-600 transition-colors">{b.name}</h3>
          <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-1 flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {b.city} {b.distance ? `· a ${b.distance.toFixed(1)}km` : ''}
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
      {/* 1. HERO SECTION & PESQUISA */}
      <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-white to-rose-50/30 -z-10" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
            A sua próxima marcação <br />
            <span className="bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text text-transparent">
              a poucos cliques de distância.
            </span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate-500 max-w-2xl mx-auto mb-10 font-medium">
            Os melhores barbeiros, cabeleireiros, salões de beleza, spas e clínicas em Portugal.
          </p>

          <div className="w-full max-w-3xl bg-white p-2 rounded-full border border-slate-200/80 shadow-2xl shadow-purple-900/5 relative z-20 flex flex-col md:flex-row items-center gap-2">
            <div className="flex-1 w-full relative px-4 py-2 border-b md:border-b-0 md:border-r border-slate-100">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">O que procura?</label>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-purple-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Serviço, salão..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none w-full text-sm font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 w-full relative px-4 py-2">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Onde?</label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Cidade, local..."
                  value={searchLocation}
                  onChange={(e) => { setSearchLocation(e.target.value); setShowLocSuggestions(true); }}
                  onFocus={() => setShowLocSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowLocSuggestions(false), 200)}
                  className="bg-transparent border-none w-full text-sm font-bold text-slate-800 focus:outline-none"
                />
              </div>
              
              {showLocSuggestions && (
                <div className="absolute top-[calc(100%+16px)] left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 py-2 text-left">
                  <button onMouseDown={() => { setSearchLocation("Perto de Mim"); setShowLocSuggestions(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-blue-600 text-sm font-bold flex items-center gap-2 border-b border-slate-50">
                    <Navigation className="w-4 h-4" /> Usar a minha localização (GPS)
                  </button>
                  {CITIES.filter(c => c.toLowerCase().includes(searchLocation.toLowerCase())).slice(0, 4).map(city => (
                    <button key={city} onMouseDown={() => { setSearchLocation(city); setShowLocSuggestions(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-sm flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleSearchSubmit} className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm uppercase tracking-wider py-4 px-8 rounded-full transition-all flex items-center justify-center gap-2 shrink-0">
              Procurar <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIAS DE ACESSO RÁPIDO */}
      <section className="pb-16 max-w-7xl mx-auto relative z-20 -mt-6 px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative group">
          <button onClick={() => scrollCategories('left')} className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div ref={scrollContainerRef} className="flex overflow-x-auto gap-3 sm:gap-4 no-scrollbar snap-x pb-4 pt-2 scroll-smooth">
            {HOME_CATEGORIES.map((cat) => (
              <button key={cat.name} onClick={() => navigate(cat.url)} className="flex items-center justify-center gap-2.5 bg-white border border-slate-200/70 hover:border-purple-300 hover:bg-purple-50/40 px-6 py-4 rounded-2xl transition-all group shrink-0 snap-start">
                <span className="text-xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-[13px] font-bold text-slate-700 group-hover:text-purple-700">{cat.name}</span>
              </button>
            ))}
          </div>
          <button onClick={() => scrollCategories('right')} className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* 3. CONTEÚDO E SEÇÕES DA PÁGINA INICIAL */}
      <div className="space-y-16 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* Secção Perto de Mim: Só mostra se a localização estiver ativa */}
            {locaisProximos.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-display font-extrabold text-slate-900">📍 Perto de si</h2>
                  <p className="text-sm text-slate-500 mt-1">A menos de 20 minutos de distância da sua localização.</p>
                </div>
                <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x">
                  {locaisProximos.map(b => <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>)}
                </div>
              </section>
            )}

            {/* Secção Recomendados */}
            {recomendados.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-display font-extrabold text-slate-900">❤️ Recomendados para si</h2>
                  <p className="text-sm text-slate-500 mt-1">Os espaços com melhores avaliações no Glamzo.</p>
                </div>
                <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x">
                  {recomendados.map(b => <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>)}
                </div>
              </section>
            )}

            {/* Secção Novidades */}
            {novasLojas.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-display font-extrabold text-slate-900">🆕 Acabaram de chegar</h2>
                  <p className="text-sm text-slate-500 mt-1">As mais recentes adições à plataforma.</p>
                </div>
                <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x">
                  {novasLojas.map(b => <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>)}
                </div>
              </section>
            )}

            {/* Top Partners */}
            {topPartners.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-display font-extrabold text-slate-900">💎 Top Partner</h2>
                  <p className="text-sm text-slate-500 mt-1">Profissionais verificados pela plataforma.</p>
                </div>
                <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x">
                  {topPartners.map(b => <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>)}
                </div>
              </section>
            )}

            {/* O MAPA INTELIGENTE QUE MOSTRA LOJAS AO REDOR */}
            <section className="pt-8 border-t border-slate-100">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-display font-extrabold text-slate-900 flex items-center justify-center gap-2.5">
                  🌍 Explorar Lojas no Mapa
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {userCoords ? "Veja as lojas ao seu redor." : "Explore geograficamente as opções disponíveis."}
                </p>
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
          </>
        )}
      </div>
    </div>
  );
}
