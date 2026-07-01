import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { InspirationPost } from '../../types';
import { Plus, Heart, Eye, TrendingUp, Image as ImageIcon } from 'lucide-react';

export default function DashboardMarketing({ business }: { business: any }) {
  const [posts, setPosts] = useState<InspirationPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (business?.id) {
      fetchPosts();
    }
  }, [business?.id]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inspiration_posts')
        .select('*, media:inspiration_media(*)')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setPosts(data as any || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-display">Marketing & Inspiração</h2>
          <p className="text-sm text-slate-500">Publique os seus melhores trabalhos e apareça no feed de inspiração Glamzo.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-sm">
          <Plus className="w-4 h-4" />
          Nova Publicação
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-purple-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">A sua montra digital</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            Mostre o talento da sua equipa. Publicações de "Antes & Depois", estilos e tendências atraem novos clientes através da pesquisa orgânica e feed de inspiração.
          </p>
          <button className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-purple-200">
            <Plus className="w-5 h-5" />
            Criar 1ª Publicação
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts.map(post => (
            <div key={post.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
              <div className="aspect-[4/3] bg-slate-100 relative">
                {post.media && post.media.length > 0 ? (
                  <img src={post.media[0].url} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  </div>
                )}
                {post.is_trending && (
                  <div className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Trending
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h4 className="font-bold text-slate-900 text-sm mb-1">{post.title}</h4>
                <div className="flex gap-2 mb-3">
                  {post.tags?.slice(0, 2).map(t => (
                    <span key={t} className="text-[9px] font-mono font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">#{t}</span>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 text-slate-500">
                  <div className="flex items-center gap-1 text-xs">
                    <Eye className="w-4 h-4" /> {post.views_count}
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Heart className="w-4 h-4" /> {post.saves_count}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                    {post.bookings_generated} marcas
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
