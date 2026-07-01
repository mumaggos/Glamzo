import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { InspirationPost } from '../../types';
import { Sparkles, Heart, Eye, TrendingUp, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BusinessInspiration({ businessId, businessName }: { businessId: string, businessName: string }) {
  const [posts, setPosts] = useState<InspirationPost[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('inspiration_posts')
          .select('*, media:inspiration_media(*)')
          .eq('business_id', businessId)
          .eq('status', 'published')
          .eq('visibility', 'public')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPosts(data as unknown as InspirationPost[]);
      } catch (err) {
        console.error('Error fetching inspiration:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [businessId]);

  if (loading) {
    return (
      <div className="py-12 text-center space-y-2">
        <div className="w-6 h-6 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-mono">A carregar montra de inspiração...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return null; // Hide the section if no inspiration posts exist
  }

  return (
    <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-[24px] border border-slate-100 shadow-xl space-y-6 mt-8">
      <div className="flex justify-between items-center pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
            Montra de Inspiração <Sparkles className="w-4 h-4 text-purple-500" />
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Trabalhos recentes e estilos criados por {businessName}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {posts.map(post => {
          const mainMedia = post.media?.sort((a: any, b: any) => a.display_order - b.display_order)[0];
          
          return (
            <div 
              key={post.id} 
              onClick={() => navigate(`/inspiration?post=${post.id}`)}
              className="group cursor-pointer rounded-2xl overflow-hidden bg-slate-100 relative aspect-[4/5]"
            >
              {mainMedia ? (
                <img 
                  src={mainMedia.url} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-slate-300" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                <h4 className="font-bold text-white text-sm line-clamp-1">{post.title}</h4>
                <div className="flex items-center gap-3 text-white/80 text-[10px] mt-2">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views_count}</span>
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.saves_count}</span>
                </div>
              </div>
              
              {post.is_trending && (
                <div className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-md flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Trending
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
