import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { fetchAllReviews } from "../utils/reviewsHelper";
import {
  Search, MapPin, Star, Sparkles, Navigation, 
  ChevronRight, ChevronLeft, ShieldCheck, Tag, ArrowRight
} from "lucide-react";
import { getCoordinatesForCity, calculateDistanceInKm, PORTUGAL_GEO } from "../utils/geoData";

const HOME_CATEGORIES = [
  { name: "Cabelo & Barbearia", icon: "💇", url: "/explore?category=Cabelo %26 Barbearia" },
  { name: "Nails & Beauty", icon: "💅", url: "/explore?category=Nails %26 Beauty" },
  { name: "Estética", icon: "✨", url: "/explore?category=Estética" },
  { name: "Wellness & Spa", icon: "💆", url: "/explore?category=Wellness" },
  { name: "Ao Domicílio", icon: "🏠", url: "/explore?category=Ao domicílio" },
  { name: "Noivas & Eventos", icon: "👰", url: "/explore?category=Noivas %26 Eventos" },
  { name: "Barbeiro", icon: "💈", url: "/explore?category=Cabelo %26 Barbearia&subcategory=Barbearia" },
  { name: "Massagens", icon: "💆", url: "/explore?category=Wellness&subcategory=Massagem Relaxante" }
];

const CITIES = [
  "Lisboa", "Porto", "Braga", "Coimbra", "Aveiro", "Faro", "Funchal", "Ponta Delgada"
];

