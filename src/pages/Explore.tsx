import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Business, Review } from "../types";
import { fetchAllReviews } from "../utils/reviewsHelper";
import { calculateDistanceInKm, getCoordinatesForCity } from "../utils/geoData";
import { MAIN_CATEGORIES, SUBCATEGORIES_BY_MAIN } from "../utils/categoriesData";
import { useAuth } from "../hooks/useAuth";
import { toggleFavorite, fetchCustomerFavorites } from "../utils/marketingHelper";
import {
  Search, MapPin, Grid, Compass, Star, SlidersHorizontal, Sliders, CheckCircle2,
  Loader2, X, Navigation, List, Map as MapIcon, Heart
} from "lucide-react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

const getCategoryDisplayName = (name: string) => {
  if (name === "Wellness") return "Wellness & Spa";
  if (name === "Ao domicílio") return "Ao Domicílio";
  return name;
};

// Marcador Oficial Glamzo no Mapa
const getCustomMarkerIcon = (rating: number) => {
  const finalRating = rating > 0 ? rating : 5.0;
  const ratingText = `${finalRating.toFixed(1)} ★`;
  const bgColor = "#9333ea"; 
  const textColor = "#ffffff"; 

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="42" viewBox="0 0 56 42">
      <g filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.3))">
        <path d="M 8 2 L 48 2 C 51.3 2 54 4.7 54 8 L 54 22 C 54 25.3 51.3 28 48 28 L 34 28 L 28 38 L 22 28 L 8 28 C 4.7 28 2 25.3 2 22 L 2 8 C 2 4.7 4.7 2 8 2 Z" fill="${bgColor}" stroke="#ffffff" stroke-width="1.5" />
        <text x="28" y="19" fill="${textColor}" font-size="12px" font-family="Outfit, system-ui, sans-serif" font-weight="900" text-anchor="middle">
          ${ratingText}
        </text>
      </g>
    </svg>
  `;
  return `data:image/svg+xml;utf-8,${encodeURIComponent(svg.trim())}`;
};

const mapStyles = [
  { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] }
];

export default function Explore() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"list" | "map">(searchParams.get("view") === "map" ? "map" : "list");
  
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

      if (loadedBiz.length === 0 || bizRes.error) {
        const { FALLBACK_BUSINESSES, FALLBACK_SERVICES, FALLBACK_REVIEWS, FALLBACK_HOURS } = await import("../utils/fallbackData");
        loadedBiz = FALLBACK_BUSINESSES;
        loadedServices = FALLBACK_SERVICES;
        loadedReviews = FALLBACK_REVIEWS;
        loadedHours = FALLBACK_HOURS;
      }

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
      setErrorMsg("Falha ao descarregar base de dados. Tente novamente.");
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
    if (viewMode === "map") params.view = "map";
    setSearchParams(params, { replace: true });
  }, [searchQuery, searchLocation, selectedCategory, selectedSubcategory, useNearMe, viewMode]);

  const handleNearMeToggle = () => {
    if (useNearMe) {
      setUseNearMe(false);
      setUserCoords(null);
      return;
    }
    setGeoLocating(true);
    setSearchLocation(""); 
    setLocalSearchLocation("");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          setUseNearMe(true);
          setGeoLocating(false);
        },
        (err) => {
          setUseNearMe(false);
          setUserCoords(null);
          setGeoLocating(false);
          alert("Não foi possível aceder ao GPS. Por favor digite a sua região na barra de pesquisa.");
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setGeoLocating(false);
    }
  };

  const handleClearFilters = () => {
    setLocalSearchQuery(""); setSearchQuery("");
    setLocalSearchLocation(""); setSearchLocation("");
    setSelectedCategory("All"); setSelectedSubcategory("All");
    setUseNearMe(false); setUserCoords(null);
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

    if (bServices.length > 0) {
      const prices = bServices.map((s: any) => {
        const hasDiscount = (s.discount_price != null && s.discount_price > 0 && s.discount_price < s.price) || (s.price_promotion != null && s.price_promotion > 0);
        if (hasDiscount) hasRealPromotion = true;
        return s.discount_price || s.price_promotion || s.price;
      }).filter((p: number) => p != null && !isNaN(p));
      if (prices.length > 0) realStartPrice = Math.min(...prices);
    }

    const storedHoursList = (window as any).__exploreBusinessHours || [];
    const bizHours = storedHoursList.filter((h: any) => h.business_id === b.id);
    const currentDayIndex = new Date().getDay();
    const todayHour = bizHours.find((h: any) => h.weekday === currentDayIndex);

    let isOpenNow = false;
    if (todayHour && !todayHour.is_closed) {
      const now = new Date();
      const currentTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      isOpenNow = currentTimeStr >= todayHour.open_time && currentTimeStr <= todayHour.close_time;
    }

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

    if (selectedCategory !== "All") {
      if (b.category !== selectedCategory && !(Array.isArray(b.categories) && b.categories.includes(selectedCategory))) return false;
    }

    if (selectedSubcategory !== "All") {
      const subLower = selectedSubcategory.toLowerCase();
      if (!(b.description || "").toLowerCase().includes(subLower) && !b.category.toLowerCase().includes(subLower)) return false;
    }

    if (minRating > 0 && b.rating < minRating) return false;
    
    if (priceLevel !== "All") {
      if (priceLevel === "Low" && b.startPrice >= 25) return false;
      if (priceLevel === "Medium" && (b.startPrice < 25 || b.startPrice > 45)) return false;
      if (priceLevel === "High" && b.startPrice <= 45) return false;
    }

    if (filterHomeService) {
      const isDomicil = b.category === "Ao domicílio" || (b.description || "").toLowerCase().includes("domicílio");
      if (!isDomicil) return false;
    }

    if (filterPremiumPartner && !b.is_verified) return false;
    if (filterAvailableToday && !b.isOpenNow) return false;

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

  const paginatedBusinesses = sortedBusinesses.slice(0, viewMode === "map" ? 50 : itemsLimit);
  const mapApiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || "";

  const BusinessCard: React.FC<{ b: any }> = ({ b }) => (
    <Link to={`/business/${b.slug}`} className="group flex flex-col w-full cursor-pointer font-['Inter']">
      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden mb-3 bg-slate-100">
        <img 
          src={b.cover_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600"} 
          alt={b.name} loading="lazy" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {b.is_promoted && (
            <span className="bg-white text-[#0f172a] text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg">Destaque</span>
          )}
        </div>
        <button onClick={(e) => { e.preventDefault(); handleToggleFavorite(b.id); }} className="absolute top-3 right-3 p-1.5 rounded-full text-white hover:scale-110 transition-transform drop-shadow-md z-10">
          <Heart className={`w-6 h-6 stroke-[1.5] transition-colors ${userFavorites.includes(b.id) ? "fill-rose-500 stroke-rose-500" : "fill-black/20 stroke-white"}`} />
        </button>
      </div>
      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="font-bold text-[#0f172a] text-base line-clamp-1 font-['Outfit']">{b.name}</h3>
          <p className="text-sm text-slate-500 mt-0.5 truncate">{b.category} · {b.city} {b.distance && `(${b.distance.toFixed(1)}km)`}</p>
        </div>
        <div className="flex items-center gap-1 text-sm font-semibold text-[#0f172a] shrink-0">
          <Star className="w-3.5 h-3.5 fill-slate-900" />
          {b.rating > 0 ? b.rating.toFixed(1) : "Novo"}
        </div>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-semibold text-[#0f172a]">{b.startPrice > 0 ? `${b.startPrice}€` : 'Grátis'}</span>
        <span className="text-sm text-slate-500">preço base</span>
      </div>
    </Link>
  );

  return (
    <div id="explore-view" className="min-h-screen bg-[#FDFDFD] py-10 flex flex-col selection:bg-purple-100 selection:text-purple-900 pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-100 rounded-full text-[10px] font-bold text-purple-600 uppercase mb-3 tracking-wider">
              <Compass className="w-3.5 h-3.5 text-purple-500" />
              <span>Descoberta Inteligente Glamzo</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-[#0f172a] tracking-tight leading-none font-['Outfit']">
              Explore {selectedCategory !== "All" ? selectedCategory : "os Melhores Espaços"}
            </h1>
          </div>

          <div className="flex items-center gap-3 font-['Inter']">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button onClick={() => setViewMode("list")} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === "list" ? "bg-white text-purple-700 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>
                <List className="w-4 h-4" /> Lista
              </button>
              <button onClick={() => setViewMode("map")} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === "map" ? "bg-white text-purple-700 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>
                <MapIcon className="w-4 h-4" /> Mapa
              </button>
            </div>
          </div>
        </div>

        {/* Categorias Horizontais */}
        <div className="mb-8 overflow-x-auto pb-3 flex items-center gap-3 no-scrollbar scroll-smooth font-['Inter']">
          <button onClick={() => { setSelectedCategory("All"); setSelectedSubcategory("All"); }} className={`px-5 py-2.5 rounded-full text-xs font-bold shrink-0 transition-all border flex items-center gap-1.5 ${selectedCategory === "All" ? "bg-purple-600 text-white border-purple-600 shadow-sm" : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200 shadow-sm"}`}>
            <Grid className="w-3.5 h-3.5" /> Ver Tudo
          </button>
          {MAIN_CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => { setSelectedCategory(cat.name); setSelectedSubcategory("All"); }} className={`px-5 py-2.5 rounded-full text-xs font-bold shrink-0 transition-all border flex items-center gap-1.5 ${selectedCategory === cat.name ? "bg-purple-600 text-white border-purple-600 shadow-sm" : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200 shadow-sm"}`}>
              <span>{cat.emoji}</span> <span>{getCategoryDisplayName(cat.name)}</span>
            </button>
          ))}
        </div>

        {selectedCategory !== "All" && SUBCATEGORIES_BY_MAIN[selectedCategory] && (
          <div className="mb-8 p-4 bg-white border border-slate-200/60 rounded-2xl shadow-sm font-['Inter']">
            <span className="block text-[10px] font-bold uppercase text-purple-600 tracking-wider mb-2.5">Subcategorias de {getCategoryDisplayName(selectedCategory)}</span>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSelectedSubcategory("All")} className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedSubcategory === "All" ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-slate-50 text-slate-600 border border-slate-200"}`}>Todas</button>
              {SUBCATEGORIES_BY_MAIN[selectedCategory].map((sub) => (
                <button key={sub} onClick={() => setSelectedSubcategory(sub)} className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedSubcategory === sub ? "bg-purple-600 text-white border-purple-600" : "bg-slate-50 text-slate-600 border border-slate-200"}`}>{sub}</button>
              ))}
            </div>
          </div>
        )}

        {/* Corpo Principal (Filtros Laterais + Resultados) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filtros (Desktop) */}
          <div className="hidden lg:block bg-white p-6 border border-slate-200 rounded-3xl space-y-7 self-start shadow-sm font-['Inter']">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-600" /> Filtros
              </span>
              <button onClick={handleClearFilters} className="text-[10px] font-extrabold text-purple-600 hover:text-purple-700 uppercase tracking-wider">Limpar</button>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-wider mb-2 pl-0.5">Serviço ou Nome</label>
              <div className="relative">
                <input type="text" value={localSearchQuery} onChange={(e) => setLocalSearchQuery(e.target.value)} placeholder="Ex: Manicure, Barbearia..." className="block w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-wider mb-2 pl-0.5">Localização Livre</label>
              <div className="relative mb-2">
                <input type="text" value={localSearchLocation} onChange={(e) => { setLocalSearchLocation(e.target.value); setUseNearMe(false); setUserCoords(null); }} placeholder="Cidade, Concelho, Morada..." className="block w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <button type="button" onClick={handleNearMeToggle} className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-xl border transition-all ${useNearMe ? "bg-purple-600 text-white border-purple-600" : "bg-white text-blue-600 border-slate-200 hover:bg-slate-50"}`}>
                <Navigation className="w-4 h-4" /> {geoLocating ? "A localizar..." : "Usar o meu GPS"}
              </button>
              {useNearMe && (
                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  {[1, 5, 10, 20, 50, 100].map(r => (
                    <button key={r} onClick={() => setNearMeRadius(r)} className={`py-1.5 text-[10px] font-bold rounded-lg border ${nearMeRadius === r ? "bg-purple-100 text-purple-700 border-purple-300" : "bg-slate-50 text-slate-600 border-slate-200"}`}>{r} km</button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-wider mb-2 pl-0.5">Preço Inicial</label>
              <div className="flex gap-1.5">
                {[{ key: "All", label: "Todos" }, { key: "Low", label: "< 25€" }, { key: "Medium", label: "25-45€" }, { key: "High", label: "> 45€" }].map((p) => (
                  <button key={p.key} onClick={() => setPriceLevel(p.key)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border text-center ${priceLevel === p.key ? "bg-purple-600 text-white border-purple-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"}`}>{p.label}</button>
                ))}
              </div>
            </div>

            <div className="space-y-3.5 pt-2">
              <span className="block text-[9px] font-bold text-slate-600 uppercase tracking-wider pl-0.5">Preferências</span>
              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                <input type="checkbox" checked={filterHomeService} onChange={(e) => setFilterHomeService(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500" /> Ao domicílio
              </label>
              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                <input type="checkbox" checked={filterPremiumPartner} onChange={(e) => setFilterPremiumPartner(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500" /> Premium Partner
              </label>
              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                <input type="checkbox" checked={filterAvailableToday} onChange={(e) => setFilterAvailableToday(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500" /> Aberto Hoje
              </label>
            </div>
          </div>

          {/* Área de Resultados */}
          <div className="lg:col-span-3 space-y-6">
            
            <div className="lg:hidden flex gap-2">
              <button onClick={() => setIsDrawerOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl py-3.5 px-4 text-xs font-bold shadow-md uppercase tracking-wider">
                <SlidersHorizontal className="w-4 h-4" /> Filtrar ({sortedBusinesses.length})
              </button>
            </div>

            {loading ? (
              <div className="min-h-[45vh] flex flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-slate-100 p-8">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
              </div>
            ) : viewMode === "map" ? (
              <div className="w-full h-[70vh] rounded-3xl overflow-hidden border border-slate-200 shadow-md relative">
                {mapApiKey ? (
                  <APIProvider apiKey={mapApiKey}>
                    <Map defaultCenter={userCoords ? { lat: userCoords.latitude, lng: userCoords.longitude } : { lat: 39.3999, lng: -8.2245 }} defaultZoom={userCoords ? 11 : 6} disableDefaultUI styles={mapStyles} options={{ styles: mapStyles }}>
                      {userCoords && <Marker position={{ lat: userCoords.latitude, lng: userCoords.longitude }} icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png" />}
                      {paginatedBusinesses.map((b) => (
                        <Marker key={b.id} position={{ lat: b.lat, lng: b.lng }} icon={{ url: getCustomMarkerIcon(b.rating), anchor: { x: 29, y: 32 } }} onClick={() => navigate(`/business/${b.slug}`)} />
                      ))}
                    </Map>
                  </APIProvider>
                ) : (
                  <div className="flex items-center justify-center h-full bg-slate-100 text-slate-500">API Key do Google Maps necessária.</div>
                )}
              </div>
            ) : paginatedBusinesses.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedBusinesses.map((b) => <BusinessCard key={b.id} b={b} />)}
                </div>
                {sortedBusinesses.length > itemsLimit && (
                  <div className="text-center pt-10">
                    <button onClick={() => setItemsLimit(itemsLimit + 12)} className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-colors">
                      Carregar mais resultados
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white p-16 sm:p-24 border border-slate-200 rounded-3xl text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-['Outfit']">Nenhum espaço encontrado</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-sm">Tente procurar noutra localização livre (ex: Pedroso, Funchal) ou ajustar os filtros.</p>
                <button onClick={handleClearFilters} className="mt-6 px-6 py-3 border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50">Limpar Filtros</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gaveta Mobile para Filtros */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setIsDrawerOpen(false)} />
          <div className="w-full max-w-sm bg-white h-full shadow-2xl relative flex flex-col animate-slide-in-right overflow-hidden font-['Inter']">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 font-['Outfit']">Filtros Avançados</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6 max-h-[calc(100vh-140px)] custom-scrollbar">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Serviço ou Nome</label>
                <input type="text" value={localSearchQuery} onChange={(e) => setLocalSearchQuery(e.target.value)} placeholder="O que procura?" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Localização Livre</label>
                <input type="text" value={localSearchLocation} onChange={(e) => setLocalSearchLocation(e.target.value)} placeholder="Ex: Pedroso, Gaia, Funchal..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm mb-3" />
                <button type="button" onClick={handleNearMeToggle} className={`w-full py-3 rounded-xl text-sm font-bold flex justify-center gap-2 ${useNearMe ? "bg-purple-600 text-white" : "bg-blue-50 text-blue-600"}`}>
                  <Navigation className="w-4 h-4" /> Ativar GPS do Telemóvel
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Preço Inicial</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ key: "All", label: "Todos" }, { key: "Low", label: "< 25€" }, { key: "Medium", label: "25-45€" }, { key: "High", label: "> 45€" }].map((p) => (
                    <button key={p.key} onClick={() => setPriceLevel(p.key)} className={`py-2 text-xs font-semibold rounded-lg border ${priceLevel === p.key ? "bg-purple-600 text-white border-purple-600" : "bg-white text-slate-650"}`}>{p.label}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex gap-3 bg-white sticky bottom-0">
              <button onClick={handleClearFilters} className="w-1/3 py-3.5 border border-slate-200 rounded-xl font-bold text-sm">Limpar</button>
              <button onClick={() => setIsDrawerOpen(false)} className="w-2/3 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm">Aplicar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
