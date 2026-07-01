import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { InspirationPost } from '../../types';
import { Heart, MessageCircle, ArrowRight, TrendingUp } from 'lucide-react';

export default function TrendingInspirationCarousel() {
  const [posts, setPosts] = useState<InspirationPost[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const { data, error } = await supabase
          .from('inspiration_posts')
          .select(`
            *,
            business:businesses(id, name, slug, city),
            media:inspiration_media(*)
          `)
          .eq('status', 'published')
          .eq('is_trending', true)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!error && data) {
          setPosts(data as unknown as InspirationPost[]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-6 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="min-w-[280px] w-[280px] h-[380px] bg-slate-200 rounded-2xl shrink-0" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) return null;

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Em Destaque <TrendingUp className="w-5 h-5 text-purple-600" />
          </h2>
          <p className="text-slate-500 text-sm mt-1">Os looks mais guardados esta semana</p>
        </div>
        <button 
          onClick={() => navigate('/inspiration')}
          className="text-sm font-bold text-purple-600 hover:text-purple-700 hidden sm:flex items-center gap-1 transition-colors"
        >
          Ver tudo <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {posts.map(post => {
          const mainMedia = post.media?.sort((a, b) => a.display_order - b.display_order)[0];
          const hasGallery = (post.media?.length || 0) > 1;

          return (
            <div 
              key={post.id}
              onClick={() => navigate(`/inspiration?post=${post.id}`)}
              className="min-w-[280px] w-[280px] shrink-0 snap-start group cursor-pointer"
            >
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-3 bg-slate-100">
                <img 
                  src={mainMedia?.url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'} 
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                
                {hasGallery && (
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md z-10 flex items-center gap-1">
                    <div className="flex gap-0.5">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                    </div>
                  </div>
                )}
                
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12 flex items-end justify-between">
                  <div className="text-white">
                    <h3 className="font-bold text-sm line-clamp-1 shadow-sm">{post.title}</h3>
                    <p className="text-[10px] opacity-90">{post.business?.name}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-rose-500 transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button 
        onClick={() => navigate('/inspiration')}
        className="w-full py-3 mt-2 rounded-xl bg-purple-50 text-purple-700 font-bold text-sm sm:hidden flex items-center justify-center gap-2"
      >
        Ver toda a inspiração <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
