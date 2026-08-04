import { BusinessCard } from '../components/BusinessCard';
import { lazyWithRetry } from '../utils/lazyImport';
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
import { formatCurrency } from '../utils/currency';

import { HomeBelowFold } from '../components/HomeBelowFold';



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




const homeSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "url": "https://glamzo.pt/",
      "name": "Glamzo",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://glamzo.pt/explore?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "name": "Glamzo",
      "url": "https://glamzo.pt",
      "logo": "https://glamzo.pt/favicon-v2.svg",
      "sameAs": [
        "https://www.instagram.com/glamzo.pt",
        "https://www.facebook.com/glamzo.pt"
      ]
    }
  ]
};



export default function Home() {
  const { t, i18n } = useTranslation();
  const currentLangCode = i18n.language || 'pt';
  const navigate = useLocalizedNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [showQuerySuggestions, setShowQuerySuggestions] = useState(false);
  const [showLocSuggestions, setShowLocSuggestions] = useState(false);
  const [querySuggestions, setQuerySuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [locaisProximos, setLocaisProximos] = useState<any[]>([]);
  const [recomendados, setRecomendados] = useState<any[]>([]);
  const [novasLojas, setNovasLojas] = useState<any[]>([]);
  const [userCoords, setUserCoords] = useState<{latitude: number, longitude: number} | null>(null);
  const [mapBusinesses, setMapBusinesses] = useState<any[]>([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        },
        () => {
          console.warn("Geolocation not allowed or failed.");
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: businesses, error } = await supabase.from('businesses').select(`
          *,
          services (
            id, name, price, duration_minutes, is_active
          )
        `).eq('status', 'active').in('subscription_status', ['active', 'trialing']);
        
        if (businesses) {
           const processed = businesses.map(b => {
             let hasRealPromotion = b.is_promoted || false;
             let minPrice = Infinity;
             if (b.services) {
               b.services.forEach((s: any) => {
                 if (!s.is_active) return;
                 const price = s.discount_price || s.price_promotion || s.price;
                 if (price < minPrice) minPrice = price;
                 if ((s.discount_price && s.discount_price < s.price) || (s.price_promotion && s.price_promotion > 0)) {
                   hasRealPromotion = true;
                 }
               });
             }
             return { ...b, hasRealPromotion, startPrice: minPrice === Infinity ? 0 : minPrice };
           });
           
           setMapBusinesses(processed);
           setRecomendados(processed.filter(b => b.hasRealPromotion).slice(0, 8));
           setNovasLojas([...processed].sort((a,b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 8));
           setLocaisProximos(processed.slice(0, 8));
        }
      } catch(e) {}
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 1) {
       setQuerySuggestions([{text: searchQuery, slug: "explore?q=" + encodeURIComponent(searchQuery)}]);
    } else {
       setQuerySuggestions([]);
    }
  }, [searchQuery]);

  const handleSearchSubmit = () => {
    if (searchQuery.trim() || searchLocation.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}&loc=${encodeURIComponent(searchLocation)}`);
    } else {
      navigate(`/explore`);
    }
  };

  const handleGetLocation = () => {
     if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition((pos) => {
         setUserCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
         setSearchLocation(t('home.currentLocation'));
         setShowLocSuggestions(false);
       });
     }
  };

return (
     <div className="min-h-[100vh] bg-[#FDFDFD] font-sans flex flex-col selection:bg-purple-100 selection:text-purple-950">
      <SeoHead title="Glamzo | Plataforma & Agendamentos de Beleza Premium" description="Glamzo é a plataforma líder em beleza em Portugal. Agende cabeleireiro, barbeiro, manicures, estética e massagens online com rapidez e segurança." schema={homeSchema} /> 
       
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


       
        <HomeBelowFold 
          HOME_CATEGORIES={HOME_CATEGORIES}
          loading={loading}
          locaisProximos={locaisProximos}
          recomendados={recomendados}
          novasLojas={novasLojas}
          
          userCoords={userCoords}
          mapBusinesses={mapBusinesses}
          currentLangCode={currentLangCode}
        />
      
    </div>
  );
}

