import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { 
  Search, MapPin, Star, Sparkles, Navigation, ArrowRight,
  Scissors, Heart, Smile, Droplet, Sun, Zap, CheckCircle, Clock
} from "lucide-react";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { getFallbackImageForCategory } from '../utils/categoryImages';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY || "";

const CATEGORIES = [
  { id: 'barbearias', label: 'Barbearias', icon: '💈' },
  { id: 'cabeleireiros', label: 'Cabeleireiros', icon: '💇' },
  { id: 'unhas', label: 'Unhas', icon: '💅' },
  { id: 'spa', label: 'Spa', icon: '💆' },
  { id: 'maquilhagem', label: 'Maquilhagem', icon: '💄' },
  { id: 'pestanas', label: 'Pestanas', icon: '👁' },
  { id: 'estetica', label: 'Estética', icon: '🧖' },
  { id: 'medicina-estetica', label: 'Medicina Estética', icon: '💉' },
  { id: 'depilacao', label: 'Depilação', icon: '🪒' },
  { id: 'massagens', label: 'Massagens', icon: '💆' },
  { id: 'bem-estar', label: 'Bem-estar', icon: '🏋️' },
  { id: 'fisioterapia', label: 'Fisioterapia', icon: '🩺' },
  { id: 'tatuagens', label: 'Tatuagens', icon: '🎨' },
  { id: 'piercing', label: 'Piercing', icon: '💎' },
];

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  
  const [topRated, setTopRated] = useState<any[]>([]);
  const [newShops, setNewShops] = useState<any[]>([]);
  const [mostBooked, setMostBooked] = useState<any[]>([]);
  const [nearMe, setNearMe] = useState<any[]>([]);

  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    fetchData();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  const fetchData = async () => {
    const { data } = await supabase.from('businesses').select('*').eq('status', 'active');
    if (data) {
      const rated = [...data].sort((a,b) => (b.rating || 5) - (a.rating || 5)).slice(0, 8);
      const newS = [...data].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8);
      const booked = [...data].slice(0, 8);
      setTopRated(rated);
      setNewShops(newS);
      setMostBooked(booked);
      setNearMe(data.slice(0, 8));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/explore?q=${encodeURIComponent(query)}&loc=${encodeURIComponent(location)}`);
  };

  const handleCategory = (c: string) => {
    navigate(`/explore?cat=${encodeURIComponent(c)}`);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20">
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-50">
        <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80" alt="" aria-hidden="true" fetchPriority="high" className="absolute inset-0 w-full h-full object-cover opacity-[0.04] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Encontre o seu próximo <span className="text-purple-600 italic font-display">profissional de beleza</span>.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Descubra e reserve os melhores salões, spas e clínicas perto de si. Instantaneamente.
          </p>
          
          <form ref={searchRef} onSubmit={handleSearch} className="max-w-3xl mx-auto bg-white p-2 rounded-2xl md:rounded-full shadow-xl shadow-purple-900/5 flex flex-col md:flex-row items-center border border-slate-200/60 relative">
            
            <div className="flex-1 w-full flex items-center px-4 py-3 md:py-2 border-b md:border-b-0 md:border-r border-slate-200 relative">
              <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input 
                type="text"
                placeholder="Qual serviço procura?"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400 font-medium"
              />
              
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-4 md:mt-6 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                  {suggestions.map((s, i) => (
                    <div 
                      key={i} 
                      className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-0 transition-colors"
                      onClick={() => {
                        if (s.type === 'category') {
                          window.location.href = `/explore?cat=${encodeURIComponent(s.text)}`;
                        } else if (s.slug) {
                          window.location.href = `/${s.slug}`;
                        }
                      }}
                    >
                      {s.type === 'category' ? (
                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold shrink-0">{s.icon}</div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0"><Search className="w-4 h-4" /></div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{s.text}</p>
                        {s.type === 'business' && <p className="text-[10px] text-slate-500 uppercase tracking-wider">{s.category}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 w-full flex items-center px-4 py-3 md:py-2">
              <MapPin className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input 
                type="text"
                placeholder="Onde? Ex: Lisboa"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400 font-medium"
              />
              <button type="button" className="text-purple-600 hover:bg-purple-50 p-1.5 rounded-full transition-colors ml-2 shrink-0">
                <Navigation className="w-4 h-4" />
              </button>
            </div>
            <button type="submit" className="w-full md:w-auto mt-2 md:mt-0 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 md:py-3 rounded-xl md:rounded-full font-bold transition-all shadow-md flex items-center justify-center shrink-0">
              Procurar
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-16">
        <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 px-2 snap-x">
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => handleCategory(cat.id)}
              className="snap-start shrink-0 flex flex-col items-center justify-center w-24 h-24 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group"
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-[10px] font-bold text-slate-600 text-center leading-tight uppercase tracking-wide">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <span className="text-2xl">⭐</span> Melhores Avaliações
              </h2>
              <p className="text-slate-500 text-sm mt-1">Os espaços mais bem cotados pelos clientes.</p>
            </div>
            <Link to="/explore?sort=rating" className="text-sm font-bold text-purple-600 hover:text-purple-700 hidden md:block">Ver todos</Link>
          </div>
          <ShopCarousel shops={topRated} />
        </section>

        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <span className="text-2xl">🔥</span> Mais Reservadas
              </h2>
              <p className="text-slate-500 text-sm mt-1">Os locais de eleição do momento.</p>
            </div>
            <Link to="/explore?sort=popular" className="text-sm font-bold text-purple-600 hover:text-purple-700 hidden md:block">Ver todos</Link>
          </div>
          <ShopCarousel shops={mostBooked} />
        </section>

        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <span className="text-2xl">🆕</span> Novas Lojas
              </h2>
              <p className="text-slate-500 text-sm mt-1">As novidades que acabaram de chegar à Glamzo.</p>
            </div>
            <Link to="/explore?sort=new" className="text-sm font-bold text-purple-600 hover:text-purple-700 hidden md:block">Ver todos</Link>
          </div>
          <ShopCarousel shops={newShops} />
        </section>

        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <span className="text-2xl">📍</span> Perto de Mim
              </h2>
              <p className="text-slate-500 text-sm mt-1">Descubra os serviços à sua volta.</p>
            </div>
            <Link to="/explore?mode=map" className="text-sm font-bold text-purple-600 hover:text-purple-700 hidden md:block">Abrir Mapa</Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-[400px] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200">
              
              {API_KEY && API_KEY.startsWith('AIza') ? (
              <APIProvider apiKey={API_KEY}>
                <Map 
                  defaultCenter={userLoc || { lat: 38.7223, lng: -9.1393 }}
                  defaultZoom={12}
                  gestureHandling={'greedy'}
                  disableDefaultUI={true}
                  mapId="DEMO_MAP_ID"
                >
                  {nearMe.map((shop, i) => shop.latitude && shop.longitude && (
                    <AdvancedMarker key={i} position={{ lat: shop.latitude, lng: shop.longitude }}>
                      <div className="bg-white px-3 py-1.5 rounded-full shadow-lg border border-slate-200 text-sm font-bold text-slate-900 flex items-center gap-1.5 transform hover:scale-110 transition-transform cursor-pointer">
                        <span>⭐ {(shop.rating || 5.0).toFixed(1)}</span>
                      </div>
                    </AdvancedMarker>
                  ))}
                </Map>
              </APIProvider>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-200 text-slate-500 p-6 text-center">
                  <MapPin className="w-12 h-12 mb-4 opacity-50" />
                  <p className="font-bold text-slate-700">Mapa Indisponível</p>
                  <p className="text-sm mt-2 max-w-xs">A integração do Google Maps requer configuração adicional.</p>
                </div>
              )}

            </div>
            <div className="flex flex-col gap-4 overflow-y-auto pr-2 max-h-[400px] scrollbar-thin scrollbar-thumb-slate-200">
              {nearMe.slice(0,5).map((shop, i) => (
                <Link key={i} to={`/${shop.slug}`} className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img src={shop.cover_url || shop.logo_url || getFallbackImageForCategory(shop.category)} alt={shop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-bold text-slate-900 line-clamp-1">{shop.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{shop.address_line_1 || shop.city}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center text-xs font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current mr-1" /> {(shop.rating || 5.0).toFixed(1)}
                      </div>
                      <span className="text-slate-300 text-xs">•</span>
                      <span className="text-xs font-medium text-slate-600">{shop.category || 'Beleza'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

function ShopCarousel({ shops }: { shops: any[] }) {
  if (!shops.length) {
    return (
      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x">
        {[1,2,3,4].map(i => (
          <div key={i} className="min-w-[260px] h-[320px] bg-slate-100 rounded-3xl animate-pulse shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x">
      {shops.map((shop, i) => (
        <Link 
          key={i} 
          to={`/${shop.slug}`}
          className="snap-start shrink-0 w-[260px] sm:w-[280px] group block"
        >
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden mb-3 bg-slate-100">
            <img 
              src={shop.cover_url || shop.logo_url || getFallbackImageForCategory(shop.category)} 
              alt={shop.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-slate-900 flex items-center gap-1 shadow-sm">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              {(shop.rating || 5.0).toFixed(1)}
            </div>
            {shop.discount_active && (
              <div className="absolute top-3 right-3 bg-rose-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                -{shop.discount_percent}%
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
               {shop.logo_url && (
                 <img src={shop.logo_url} alt={`Logotipo de ${shop.name}`} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
               )}
               <div className="flex-1 min-w-0">
                 <h3 className="text-white font-bold truncate text-sm">{shop.name}</h3>
                 <p className="text-white/80 text-[10px] truncate">{shop.category}</p>
               </div>
            </div>
          </div>
          <div className="px-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{shop.city || 'Portugal'}</span>
            </div>
            {shop.accepts_online_payments && (
              <span className="inline-flex text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Pagamento Online</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
