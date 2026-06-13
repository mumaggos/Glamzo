import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Heart, Search, MapPin, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Favorites() {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchFavorites() {
      try {
        const { data: favIds, error: favErr } = await supabase
          .from('favorites')
          .select('business_id')
          .eq('customer_id', user!.id);

        let ids: string[] = [];
        if (!favErr && favIds && favIds.length > 0) {
          ids = favIds.map((f: any) => f.business_id);
        } else {
          try {
            const stored = JSON.parse(localStorage.getItem(`glamzo_customer_favorites_${user!.id}`) || '[]');
            ids = stored;
          } catch (_) {}
        }

        if (ids.length === 0) {
          setFavorites([]);
          setLoading(false);
          return;
        }

        const { data: bizData, error: bizErr } = await supabase
          .from('businesses')
          .select('*')
          .in('id', ids);

        if (!bizErr && bizData) {
          setFavorites(bizData);
        }
      } catch (err) {
        console.error('Error fetching favorites:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span>Voltar</span>
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-500 shrink-0">
          <Heart className="w-6 h-6 fill-current" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Os Meus Favoritos</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Acesso rápido aos seus salões preferidos.</p>
        </div>
      </div>

      {!user ? (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center mt-8">
          <Heart className="w-12 h-12 text-slate-300 mx-auto border-2 border-dashed border-slate-300 rounded-2xl p-2 mb-4" />
          <h3 className="text-lg font-bold text-slate-800">Inicie sessão</h3>
          <p className="text-sm text-slate-500 mt-2 mb-6">Precisa estar autenticado para guardar e ver os seus favoritos.</p>
          <button onClick={() => navigate('/login')} className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl text-sm transition-all">
            Fazer Login
          </button>
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center mt-8">
          <Search className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">Nenhum Favorito Adicionado</h3>
          <p className="text-sm text-slate-500 mt-2 mb-6">Explore o nosso catálogo para encontrar os melhores espaços.</p>
          <button onClick={() => navigate('/explore')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl text-sm transition-all">
            Explorar Salões
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favorites.map(biz => (
            <div key={biz.id} className="bg-white border border-slate-150 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-purple-200 transition-all group flex items-start gap-4 cursor-pointer" onClick={() => navigate(`/business/${biz.slug}`)}>
              {biz.logo_url ? (
                <img src={biz.logo_url} alt={biz.name} className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0 bg-slate-50 group-hover:scale-105 transition-transform" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-purple-50 text-purple-300 flex items-center justify-center shrink-0 border border-purple-100 group-hover:scale-105 transition-transform font-bold text-xl uppercase">
                  {biz.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0 pt-1">
                <span className="block text-[9px] font-bold text-rose-500 uppercase tracking-widest leading-none mb-1.5 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" />
                  {biz.city || 'Portugal'}
                </span>
                <h4 className="text-sm font-black text-slate-900 group-hover:text-purple-600 truncate mb-1">
                  {biz.name}
                </h4>
                <p className="text-[11px] text-slate-500 truncate leading-snug font-medium">
                  {biz.address || 'Serviços de Beleza Premium'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