export default function Home() {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Estados de Pesquisa Simplificados (Apenas 2 campos)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocSuggestions, setShowLocSuggestions] = useState(false);

  // Estados de Dados
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);

  // Navegação nas Categorias
  const scrollCategories = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      if (direction === 'right') scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      else scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  // Pedir Localização ao Iniciar
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log("Localização não permitida pelo utilizador")
      );
    }
  }, []);

  // Carregar Dados
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

        // Fallback Inteligente caso a BD falhe
        if (loadedBiz.length === 0 || bizRes.error) {
          const { FALLBACK_BUSINESSES, FALLBACK_SERVICES, FALLBACK_REVIEWS } = await import("../utils/fallbackData");
          loadedBiz = FALLBACK_BUSINESSES;
          srvData = FALLBACK_SERVICES;
          revDataFinal = FALLBACK_REVIEWS;
        }
        
        setReviews(revDataFinal);
        const now = new Date();
        
        const processed = loadedBiz.map(b => {
          const bReviews = revDataFinal.filter(r => r.business_id === b.id);
          const rating = bReviews.length ? bReviews.reduce((sum, r) => sum + r.rating, 0) / bReviews.length : (b.is_premium ? 4.8 : 0);
          
          const lat = b.latitude ?? getCoordinatesForCity(b.district, b.city).latitude;
          const lng = b.longitude ?? getCoordinatesForCity(b.district, b.city).longitude;
          
          let distance = null;
          if (userCoords) {
            distance = calculateDistanceInKm(userCoords.lat, userCoords.lng, lat, lng);
          }

          return { 
            ...b, 
            rating, 
            reviewsCount: bReviews.length || (b.is_premium ? 24 : 0), 
            startPrice: 15, // Valor base simplificado
            lat, lng, distance, 
            isNew: (now.getTime() - new Date(b.created_at).getTime()) < 15 * 24 * 60 * 60 * 1000,
            services: srvData.filter((s: any) => s.business_id === b.id)
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

  // Lógica de Submissão de Pesquisa
  const handleSearchSubmit = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery);
    if (searchLocation.trim()) {
      if (searchLocation === "Perto de Mim") params.set("nearMe", "true");
      else params.set("city", searchLocation);
    }
    navigate(`/explore?${params.toString()}`);
  };

  // Cálculos Inteligentes para as Secções
  const topPartners = useMemo(() => businesses.filter(b => b.is_premium || b.is_verified), [businesses]);
  const promocoes = useMemo(() => businesses.filter(b => b.is_promoted || b.services?.some((s: any) => s.discount_price || s.price_promotion || s.is_promo)), [businesses]);
  const melhoresAvaliacoes = useMemo(() => [...businesses].sort((a, b) => b.rating - a.rating).slice(0, 10), [businesses]);
  
  // NOVA SECÇÃO INTELIGENTE: Perto de Mim (Só aparece se tivermos coordenadas)
  const locaisProximos = useMemo(() => {
    if (!userCoords) return [];
    return [...businesses]
      .filter(b => b.distance !== null && b.distance < 20) // Raio de 20km
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, 10);
  }, [businesses, userCoords]);

  // Cartão de Espaço Reutilizável
  const BusinessCard: React.FC<{ b: any }> = ({ b }) => (
    <Link to={`/business/${b.slug}`} className="group bg-white rounded-3xl border border-slate-100/60 overflow-hidden hover:shadow-2xl hover:shadow-purple-900/5 transition-all duration-300 flex flex-col min-w-[280px] max-w-[300px] shrink-0">
      <div className="relative overflow-hidden h-48 sm:h-56">
        <img src={b.cover_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600"} alt={b.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {(b.is_premium || b.is_verified) && (
            <span className="bg-slate-900/90 text-amber-400 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Top Partner
            </span>
          )}
          {b.is_promoted && (
            <span className="bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1">
              <Tag className="w-3 h-3" /> Promoção
            </span>
          )}
        </div>

        {b.rating > 0 && (
          <div className="absolute bottom-3 left-3 bg-white/95 text-slate-900 text-[10px] font-black px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-lg">
            <Star className="w-3 h-3 text-purple-600 fill-purple-600" />
            {b.rating.toFixed(1)} <span className="text-slate-500">({b.reviewsCount})</span>
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col justify-between flex-1">
        <div>
          <h3 className="font-display font-bold text-slate-900 text-base line-clamp-1 group-hover:text-purple-600">{b.name}</h3>
          <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-1 flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {b.city} {b.distance ? `· a ${b.distance.toFixed(1)}km` : ''}
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between text-[11px] font-semibold border-t border-slate-100/50 pt-3">
          <span className="text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">{b.category}</span>
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest">A partir de</span>
            <span className="text-purple-600 font-black text-sm">{b.startPrice}€</span>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans flex flex-col">
      {/* 1. HERO SECTION & SMART SEARCH */}
      <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-white to-rose-50/30 -z-10" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
            A sua próxima marcação <br />
            <span className="bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text text-transparent">
              a poucos cliques de distância.
            </span>
          </h1>
          <p className="text-sm lg:text-lg text-slate-500 max-w-2xl mx-auto mb-10 font-medium">
            Os melhores barbeiros, salões de beleza, spas e clínicas em Portugal.
          </p>

          {/* Search Bar Simplificada (Estilo Fresha) */}
          <div className="w-full max-w-3xl bg-white p-2 rounded-full border border-slate-200/80 shadow-2xl shadow-purple-900/5 relative z-20 flex flex-col md:flex-row items-center gap-2">
            
            {/* Campo 1: O que procura */}
            <div className="flex-1 w-full relative px-4 py-2 border-b md:border-b-0 md:border-r border-slate-100">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">O que procura?</label>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-purple-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Serviço, nome do espaço..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(e.target.value.length > 0); }}
                  className="bg-transparent border-none w-full text-sm font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Campo 2: Onde */}
            <div className="flex-1 w-full relative px-4 py-2">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Onde?</label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Cidade, local..."
                  value={searchLocation}
                  onChange={(e) => { setSearchLocation(e.target.value); setShowLocSuggestions(e.target.value.length > 0); }}
                  onFocus={() => setShowLocSuggestions(true)}
                  className="bg-transparent border-none w-full text-sm font-bold text-slate-800 focus:outline-none"
                />
              </div>
              
              {/* Sugestão Inteligente de Localização */}
              {showLocSuggestions && (
                <div className="absolute top-[calc(100%+16px)] left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 py-2">
                  <button onMouseDown={() => { setSearchLocation("Perto de Mim"); setShowLocSuggestions(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-blue-600 text-sm font-bold flex items-center gap-2 border-b border-slate-50">
                    <Navigation className="w-4 h-4" /> Usar a minha localização atual
                  </button>
                  {CITIES.filter(c => c.toLowerCase().includes(searchLocation.toLowerCase())).slice(0, 4).map(city => (
                    <button key={city} onMouseDown={() => { setSearchLocation(city); setShowLocSuggestions(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-sm flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleSearchSubmit} className="w-full md:w-auto bg-slate-900 hover:bg-purple-600 text-white font-bold text-sm py-4 px-8 rounded-full transition-colors flex items-center justify-center gap-2 shrink-0">
              Pesquisar
            </button>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIAS RÁPIDAS */}
      <section className="pb-16 max-w-7xl mx-auto px-4 w-full">
        <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar">
          {HOME_CATEGORIES.map((cat) => (
            <button key={cat.name} onClick={() => navigate(cat.url)} className="flex items-center gap-2 bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 px-5 py-3 rounded-2xl transition-all cursor-pointer shrink-0">
              <span className="text-lg">{cat.icon}</span>
              <span className="text-xs font-bold text-slate-700">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. CONTEÚDO DINÂMICO */}
      <div className="space-y-16 pb-24 max-w-7xl mx-auto px-4 w-full">
        {/* Nova Secção: Perto de Mim (Ativada por GPS) */}
        {locaisProximos.length > 0 && (
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">📍 Perto de si</h2>
              <p className="text-sm text-slate-500">Espaços fantásticos a poucos minutos de distância.</p>
            </div>
            <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x">
              {locaisProximos.map(b => <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>)}
            </div>
          </section>
        )}

        {/* Top Partners */}
        {topPartners.length > 0 && (
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">💎 Escolhas de Topo</h2>
              <p className="text-sm text-slate-500">Profissionais verificados e com as melhores avaliações.</p>
            </div>
            <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x">
              {topPartners.map(b => <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>)}
            </div>
          </section>
        )}

        {/* Promoções */}
        {promocoes.length > 0 && (
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">🎁 Ofertas Especiais</h2>
              <p className="text-sm text-slate-500">Poupe nas suas próximas marcações.</p>
            </div>
            <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x">
              {promocoes.map(b => <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
