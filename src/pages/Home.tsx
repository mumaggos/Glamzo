
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Business } from "../types";
import { 
  Search, MapPin, Star, Navigation, ArrowRight, Clock, Map as MapIcon, 
  Percent, Crown, CheckCircle2, Navigation2
} from "lucide-react";
import { getFallbackImageForCategory } from '../utils/categoryImages';

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

const CITIES = [
  { name: 'Lisboa', image: 'https://images.unsplash.com/photo-1589330694653-efa637384160?auto=format&fit=crop&q=80&w=400' },
  { name: 'Porto', image: 'https://images.unsplash.com/photo-1552832233-90d2ce2c6b44?auto=format&fit=crop&q=80&w=400' },
  { name: 'Braga', image: 'https://images.unsplash.com/photo-1563200921-9d19a28867a5?auto=format&fit=crop&q=80&w=400' },
  { name: 'Coimbra', image: 'https://images.unsplash.com/photo-1647466854125-97fc8dce857c?auto=format&fit=crop&q=80&w=400' },
  { name: 'Aveiro', image: 'https://images.unsplash.com/photo-1681729015096-3c0512db47bd?auto=format&fit=crop&q=80&w=400' },
  { name: 'Faro', image: 'https://images.unsplash.com/photo-1534008897995-27a23e859048?auto=format&fit=crop&q=80&w=400' },
];

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  
  const [topPartners, setTopPartners] = useState<Business[]>([]);
  const [recommended, setRecommended] = useState<Business[]>([]);
  const [promotions, setPromotions] = useState<Business[]>([]);
  const [topRated, setTopRated] = useState<Business[]>([]);
  const [newShops, setNewShops] = useState<Business[]>([]);
  const [mostBooked, setMostBooked] = useState<Business[]>([]);
  const [nearMe, setNearMe] = useState<Business[]>([]);
  
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null);
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetchData();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
    
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query) {
      setSuggestions(CATEGORIES.slice(0, 4).map(c => ({ text: c.label, type: 'category', icon: c.icon })));
      return;
    }
    const filteredCats = CATEGORIES.filter(c => c.label.toLowerCase().includes(query.toLowerCase())).map(c => ({ text: c.label, type: 'category', icon: c.icon }));
    const filteredShops = recommended.filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || s.category.toLowerCase().includes(query.toLowerCase())).map(s => ({ text: s.name, type: 'business', slug: s.slug, category: s.category }));
    setSuggestions([...filteredCats, ...filteredShops].slice(0, 5));
  }, [query, recommended]);

  const fetchData = async () => {
    const { data } = await supabase.from('businesses').select('*').eq('status', 'active');
    if (data) {
      // Logic for new categories and badges
      const partners = data.filter(b => b.is_premium);
      const promos = data.filter(b => b.discount_active);
      const recom = [...data].sort((a,b) => (b.rating || 5) - (a.rating || 5)); // Just mock recommendation logic by rating for now
      
      const newS = [...data].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setTopPartners(partners);
      setPromotions(promos);
      setRecommended(recom);
      setTopRated(recom);
      setNewShops(newS);
      setMostBooked([...data]);
      setNearMe(data);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/explore?q=${encodeURIComponent(query)}&loc=${encodeURIComponent(location)}`);
  };

  const handleCategory = (c: string) => {
    navigate(`/explore?cat=${encodeURIComponent(c)}`);
  };
  
  const handleCity = (c: string) => {
    navigate(`/explore?loc=${encodeURIComponent(c)}`);
  };
  
  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        // Reverse geocoding can be done here, for now we just show Near Me
        setLocation("Perto de mim");
      });
    }
  };

  const isNewShop = (dateString?: string) => {
    if (!dateString) return false;
    const createdDate = new Date(dateString);
    const diffDays = Math.ceil(Math.abs(new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)); 
    return diffDays <= 15;
  };

  const ShopCard = ({ shop }: { shop: Business }) => {
    const isNew = isNewShop(shop.created_at);
    
    return (
      <div className="shrink-0 w-[280px] sm:w-[300px]">
        <Link 
          to={`/${shop.slug}`}
          className="group flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-300 overflow-hidden relative h-full"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 shrink-0">
            <img 
              src={shop.cover_url || shop.logo_url || getFallbackImageForCategory(shop.category)} 
              alt={shop.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
            
            {/* Badges Container */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
              {shop.is_premium && (
                <span className="bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                  <Crown className="w-3 h-3" /> Top Partner
                </span>
              )}
              {isNew && (
                <span className="bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg shadow-lg">
                  NOVA
                </span>
              )}
              {shop.discount_active && (
                <span className="bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                  <Percent className="w-3 h-3" /> -{shop.discount_percent || 10}%
                </span>
              )}
            </div>
            
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2 py-1 rounded-xl shadow-lg flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
              <span className="text-xs font-bold text-slate-900">{shop.rating?.toFixed(1) || '5.0'}</span>
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3">
               {shop.logo_url && (
                 <img src={shop.logo_url} alt={shop.name} loading="lazy" className="w-10 h-10 rounded-full border-2 border-white object-cover bg-white shrink-0 shadow-md" />
               )}
               <div className="flex-1 min-w-0">
                 <h3 className="text-white font-bold truncate text-base mb-0.5">{shop.name}</h3>
                 <p className="text-slate-200 text-xs truncate flex items-center gap-1">
                   {shop.category}
                 </p>
               </div>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
            <div className="flex items-center text-xs text-slate-500 font-medium">
              <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
              <span className="truncate">{shop.city} • {shop.address}</span>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-50 mt-auto">
               <div className="flex-1 flex flex-col">
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Aberto Agora</span>
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Disponível
                  </span>
               </div>
               <div className="flex items-center gap-1 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                  <Clock className="w-3.5 h-3.5" />
                  Agendar
               </div>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans selection:bg-purple-100 selection:text-purple-900">
      
      {/* HERO SECTION */}
      <div className="relative pt-24 pb-20 md:pt-32 md:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1600880292089-90a7e086ee8c?auto=format&fit=crop&q=80&w=1920" 
            alt="Glamzo Premium Spa and Salon Background" 
            fetchPriority="high" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay pointer-events-none" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950" />
          <div className="absolute inset-0 bg-purple-900/10" />
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10 text-center flex flex-col items-center">
          <span className="inline-block py-1 px-3 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-200 text-[10px] font-bold uppercase tracking-widest mb-6">A revolução da beleza</span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            Encontre o profissional <br className="hidden md:block"/> perfeito <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300 italic font-display">perto de si</span>.
          </h1>
          <p className="text-base md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-medium">
            Reserve facilmente os melhores barbeiros, cabeleireiros, salões de beleza, spas e clínicas em Portugal.
          </p>
          
          {/* SEARCH BAR */}
          <form ref={searchRef} onSubmit={handleSearch} className="w-full max-w-3xl mx-auto bg-white p-2 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center relative z-20">
            <div className="flex-1 w-full flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-slate-100 relative group">
              <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0 group-focus-within:text-purple-600 transition-colors" />
              <input 
                type="text"
                placeholder="Qual serviço procura?"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400 font-semibold"
              />
              
              {/* SUGGESTIONS */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-[calc(100%+16px)] left-0 right-0 bg-white rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                  {suggestions.map((s, i) => (
                    <div 
                      key={i} 
                      className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-0 transition-colors"
                      onClick={() => {
                        if (s.type === 'category') {
                          setQuery(s.text);
                          setShowSuggestions(false);
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
            <div className="flex-1 w-full flex items-center px-4 py-3 group relative">
              <MapPin className="w-5 h-5 text-slate-400 mr-3 shrink-0 group-focus-within:text-purple-600 transition-colors" />
              <input 
                type="text"
                placeholder="Onde? Ex: Lisboa"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400 font-semibold"
              />
              <button 
                type="button" 
                onClick={requestLocation}
                title="Perto de mim"
                className="text-slate-400 hover:text-purple-600 hover:bg-purple-50 p-2 rounded-full transition-all ml-2 shrink-0 active:scale-95"
              >
                <Navigation2 className="w-5 h-5" />
              </button>
            </div>
            <button type="submit" className="w-full md:w-auto mt-2 md:mt-0 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl md:rounded-full font-bold transition-all shadow-md shadow-purple-600/20 flex items-center justify-center shrink-0 active:scale-95">
              Pesquisar
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-16 relative z-10 -translate-y-14 md:-translate-y-16">
        <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-4 px-2">
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => handleCategory(cat.id)}
              className="shrink-0 flex items-center gap-2 px-5 py-3.5 bg-white rounded-full border border-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_25px_rgba(168,85,247,0.15)] hover:border-purple-200 transition-all group hover:-translate-y-1"
            >
              <span className="text-xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
              <span className="text-[13px] font-bold text-slate-700 whitespace-nowrap">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* TOP PARTNERS (Only show if there are top partners) */}
        {topPartners.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
                   <Crown className="w-8 h-8 text-amber-500" /> Top Partner
                </h2>
                <p className="text-slate-500 mt-2 font-medium">Os estabelecimentos mais prestigiados da plataforma.</p>
              </div>
            </div>
            <div className="flex overflow-x-auto hide-scrollbar gap-6 pb-6 px-2 -mx-2 snap-x">
              {topPartners.slice(0, 8).map((shop, i) => (
                <div key={i} className="snap-start"><ShopCard shop={shop} /></div>
              ))}
            </div>
          </section>
        )}

        {/* PROMOÇÕES (Only show if there are active promos) */}
        {promotions.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
                   <Percent className="w-8 h-8 text-rose-500" /> Promoções Ativas
                </h2>
                <p className="text-slate-500 mt-2 font-medium">Aproveite descontos especiais perto de si.</p>
              </div>
            </div>
            <div className="flex overflow-x-auto hide-scrollbar gap-6 pb-6 px-2 -mx-2 snap-x">
              {promotions.slice(0, 8).map((shop, i) => (
                <div key={i} className="snap-start"><ShopCard shop={shop} /></div>
              ))}
            </div>
          </section>
        )}

        {/* RECOMENDADOS PARA SI */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
                 <Star className="w-8 h-8 text-purple-600" /> Recomendados para Si
              </h2>
              <p className="text-slate-500 mt-2 font-medium">Com base na sua localização e avaliações.</p>
            </div>
            <Link to="/explore" className="hidden sm:flex items-center gap-1 text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors group">
              Ver todos <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="flex overflow-x-auto hide-scrollbar gap-6 pb-6 px-2 -mx-2 snap-x">
            {recommended.slice(0, 8).map((shop, i) => (
              <div key={i} className="snap-start"><ShopCard shop={shop} /></div>
            ))}
          </div>
        </section>

        {/* MELHORES AVALIAÇÕES */}
        {topRated.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
                   <Star className="w-8 h-8 text-amber-500" /> Melhores Avaliações
                </h2>
                <p className="text-slate-500 mt-2 font-medium">Os espaços favoritos dos nossos clientes.</p>
              </div>
            </div>
            <div className="flex overflow-x-auto hide-scrollbar gap-6 pb-6 px-2 -mx-2 snap-x">
              {topRated.slice(0, 8).map((shop, i) => (
                <div key={i} className="snap-start"><ShopCard shop={shop} /></div>
              ))}
            </div>
          </section>
        )}

        {/* NOVIDADES */}
        {newShops.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
                   <span className="text-3xl">✨</span> Novidades
                </h2>
                <p className="text-slate-500 mt-2 font-medium">Descubra os novos espaços na plataforma.</p>
              </div>
            </div>
            <div className="flex overflow-x-auto hide-scrollbar gap-6 pb-6 px-2 -mx-2 snap-x">
              {newShops.slice(0, 8).map((shop, i) => (
                <div key={i} className="snap-start"><ShopCard shop={shop} /></div>
              ))}
            </div>
          </section>
        )}

        {/* MAIS RESERVADOS */}
        {mostBooked.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
                   <span className="text-3xl">🔥</span> Mais Reservados
                </h2>
                <p className="text-slate-500 mt-2 font-medium">Os serviços mais populares do momento.</p>
              </div>
            </div>
            <div className="flex overflow-x-auto hide-scrollbar gap-6 pb-6 px-2 -mx-2 snap-x">
              {mostBooked.slice(0, 8).map((shop, i) => (
                <div key={i} className="snap-start"><ShopCard shop={shop} /></div>
              ))}
            </div>
          </section>
        )}

        {/* PERTO DE MIM */}
        {nearMe.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
                   <MapPin className="w-8 h-8 text-emerald-600" /> Perto de Mim
                </h2>
                <p className="text-slate-500 mt-2 font-medium">Os melhores espaços na sua área.</p>
              </div>
            </div>
            <div className="flex overflow-x-auto hide-scrollbar gap-6 pb-6 px-2 -mx-2 snap-x">
              {nearMe.slice(0, 8).map((shop, i) => (
                <div key={i} className="snap-start"><ShopCard shop={shop} /></div>
              ))}
            </div>
          </section>
        )}
        
        {/* EXPLORAR POR CIDADE */}
        <section className="pb-10">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
               <MapIcon className="w-8 h-8 text-emerald-500" /> Explorar por Cidade
            </h2>
            <p className="text-slate-500 mt-2 font-medium">Descubra os melhores serviços de beleza nas principais cidades.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {CITIES.map((city, i) => (
              <button 
                key={i} 
                onClick={() => handleCity(city.name)}
                className="group relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer"
              >
                <img src={city.image} alt={city.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-left">
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">{city.name}</h3>
                  <div className="w-8 h-1 bg-white/30 rounded-full group-hover:w-12 group-hover:bg-purple-500 transition-all duration-300" />
                </div>
              </button>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
