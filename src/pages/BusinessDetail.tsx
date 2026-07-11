import React, { useState, useEffect } from 'react';
import { Helmet } from "react-helmet-async";
import { useParams, Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Business, Review } from '../types';
import { fetchReviewsForBusiness, submitReview } from '../utils/reviewsHelper';
import { startChatSession, fetchMessagesForSession, submitMessage } from '../utils/communicationHelper';
import { useAuth } from '../hooks/useAuth';
import BookingModal from '../components/BookingModal';
import toast from 'react-hot-toast';
import ErrorBoundary from '../components/ErrorBoundary';
import SecurityBadge from '../components/SecurityBadge';
import { toggleFavorite, isFavorite, reportReview, createDispute } from '../utils/marketingHelper';
import { 
  MapPin, Phone, Mail, Globe, Calendar, CheckCircle2, 
  ArrowLeft, Loader2, Share2, Compass, MessageSquare,
  Clock, X, Check, Sparkles, AlertCircle,
  Star, Heart, Flag, FileWarning, Smartphone
} from 'lucide-react';

export default function BusinessDetail() {
  
  const [searchParams] = useSearchParams();
const { slug } = useParams<{ slug: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [business, setBusiness] = useState<Business | null>(null);
  const [availability, setAvailability] = useState<{ available: boolean, label: string } | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [favoriteActive, setFavoriteActive] = useState(false);

  // States de Reviews e Reportes
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewService, setNewReviewService] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState<File[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reportReasonText, setReportReasonText] = useState('');

  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any | null>(null);

  const [staff, setStaff] = useState<any[]>([]);
  const [businessHours, setBusinessHours] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Carregar Estabelecimento
  useEffect(() => {
    const fetchBusinessBySlug = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const { data } = await supabase.from('businesses').select('*').eq('slug', slug).maybeSingle();
        if (data) {
          // Increment page views
          supabase.rpc('increment_page_views', { store_id: data.id }).then(() => {});
          if (data.subscription_status === 'suspended') {
            setErrorMsg('Estabelecimento suspenso temporariamente.');
          } else {
            setBusiness(data as Business);
            // Fetch business hours
            const { data: hoursData } = await supabase.from('business_hours').select('*').eq('business_id', data.id);
            if (hoursData) setBusinessHours(hoursData);
            
            // Fetch services
            const { data: servicesData } = await supabase.from('services').select('*').eq('business_id', data.id);
            if (servicesData) setServices(servicesData);
            
            // Fetch staff
            const { data: staffData } = await supabase.from('staff').select('*').eq('business_id', data.id);
            if (staffData) setStaff(staffData);

            
            // QR Scan tracking
            const isFromQr = searchParams.get('source') === 'qr';
            if (isFromQr) {
               try {
                 const qrKey = `qr_tracked_${data.id}`;
                 if (!sessionStorage.getItem(qrKey)) {
                   fetch("/api/business/qr-scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ businessId: data.id }) }).catch(() => {});
                   sessionStorage.setItem(qrKey, 'true');
                 }
               } catch(e) {}
            }
  
          }
        } else {
          setErrorMsg('Estabelecimento não encontrado.');
        }
      } catch (err) {
        setErrorMsg('Erro de ligação.');
      } finally {
        setLoading(false);
      }
    };
    fetchBusinessBySlug();
  }, [slug]);

  // Carregar Serviços
  useEffect(() => {
    const fetchServices = async () => {
      if (!business?.id) return;
      setLoadingServices(true);
      try {
        const { data } = await supabase.from('services').select(`*, category:service_categories(name, icon)`).eq('business_id', business.id).eq('is_active', true).order('created_at', { ascending: false });
        setServices(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, [business?.id]);

  // Carregar Avaliações
  useEffect(() => {
    const loadReviews = async () => {
      if (!business?.id) return;
      setLoadingReviews(true);
      try {
        const data = await fetchReviewsForBusiness(business.id);
        setReviews(data || []);
      } finally {
        setLoadingReviews(false);
      }
    };
    loadReviews();
  }, [business?.id]);

  useEffect(() => {
    if (user && business?.id) {
      isFavorite(user.id, business.id).then(setFavoriteActive);
    }
  }, [user, business?.id]);

  useEffect(() => {
    if (business?.id && !user) {
      const source = searchParams.get('source');
      const autoFavorite = searchParams.get('autoFavorite');
      
      if (source === 'qr' && autoFavorite === 'true') {
        localStorage.setItem('pendingFavoriteShopId', business.id);
        localStorage.setItem('returnTo', location.pathname + location.search);
      }
    }
  }, [business?.id, user, searchParams, location.pathname, location.search]);

  const handleOpenBooking = (service: any | null) => {
    if (!user) {
      if (service) sessionStorage.setItem('pre_selected_service_id', service.id);
      localStorage.setItem('returnTo', location.pathname + location.search);
      if (business?.id) {
        localStorage.setItem('pendingFavoriteShopId', business.id);
      }
      navigate(`/login`);
      return;
    }
    setSelectedService(service || null);
    setBookingOpen(true);
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast('Inicie sessão para guardar nos favoritos!');
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (business?.id) setFavoriteActive(await toggleFavorite(user.id, business.id));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePhotoSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setReviewPhotos(Array.from(e.target.files).slice(0, 5)); // Limit to 5 photos
    }
  };

  const handleCreateReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      localStorage.setItem('returnTo', location.pathname + location.search);
      navigate('/login');
      return;
    }
    if (!business?.id) return;
    setSubmittingReview(true);
    try {
      let uploadedUrls: string[] = [];
      if (reviewPhotos.length > 0) {
        setUploadingPhotos(true);
        for (const file of reviewPhotos) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;
          
          const { error: uploadError, data } = await supabase.storage
            .from('review_photos')
            .upload(filePath, file);
            
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage.from('review_photos').getPublicUrl(filePath);
          uploadedUrls.push(publicUrl);
        }
        setUploadingPhotos(false);
      }

      const author = profile?.full_name || user.email?.split('@')[0] || 'Cliente Glamzo';
      const input = {
        business_id: business.id,
        customer_id: user.id,
        customer_name: author,
        rating: newReviewRating,
        comment: newReviewComment,
        service_id: 'general',
        service_name: newReviewService || 'Geral',
        image_urls: uploadedUrls.length > 0 ? uploadedUrls : null
      };
      const created = await submitReview(input as any);
      // We manually add stats for immediate display
      created.customer_stats = { total_reviews: 1, total_photos: uploadedUrls.length };
      setReviews(prev => [created, ...prev]);
      setNewReviewComment(''); setNewReviewService(''); setReviewPhotos([]); setReviewFormOpen(false);
      toast('Avaliação submetida com sucesso! Obrigado.');
    } catch (e: any) {
      console.error(e);
      toast('Falha ao registar a avaliação: ' + e.message);
    } finally {
      setSubmittingReview(false);
      setUploadingPhotos(false);
    }
  };

  const handleReportReviewSubmit = async (reviewId: string) => {
    if (!user) return toast('Inicie sessão para reportar conteúdo.');
    if (!reportReasonText.trim()) return toast('Por favor, descreva a razão.');
    try {
      await reportReview(reviewId, reportReasonText.trim());
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_reported: true, report_reason: reportReasonText.trim() } : r));
      setReportingReviewId(null); setReportReasonText('');
      toast('Denúncia enviada para a equipa Glamzo.');
    } catch (e) { console.error(e); }
  };



  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;
  if (errorMsg || !business) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] font-bold text-slate-500">{errorMsg || "Loja não encontrada"}</div>;

  let finalRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 5.0;
  let finalReviewsCount = reviews.length;

  return (
    <>
      <Helmet>
        <title>{business.name} - Reservas Online | Glamzo</title>
      </Helmet>
      
      <div className="bg-[#F8F9FC] min-h-screen pb-20 font-sans text-slate-800">
        
        {/* Banner Premium */}
        <div className="h-[320px] w-full relative bg-slate-900 overflow-hidden">
          <img fetchPriority="high" 
            src={business.cover_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80'}
            alt={business.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F8F9FC] via-[#F8F9FC]/20 to-transparent" />

          {/* Top Actions */}
          <div className="absolute top-6 left-4 sm:left-8 z-10">
            <Link to="/explore" className="flex items-center gap-2 bg-white/90 backdrop-blur-md hover:bg-white text-slate-900 text-xs font-bold px-4 py-2.5 rounded-full shadow-lg transition-all">
              <ArrowLeft className="w-4 h-4 text-purple-600" /> <span className="hidden sm:inline">Voltar</span>
            </Link>
          </div>
          <div className="absolute top-6 right-4 sm:right-8 z-10 flex gap-2">
            <button onClick={handleToggleFavorite} className="flex items-center gap-2 bg-white/90 backdrop-blur-md hover:bg-white text-slate-900 text-xs font-bold px-4 py-2.5 rounded-full shadow-lg transition-all">
              <Heart className={`w-4 h-4 ${favoriteActive ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">{favoriteActive ? 'Favorito' : 'Guardar'}</span>
            </button>
            <button onClick={handleShare} className="flex items-center gap-2 bg-white/90 backdrop-blur-md hover:bg-white text-slate-900 text-xs font-bold px-4 py-2.5 rounded-full shadow-lg transition-all">
              <Share2 className="w-4 h-4 text-purple-600" />
            </button>
          </div>
        </div>

        {/* Layout Bento Grid */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Coluna Principal (Esquerda) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Header da Loja */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
                <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-lg bg-white shrink-0 border-4 border-white">
                  <img fetchPriority="high" src={business.logo_url || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=150&q=70'} className="w-full h-full object-cover" />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <div className="flex justify-center sm:justify-start gap-2 mb-2">
                    <span className="px-3 py-1 bg-purple-50 text-purple-600 text-[10px] uppercase font-black rounded-full tracking-widest">{business.category}</span>
                    {business.is_verified && <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] uppercase font-black rounded-full tracking-widest flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Verificado</span>}
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">{business.name}</h1>
                  <p className="text-sm text-slate-500 mt-2 flex items-center justify-center sm:justify-start gap-1.5"><MapPin className="w-4 h-4" /> {business.city}, {business.district}</p>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-3 text-sm text-slate-700 font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{finalRating.toFixed(1)}</span>
                    <span className="text-slate-400 font-normal">({finalReviewsCount} avaliações)</span>
                  </div>
                </div>
              </div>

              {/* Sobre */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm">
                <h2 className="text-lg font-black text-slate-900 mb-3">Sobre o Espaço</h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{business.description || 'Um espaço dedicado a elevar a sua beleza e bem-estar.'}</p>
              </div>

              {/* Serviços Premium */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-black text-slate-900">Menu de Serviços</h2>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{services.length}</span>
                </div>

                {loadingServices ? (
                  <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-purple-600" /></div>
                ) : (
                  <div className="space-y-3">
                    {services.map((srv) => (
                      <div key={srv.id} className="p-4 border border-slate-100 hover:border-purple-200 hover:shadow-md rounded-2xl transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group bg-slate-50/50 hover:bg-white">
                        <div>
                          <h4 className="text-base font-bold text-slate-900">{srv.name}</h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 max-w-md">{srv.description}</p>
                          <span className="inline-block mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white border border-slate-200 px-2 py-1 rounded-lg">⏱ {srv.duration_minutes} min</span>
                        </div>
                        <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:border-l sm:border-slate-100 sm:pl-6">
                          <span className="text-lg font-black text-slate-900">{Number(srv.price).toFixed(2)}€</span>
                          <button onClick={() => handleOpenBooking(srv)} className="px-5 py-2.5 bg-slate-900 hover:bg-purple-600 text-white text-xs font-bold rounded-xl transition-colors">
                            Reservar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AVALIAÇÕES RECUPERADAS */}
              {/* Modal Foto Expandida */}
              {expandedPhoto && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setExpandedPhoto(null)}>
                  <button className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                  <img src={expandedPhoto} className="max-w-full max-h-[90vh] object-contain rounded-xl" alt="Expanded review" onClick={(e) => e.stopPropagation()} />
                </div>
              )}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-6 text-left">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Avaliações de Clientes</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Opiniões reais pós-visita.</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button onClick={() => { 
  if (!user) { 
    localStorage.setItem('returnTo', location.pathname + location.search);
    navigate('/login'); 
    return; 
  } 
  setReviewFormOpen(!reviewFormOpen); 
}} className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer">
                      <Sparkles className="w-4 h-4" />
                      <span>{reviewFormOpen ? 'Fechar Formulário' : 'Avaliar Salão'}</span>
                    </button>
                  </div>
                </div>

                {reviewFormOpen && (
                  <form onSubmit={handleCreateReviewSubmit} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Pontuação (1 a 5 Estrelas)</label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button type="button" key={star} aria-label={`Avaliar ${star} estrelas`} onClick={() => setNewReviewRating(star)} className="text-amber-400 focus:outline-none cursor-pointer">
                              <Star className={`w-6 h-6 ${star <= newReviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Serviço Realizado</label>
                        <select required value={newReviewService} onChange={(e) => setNewReviewService(e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-purple-500">
                          <option value="">-- Escolha um serviço --</option>
                          {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                          <option value="Outro Serviço">Outro Serviço Geral</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">O seu Comentário</label>
                      <textarea required placeholder="Como foi o atendimento?" rows={3} value={newReviewComment} onChange={(e) => setNewReviewComment(e.target.value)} className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-purple-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Fotos (Opcional, máx 5)</label>
                      <input type="file" multiple accept="image/*" onChange={handlePhotoSelection} className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                      {reviewPhotos.length > 0 && <p className="text-[10px] text-slate-500 mt-1">{reviewPhotos.length} foto(s) selecionada(s)</p>}
                    </div>
                    <div className="flex justify-end pt-2">
                      <button type="submit" disabled={submittingReview} className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all">
                        {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        {uploadingPhotos ? 'A carregar fotos...' : 'Submeter Avaliação'}
                      </button>
                    </div>
                  </form>
                )}

                {loadingReviews ? (
                  <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 text-purple-400 animate-spin" /></div>
                ) : reviews.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {reviews.map((r) => (
                      <div key={r.id} className="py-5 first:pt-0 last:pb-0">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <span className="font-bold text-slate-800 text-sm block">{r.customer_name}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-500 font-medium">Serviço: <span className="font-semibold text-purple-600">{r.service_name}</span></span>
                              <span className="text-[10px] text-slate-400">•</span>
                              <span className="text-[10px] text-slate-500 font-medium">⭐ {r.customer_stats?.total_reviews || 1} Avaliações</span>
                              <span className="text-[10px] text-slate-400">•</span>
                              <span className="text-[10px] text-slate-500 font-medium">📷 {r.customer_stats?.total_photos || (r.image_urls?.length || 0)} Fotos</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={`w-3.5 h-3.5 ${star <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />))}
                          </div>
                        </div>
                        <p className="text-slate-600 mt-3 text-xs leading-relaxed">{r.comment}</p>
                        
                        {r.image_urls && r.image_urls.length > 0 && (
                          <div className="flex gap-2 mt-3 overflow-x-auto pb-2 custom-scrollbar">
                            {r.image_urls.map((url, i) => (
                              <img 
                                key={i} 
                                src={url} 
                                alt="Review photo" 
                                className="h-20 w-20 object-cover rounded-xl cursor-pointer border border-slate-200 hover:opacity-90 transition-opacity flex-shrink-0"
                                onClick={() => setExpandedPhoto(url)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100"><MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" /><p className="text-xs text-slate-500">Sem avaliações. Seja o primeiro a opinar!</p></div>
                )}
              </div>

            </div>

            {/* Coluna Lateral (Direita) */}
            <div className="space-y-6">
              
              {/* CTA Reserva Card */}
              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <h3 className="text-xl font-black mb-2 relative z-10">Marcar Atendimento</h3>
                <p className="text-xs text-purple-100 mb-6 relative z-10">Agendamento online, rápido e com vagas reais atualizadas ao minuto.</p>
                <button onClick={() => handleOpenBooking(null)} className="w-full py-4 bg-white text-slate-900 hover:bg-slate-50 rounded-2xl text-sm font-black uppercase tracking-wider shadow-lg transition-all flex justify-center items-center gap-2 relative z-10">
                  <Calendar className="w-5 h-5" /> Reservar Agora
                </button>
              </div>

              {/* Informações */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-5">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">Informações</h3>
                
                {businessHours && businessHours.length > 0 && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <h4 className="font-bold text-sm text-slate-800">Horário de Funcionamento</h4>
                    </div>
                    <div className="space-y-2 text-xs">
                      {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((day, idx) => {
                        const h = businessHours.find(bh => bh.weekday === idx);
                        if (!h) return null;
                        return (
                          <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-100/50 last:border-0">
                            <span className="font-bold text-slate-600">{day}</span>
                            <span className={h.is_closed ? "text-rose-500 font-bold" : "text-slate-500 font-mono"}>
                              {h.is_closed ? 'Fechado' : `${h.open_time?.substring(0,5)} - ${h.close_time?.substring(0,5)}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between gap-3 text-sm">
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 block">{business.city}</span>
                      <span className="text-slate-500 text-xs">{business.address}</span>
                    </div>
                  </div>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address + ', ' + business.city)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-purple-200"
                  >
                    Mapa
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                  <a href={`tel:${business.phone}`} className="font-bold text-slate-700 hover:text-purple-600">{business.phone}</a>
                </div>

                {/* BOTÕES DE CONTACTO RÁPIDOS RECUPERADOS */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <a 
                    href={business.whatsapp || `https://wa.me/${business.phone.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all"
                  >
                    <MessageSquare className="w-4 h-4 fill-emerald-600" />
                    Falar no WhatsApp
                  </a>
                  {business.website && (
                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all">
                      <Globe className="w-4 h-4 text-purple-600" />
                      Visitar Website
                    </a>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <ErrorBoundary>
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        business={business}
        services={services}
        user={user}
        profile={profile}
        initialSelectedService={selectedService}
      />
      </ErrorBoundary>
    </>
  );
}


