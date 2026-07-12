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
// Removed obsolete local calculations

const getCategoryDisplayName = (name: string) => {
  if (name === "Wellness") return "Wellness & Spa";
  if (name === "Ao domicílio") return "Ao Domicílio";
  return name;
};

// Marcador Oficial Glamzo no Mapa
const getCustomMarkerIcon = (rating: number, isHovered: boolean = false) => {
  const finalRating = rating > 0 ? rating : 5.0;
  const ratingText = `${finalRating.toFixed(1)}`;
  const bgColor = isHovered ? "#0f172a" : "#9333ea"; 
  const textColor = "#ffffff";
  const scale = isHovered ? 1.15 : 1;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${40 * scale}" height="${50 * scale}" viewBox="0 0 40 50">
      <g filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.4))">
        <path d="M20 0C8.954 0 0 8.954 0 20c0 15 20 30 20 30s20-15 20-30C40 8.954 31.046 0 20 0z" fill="${bgColor}" stroke="#ffffff" stroke-width="2"/>
        <text x="20" y="21" fill="${textColor}" font-size="12px" font-family="Outfit, system-ui, sans-serif" font-weight="900" text-anchor="middle">
          ${ratingText}
        </text>
        <text x="20" y="28" fill="${textColor}" font-size="7px" font-family="Outfit, system-ui, sans-serif" font-weight="bold" text-anchor="middle">
          ★
        </text>
      </g>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`;
};

const mapStyles = [
  { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] }
];


function calculateImmediateSlots(shopId: string, hoursData: any[], bookingsData: any[]) {
  if (!hoursData) return [];
  const shopHours = hoursData.find((h: any) => h.business_id === shopId);
  if (!shopHours || shopHours.is_closed) return [];

  const now = new Date();
  
  const [openHourStr, openMinuteStr] = (shopHours.open_time || "09:00").split(':');
  const openHour = parseInt(openHourStr, 10);
  const openMinute = parseInt(openMinuteStr, 10);
  const openTotalMins = openHour * 60 + openMinute;

  let currentHour = now.getHours();
  let currentMinute = now.getMinutes();
  let startMinuteRounded = currentMinute < 30 ? 30 : 0;
  let startHourRounded = currentHour;
  if (startMinuteRounded === 0) startHourRounded += 1;
  
  let startTotalMins = startHourRounded * 60 + startMinuteRounded;
  
  if (startTotalMins < openTotalMins) {
    startTotalMins = openTotalMins;
  }

  const [closeHourStr, closeMinuteStr] = (shopHours.close_time || "19:00").split(':');
  const closeTotalMins = parseInt(closeHourStr, 10) * 60 + parseInt(closeMinuteStr, 10);

  const shopBookings = bookingsData.filter((b: any) => b.business_id === shopId);

  const slots = [];
  let currentSlotMins = startTotalMins;

  while (currentSlotMins + 30 <= closeTotalMins) {
    const sHour = Math.floor(currentSlotMins / 60);
    const sMin = currentSlotMins % 60;
    const timeStr = `${sHour.toString().padStart(2, '0')}:${sMin.toString().padStart(2, '0')}`;
    
    const slotStartMins = currentSlotMins;
    const slotEndMins = currentSlotMins + 30;

    let isAvailable = true;
    for (const b of shopBookings) {
      if (!b.start_time || !b.end_time) continue;
      const [bStartH, bStartM] = b.start_time.split(':');
      const bStartMins = parseInt(bStartH, 10) * 60 + parseInt(bStartM, 10);
      const [bEndH, bEndM] = b.end_time.split(':');
      const bEndMins = parseInt(bEndH, 10) * 60 + parseInt(bEndM, 10);

      if (slotStartMins < bEndMins && slotEndMins > bStartMins) {
        isAvailable = false;
        break;
      }
    }

    if (isAvailable) {
      slots.push(timeStr);
    }

    currentSlotMins += 30;
  }

  return slots.slice(0, 3);
}

export default function Explore() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewModeMobile, setViewModeMobile] = useState<"list" | "map">("list");
  const [viewLayout, setViewLayout] = useState<"list" | "grid">("list");
  const [searchRadius, setSearchRadius] = useState<number | null>(null);
  
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [promotions, setPromotions] = useState<Record<string, { is_promoted: boolean }>>({});
  

  const [hoveredShopId, setHoveredShopId] = useState<string | null>(null);
  const [clickedPinId, setClickedPinId] = useState<string | null>(null);
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
  const [mapZoom, setMapZoom] = useState<number>(6);
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number} | null>(null);
  const [useNearMe, setUseNearMe] = useState(searchParams.get("nearMe") === "true");
  const [mapBounds, setMapBounds] = useState<any>(null);
  const [sortBy, setSortBy] = useState<string>("recomendados"); // recomendados, distancia, preco_asc, rating
  const [abertoAgora, setAbertoAgora] = useState(false);
  const [minimo4Estrelas, setMinimo4Estrelas] = useState(false);
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
      const [bizRes, analyticsRes, servRes, realRev, hoursRes, bookingsRes] = await Promise.all([
        supabase.from("businesses").select("*").eq("status", "active"),
        supabase.rpc("get_explore_shops_with_analytics"),
        supabase.from("services").select("*").eq("is_active", true),
        fetchAllReviews(),
        supabase.from('business_hours').select('*'),
        supabase.from('bookings').select('business_id, start_time, end_time, booking_date').gte('booking_date', new Date().toISOString().split('T')[0])
      ]);
      
      let baseBiz = (bizRes.data || []).filter(b => b.public_page_enabled !== false);
      let analyticsData = analyticsRes.data || [];
      
      let loadedBiz = baseBiz.map(b => {
        const stats = analyticsData.find((a: any) => a.shop_id === b.id) || {};
        return {
           ...b,
           is_new: stats.is_new || false,
           is_popular: stats.is_popular || false,
           is_top_rated: stats.is_top_rated || false,
           available_slots: calculateImmediateSlots(b.id, hoursRes.data || [], bookingsRes.data || [])
        };
      });
      let loadedServices = servRes.data || [];
      let loadedReviews = realRev || [];
      
      
      setBusinesses(loadedBiz);
      setServices(loadedServices);
      setReviews(loadedReviews || []);
      
      
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

  useEffect(() => {
    if (searchRadius === null && businesses.length > 0) {
      const lats = businesses.map(b => b.latitude ?? getCoordinatesForCity(b.district, b.city).latitude).filter(l => l !== undefined && l !== null);
      const lngs = businesses.map(b => b.longitude ?? getCoordinatesForCity(b.district, b.city).longitude).filter(l => l !== undefined && l !== null);
      if (lats.length > 0 && lngs.length > 0) {
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;
        
        const maxDiff = Math.max(maxLat - minLat, maxLng - minLng);
        let zoom = 6;
        if (maxDiff < 0.05) zoom = 13;
        else if (maxDiff < 0.1) zoom = 12;
        else if (maxDiff < 0.5) zoom = 11;
        else if (maxDiff < 1) zoom = 9;
        else if (maxDiff < 2) zoom = 8;
        else if (maxDiff < 5) zoom = 7;
        
        setMapCenter({ lat: centerLat, lng: centerLng });
        setMapZoom(zoom);
      } else if (userCoords) {
        setMapCenter({ lat: userCoords.latitude, lng: userCoords.longitude });
        setMapZoom(6);
      }
    } else if (searchRadius !== null && userCoords) {
      setMapCenter({ lat: userCoords.latitude, lng: userCoords.longitude });
      if (searchRadius <= 5) setMapZoom(12);
      else if (searchRadius <= 10) setMapZoom(11);
      else if (searchRadius <= 25) setMapZoom(10);
      else if (searchRadius <= 50) setMapZoom(9);
    }
  }, [searchRadius, userCoords, businesses]);

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
    setSelectedCategory("All");
    setSortBy("recomendados");
    setAbertoAgora(false);
    setMinimo4Estrelas(false);
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
    const is_top_rated = rating >= 4.7 && reviewsCount > 0;
    const is_new = b.created_at ? (new Date().getTime() - new Date(b.created_at).getTime()) / (1000 * 3600 * 24) < 30 : false;
    return { ...b, lat, lng, distance, rating, reviewsCount, startPrice: realStartPrice, isOpenNow, is_promoted: hasRealPromotion, is_premium: isPremiumVal, is_top_rated, is_new };
  });

    const filteredBusinesses = processedBusinesses.filter((b) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (b.name || "").toLowerCase().includes(q);
      const matchCat = (b.category || "").toLowerCase().includes(q);
      const matchServices = services.some(s => {
        if (!s || s.business_id !== b.id) return false;
        const sName = s.name || "";
        return sName.toLowerCase().includes(q);
      });
      if (!matchName && !matchCat && !matchServices) return false;
    }
    if (searchRadius !== null && b.distance !== null && b.distance > searchRadius) {
      return false;
    }
    if (searchLocation.trim() && !useNearMe) {
      const locQ = searchLocation.toLowerCase().trim();
      const matchCity = (b.city || "").toLowerCase().includes(locQ);
      const matchDist = (b.district || "").toLowerCase().includes(locQ);
      const matchAddress = (b.address || "").toLowerCase().includes(locQ);
      if (!matchCity && !matchDist && !matchAddress) return false;
    }
    
    // Bounds filtering
    if (searchRadius !== null) {
      if (mapBounds) {
        const lat = b.lat;
        const lng = b.lng;
        if (lat < mapBounds.south || lat > mapBounds.north || lng < mapBounds.west || lng > mapBounds.east) {
          return false;
        }
      } else if (useNearMe && userCoords && b.distance !== null) {
        // fallback to radius if no map bounds
        if (b.distance > 50) return false; // expanded default to 50km
      }
    }

    if (selectedCategory !== "All" && b.category !== selectedCategory) return false;
    if (abertoAgora && !b.isOpenNow) return false;
    if (minimo4Estrelas && b.rating < 4) return false;

    return true;
  });

  const sortedBusinesses = [...filteredBusinesses].sort((x, y) => {
    if (sortBy === 'distancia' && x.distance !== null && y.distance !== null) return x.distance - y.distance;
    if (sortBy === 'preco_asc') return x.startPrice - y.startPrice;
    if (sortBy === 'rating') return y.rating - x.rating;
    
    // Recomendados
    if (x.is_promoted && !y.is_promoted) return -1;
    if (!x.is_promoted && y.is_promoted) return 1;
    if (x.distance !== null && y.distance !== null && useNearMe) return x.distance - y.distance;
    if (x.is_verified && !y.is_verified) return -1;
    if (!x.is_verified && y.is_verified) return 1;
    return y.rating - x.rating;
  });

  const paginatedBusinesses = sortedBusinesses.slice(0, itemsLimit);
  const mapApiKey = (import.meta as any).env.VITE_GOOGLE_MAPS_PLATFORM_KEY || "";

  
  const renderBusinessCard = (b: any, viewMode: 'list' | 'grid' = 'list') => {
    const isHighlighted = clickedPinId === b.id || hoveredShopId === b.id;
    
    // Social Proof Badge Logic (Mock)
    let badge = null;
    if (b.is_top_rated) {
      badge = <span className="bg-[#0f172a] text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400"/> Top Rated</span>;
    } else if (b.is_popular) {
      badge = <span className="bg-rose-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1">🔥 Muito Procurado</span>;
    } else if (b.is_new) {
      badge = <span className="bg-emerald-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Nova Loja</span>;
    }
    
    const isGrid = viewMode === 'grid';
    // Use slots directly from the RPC response
    const availableSlots = Array.isArray(b.available_slots) ? b.available_slots : [];

    return (
      <Link key={b.id}
         to={`/business/${b.slug}`}
         id={`shop-card-${b.id}`}
        onMouseEnter={() => setHoveredShopId(b.id)}
        onMouseLeave={() => setHoveredShopId(null)}
        className={`group flex ${viewMode === 'list' ? 'flex-col sm:flex-row' : 'flex-col'} w-full cursor-pointer bg-white rounded-2xl overflow-hidden transition-all font-['Inter'] ${isHighlighted ? 'ring-2 ring-purple-600 shadow-xl scale-[1.02] z-10' : 'border border-slate-100 shadow-sm hover:shadow-md'}`}
      >
        <div className={`relative ${viewMode === 'list' ? 'w-full sm:w-2/5 aspect-[16/10] sm:aspect-[4/3]' : 'w-full aspect-[16/10]'} bg-slate-100 shrink-0`}>
          <img loading="lazy" 
            src={b.cover_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600"} 
            alt={b.name}  
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            {b.is_promoted && (
              <span className="bg-white text-[#0f172a] text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg">Destaque</span>
            )}
            {badge}
          </div>
          <button onClick={(e) => { e.preventDefault(); handleToggleFavorite(b.id); }} aria-label={userFavorites.includes(b.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"} className="absolute top-3 right-3 p-1.5 rounded-full text-white hover:scale-110 transition-transform drop-shadow-md z-10">
            <Heart className={`w-6 h-6 stroke-[1.5] transition-colors ${userFavorites.includes(b.id) ? "fill-rose-500 stroke-rose-500" : "fill-black/20 stroke-white"}`} />
          </button>
        </div>
        <div className={`p-4 flex flex-col gap-1.5 flex-1 ${viewMode === 'grid' ? 'justify-between' : 'justify-center'}`}>
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-[#0f172a] text-base line-clamp-1 font-['Outfit']">{b.name}</h3>
            <div className="flex items-center gap-1 text-sm font-semibold text-[#0f172a] shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{b.rating > 0 ? b.rating.toFixed(1) : "Novo"}</span>
            </div>
          </div>
          <p className="text-xs font-medium text-purple-600 truncate">{b.category}</p>
          <p className="text-xs text-slate-500 truncate">{b.city} {b.distance && `(${b.distance.toFixed(1)}km)`}</p>
          {viewMode === 'list' && b.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{b.description}</p>
          )}
          
          {/* Instant Booking Slots */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
             {loading ? (
                <div className="flex gap-2 w-full animate-pulse">
                  <div className="h-7 bg-slate-200 rounded-lg w-14"></div>
                  <div className="h-7 bg-slate-200 rounded-lg w-14"></div>
                  <div className="h-7 bg-slate-200 rounded-lg w-14"></div>
                </div>
             ) : availableSlots.length > 0 ? (
                availableSlots.slice(0, 4).map((slot: any, idx: number) => {
                  const slotTime = typeof slot === 'string' ? slot : slot.time;
                  // If the RPC doesn't return dates, we can omit it or use today's date placeholder
                  const slotDate = typeof slot === 'string' ? new Date().toISOString().split('T')[0] : slot.date;
                  return (
                    <button key={idx} onClick={(e) => { e.preventDefault(); navigate(`/business/${b.slug}?date=${slotDate}&time=${slotTime}`); }} className="shrink-0 px-3 py-1.5 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-200 rounded-lg text-[11px] font-bold transition-colors">
                      {slotTime}
                    </button>
                  );
                })
             ) : (
                <span className="text-[11px] text-slate-500 font-medium py-1.5">Sem vagas próximas</span>
             )}
          </div>
        </div>
      </Link>
    );
  };


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Barra de Filtros Topo */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 overflow-x-auto custom-scrollbar pb-1">
            <button onClick={() => setSelectedCategory("All")} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${selectedCategory === "All" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Todos</button>
            {MAIN_CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${selectedCategory === cat.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{getCategoryDisplayName(cat.name)}</button>
            ))}
          </div>
          <div className="ml-4 pl-4 border-l border-slate-200 hidden md:flex items-center gap-3">
             <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" value={localSearchQuery} onChange={(e) => setLocalSearchQuery(e.target.value)} placeholder="Pesquisar loja..." className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-purple-500" />
             </div>
             <div className="hidden lg:flex items-center gap-2">
      <select value={searchRadius !== null ? searchRadius.toString() : ""} onChange={(e) => setSearchRadius(e.target.value ? Number(e.target.value) : null)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-purple-500">
        <option value="">Raio: Todos</option>
        <option value="5">Até 5 km</option>
        <option value="10">Até 10 km</option>
        <option value="25">Até 25 km</option>
        <option value="50">Até 50 km</option>
      </select>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-purple-500">
        <option value="recomendados">Recomendados</option>
        <option value="distancia">Distância: Mais Próximo</option>
        <option value="preco_asc">Preço: Mais barato primeiro</option>
        <option value="rating">Melhor Avaliação</option>
      </select>
      <button onClick={() => setAbertoAgora(!abertoAgora)} className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${abertoAgora ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
        Aberto Agora
      </button>
      <button onClick={() => setMinimo4Estrelas(!minimo4Estrelas)} className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${minimo4Estrelas ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
        Apenas 4+ ⭐
      </button>
   </div>
   <button onClick={() => setIsDrawerOpen(true)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors lg:ml-2">
     <SlidersHorizontal className="w-4 h-4" /> Filtros
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
        <div className={`w-full lg:w-[55%] xl:w-[50%] flex-col h-[calc(100vh-65px)] overflow-y-auto custom-scrollbar bg-slate-50 p-4 lg:p-6 ${viewModeMobile === 'map' ? 'hidden lg:flex' : 'flex'}`}>
           <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-black text-slate-900 font-['Outfit']">Explorar ({sortedBusinesses.length})</h2>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                  <button onClick={() => setViewLayout('list')} className={`p-1.5 rounded-md transition-colors ${viewLayout === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                    <List className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewLayout('grid')} className={`p-1.5 rounded-md transition-colors ${viewLayout === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                    <Grid className="w-4 h-4" />
                  </button>
                </div>
              </div>
           </div>
           
           {loading ? (
              <div className="flex flex-col items-center justify-center flex-1 py-20">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
                <p className="text-sm font-medium text-slate-500">A carregar lojas...</p>
              </div>
            ) : sortedBusinesses.length > 0 ? (
              <>
                <div className={viewLayout === 'list' ? "flex flex-col gap-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"}>
                  {paginatedBusinesses.map((b) => renderBusinessCard(b, viewLayout))}
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
        <div className={`w-full lg:w-[45%] xl:w-[50%] lg:h-[calc(100vh-65px)] lg:sticky lg:top-[65px] bg-slate-200 ${viewModeMobile === 'list' ? 'hidden lg:block' : 'block h-[calc(100vh-65px)]'}`}>
           {mapApiKey ? (
             <APIProvider apiKey={mapApiKey}>
               <Map 
     center={mapCenter || (userCoords ? { lat: userCoords.latitude, lng: userCoords.longitude } : { lat: 39.3999, lng: -8.2245 })} 
     zoom={mapZoom} 
     disableDefaultUI 
     styles={mapStyles} 
     options={{ styles: mapStyles }}
     onCameraChanged={(e) => {
        setMapCenter(e.detail.center);
        setMapZoom(e.detail.zoom);
     }}
     onBoundsChanged={(e) => {
       if (e.detail.bounds) {
         setMapBounds(e.detail.bounds);
       }
     }}
  >
                 {userCoords && <Marker position={{ lat: userCoords.latitude, lng: userCoords.longitude }} icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png" />}
                 {sortedBusinesses.slice(0, 50).map((b) => (
                   <Marker 
     key={b.id} 
     position={{ lat: b.lat, lng: b.lng }} 
     icon={{ url: getCustomMarkerIcon(b.rating, hoveredShopId === b.id || clickedPinId === b.id), anchor: { x: 20, y: 50 } }} 
     onClick={() => {
       setClickedPinId(b.id);
       // We can still navigate, but we'll let them click the pin to focus list instead if they prefer. Let's just scroll to list.
       const cardEl = document.getElementById(`shop-card-${b.id}`);
       if (cardEl) {
         cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
       }
     }}
     onMouseOver={() => setHoveredShopId(b.id)}
     onMouseOut={() => setHoveredShopId(null)}
  />
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
                 <button onClick={handleNearMeToggle} className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors ${useNearMe ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                    <Navigation className="w-4 h-4" /> Usar a minha localização
                 </button>
               </div>
               <div>
      <label className="block text-xs font-bold text-slate-700 mb-2">Raio de Pesquisa</label>
      <select value={searchRadius !== null ? searchRadius.toString() : ""} onChange={(e) => setSearchRadius(e.target.value ? Number(e.target.value) : null)} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-purple-500 mb-4">
        <option value="">Todos</option>
        <option value="5">Até 5 km</option>
        <option value="10">Até 10 km</option>
        <option value="25">Até 25 km</option>
        <option value="50">Até 50 km</option>
      </select>
      <label className="block text-xs font-bold text-slate-700 mb-2">Ordenação</label>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-purple-500 mb-4">
        <option value="recomendados">Recomendados</option>
        <option value="distancia">Distância: Mais Próximo</option>
        <option value="preco_asc">Preço: Mais barato primeiro</option>
        <option value="rating">Melhor Avaliação</option>
      </select>
      <label className="block text-xs font-bold text-slate-700 mb-2">Filtros Rápidos</label>
      <div className="flex gap-2">
        <button onClick={() => setAbertoAgora(!abertoAgora)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors ${abertoAgora ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-slate-50 border border-slate-200 text-slate-700'}`}>
          Aberto Agora
        </button>
        <button onClick={() => setMinimo4Estrelas(!minimo4Estrelas)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors ${minimo4Estrelas ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-50 border border-slate-200 text-slate-700'}`}>
          Apenas 4+ ⭐
        </button>
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
