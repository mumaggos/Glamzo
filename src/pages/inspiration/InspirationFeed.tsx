import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { InspirationPost, InspirationMedia } from '../../types';
import { Heart, Share2, MapPin, Scissors, Calendar, Sparkles, TrendingUp } from 'lucide-react';

export default function InspirationFeed({ isTrending = false, overrideTag }: { isTrending?: boolean, overrideTag?: string }) {
  const { tag: paramTag } = useParams<{ tag?: string }>();
  const activeTag = overrideTag || paramTag;
  const [posts, setPosts] = useState<(InspirationPost & { media: InspirationMedia[], business: any })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [activeTag, isTrending]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('inspiration_posts')
        .select(`
          *,
          media:inspiration_media(*),
          business:businesses(id, name, slug, city, logo_url, is_top_partner)
        `)
        .eq('visibility', 'public');

      if (activeTag) {
        // Find by category, style, or inside tags array
        query = query.or(`category.ilike.%${activeTag}%,style.ilike.%${activeTag}%,tags.cs.{${activeTag}}`);
      }

      if (isTrending) {
        query = query.eq('is_trending', true).order('views_count', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      setPosts(data as any || []);
    } catch (err) {
      console.error('Error fetching inspiration posts:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
          {isTrending ? (
            <>
              <TrendingUp className="w-8 h-8 text-rose-500" />
              Em Destaque
            </>
          ) : activeTag ? (
            <>
              <Sparkles className="w-8 h-8 text-purple-500" />
              Inspiração: <span className="capitalize">{activeTag}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-8 h-8 text-purple-500" />
              Inspiração & Tendências
            </>
          )}
        </h1>
        <p className="text-slate-500 mt-2 text-sm max-w-2xl">
          Descubra os melhores estilos, transformações e tendências de beleza em Portugal. Guarde as suas inspirações favoritas e marque diretamente no salão.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse flex flex-col gap-3">
              <div className="bg-slate-200 rounded-3xl aspect-[3/4] w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">Ainda sem inspirações</h3>
          <p className="text-slate-500 mt-1">Não encontrámos publicações para esta categoria.</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
          {posts.map(post => (
            <InspirationCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

const InspirationCard: React.FC<{ post: any }> = ({ post }) => {
  const mainImage = post.media?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.url;

  return (
    <div className="break-inside-avoid relative group bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300">
      {/* Image container */}
      <div className="relative overflow-hidden cursor-pointer">
        {mainImage ? (
          <img 
            src={mainImage} 
            alt={post.title} 
            className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full aspect-square bg-slate-100 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-slate-300" />
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="flex items-center gap-2 mb-3">
            <button className="bg-white/20 hover:bg-rose-500 text-white backdrop-blur-md p-2 rounded-full transition-colors">
              <Heart className="w-4 h-4" />
            </button>
            <button className="bg-white/20 hover:bg-white/40 text-white backdrop-blur-md p-2 rounded-full transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
            <div className="flex-1"></div>
            <Link 
              to={`/${post.business?.slug}`}
              className="bg-white text-slate-900 text-[10px] font-bold px-4 py-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              Marcar
            </Link>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {post.is_before_after && (
            <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
              Transformação
            </span>
          )}
          {post.is_trending && (
            <span className="bg-rose-500/90 backdrop-blur-md text-white text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1">
              🔥 Trending
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-slate-900 text-sm mb-1 leading-tight">{post.title}</h3>
        {post.description && (
          <p className="text-slate-500 text-xs line-clamp-2 mb-3">{post.description}</p>
        )}
        
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags?.slice(0, 3).map(tag => (
            <Link 
              key={tag}
              to={`/inspiration/${tag}`}
              className="text-[10px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md hover:bg-purple-100 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>

        <Link to={`/${post.business?.slug}`} className="flex items-center gap-2 pt-3 border-t border-slate-100 group/biz">
          {post.business?.logo_url ? (
            <img src={post.business.logo_url} alt={post.business.name} className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
              <Scissors className="w-3 h-3 text-slate-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate group-hover/biz:text-purple-600 transition-colors">
              {post.business?.name}
              {post.business?.is_top_partner && (
                <span className="ml-1 inline-block w-2 h-2 rounded-full bg-amber-400" title="Top Partner"></span>
              )}
            </p>
            <p className="text-[10px] text-slate-500 flex items-center gap-1 truncate">
              <MapPin className="w-2.5 h-2.5" />
              {post.business?.city}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
