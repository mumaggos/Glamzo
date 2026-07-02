import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { 
  Search, MapPin, SlidersHorizontal, Star, Navigation, Map as MapIcon, List, Clock, Zap, Target
} from "lucide-react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY || "";

const FILTERS = [
  { id: 'aberto_hoje', label: 'Aberto Hoje' },
  { id: 'mais_perto', label: 'Mais Perto' },
  { id: 'mais_barato', label: 'Mais Barato' },
  { id: 'top_partner', label: 'Top Partner' },
  { id: 'pagamento_online', label: 'Pagamento Online' },
  { id: 'promocoes', label: 'Promoções' },
  { id: 'melhor_avaliacao', label: 'Melhor Avaliação' }
];

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const initialCat = searchParams.get("cat") || "";
  const initialLoc = searchParams.get("loc") || "";
  
  const [query, setQuery] = useState(initialQ);
  const [location, setLocation] = useState(initialLoc);
  const [category, setCategory] = useState(initialCat);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
    fetchBusinesses();
  }, [query, location, category, activeFilters]);

  const fetchBusinesses = async () => {
    setLoading(true);
    let q = supabase.from('businesses').select('*').eq('status', 'active');
    
    if (category) {
      q = q.ilike('category', `%${category}%`);
    }
    if (query) {
      q = q.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }
    if (location) {
      q = q.or(`city.ilike.%${location}%,address_line_1.ilike.%${location}%`);
    }

    if (activeFilters.includes('pagamento_online')) {
      q = q.eq('accepts_online_payments', true);
    }
    if (activeFilters.includes('promocoes')) {
      q = q.eq('discount_active', true);
    }
    
    const { data } = await q;
    let results = data || [];

    if (activeFilters.includes('melhor_avaliacao')) {
      results.sort((a,b) => (b.rating || 5) - (a.rating || 5));
    }
    
    setBusinesses(results);
    setLoading(false);
  };

  const toggleFilter = (f: string) => {
    setActiveFilters(prev => 
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    );
  };

  const mapCenter = userLoc || (businesses.length > 0 && businesses[0].latitude ? { lat: businesses[0].latitude, lng: businesses[0].longitude } : { lat: 38.7223, lng: -9.1393 });

  return (
    <div className="flex flex-col h-screen pt-16 bg-white overflow-hidden">
      
      {/* Search & Filters Bar */}
      <div className="border-b border-slate-200 bg-white z-20 shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Serviço ou espaço" 
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="bg-transparent w-full focus:outline-none text-sm font-medium"
            />
            <div className="w-px h-4 bg-slate-300 mx-3" />
            <MapPin className="w-4 h-4 text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Localização" 
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="bg-transparent w-full focus:outline-none text-sm font-medium"
            />
          </div>

          <div className="flex overflow-x-auto hide-scrollbar gap-2 w-full md:w-auto">
            {FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => toggleFilter(f.id)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${activeFilters.includes(f.id) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex bg-slate-100 p-1 rounded-lg">
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded text-slate-600 ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}><List className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('split')} className={`p-1.5 rounded text-slate-600 ${viewMode === 'split' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}><Zap className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('map')} className={`p-1.5 rounded text-slate-600 ${viewMode === 'map' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'}`}><MapIcon className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* List View */}
        {(viewMode === 'list' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-full md:w-[600px] lg:w-[700px]' : 'w-full max-w-5xl mx-auto'} h-full overflow-y-auto p-4 sm:p-6 pb-24 scrollbar-thin scrollbar-thumb-slate-200 bg-white shrink-0`}>
            {loading ? (
              <div className="space-y-6">
                {[1,2,3].map(i => <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-2xl" />)}
              </div>
            ) : businesses.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <Target className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-bold text-slate-900">Nenhum resultado</h3>
                <p className="text-sm">Tente ajustar a sua pesquisa ou filtros.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {businesses.map((shop, i) => (
                  <Link key={i} to={`/${shop.slug}`} className="flex flex-col sm:flex-row gap-4 p-4 rounded-3xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all group bg-white">
                    <div className="w-full sm:w-48 h-48 sm:h-36 shrink-0 rounded-2xl overflow-hidden bg-slate-100 relative">
                      <img src={shop.cover_url || shop.logo_url || 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=400'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {shop.discount_active && (
                        <div className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          -{shop.discount_percent}%
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-purple-600 mb-1">{shop.category}</p>
                          <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1 truncate">{shop.name}</h3>
                          <div className="flex items-center text-xs text-slate-500 gap-1 mb-3">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate">{shop.address_line_1 || shop.city}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-bold text-amber-700">{(shop.rating || 5.0).toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {shop.accepts_online_payments && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-1 rounded">Pagamento Online</span>
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-1 rounded">Reserva Imediata</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Map View */}
        {(viewMode === 'map' || viewMode === 'split') && (
          <div className={`flex-1 h-full bg-slate-100 relative ${viewMode === 'split' ? 'hidden md:block' : 'block'}`}>
            <APIProvider apiKey={API_KEY}>
              <Map 
                defaultCenter={mapCenter} 
                defaultZoom={13} 
                gestureHandling={'greedy'} 
                disableDefaultUI={true}
                mapId="DEMO_MAP_ID"
              >
                {businesses.map((shop, i) => shop.latitude && shop.longitude && (
                  <AdvancedMarker key={i} position={{ lat: shop.latitude, lng: shop.longitude }}>
                    <div className="bg-slate-900 px-3 py-1.5 rounded-full shadow-lg border-2 border-white text-sm font-bold text-white flex items-center gap-1.5 transform hover:scale-110 hover:bg-purple-600 hover:border-purple-200 transition-all cursor-pointer">
                      <span>{(shop.rating || 5.0).toFixed(1)}</span>
                    </div>
                  </AdvancedMarker>
                ))}
              </Map>
            </APIProvider>
          </div>
        )}

      </div>

    </div>
  );
}
