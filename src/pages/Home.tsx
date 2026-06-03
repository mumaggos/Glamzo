import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PORTUGAL_GEO } from '../utils/geoData';
import { MAIN_CATEGORIES } from '../utils/categoriesData';
import { supabase } from '../lib/supabase';
import { getPromotionStatus } from '../utils/marketingHelper';
import { 
  Sparkles, Search, MapPin, ArrowRight,
  Smile, Star, ShieldCheck, Check, Compass, Home as HomeIcon, Heart
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Search parameters
  const [typedQuery, setTypedQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');

  // Promoted Campaigns state
  const [promotedShops, setPromotedShops] = useState<any[]>([]);
  const [dynamicCards, setDynamicCards] = useState<any[]>([]);

  useEffect(() => {
    // 1. Load promoted campaigns with instant SessionStorage cache fallback for 100ms render speeds
    const cachedShops = sessionStorage.getItem('glamzo_promoted_shops');
    if (cachedShops) {
      try {
        setPromotedShops(JSON.parse(cachedShops));
      } catch (e) {
        console.warn("Failed to parse cached shops:", e);
      }
    }

    supabase.from('businesses').select('*').limit(30).then(({ data }) => {
      if (data) {
        try {
          const now = Date.now();
          const filtered = data.filter((b: any) => {
            if (b.subscription_status === 'suspended') {
              return false;
            }
            // Enforce card added for real shops to appear in the public list
            const isDemo = ['salao-spa-premium', 'barbearia-braga-moderna', 'estetica-beleza-braganca'].includes(b.slug);
            if (!isDemo && (!b.stripe_subscription_id || b.stripe_subscription_id.trim() === '')) {
              return false;
            }
            const isPromoted = !!b.is_promoted;
            const endsAt = b.promotion_ends_at;
            if (isPromoted && endsAt && new Date(endsAt).getTime() < now) {
              return false;
            }
            return isPromoted;
          }).slice(0, 3);
          setPromotedShops(filtered);
          sessionStorage.setItem('glamzo_promoted_shops', JSON.stringify(filtered));
        } catch (e) {
          console.error(e);
        }
      }
    });

    // 2. Load custom CMS homepage cards with instant SessionStorage caching
    const loadDynamicCards = async () => {
      const cachedCards = sessionStorage.getItem('glamzo_homepage_cards');
      if (cachedCards) {
        try {
          setDynamicCards(JSON.parse(cachedCards));
        } catch (e) {
          console.warn("Failed to parse cached dynamic cards:", e);
        }
      }

      try {
        const { data, error } = await supabase
          .from('homepage_cards')
          .select('*')
          .eq('active', true)
          .order('display_order', { ascending: true });
        if (error) {
          console.warn("Could not query dynamic homepage_cards:", error.message);
        } else if (data && data.length > 0) {
          setDynamicCards(data);
          sessionStorage.setItem('glamzo_homepage_cards', JSON.stringify(data));
        }
      } catch (err) {
        console.warn("Error loadDynamicCards:", err);
      }
    };
    loadDynamicCards();
  }, []);

  // Memoize rendered categories so that input keystrokes do not trigger complete mapping loops
  const renderedCategories = useMemo(() => {
    if (dynamicCards.length > 0) {
      return dynamicCards.map(c => {
        // Resolve a beautiful Unsplash fallback if the database image is local/broken/placeholder
        let imgUrl = c.image_url;
        if (!imgUrl || imgUrl.startsWith('/assets/') || imgUrl.includes('localhost') || imgUrl.startsWith('/')) {
          const match = MAIN_CATEGORIES.find(m => m.name.toLowerCase().trim() === c.title.toLowerCase().trim());
          imgUrl = match ? match.imageUrl : 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600';
        }
        return {
          id: c.id,
          name: c.title,
          description: c.subtitle,
          imageUrl: imgUrl,
          emoji: c.emoji || '✨'
        };
      });
    }
    return MAIN_CATEGORIES;
  }, [dynamicCards]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (typedQuery.trim()) queryParams.set('q', typedQuery.trim());
    if (selectedDistrict !== 'All') queryParams.set('district', selectedDistrict);
    if (selectedCity !== 'All') queryParams.set('city', selectedCity);
    navigate(`/explore?${queryParams.toString()}`);
  };  return (
    <div id="lifestyle-home-view" className="min-h-screen bg-[#fafbfc] flex flex-col justify-between font-sans selection:bg-purple-100 selection:text-purple-900 pb-24">
      
      {/* 1. Immersive Editorial Hero Section - Airbnb & Apple-inspired */}
      <section className="relative pt-20 pb-16 border-b border-slate-100 bg-white">
        {/* Simplified high-performance background decoration (no filter blurs) */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-500/5 rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 font-sans">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-100 rounded-full text-[10px] font-bold tracking-wider text-purple-600 mb-6 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>O Marketplace de Reservas Premium em Portugal</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-display font-medium tracking-tight text-slate-900 leading-[1.08] mb-6">
              Encontre e reserve os melhores <br />
              <span className="bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text text-transparent">serviços de beleza</span> de elite.
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-500 font-normal max-w-xl mx-auto leading-relaxed">
              Agendamento em tempo real nos salões recomendados, tratamentos estéticos de alta costura e serviços de elite em toda a República Portuguesa. No waits, no fuss.
            </p>
          </div>

          {/* Search bar widget - Stripe/Linear Style */}
          <form 
            onSubmit={handleSearchSubmit}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgba(15,23,42,0.04)] max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center relative z-20"
            id="home-search-container"
          >
            {/* Find Service */}
            <div className="md:col-span-4 relative">
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">O que procura?</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-450">
                  <Search className="w-4 h-4 text-slate-400" />
                </span>
                <input 
                  type="text"
                  placeholder="Cabeleireiro, Barbearia, Spa..." 
                  value={typedQuery}
                  onChange={(e) => setTypedQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/70 pl-10 pr-3.5 py-3 rounded-xl text-xs sm:text-sm text-slate-805 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium placeholder-slate-400"
                />
              </div>
            </div>

            {/* Select Distrito */}
            <div className="md:col-span-3 relative">
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Escolher Distrito</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-purple-600">
                  <MapPin className="w-4 h-4" />
                </span>
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    const nextVal = e.target.value;
                    setSelectedDistrict(nextVal);
                    setSelectedCity('All');
                  }}
                  className="w-full bg-slate-50 border border-slate-200/70 pl-10 pr-3.5 py-3 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium cursor-pointer appearance-none"
                >
                  <option value="All">Distritos de Portugal</option>
                  {Object.keys(PORTUGAL_GEO).sort().map((dist) => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Select Cidade */}
            <div className="md:col-span-3 relative">
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Escolher Cidade</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-450">
                  <Compass className="w-4 h-4 text-slate-400" />
                </span>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={selectedDistrict === 'All'}
                  className="w-full bg-slate-50 border border-slate-200/70 pl-10 pr-3.5 py-3 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="All">
                    {selectedDistrict === 'All' ? 'Selecione o distrito' : 'Todas as cidades'}
                  </option>
                  {selectedDistrict !== 'All' && (PORTUGAL_GEO[selectedDistrict] || []).map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-2 pt-4 md:pt-0">
              <button 
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-6 rounded-xl text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-purple-200 hover:scale-[1.01]"
              >
                <span>Explorar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

        </div>
      </section>

      {/* 2. Visual Categories Grid - Airbnb Style */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center md:text-left mb-12">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 border border-purple-100 rounded text-[9px] font-bold uppercase text-purple-600 tracking-widest mb-3">
            <span>Explorar Serviços</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-medium tracking-tight text-slate-900">
            Categorias de Elite
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">De cabeleireiros tradicionais de alto padrão a centros de alta estética e atendimento premium.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {renderedCategories.map((cat) => (
            <Link 
              key={cat.id || cat.name}
              to={`/explore?category=${encodeURIComponent(cat.name)}`}
              className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-purple-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(15,23,42,0.04)] -translate-y-0 hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={cat.imageUrl} 
                  alt={cat.name} 
                  loading="lazy"
                  decoding="async"
                  width="400"
                  height="192"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 grayscale-[10%] group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl bg-white/10 backdrop-blur-md w-10 h-10 rounded-lg flex items-center justify-center border border-white/10">
                      {cat.emoji || '✨'}
                    </span>
                    <h3 className="text-base font-display font-bold text-white tracking-tight uppercase group-hover:text-purple-300 transition-colors">
                      {cat.name}
                    </h3>
                  </div>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-500 leading-relaxed min-h-[40px]">
                  {cat.description}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-black tracking-widest uppercase text-slate-550 group-hover:text-purple-600 transition-colors">
                  <span>Descobrir {cat.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-purple-600" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 2.5 Promoted Campaigns Section - Minimal Modern Cards */}
      {promotedShops.length > 0 && (
        <section className="py-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 bg-slate-50/50 rounded-3xl mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-50 border border-rose-100 rounded text-[9px] font-bold uppercase text-rose-600 tracking-wider mb-2">
                <Sparkles className="w-3 h-3 text-rose-500" />
                <span>Salões em Destaque Glamzo</span>
              </div>
              <h2 className="text-2xl font-display font-medium tracking-tight text-slate-900">
                Campanhas Ativas de Destaque
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                Descubra as principais campanhas de beleza e estúdios VIP recomendados perto de si.
              </p>
            </div>
            
            <Link 
              to="/explore"
              className="group inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 uppercase tracking-wider"
            >
              <span>Ver todos os salões</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
            {promotedShops.map((b) => (
              <Link
                key={b.id}
                to={`/business/${b.slug}`}
                className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-purple-300/60 shadow-sm transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 relative overflow-hidden">
                    <img 
                      src={b.cover_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="176" viewBox="0 0 400 176"><rect width="400" height="176" fill="%23f8fafc"/><text x="50%" y="54%" font-family="system-ui, sans-serif" font-size="10" font-weight="950" fill="%237c3aed" opacity="0.3" letter-spacing="3" text-anchor="middle">GLAMZO PARTNER</text></svg>'} 
                      alt={b.name}
                      loading="lazy"
                      decoding="async"
                      width="400"
                      height="176"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                      <span className="bg-purple-600 text-white font-mono text-[8px] font-bold uppercase px-2 py-0.5 rounded-full">
                        {b.category}
                      </span>
                      <span className="bg-rose-500 text-white font-mono text-[8px] font-bold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Destaque</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-base font-display font-medium text-slate-800 tracking-tight group-hover:text-purple-600 transition-colors uppercase">
                      {b.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {b.description || 'Tratamentos estéticos de alta costura, equipe de alto gabarito e produtos importados.'}
                    </p>
                    <div className="text-[10px] font-mono text-purple-600 mt-3 flex items-center gap-1">
                      <span>📍</span> {b.city}, {b.district}
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 group-hover:bg-slate-100/50 transition-colors">
                  <span className="group-hover:text-slate-900 transition-colors">Marcar neste estúdio</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform text-purple-600" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. Emotional Lifestyle Narrative (Values) - Clean Grid */}
      <section className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-display font-medium text-slate-900 tracking-tight">Praticidade e Segurança Sem Esforço</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-sm mx-auto">Surgido para descomplicar a beleza profissional com agendamentos de confiança em minutos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-6.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center sm:items-start text-center sm:text-left transition-colors hover:bg-slate-100/30">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 border border-purple-100">
                <Smile className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">Zero tempos de espera</h3>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                Visualização de horários em tempo real. Planeie em segundos no conforto do seu telemóvel, sem necessitar de longas filas ou telefonemas indesejados.
              </p>
            </div>

            <div className="p-6.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center sm:items-start text-center sm:text-left transition-colors hover:bg-slate-100/30">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 border border-purple-100">
                <Star className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">Reviews Verificadas</h3>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                Críticas de utilizadores reais pós-reservas. Conheça as classificações e os portfólios antes de investir noutros tratamentos.
              </p>
            </div>

            <div className="p-6.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center sm:items-start text-center sm:text-left transition-colors hover:bg-slate-100/30">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 border border-purple-100">
                <ShieldCheck className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">Pague como quiser</h3>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                Opte pelo pagamento online super rápido integrado com Stripe Wallet, ou reserve de forma livre e pague em numerário ou multibanco directamente no salão.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 4. SaaS Partner Portal CTA - Stripe Inspired */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
        <div className="bg-[#f8fafc] border border-slate-200/50 rounded-3xl p-8 sm:p-14 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="absolute inset-0 bg-radial-[circle_at_left_bottom] from-purple-100/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-xl relative">
            <span className="text-[9px] font-mono font-bold text-purple-600 uppercase tracking-widest block mb-2 leading-none">PARA SALÕES, CLÍNICAS & PROFISSIONAIS</span>
            <h2 className="text-xl sm:text-3xl font-display font-medium text-slate-900 leading-snug tracking-tight">Gira a sua agenda, fature pagamentos e cresça na Glamzo</h2>
            <p className="text-slate-500 text-xs mt-3 leading-relaxed">
              Disponibilize faturamento imediato via Stripe Connect, automatize lembretes de marcações via WhatsApp, controle o desempenho da equipa e aumente a sua conversão.
            </p>
          </div>

          <div className="relative shrink-0 w-full sm:w-auto">
            <Link 
              to="/partner"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-7 py-3.5 rounded-xl font-bold transition-all shadow-sm text-xs tracking-wider uppercase cursor-pointer hover:scale-[1.01]"
            >
              <span>Registar meu negócio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 mt-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-400 font-mono">
          <div>Glamzo Premium Marketplace © 2026. Todos os direitos reservados.</div>
          <div className="flex gap-4">
            <Link to="/explore" className="hover:text-purple-600 transition-colors">Explorar Salões</Link>
            <Link to="/partner" className="hover:text-purple-600 transition-colors">Área do Parceiro</Link>
            <Link to="/admin/login" className="hover:text-purple-600 transition-colors opacity-55 hover:opacity-100">• Painel Admin</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
