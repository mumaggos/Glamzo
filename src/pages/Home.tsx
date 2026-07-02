import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { PORTUGAL_GEO } from "../utils/geoData";
import { MAIN_CATEGORIES } from "../utils/categoriesData";
import { supabase } from "../lib/supabase";
import {
  Sparkles,
  Search,
  MapPin,
  ArrowRight,
  Smile,
  Star,
  ShieldCheck,
  Check,
  Compass,
  Home as HomeIcon,
  Heart,
  CalendarDays,
  Flame,
  Award
} from "lucide-react";

// Helper distance function
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const d = R * c; 
  return d;
}

const BusinessCard = ({ b }: { b: any }) => {
  const isNew = (Date.now() - new Date(b.created_at).getTime()) < 15 * 24 * 60 * 60 * 1000;
  const isTopPartner = (b.rating ?? 0) >= 4.8;
  const isPromo = b.is_promoted;

  return (
    <Link
      to={`/business/${b.slug}`}
      className={`group bg-white border rounded-2xl overflow-hidden hover:shadow-[0_10px_35px_rgba(15,23,42,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between block relative h-full ${
        isPromo
          ? "border-purple-300 shadow-[0_4px_20px_rgba(147,51,234,0.04)]"
          : "border-slate-200/80"
      }`}
    >
      <div>
        <div className="h-48 bg-slate-100 relative overflow-hidden">
          <img
            src={
              b.cover_url ||
              "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=70"
            }
            alt={b.name}
            loading="lazy"
            decoding="async"
            width="400"
            height="192"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

          {/* Badges top-left */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10">
            {isPromo && (
              <div className="bg-rose-500 text-white font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm flex items-center gap-1">
                <Flame className="w-3 h-3" />
                <span>Promoção</span>
              </div>
            )}
            {isNew && (
              <div className="bg-blue-500 text-white font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Nova Loja</span>
              </div>
            )}
            {isTopPartner && (
              <div className="bg-slate-900 text-amber-400 border border-slate-700/50 font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm flex items-center gap-1">
                <Award className="w-3 h-3" />
                <span>Top Partner</span>
              </div>
            )}
          </div>
          
          {/* Rating top-right */}
          {(b.rating ?? 0) > 0 && (
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-slate-100 z-10">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-slate-900">{b.rating.toFixed(1)}</span>
              {b.review_count > 0 && (
                <span className="text-[10px] text-slate-500 font-medium">({b.review_count})</span>
              )}
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-1.5 line-clamp-1">
            {b.category}
          </div>
          <h3 className="text-base font-display font-bold text-slate-900 tracking-tight group-hover:text-purple-600 transition-colors line-clamp-1">
            {b.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-2.5 text-slate-500 text-xs font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="line-clamp-1">{b.city}, {b.district}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const CarouselSection = ({ title, subtitle, businesses }: { title: string, subtitle?: string, businesses: any[] }) => {
  if (!businesses || businesses.length === 0) return null;
  return (
    <section className="py-12 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="flex flex-col mb-8 gap-1.5">
        <h2 className="text-2xl sm:text-3xl font-display font-medium text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-slate-500 text-sm">{subtitle}</p>}
      </div>
      <div className="flex gap-5 overflow-x-auto pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {businesses.map(b => (
           <div key={b.id} className="snap-start shrink-0 w-[280px] sm:w-[320px]">
             <BusinessCard b={b} />
           </div>
        ))}
      </div>
    </section>
  );
};

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Search parameters
  const [typedQuery, setTypedQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");

  const [promotedShops, setPromotedShops] = useState<any[]>([]);
  const [mapBusinesses, setMapBusinesses] = useState<any[]>([]);
  const [dynamicCards, setDynamicCards] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation error:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    // Exactly existing logic for fetching map businesses
    supabase
      .from("businesses")
      .select("*")
      .eq("status", "active")
      .eq("public_page_enabled", true)
      .limit(50)
      .then(({ data }) => {
        if (data) {
          setMapBusinesses(data);
        }
      });
  }, []);

  useEffect(() => {
    // Exactly existing logic for fetching promoted shops
    const cachedShops = sessionStorage.getItem("glamzo_promoted_shops");
    if (cachedShops) {
      try {
        setPromotedShops(JSON.parse(cachedShops));
      } catch (e) {}
    }

    supabase
      .from("businesses")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (data) {
          try {
            const filtered = data.filter((b: any) => {
              const isDemo = ["salao-spa-premium", "barbearia-braga-moderna", "estetica-beleza-braganca"].includes(b.slug);
              if (!isDemo) {
                if (b.status !== 'active') return false;
                if (!b.subscription_active) return false;
                if (b.subscription_status !== 'active' && b.subscription_status !== 'trialing') return false;
                if (b.public_page_enabled === false) return false;
              }
              return true;
            }).slice(0, 3);
            setPromotedShops(filtered);
            sessionStorage.setItem("glamzo_promoted_shops", JSON.stringify(filtered));
          } catch (e) {}
        }
      });

    // Exactly existing logic for fetching dynamic cards
    const loadDynamicCards = async () => {
      const cachedCards = sessionStorage.getItem("glamzo_homepage_cards");
      if (cachedCards) {
        try {
          setDynamicCards(JSON.parse(cachedCards));
        } catch (e) {}
      }
      try {
        const { data, error } = await supabase
          .from("homepage_cards")
          .select("*")
          .eq("active", true)
          .order("display_order", { ascending: true });
        if (!error && data && data.length > 0) {
          setDynamicCards(data);
          sessionStorage.setItem("glamzo_homepage_cards", JSON.stringify(data));
        }
      } catch (err) {}
    };
    loadDynamicCards();
  }, []);

  // Category Helpers
  const getMatchingCategoryName = (title: string): string => {
    const t = (title || "").toLowerCase().trim();
    if (t.includes("noiva") || t.includes("event") || t.includes("casam") || t.includes("brid") || t.includes("wed")) return "Noivas & Eventos";
    if (t.includes("cabel") || t.includes("barb") || t.includes("pente") || t.includes("hair") || t.includes("cut")) return "Cabelo & Barbearia";
    if (t.includes("nail") || t.includes("unh") || t.includes("pest") || t.includes("sobr") || t.includes("maqu") || t.includes("beauty") || t.includes("make")) return "Nails & Beauty";
    if (t.includes("estét") || t.includes("pele") || t.includes("corpo") || t.includes("laser") || t.includes("depil") || t.includes("skin")) return "Estética";
    if (t.includes("well") || t.includes("mass") || t.includes("spa") || t.includes("reik") || t.includes("terap") || t.includes("relax")) return "Wellness";
    if (t.includes("domicíl") || t.includes("casa") || t.includes("home")) return "Ao domicílio";
    return title;
  };

  const getBestUnsplashCategoryFallback = (title: string): string => {
    const t = (title || "").toLowerCase().trim();
    if (t.includes("noiva") || t.includes("event") || t.includes("casam") || t.includes("brid") || t.includes("wed")) return "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400";
    if (t.includes("cabel") || t.includes("barb") || t.includes("pente") || t.includes("hair") || t.includes("cut")) return "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=400";
    if (t.includes("nail") || t.includes("unh") || t.includes("pest") || t.includes("sobr") || t.includes("maqu") || t.includes("beauty") || t.includes("make")) return "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=400";
    if (t.includes("estét") || t.includes("pele") || t.includes("corpo") || t.includes("laser") || t.includes("depil") || t.includes("skin")) return "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400";
    if (t.includes("well") || t.includes("mass") || t.includes("spa") || t.includes("reik") || t.includes("terap") || t.includes("relax")) return "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400";
    if (t.includes("domicíl") || t.includes("casa") || t.includes("home")) return "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400";
    return "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400";
  };

  const renderedCategories = useMemo(() => {
    if (dynamicCards.length > 0) {
      return dynamicCards.map((c) => {
        let imgUrl = c.image_url;
        if (!imgUrl || imgUrl.startsWith("/assets/") || imgUrl.includes("localhost") || imgUrl.startsWith("/") || imgUrl === "null" || imgUrl === "undefined" || imgUrl.includes("photo-1594744803329-e58b31de215f")) {
          imgUrl = getBestUnsplashCategoryFallback(c.title);
        }
        return { id: c.id, name: c.title, description: c.subtitle, imageUrl: imgUrl, emoji: c.emoji || "✨" };
      });
    }
    return MAIN_CATEGORIES;
  }, [dynamicCards]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (typedQuery.trim()) queryParams.set("q", typedQuery.trim());
    if (selectedDistrict !== "All") queryParams.set("district", selectedDistrict);
    if (selectedCity !== "All") queryParams.set("city", selectedCity);
    navigate(`/explore?${queryParams.toString()}`);
  };

  // Carousel Data Preparation
  const allBusinesses = useMemo(() => {
    const combined = [...promotedShops, ...mapBusinesses];
    return Array.from(new Map(combined.map(b => [b.id, b])).values());
  }, [promotedShops, mapBusinesses]);

  const melhoresAvaliacoes = useMemo(() => allBusinesses.slice().sort((a,b) => (b.rating||0) - (a.rating||0)).slice(0, 10), [allBusinesses]);
  const maisReservados = useMemo(() => allBusinesses.slice().sort((a,b) => (b.review_count||0) - (a.review_count||0)).slice(0, 10), [allBusinesses]);
  const novasLojas = useMemo(() => allBusinesses.slice().sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10), [allBusinesses]);
  const topPartner = useMemo(() => allBusinesses.filter(b => (b.rating||0) >= 4.8), [allBusinesses]);
  const promocoes = useMemo(() => allBusinesses.filter(b => b.is_promoted), [allBusinesses]);
  
  const recomendados = useMemo(() => {
    if (userLocation) {
      return allBusinesses.slice().sort((a,b) => {
        const distA = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, a.lat || 0, a.lng || 0);
        const distB = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, b.lat || 0, b.lng || 0);
        const scoreA = (a.rating || 0) * 10 - distA;
        const scoreB = (b.rating || 0) * 10 - distB;
        return scoreB - scoreA;
      }).slice(0, 10);
    }
    return melhoresAvaliacoes; // fallback
  }, [allBusinesses, userLocation, melhoresAvaliacoes]);

  // Cities Data Preparation
  const topCities = useMemo(() => {
    const counts: Record<string, number> = {};
    allBusinesses.forEach(b => {
      if (b.city) counts[b.city] = (counts[b.city] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [allBusinesses]);

  const cityPhotos: Record<string, string> = {
    'Lisboa': 'https://images.unsplash.com/photo-1558694440-03ade9215d7b?auto=format&fit=crop&q=80&w=600',
    'Porto': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&q=80&w=600',
    'Braga': 'https://images.unsplash.com/photo-1629806456073-ce6f6104c997?auto=format&fit=crop&q=80&w=600',
    'Faro': 'https://images.unsplash.com/photo-1629731665427-d3eb97c83f99?auto=format&fit=crop&q=80&w=600',
    'Coimbra': 'https://images.unsplash.com/photo-1621245781373-3051bc728a9b?auto=format&fit=crop&q=80&w=600',
    'Aveiro': 'https://images.unsplash.com/photo-1563172082-986cbe91280b?auto=format&fit=crop&q=80&w=600',
  };

  const getCityPhoto = (cityName: string) => {
    return cityPhotos[cityName] || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600';
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col justify-between font-sans selection:bg-purple-100 selection:text-purple-900 pb-24">
      {/* 1. Modern Premium Hero Section */}
      <section className="relative pt-24 pb-20 border-b border-slate-200 bg-white overflow-hidden">
        {/* Background Premium Image Layer */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=2000" 
            alt="Glamzo Premium Spa" 
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/80 to-[#fafbfc]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 font-sans">
          <div className="text-center max-w-4xl mx-auto mb-14">
            <h1 className="text-5xl sm:text-7xl font-display font-medium tracking-tight text-slate-900 leading-[1.05] mb-6">
              O seu momento de cuidado, <br className="hidden sm:block" />
              <span className="text-purple-600">reservado com elegância.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
              Descubra e reserve instantaneamente os melhores salões, barbearias e centros de estética em Portugal. Experiência premium, 24 horas por dia.
            </p>
          </div>

          {/* Search bar widget - Booking/Airbnb Style */}
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white p-2.5 sm:p-3 rounded-3xl border border-slate-200 shadow-[0_15px_40px_rgba(15,23,42,0.06)] max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-2 items-center relative z-20"
          >
            {/* Find Service */}
            <div className="md:col-span-5 relative group px-2 sm:px-4 py-1">
              <label className="block text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-0.5">
                O que procura?
              </label>
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0 group-focus-within:text-purple-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Cabeleireiro, Barbearia..."
                  value={typedQuery}
                  onChange={(e) => setTypedQuery(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-sm sm:text-base text-slate-900 focus:ring-0 placeholder-slate-400 font-medium outline-none truncate"
                />
              </div>
            </div>
            
            <div className="hidden md:block w-px h-10 bg-slate-200"></div>

            {/* Select Local */}
            <div className="md:col-span-4 relative group px-2 sm:px-4 py-1 border-t md:border-t-0 border-slate-100 md:border-none pt-3 md:pt-1">
              <label className="block text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-0.5">
                Localização
              </label>
              <div className="relative flex items-center">
                <MapPin className="w-5 h-5 text-slate-400 mr-2 shrink-0 group-focus-within:text-purple-600 transition-colors" />
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    setSelectedCity("All");
                  }}
                  className="w-full bg-transparent border-none p-0 text-sm sm:text-base text-slate-900 focus:ring-0 font-medium cursor-pointer appearance-none outline-none truncate"
                >
                  <option value="All">Onde quer agendar?</option>
                  {Object.keys(PORTUGAL_GEO).sort().map((dist) => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="md:col-span-3 pt-3 md:pt-0 pl-0 md:pl-2">
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-2xl text-sm sm:text-base tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30 hover:shadow-purple-600/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                <Search className="w-4 h-4" />
                <span>Pesquisar</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 2. Elegant Small Categories - Fresha Style */}
      <section className="py-12 border-b border-slate-200/60 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {renderedCategories.map((cat) => (
              <Link
                key={cat.id || cat.name}
                to={`/explore?category=${encodeURIComponent(getMatchingCategoryName(cat.name))}`}
                className="snap-start shrink-0 group flex flex-col items-center gap-3 cursor-pointer w-[80px] sm:w-[96px]"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden relative shadow-sm border border-slate-200 group-hover:border-purple-300 group-hover:shadow-md transition-all duration-300 bg-slate-50 flex items-center justify-center">
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors" />
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-700 text-center leading-tight group-hover:text-purple-600 transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Carousels */}
      <div className="bg-[#fafbfc] pt-4">
        {promocoes.length > 0 && (
          <CarouselSection title="Ofertas Especiais" subtitle="Aproveite descontos ativos agora mesmo." businesses={promocoes} />
        )}
        
        {recomendados.length > 0 && (
          <CarouselSection title="Recomendados para Si" subtitle="Com base na sua localização e preferências." businesses={recomendados} />
        )}
        
        {topPartner.length > 0 && (
          <CarouselSection title="Top Partners Glamzo" subtitle="Os espaços mais exclusivos e bem avaliados." businesses={topPartner} />
        )}
        
        <CarouselSection title="Melhores Avaliações" subtitle="Favoritos dos nossos clientes." businesses={melhoresAvaliacoes} />
        
        <CarouselSection title="Novidades na Glamzo" subtitle="Descubra os espaços adicionados recentemente." businesses={novasLojas} />
        
        <CarouselSection title="Mais Reservados" subtitle="Os espaços com maior popularidade." businesses={maisReservados} />
      </div>

      {/* 4. Explore by City - Booking Style */}
      {topCities.length > 0 && (
        <section className="py-12 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex flex-col mb-8 gap-1.5">
              <h2 className="text-2xl sm:text-3xl font-display font-medium text-slate-900 tracking-tight">Explorar por Cidade</h2>
              <p className="text-slate-500 text-sm">Os melhores destinos de beleza e bem-estar.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {topCities.map(city => (
                <Link
                  key={city.name}
                  to={`/explore?city=${encodeURIComponent(city.name)}`}
                  className="group relative h-48 sm:h-64 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 block"
                >
                  <img
                    src={getCityPhoto(city.name)}
                    alt={city.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 p-4 sm:p-5">
                    <h3 className="text-white text-lg sm:text-xl font-display font-bold tracking-tight mb-0.5">{city.name}</h3>
                    <p className="text-slate-200 text-xs sm:text-sm font-medium">{city.count} {city.count === 1 ? 'espaço' : 'espaços'}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Emotive Values */}
      <section className="py-20 border-t border-slate-200 bg-[#fafbfc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-white text-purple-600 flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                <CalendarDays className="w-7 h-7 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2">Agendamento Fácil 24/7</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                Acesse a disponibilidade real dos melhores profissionais e reserve instantaneamente a qualquer momento.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-white text-purple-600 flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                <Star className="w-7 h-7 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2">Opiniões Reais</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                Tome decisões baseadas em avaliações autênticas de clientes que visitaram os espaços.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-white text-purple-600 flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                <ShieldCheck className="w-7 h-7 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2">Garantia de Qualidade</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                Uma seleção curada dos parceiros mais exclusivos para garantir uma experiência de excelência.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Partner Portal CTA */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mb-4">
              Impulsione o seu negócio de beleza
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mb-8 leading-relaxed">
              Junte-se a centenas de parceiros Glamzo e descubra a melhor plataforma para gerir reservas, aumentar clientes e simplificar pagamentos.
            </p>
            <Link
              to="/partner"
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-slate-900/20 text-sm tracking-wider cursor-pointer hover:-translate-y-0.5"
            >
              <span>Registar meu espaço grátis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
