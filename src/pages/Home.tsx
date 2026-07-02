import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { PORTUGAL_GEO } from "../utils/geoData";
import { supabase } from "../lib/supabase";
import {
  Sparkles,
  Search,
  MapPin,
  ArrowRight,
  Star,
  ShieldCheck,
  CalendarDays,
  Flame,
  Award,
  TrendingUp,
  Map as MapIcon,
  Clock
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

const ALL_CATEGORIES = [
  { name: 'Barbearia', emoji: '💈', imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=400' },
  { name: 'Cabeleireiro', emoji: '✂️', imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=400' },
  { name: 'Salão de Beleza', emoji: '💇‍♀️', imageUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=400' },
  { name: 'Unhas', emoji: '💅', imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=400' },
  { name: 'Estética', emoji: '✨', imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400' },
  { name: 'Spa', emoji: '🧖‍♀️', imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400' },
  { name: 'Massagens', emoji: '💆', imageUrl: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=400' },
  { name: 'Wellness', emoji: '🌿', imageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=400' },
  { name: 'Maquilhagem', emoji: '💄', imageUrl: 'https://images.unsplash.com/photo-1512496015851-a1c8ce95874c?auto=format&fit=crop&q=80&w=400' },
  { name: 'Micropigmentação', emoji: '✒️', imageUrl: 'https://images.unsplash.com/photo-1579496660164-9642512e9b06?auto=format&fit=crop&q=80&w=400' },
  { name: 'Depilação', emoji: '🦵', imageUrl: 'https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&q=80&w=400' },
  { name: 'Laser', emoji: '⚡', imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400' },
  { name: 'Clínica Estética', emoji: '🏥', imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=400' },
  { name: 'Podologia', emoji: '🦶', imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=400' },
  { name: 'Nutrição', emoji: '🥗', imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=400' },
  { name: 'Fisioterapia', emoji: '🦴', imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400' },
  { name: 'Osteopatia', emoji: '👐', imageUrl: 'https://images.unsplash.com/photo-1544161515-4abfbcece6b4?auto=format&fit=crop&q=80&w=400' },
  { name: 'Personal Trainer', emoji: '💪', imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=400' },
  { name: 'Yoga', emoji: '🧘‍♀️', imageUrl: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&q=80&w=400' },
  { name: 'Pilates', emoji: '🤸', imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=400' },
  { name: 'Tattoo', emoji: '🖋️', imageUrl: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&q=80&w=400' },
  { name: 'Piercing', emoji: '💎', imageUrl: 'https://images.unsplash.com/photo-1611558709798-e009c8fd7706?auto=format&fit=crop&q=80&w=400' },
];

const TRENDS = [
  "Corte Degradê",
  "Unhas de Gel",
  "Massagem Relaxante",
  "Penteados",
  "Maquilhagem"
];

const BusinessCard = ({ b, userLocation }: { b: any, userLocation?: {lat: number, lng: number} | null }) => {
  const isNew = (Date.now() - new Date(b.created_at).getTime()) < 15 * 24 * 60 * 60 * 1000;
  const isTopPartner = (b.rating ?? 0) >= 4.8;
  const isPromo = b.is_promoted;
  
  const distKm = userLocation && b.lat && b.lng 
    ? getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, b.lat, b.lng) 
    : null;

  return (
    <Link
      to={`/business/${b.slug}`}
      className={`group bg-white border rounded-[20px] overflow-hidden hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between block relative h-full ${
        isPromo
          ? "border-purple-300 shadow-[0_4px_20px_rgba(147,51,234,0.04)]"
          : "border-slate-200/80 shadow-sm"
      }`}
    >
      <div>
        <div className="h-56 bg-slate-100 relative overflow-hidden">
          <img
            src={
              b.cover_url ||
              "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80"
            }
            alt={b.name}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />

          {/* Badges top-left */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 items-start z-10">
            {isPromo && (
              <div className="bg-rose-500 text-white font-sans text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span>Promoção</span>
              </div>
            )}
            {isNew && (
              <div className="bg-blue-600 text-white font-sans text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nova Loja</span>
              </div>
            )}
            {isTopPartner && (
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-amber-400 border border-amber-500/30 font-sans text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>Top Partner</span>
              </div>
            )}
          </div>
          
          {/* Distance overlay bottom-right over image */}
          {distKm !== null && (
            <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm border border-white/10 z-10 text-white">
              <MapIcon className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-xs font-semibold">{distKm < 1 ? "< 1" : distKm.toFixed(1)} km</span>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="text-[11px] font-bold text-purple-600 uppercase tracking-widest line-clamp-1">
              {b.category}
            </div>
            {/* Rating */}
            {(b.rating ?? 0) > 0 && (
              <div className="flex items-center gap-1 shrink-0 bg-amber-50 px-1.5 py-0.5 rounded text-amber-700">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span className="text-xs font-bold">{b.rating.toFixed(1)}</span>
                {b.review_count > 0 && (
                  <span className="text-[10px] opacity-80 font-medium">({b.review_count})</span>
                )}
              </div>
            )}
          </div>
          
          <h3 className="text-lg font-display font-bold text-slate-900 tracking-tight group-hover:text-purple-600 transition-colors line-clamp-1">
            {b.name}
          </h3>
          
          <div className="flex items-center gap-1.5 mt-2.5 text-slate-500 text-sm font-medium">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="line-clamp-1">{b.address || b.city}, {b.district}</span>
          </div>
          
          {/* Mockup for "Aberto Agora" or extra info if available in future. Just styling placeholder */}
          {/* <div className="flex items-center gap-1.5 mt-3 text-emerald-600 text-xs font-semibold">
             <Clock className="w-3.5 h-3.5" /> Aberto agora
          </div> */}
        </div>
      </div>
    </Link>
  );
};

const CarouselSection = ({ title, subtitle, businesses, userLocation }: { title: string, subtitle?: string, businesses: any[], userLocation?: any }) => {
  if (!businesses || businesses.length === 0) return null;
  return (
    <section className="py-12 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="flex flex-col mb-8 gap-1.5">
        <h2 className="text-2xl sm:text-3xl font-display font-medium text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-slate-500 text-sm sm:text-base">{subtitle}</p>}
      </div>
      <div className="flex gap-5 sm:gap-6 overflow-x-auto pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {businesses.map(b => (
           <div key={b.id} className="snap-start shrink-0 w-[300px] sm:w-[340px]">
             <BusinessCard b={b} userLocation={userLocation} />
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
  const [typedLocation, setTypedLocation] = useState("");
  
  const [showQuerySuggestions, setShowQuerySuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const searchRef = useRef<HTMLFormElement>(null);

  const [promotedShops, setPromotedShops] = useState<any[]>([]);
  const [mapBusinesses, setMapBusinesses] = useState<any[]>([]);
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
    
    // Close dropdowns when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowQuerySuggestions(false);
        setShowLocationSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    supabase
      .from("businesses")
      .select("*")
      .eq("status", "active")
      .eq("public_page_enabled", true)
      .limit(200)
      .then(({ data }) => {
        if (data) {
          setMapBusinesses(data);
        }
      });
  }, []);

  useEffect(() => {
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
  }, []);

  // Carousel Data Preparation
  const allBusinesses = useMemo(() => {
    const combined = [...promotedShops, ...mapBusinesses];
    return Array.from(new Map(combined.map(b => [b.id, b])).values());
  }, [promotedShops, mapBusinesses]);
  
  // Intelligent Suggestions logic
  const querySuggestions = useMemo(() => {
    if (!typedQuery.trim()) return [];
    const q = typedQuery.toLowerCase().trim();
    const suggestions = new Set<string>();
    
    // Add matching categories
    ALL_CATEGORIES.forEach(c => {
      if (c.name.toLowerCase().includes(q)) suggestions.add(c.name);
    });
    
    // Add matching services/categories from DB
    allBusinesses.forEach(b => {
      if (b.category?.toLowerCase().includes(q)) suggestions.add(b.category);
      if (b.name?.toLowerCase().includes(q)) suggestions.add(b.name);
    });
    
    return Array.from(suggestions).slice(0, 6);
  }, [typedQuery, allBusinesses]);

  const locationSuggestions = useMemo(() => {
    if (!typedLocation.trim()) return [];
    const q = typedLocation.toLowerCase().trim();
    const suggestions = new Set<string>();
    
    Object.keys(PORTUGAL_GEO).forEach(dist => {
      if (dist.toLowerCase().includes(q)) suggestions.add(dist);
      PORTUGAL_GEO[dist].forEach((city: string) => {
        if (city.toLowerCase().includes(q)) suggestions.add(city);
      });
    });
    
    return Array.from(suggestions).slice(0, 6);
  }, [typedLocation]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (typedQuery.trim()) queryParams.set("q", typedQuery.trim());
    
    if (typedLocation.trim()) {
      let loc = typedLocation.trim();
      let foundDist = "All";
      if (Object.keys(PORTUGAL_GEO).some(d => d.toLowerCase() === loc.toLowerCase())) {
        foundDist = Object.keys(PORTUGAL_GEO).find(d => d.toLowerCase() === loc.toLowerCase()) || loc;
        
      } else {
        for (const [dist, cities] of Object.entries(PORTUGAL_GEO)) {
          if ((cities as string[]).some(c => c.toLowerCase() === loc.toLowerCase())) {
            loc = (cities as string[]).find(c => c.toLowerCase() === loc.toLowerCase()) || loc;
            foundDist = dist;
            break;
          }
        }
      }
      
      if (foundDist !== "All") {
        queryParams.set("district", foundDist);
        if (foundDist !== loc) {
          queryParams.set("city", loc);
        }
      } else {
        queryParams.set("city", loc); // fallback
      }
    }
    
    navigate(`/explore?${queryParams.toString()}`);
  };

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
    return melhoresAvaliacoes;
  }, [allBusinesses, userLocation, melhoresAvaliacoes]);

  // Cities Data Preparation - Aggregate by District!
  const topCities = useMemo(() => {
    const counts: Record<string, number> = {};
    allBusinesses.forEach(b => {
      // The city represents the whole region (district)
      const region = b.district || b.city; 
      if (region) counts[region] = (counts[region] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [allBusinesses]);

  const cityPhotos: Record<string, string> = {
    'Lisboa': 'https://images.unsplash.com/photo-1558694440-03ade9215d7b?auto=format&fit=crop&q=80&w=600',
    'Porto': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&q=80&w=600',
    'Braga': 'https://images.unsplash.com/photo-1629806456073-ce6f6104c997?auto=format&fit=crop&q=80&w=600',
    'Faro': 'https://images.unsplash.com/photo-1629731665427-d3eb97c83f99?auto=format&fit=crop&q=80&w=600',
    'Coimbra': 'https://images.unsplash.com/photo-1621245781373-3051bc728a9b?auto=format&fit=crop&q=80&w=600',
    'Aveiro': 'https://images.unsplash.com/photo-1563172082-986cbe91280b?auto=format&fit=crop&q=80&w=600',
    'Funchal': 'https://images.unsplash.com/photo-1590432363198-d748f3b4ba9e?auto=format&fit=crop&q=80&w=600',
    'Ponta Delgada': 'https://images.unsplash.com/photo-1596700084365-b0429f52f416?auto=format&fit=crop&q=80&w=600',
    'Setúbal': 'https://images.unsplash.com/photo-1582298754170-072fc47dfd67?auto=format&fit=crop&q=80&w=600',
    'Viseu': 'https://images.unsplash.com/photo-1629806456073-ce6f6104c997?auto=format&fit=crop&q=80&w=600',
    'Leiria': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600',
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
            className="w-full h-full object-cover opacity-[0.12]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/80 to-[#fafbfc]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 font-sans">
          <div className="text-center max-w-4xl mx-auto mb-14">
            <h1 className="text-5xl sm:text-7xl font-display font-medium tracking-tight text-slate-900 leading-[1.05] mb-6">
              O seu momento de cuidado, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">reservado com elegância.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
              Descubra e reserve instantaneamente os melhores salões, barbearias e centros de estética em Portugal. Experiência premium, 24 horas por dia.
            </p>
            
            {/* Trends tags */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Tendências:</span>
              {TRENDS.map(trend => (
                <Link
                  key={trend}
                  to={`/explore?q=${encodeURIComponent(trend)}`}
                  className="bg-white/80 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-purple-600 hover:border-purple-300 hover:shadow-sm transition-all duration-300 cursor-pointer"
                >
                  {trend}
                </Link>
              ))}
            </div>
          </div>

          {/* Search bar widget - Booking/Airbnb Style */}
          <form
            ref={searchRef}
            onSubmit={handleSearchSubmit}
            className="bg-white p-2.5 sm:p-3 rounded-[24px] border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.08)] max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-2 items-center relative z-20"
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
                  placeholder="Cabeleireiro, Barbearia, Massagem..."
                  value={typedQuery}
                  onChange={(e) => {
                    setTypedQuery(e.target.value);
                    setShowQuerySuggestions(true);
                  }}
                  onFocus={() => setShowQuerySuggestions(true)}
                  className="w-full bg-transparent border-none p-0 text-sm sm:text-base text-slate-900 focus:ring-0 placeholder-slate-400 font-medium outline-none truncate"
                />
              </div>
              
              {/* Query Suggestions Dropdown */}
              {showQuerySuggestions && querySuggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-4 bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2">
                    {querySuggestions.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setTypedQuery(s);
                          setShowQuerySuggestions(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors flex items-center gap-3"
                      >
                        <Search className="w-4 h-4 text-slate-400" />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="hidden md:block w-px h-10 bg-slate-200"></div>

            {/* Select Local */}
            <div className="md:col-span-4 relative group px-2 sm:px-4 py-1 border-t md:border-t-0 border-slate-100 md:border-none pt-3 md:pt-1">
              <label className="block text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-0.5">
                Localização
              </label>
              <div className="relative flex items-center">
                <MapPin className="w-5 h-5 text-slate-400 mr-2 shrink-0 group-focus-within:text-purple-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Onde quer agendar?"
                  value={typedLocation}
                  onChange={(e) => {
                    setTypedLocation(e.target.value);
                    setShowLocationSuggestions(true);
                  }}
                  onFocus={() => setShowLocationSuggestions(true)}
                  className="w-full bg-transparent border-none p-0 text-sm sm:text-base text-slate-900 focus:ring-0 placeholder-slate-400 font-medium outline-none truncate"
                />
              </div>
              
              {/* Location Suggestions Dropdown */}
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-4 bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2">
                    {locationSuggestions.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setTypedLocation(s);
                          setShowLocationSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors flex items-center gap-3"
                      >
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="md:col-span-3 pt-3 md:pt-0 pl-0 md:pl-2">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl text-sm sm:text-base tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30 hover:shadow-purple-600/40 hover:-translate-y-0.5 active:translate-y-0"
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
            {ALL_CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={`/explore?category=${encodeURIComponent(cat.name)}`}
                className="snap-start shrink-0 group flex flex-col items-center gap-3 cursor-pointer w-[80px] sm:w-[96px]"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] overflow-hidden relative shadow-sm border border-slate-200 group-hover:border-purple-400 group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300 bg-slate-50 flex items-center justify-center">
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors" />
                  <span className="relative z-10 text-2xl drop-shadow-md">{cat.emoji}</span>
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-700 text-center leading-tight group-hover:text-purple-600 transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Carousels */}
      <div className="bg-[#fafbfc] pt-4 pb-8 space-y-4">
        {promocoes.length > 0 && (
          <CarouselSection title="🎁 Ofertas Especiais" subtitle="Aproveite descontos ativos agora mesmo." businesses={promocoes} userLocation={userLocation} />
        )}
        
        {recomendados.length > 0 && (
          <CarouselSection title="❤️ Recomendados para Si" subtitle="Com base na sua localização e preferências." businesses={recomendados} userLocation={userLocation} />
        )}
        
        {topPartner.length > 0 && (
          <CarouselSection title="💎 Top Partners Glamzo" subtitle="Os espaços mais exclusivos e bem avaliados." businesses={topPartner} userLocation={userLocation} />
        )}
        
        <CarouselSection title="⭐ Melhores Avaliações" subtitle="Favoritos dos nossos clientes." businesses={melhoresAvaliacoes} userLocation={userLocation} />
        
        <CarouselSection title="🆕 Novidades na Glamzo" subtitle="Descubra os espaços adicionados recentemente." businesses={novasLojas} userLocation={userLocation} />
        
        <CarouselSection title="🔥 Mais Reservados" subtitle="Os espaços com maior popularidade esta semana." businesses={maisReservados} userLocation={userLocation} />
      </div>

      {/* 4. Explore by City - Booking Style */}
      {topCities.length > 0 && (
        <section className="py-16 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex flex-col mb-10 gap-2">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">Explorar Portugal</h2>
              <p className="text-slate-500 text-base">Descubra os melhores destinos de beleza e bem-estar.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {topCities.map(city => (
                <Link
                  key={city.name}
                  to={`/explore?district=${encodeURIComponent(city.name)}`}
                  className="group relative h-56 sm:h-72 rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block border border-slate-200/50"
                >
                  <img
                    src={getCityPhoto(city.name)}
                    alt={city.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 p-5 sm:p-6 w-full">
                    <h3 className="text-white text-xl sm:text-2xl font-display font-bold tracking-tight mb-1.5 drop-shadow-md">{city.name}</h3>
                    <p className="text-slate-200/90 text-sm font-medium flex items-center gap-1.5">
                      {city.count} {city.count === 1 ? 'estabelecimento' : 'estabelecimentos'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Emotive Values */}
      <section className="py-24 border-t border-slate-200 bg-[#fafbfc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-[20px] bg-white text-purple-600 flex items-center justify-center mb-6 shadow-sm border border-slate-100 relative group overflow-hidden">
                <div className="absolute inset-0 bg-purple-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <CalendarDays className="w-8 h-8 stroke-[1.5] relative z-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-3">Agendamento Fácil 24/7</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                Aceda à disponibilidade real dos melhores profissionais e reserve instantaneamente a qualquer momento, de qualquer lugar.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-[20px] bg-white text-purple-600 flex items-center justify-center mb-6 shadow-sm border border-slate-100 relative group overflow-hidden">
                <div className="absolute inset-0 bg-purple-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <Star className="w-8 h-8 stroke-[1.5] relative z-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-3">Opiniões Reais</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                Tome decisões confiantes baseadas em avaliações autênticas de clientes reais que visitaram os espaços.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-[20px] bg-white text-purple-600 flex items-center justify-center mb-6 shadow-sm border border-slate-100 relative group overflow-hidden">
                <div className="absolute inset-0 bg-purple-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <ShieldCheck className="w-8 h-8 stroke-[1.5] relative z-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-3">Garantia de Qualidade</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                Uma seleção rigorosa e curada dos parceiros mais exclusivos para garantir uma experiência de excelência.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Partner Portal CTA */}
      <section className="py-20 bg-white border-t border-slate-200 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-purple-50/50 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-6 tracking-tight">
              Impulsione o seu negócio de beleza
            </h2>
            <p className="text-slate-500 text-base sm:text-lg mb-10 leading-relaxed">
              Junte-se a centenas de parceiros Glamzo e descubra a melhor plataforma para gerir reservas, aumentar clientes e simplificar pagamentos.
            </p>
            <Link
              to="/partner"
              className="inline-flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-xl shadow-slate-900/20 text-sm tracking-wider cursor-pointer hover:-translate-y-1 active:translate-y-0"
            >
              <span>Registar meu espaço grátis</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
