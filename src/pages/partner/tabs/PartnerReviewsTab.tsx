import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../hooks/useAuth';
import { Business, Review } from '../../../types';
import { Star, MessageSquare, Reply, Loader2, Send } from 'lucide-react';
import { fetchReviewsForBusiness } from '../../../utils/reviewsHelper';

export default function PartnerReviewsTab() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterReplied, setFilterReplied] = useState<'all' | 'replied' | 'pending'>('all');
  const [sortOrder, setSortOrder] = useState<'recent' | 'highest' | 'lowest'>('recent');
  
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    if (user) {
      loadBusiness();
    }
  }, [user]);

  const loadBusiness = async () => {
    try {
      const { data } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user!.id)
        .single();
      if (data) {
        setBusiness(data as Business);
        loadReviews(data.id);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const loadReviews = async (businessId: string) => {
    setLoading(true);
    const res = await fetchReviewsForBusiness(businessId);
    setReviews(res || []);
    setLoading(false);
  };

  const submitReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('reviews')
        .update({
          reply_text: replyText.trim(),
          replied_at: now
        })
        .eq('id', reviewId).select().single();
      if (error) throw error;
      
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply_text: replyText.trim(), replied_at: now } : r));
      setReplyingTo(null);
      setReplyText('');
    } catch (e: any) {
      toast.error('Erro ao enviar resposta: ' + e.message);
    } finally {
      setSubmittingReply(false);
    }
  };

  const filteredReviews = reviews.filter(r => {
    if (filterRating && Number(r.rating) !== filterRating) return false;
    if (filterReplied === 'replied' && !r.reply_text) return false;
    if (filterReplied === 'pending' && r.reply_text) return false;
    return true;
  }).sort((a, b) => {
    if (sortOrder === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortOrder === 'highest') return Number(b.rating) - Number(a.rating);
    if (sortOrder === 'lowest') return Number(a.rating) - Number(b.rating);
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Avaliações</h1>
          <p className="text-sm text-slate-500 mt-1">Gira as avaliações dos seus clientes e responda ao feedback.</p>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button onClick={() => setFilterRating(null)} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${filterRating === null ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>Todas as Estrelas</button>
          {[5,4,3,2,1].map(s => (
            <button key={s} onClick={() => setFilterRating(s)} className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg ${filterRating === s ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
              {s} <Star className="w-3 h-3 fill-current" />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select value={filterReplied} onChange={(e) => setFilterReplied(e.target.value as any)} className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none flex-1">
            <option value="all">Todas as Respostas</option>
            <option value="replied">Respondidas</option>
            <option value="pending">Por Responder</option>
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)} className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none flex-1">
            <option value="recent">Mais Recentes</option>
            <option value="highest">Melhor Classificação</option>
            <option value="lowest">Pior Classificação</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-purple-600 animate-spin" /></div>
      ) : filteredReviews.length > 0 ? (
        <div className="space-y-4">
          {filteredReviews.map(r => (
            <div key={r.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-800">{r.customer_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {r.service_name && <span className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded">{r.service_name}</span>}
                    <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString('pt-PT')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= Number(r.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  ))}
                </div>
              </div>
              
              {r.comment ? (
                <p className="text-sm text-slate-600 leading-relaxed">{r.comment}</p>
              ) : (
                <p className="text-sm text-slate-400 italic">O utilizador não deixou comentário.</p>
              )}
              
              {r.image_urls && r.image_urls.length > 0 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {r.image_urls.map((url, i) => (
                    <img loading="lazy" key={i} src={url} alt="Review" className="h-16 w-16 object-cover rounded-lg border border-slate-200" />
                  ))}
                </div>
              )}
              
              <div className="mt-5 border-t border-slate-100 pt-4">
                {r.reply_text ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Reply className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-bold text-slate-800">A sua resposta</span>
                      {r.replied_at && <span className="text-[10px] text-slate-400">• {new Date(r.replied_at).toLocaleDateString('pt-PT')}</span>}
                    </div>
                    <p className="text-sm text-slate-600">{r.reply_text}</p>
                  </div>
                ) : replyingTo === r.id ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <label className="block text-xs font-bold text-slate-600 mb-2">Responder a {r.customer_name}</label>
                    <textarea 
                      autoFocus
                      rows={3} 
                      value={replyText} 
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Escreva a sua resposta pública..."
                      className="w-full text-sm p-3 bg-white border border-slate-300 rounded-lg outline-none focus:border-purple-500 mb-3"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setReplyingTo(null)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-lg transition-colors">{t('cancel') || 'Cancelar'}</button>
                      <button onClick={() => submitReply(r.id)} disabled={submittingReply || !replyText.trim()} className="px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
                        {submittingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Publicar Resposta
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setReplyingTo(r.id); setReplyText(''); }} className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1.5">
                    <Reply className="w-4 h-4" /> Responder publicamente
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">Sem avaliações</h3>
          <p className="text-sm text-slate-500">Ainda não há avaliações que correspondam aos seus filtros.</p>
        </div>
      )}
    </div>
  );
}
