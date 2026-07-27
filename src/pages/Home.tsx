import SeoHead from '../components/SeoHead';
import React, { useState, useEffect, useMemo, useRef } from "react"; 
import { Link, useSearchParams } from "react-router-dom";
import { LocalizedLink } from '../components/LocalizedLink';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate'; 
import { supabase } from "../lib/supabase"; 
import { fetchAllReviews } from "../utils/reviewsHelper"; 
import { 
  Search, MapPin, Clock, Navigation,  
  ChevronRight, ChevronLeft, Map as MapIcon,  
  ShieldCheck, Loader2, ArrowRight, Heart, CalendarCheck, Zap, Star 
, Tag } from "lucide-react"; 
import { lazy, Suspense } from "react";
import { Image } from "../components/Image"; 
import { getCoordinatesForCity, calculateDistanceInKm } from "../utils/geoData"; 
import { useTranslation } from "react-i18next";

const HomeBelowFold = lazy(() => import('../components/HomeBelowFold'));



// Categorias Fotográficas Premium (Estilo Treatwell) 
const HOME_CATEGORIES = [ 
  { name: "Cabeleireiro", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=60&fm=webp", url: "/explore?category=Cabelo %26 Barbearia" }, 
  { name: "Barbearia", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=60&fm=webp", url: "/explore?category=Cabelo %26 Barbearia&subcategory=Barbearia" }, 
  { name: "Nails & Beauty", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400&q=60&fm=webp", url: "/explore?category=Nails %26 Beauty" }, 
  { name: "Estética", image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=400&q=60&fm=webp", url: "/explore?category=Estética" }, 
  { name: "Wellness & Spa", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=400&q=60&fm=webp", url: "/explore?category=Wellness" }, 
  { name: "Noivas", image: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=400&q=60&fm=webp", url: "/explore?category=Noivas %26 Eventos" } 
];

const SUGGESTED_CITIES = ["Lisboa", "Porto", "Braga", "Coimbra", "Faro", "Funchal", "Ponta Delgada"]; 



export default function Home() {
  const navigate = useLocalizedNavigate();
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const currentLangCode = (i18n.language || 'pt').split('-')[0].toLowerCase();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [searchLocation, setSearchLocation] = useState(searchParams.get("city") || "");
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const mapRef = useRef<HTMLElement>(null);
  const [showLocSuggestions, setShowLocSuggestions] = useState(false);
  const [showQuerySuggestions, setShowQuerySuggestions] = useState(false);
  const [querySuggestions, setQuerySuggestions] = useState<any[]>([]);
  const [servicesData, setServicesData] = useState<any[]>([]);

  
  useEffect(() => {
    // Attempt to get user location on mount for the map
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Silent fallback, just default location
        }
      );
    }
  }, []);

  useEffect(() => {
    supabase.from("services").select("id, name, business_id").eq("is_active", true).then(res => {
      if (res.data) setServicesData(res.data);
    });
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setQuerySuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      try {
        const q = searchQuery.toLowerCase().trim();
        const matches: any[] = [];
        
        const safeBiz = Array.isArray(businesses) ? businesses : [];
        const safeServ = Array.isArray(servicesData) ? servicesData : [];
        
        // Check businesses
        safeBiz.forEach(b => {
          if (!b) return;
          const bName = b.name || "";
          const bCat = b.category || "";
          if (bName.toLowerCase().includes(q) || bCat.toLowerCase().includes(q)) {
            matches.push({ type: 'business', id: b.id, name: b.name, slug: b.slug, text: b.name });
          }
        });
        
        // Check services
        safeServ.forEach(s => {
          if (!s) return;
          const sName = s.name || "";
          if (sName.toLowerCase().includes(q)) {
            const b = safeBiz.find(bz => bz && bz.id === s.business_id);
            if (b) {
              matches.push({ type: 'service', id: b.id, name: b.name, slug: b.slug, text: `${s.name} em ${b.name}` });
            }
          }
        });
        
        const uniqueMatches = Array.from(new Map(matches.map(m => [m.id + m.text, m])).values());
        setQuerySuggestions(uniqueMatches.slice(0, 5));
      } catch (err) {
        console.error("Search suggestion error:", err);
        setQuerySuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, businesses, servicesData]);

  useEffect(() => {
    // Auto-locate user on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setSearchLocation(t('home.nearMe'));
        },
        () => {} // fail silently on auto-locate
      );
    }
  }, []);

  const scrollCategories = (direction: 'left' | 'right') => {
    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        const containerWidth = scrollContainerRef.current.clientWidth || 300;
        const scrollAmount = Math.max(300, containerWidth * 0.8);
        const targetScroll = direction === 'right' ? scrollAmount : -scrollAmount;
        scrollContainerRef.current.scrollBy({ left: targetScroll, behavior: 'smooth' });
      }
    });
  };

  useEffect(() => {
    const fetchPromos = async () => {};
    fetchPromos();
  }, []); 

  useEffect(() => { 
    const observer = new IntersectionObserver((entries) => { 
      if (entries[0].isIntersecting) { 
        setMapVisible(true); 
        observer.disconnect(); 
      } 
    }, { rootMargin: '300px' }); // Carrega 300px antes de chegar ao mapa 
    if (mapRef.current) observer.observe(mapRef.current); 
    return () => observer.disconnect(); 
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
        const nowFilter = new Date();
        let loadedBiz = (bizRes.data || []).filter((b: any) => {
          const isActive = b.subscription_status === 'active';
          const isValidTrial = b.subscription_status === 'trialing' && b.trial_ends_at && new Date(b.trial_ends_at) > nowFilter;
          return (isActive || isValidTrial) && b.public_page_enabled !== false;
        }); 
        let revDataFinal = revData || []; 

        if (bizRes.error) { 
          console.error("Home fetch error:", bizRes.error);
        }
         
        const now = new Date(); 
         
        const processed = loadedBiz.map(b => { 
          const bReviews = revDataFinal.filter((r: any) => r.business_id === b.id); 
          const rating = bReviews.length > 0 ? bReviews.reduce((sum: number, r: any) => sum + (Number(r.rating) || 0), 0) / bReviews.length : 0; 
           
          const bServices = srvData.filter((s: any) => s.business_id === b.id); 
          let realStartPrice = 0; 
          let hasRealPromotion = b.is_promoted || false; 

          if (bServices.length > 0) { 
            const prices = bServices.map((s: any) => { 
              const hasDiscount = (s.discount_price != null && s.discount_price > 0 && s.discount_price < s.price) || (s.price_promotion != null && s.price_promotion > 0); 
              if (hasDiscount) hasRealPromotion = true; 
              return s.discount_price || s.price_promotion || s.price; 
            }).filter((p: number) => p != null && !isNaN(p)); 

            if (prices.length > 0) realStartPrice = Math.min(...prices); 
          } 

          const lat = b.latitude ?? getCoordinatesForCity(b.district, b.city).latitude; 
          const lng = b.longitude ?? getCoordinatesForCity(b.district, b.city).longitude; 
          let distance = null; 
          if (userCoords) { 
            distance = calculateDistanceInKm(userCoords.lat, userCoords.lng, lat, lng); 
          } 

          return {  
            ...b, rating, reviewsCount: bReviews.length, startPrice: realStartPrice,  
            lat, lng, distance, isNew: (now.getTime() - new Date(b.created_at).getTime()) < 15 * 24 * 60 * 60 * 1000,  
            services: bServices, is_promoted: hasRealPromotion  
          };  
        }); 
         
        setBusinesses(processed); 
      } catch (e) { 
        console.error("Erro ao carregar dados", e); 
      } finally { 
        setLoading(false); 
      } 
    }; 
    
    const fetchTimer = setTimeout(() => {
      fetchData(); 
    }, 150);

    return () => clearTimeout(fetchTimer);
  }, [userCoords]); 

  
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setSearchLocation(t('home.nearMe'));
          setShowLocSuggestions(false);
        },
        () => {
          alert("Não foi possível aceder à localização. Por favor, pesquise manualmente.");
          setShowLocSuggestions(false);
        }
      );
    }
  };

  const handleSearchSubmit = () => { 
    const params = new URLSearchParams(); 
    
    // Validate empty input to just show all results
    if (searchQuery.trim() === "" && searchLocation.trim() === "") {
      navigate('/explore');
      return;
    }
    
    if (searchQuery.trim()) params.set("q", searchQuery.trim()); 
    if (searchLocation.trim()) { 
      if (searchLocation === t('home.nearMe')) params.set("nearMe", "true"); 
      else params.set("city", searchLocation.trim()); 
    } 
    navigate(`/explore?${params.toString()}`); 
  }; 

  const locaisProximos = useMemo(() => { 
    if (!businesses || businesses.length === 0) return [];
    if (!userCoords) return []; 
    return [...businesses].filter(b => b.distance !== null && b.distance < 20).sort((a, b) => (a.distance || 0) - (b.distance || 0)).slice(0, 10); 
  }, [businesses, userCoords]); 

  const topPartners = useMemo(() => {
    if (!businesses || businesses.length === 0) return [];
    return businesses.filter(b => b.is_premium || b.is_verified);
  }, [businesses]); 

  const recomendados = useMemo(() => {
    if (!businesses || businesses.length === 0) return [];
    return [...businesses].sort((a, b) => b.rating - a.rating || (a.distance || 0) - (b.distance || 0)).slice(0, 10);
  }, [businesses]); 

  const novasLojas = useMemo(() => {
    if (!businesses || businesses.length === 0) return [];
    return [...businesses].filter(b => b.isNew).slice(0, 10);
  }, [businesses]);  

  const mapBusinesses = useMemo(() => { 
    return businesses; 
  }, [businesses]); 

  // Cartão Minimalista de Elite (Estilo Airbnb) 
  const BusinessCard: React.FC<{ b: any }> = ({ b }) => ( 
    <LocalizedLink to={`/${b.slug}`} className="group flex flex-col min-w-[260px] max-w-[280px] shrink-0 cursor-pointer font-['Inter']"> 
      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden mb-3 bg-slate-100">
        <Image fill  
          src={b.cover_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=60&fm=webp"}  
          alt={b.name}  
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"  
        /> 
         
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start"> 
          {b.is_promoted && ( 
            <span className="bg-white text-[#0f172a] text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg"> 
              {t('home.featured')}
            </span> 
          )} 
        </div> 
         
        <button
            onClick={(e) => { e.preventDefault(); }}
            aria-label={t('home.addToFavorites')}
            className="absolute top-3 right-3 p-1.5 rounded-full text-white hover:scale-110 transition-transform drop-shadow-md z-10"
         > 
          <Heart className="w-6 h-6 fill-black/20 stroke-white stroke-[1.5]" /> 
        </button> 
      </div> 

      <div className="flex justify-between items-start gap-2"> 
        <div> 
          <h3 className="font-bold text-[#0f172a] text-base line-clamp-1 font-['Outfit']">{b.name}</h3> 
          <p className="text-sm text-slate-500 mt-0.5 truncate">{t(`categories.${b.category}`, { defaultValue: b.category })} · {b.city}</p> 
        </div> 
         
        <div className="flex items-center gap-1 text-sm font-semibold text-[#0f172a] shrink-0"> 
          <Star className="w-3.5 h-3.5 fill-slate-900" /> 
          {b.rating > 0 ? b.rating.toFixed(1) : t('home.new')} 
        </div> 
      </div> 
       
      <div className="mt-1 flex items-baseline gap-1"> 
        <span className="font-semibold text-[#0f172a]">{b.startPrice > 0 ? `${b.startPrice}€` : t('home.free')}</span> 
        <span className="text-sm text-slate-500">{t('home.basePrice')}</span> 
      </div> 
    </LocalizedLink> 
  ); 

  return ( 
    <div className="min-h-[100dvh] bg-[#FDFDFD] font-sans flex flex-col selection:bg-purple-100 selection:text-purple-950">
      <SeoHead title="Glamzo | Plataforma & Agendamentos de Beleza Premium" description="Glamzo é a plataforma líder em beleza em Portugal. Agende cabeleireiro, barbeiro, manicures, estética e massagens online com rapidez e segurança." /> 
       
      {/* 1. HERO SECTION & PESQUISA (IDENTIDADE GLAMZO REFINADA) */} 
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden flex flex-col justify-center bg-[#fafbfc]"> 
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/60 via-white to-rose-50/30 -z-10" /> 
         
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col items-center text-center"> 
           
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-extrabold tracking-tight text-[#0f172a] leading-[1.1] mb-5 font-['Outfit']"> 
            {t('home.heroTitle1')} <br className="hidden sm:block" /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-rose-500"> 
              {t('home.heroTitle2')} 
            </span> 
          </h1> 
          <p className="text-sm sm:text-base lg:text-lg text-slate-500 font-medium max-w-2xl mb-10 font-['Inter']"> 
            {t('home.heroSubtitle')} 
          </p> 

          {/* MOTOR DE RESERVAS ARQUITETÓNICO COM CANTOS SUAVES */} 
          <div className="w-full max-w-4xl bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl shadow-[0_12px_40px_rgba(15,23,42,0.04)] relative z-20 flex flex-col md:flex-row items-stretch gap-1 border border-slate-200/60 font-['Inter']"> 
             
            {/* Campo 1: O que procura */} 
            <div className="flex-1 relative group"> 
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors"> 
                <Search className="w-5 h-5" /> 
              </div> 
              <div className="px-12 py-3 hover:bg-slate-50 rounded-xl transition-colors cursor-text h-full flex flex-col justify-center"> 
                <label className="block text-[10px] font-extrabold text-[#0f172a] uppercase tracking-widest mb-0.5 text-left">{t('home.searchTreatment')}</label> 
                <input 
                  type="text" 
                  placeholder={t('home.searchTreatmentPlaceholder')} 
                  value={searchQuery} 
                  onChange={(e) => { setSearchQuery(e.target.value); setShowQuerySuggestions(true); }}
                  onFocus={() => setShowQuerySuggestions(true)}
                  onBlur={() => setTimeout(() => setShowQuerySuggestions(false), 200)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(); }}
                  className="bg-transparent border-none w-full text-sm font-medium text-slate-600 placeholder-slate-400 focus:outline-none p-0 text-left" 
                /> 
              </div> 
              {showQuerySuggestions && Array.isArray(querySuggestions) && querySuggestions.length > 0 && (
                <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-xl z-30 py-2 text-left overflow-y-auto max-h-60 custom-scrollbar">
                  {querySuggestions.map((s, idx) => (
                    <button key={idx} onMouseDown={() => navigate(`/${s?.slug}`)} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-800 text-sm flex items-center gap-2 border-b border-slate-50 transition-colors last:border-0">
                      <Search className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{s?.text || ""}</span>
                    </button>
                  ))}
                </div>
              )}
            </div> 

            <div className="hidden md:block w-px bg-slate-100 my-2" /> 
            <div className="block md:hidden h-px bg-slate-50 mx-4" /> 

            {/* Campo 2: Onde (Pesquisa Livre e Scroll Corrigido) */} 
            <div className="flex-1 relative group"> 
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors"> 
                <MapPin className="w-5 h-5" /> 
              </div> 
              <div className="px-12 py-3 hover:bg-slate-50 rounded-xl transition-colors cursor-text h-full flex flex-col justify-center"> 
                <label className="block text-[10px] font-extrabold text-[#0f172a] uppercase tracking-widest mb-0.5 text-left">{t('home.searchLocation')}</label> 
                <input 
                  type="text" 
                  placeholder={t('home.searchLocationPlaceholder')} 
                  value={searchLocation} 
                  onChange={(e) => { setSearchLocation(e.target.value); setShowLocSuggestions(true); }} 
                  onFocus={() => setShowLocSuggestions(true)} 
                  onBlur={() => setTimeout(() => setShowLocSuggestions(false), 200)} 
                  className="bg-transparent border-none w-full text-sm font-medium text-slate-600 placeholder-slate-400 focus:outline-none p-0 text-left" 
                /> 
              </div> 
               
              {showLocSuggestions && ( 
                <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-xl z-30 py-2 text-left overflow-y-auto max-h-60 custom-scrollbar"> 
                  <button onMouseDown={handleGetLocation} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-blue-600 text-sm font-bold flex items-center gap-2 border-b border-slate-50 transition-colors"> 
                    <Navigation className="w-4 h-4" /> {t('home.useMyLocation')} 
                  </button> 
                  {searchLocation.trim() && ( 
                    <button onMouseDown={() => { setShowLocSuggestions(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-900 text-sm font-bold flex items-center gap-2 border-b border-slate-50 transition-colors"> 
                      <Search className="w-4 h-4 text-slate-400" /> {t('home.searchFor', { location: searchLocation })} 
                    </button> 
                  )} 
                  <div className="px-4 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{t('home.suggestions')}</div> 
                  {SUGGESTED_CITIES.filter(c => c.toLowerCase().includes(searchLocation.toLowerCase())).map(city => ( 
                    <button key={city} onMouseDown={() => { setSearchLocation(city); setShowLocSuggestions(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-sm font-medium flex items-center gap-2 transition-colors"> 
                      <MapPin className="w-4 h-4 text-slate-300" /> {city} 
                    </button> 
                  ))} 
                </div> 
              )} 
            </div> 

            <button  
              onClick={handleSearchSubmit}  
              className="w-full md:w-auto bg-[#0f172a] hover:bg-[#9333ea] text-white font-bold text-sm py-4 md:py-0 px-10 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 shrink-0 mt-2 md:mt-0" 
            > 
              {t('home.searchButton')} 
            </button> 
          </div> 

          {/* Garantias Reais de Confiança (Sem Dados Falsos) */} 
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-semibold text-slate-500 font-['Inter']"> 
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500" /> {t('home.trustImmediate')}</span> 
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300" /> 
            <span className="flex items-center gap-1.5"><CalendarCheck className="w-4 h-4 text-purple-500" /> {t('home.trustAvailability')}</span> 
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300" /> 
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> {t('home.trustPayment')}</span> 
          </div> 
        </div> 
      </section> 


      <Suspense fallback={<div className="h-96 w-full flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 text-purple-600 animate-spin" /></div>}>
        <HomeBelowFold 
          HOME_CATEGORIES={HOME_CATEGORIES}
          loading={loading}
          locaisProximos={locaisProximos}
          recomendados={recomendados}
          novasLojas={novasLojas}
          BusinessCard={BusinessCard}
          mapRef={mapRef}
          mapVisible={mapVisible}
          userCoords={userCoords}
          mapBusinesses={mapBusinesses}
          currentLangCode={currentLangCode}
        />
      </Suspense>
    </div>
  );
}

