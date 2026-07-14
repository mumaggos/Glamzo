import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ClientMessages from '../components/ClientMessages';
import ClientDisputes from '../components/ClientDisputes';
import SupportChat from '../components/SupportChat';
import { supabase } from '../lib/supabase';
import { optimizeImageBeforeUpload } from '../utils/imageOptimizer';
import { Review } from '../types';
import { fetchReviewsByCustomer, submitReview, deleteReview } from '../utils/reviewsHelper';
import { submitSupportQuery, fetchSupportTickets, createSupportTicket } from '../utils/communicationHelper';
import { financeService } from '../utils/financeService';
import { User, MessageSquare, ShieldAlert, Search, Scissors, Mail, Calendar, Upload, Loader2, Save, CheckCircle,  Gift, Sparkles, Copy, Check, Star,  AlertCircle, X, Shield, Phone, Trash2, HelpCircle, Heart, UserCircle, ShoppingBag, Compass } from 'lucide-react';
import { toggleFavorite } from '../utils/marketingHelper';

export default function Account() {
  const { user, profile, updateProfile, loading: authLoading } = useAuth();
  
  // Tabs Navigation State
  const [activeTab, setActiveTab] = useState('reservas');
  const [messageTab, setMessageTab] = useState<'lojas' | 'mensagens' | 'disputas'>('mensagens');

  // Favorites management state
  const [favoriteBusinesses, setFavoriteBusinesses] = useState<any[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  const fetchUserFavoritesList = async () => {
    if (!user) return;
    setLoadingFavorites(true);
    try {
      const { data: favIds, error: favErr } = await supabase.from('favorites').select('business_id').eq('customer_id', user.id);
      let ids: string[] = [];
      if (!favErr && favIds && favIds.length > 0) ids = favIds.map((f: any) => f.business_id);
      else { try { ids = JSON.parse(localStorage.getItem(`glamzo_customer_favorites_${user.id}`) || '[]'); } catch (_) {} }

      if (ids.length === 0) { setFavoriteBusinesses([]); return; }
      const { data: bizData, error: bizErr } = await supabase.from('businesses').select('*').in('id', ids);
      if (bizErr) throw bizErr;
      setFavoriteBusinesses(bizData || []);
    } catch (err) { console.error('Error fetching favorites:', err); } finally { setLoadingFavorites(false); }
  };

  const handleRemoveFavorite = async (bizId: string) => {
    if (!user) return;
    await toggleFavorite(user.id, bizId);
    setFavoriteBusinesses(prev => prev.filter(b => b.id !== bizId));
  };

  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Bookings engine
  const [bookings, setBookings] = useState<any[]>([]);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  
  // Loyalty and Rewards
  const [rewardsList, setRewardsList] = useState<any[]>([]);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const loadUserRewards = () => {
    if (!user) return;
    try { setRewardsList(JSON.parse(localStorage.getItem(`glamzo_rewards_${user.id}`) || '[]')); } catch (_) {}
  };

  // Real Reviews
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Dispute Filing
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeBooking, setDisputeBooking] = useState<any | null>(null);
  const [disputeReason, setDisputeReason] = useState('Serviço não condizente com a descrição');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  const handleOpenDispute = (bk: any) => {
    setDisputeBooking(bk); setDisputeReason('Qualidade do serviço insatisfatória'); setDisputeDescription(''); setDisputeModalOpen(true);
  };

    const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !disputeBooking) return;
    setSubmittingDispute(true);
    
    try {
      const { error } = await supabase.from('disputes').insert({
        booking_id: disputeBooking.id,
        initiator_id: user.id,
        business_id: disputeBooking.business_id,
        title: disputeReason,
        reason: `${disputeReason}
${disputeDescription}`
      });
      if (error) throw error;
      setRedeemSuccess(`🚨 Reclamação registada. A equipa Glamzo abriu uma disputa. Analisaremos em 24h.`);
    } catch (err: any) {
      setBookingError(err.message || 'Erro ao abrir disputa');
    } finally {
      setDisputeModalOpen(false); 
      setSubmittingDispute(false);
    }
  };

  // Review submission modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadUserReviews = async () => {
    if (!user?.id) return;
    setLoadingReviews(true);
    try { setUserReviews(await fetchReviewsByCustomer(user.id) || []); } catch (err) { console.error(err); } finally { setLoadingReviews(false); }
  };

  // Support
  const [supportInput, setSupportInput] = useState('');
  const [sendingSupport, setSendingSupport] = useState(false);
  const [userTickets, setUserTickets] = useState<any[]>([]);

  const loadTickets = async () => {
    if (!user) return;
    try { setUserTickets((await fetchSupportTickets()).filter((t: any) => t.customer_id === user.id)); } catch (_) {}
  };

  const handleSendSupportMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportInput.trim() || !user) return;
    setSendingSupport(true);
    try {
      const nameOfUser = profile?.full_name || user.email?.split('@')[0] || 'Cliente Glamzo';
      await createSupportTicket(user.id, nameOfUser, null, null, `Dúvida enviada via Suporte Técnico: "${supportInput.trim()}"`);
      // Opcional: continuar a usar a IA no background se quisermos
      // await submitSupportQuery(user.id, nameOfUser, supportInput.trim());
      setSupportInput(''); await loadTickets();
    } catch (err) { console.error(err); } finally { setSendingSupport(false); }
  };

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchUserBookings(),
        fetchUserFavoritesList(),
        loadUserRewards(),
        loadUserReviews(),
        loadTickets()
      ]);
    }
  }, [user]);

  const currentPointsBalance = financeService.getCustomerPoints(user?.id || 'default');

  const handleRedeemPoints = (pointsCost: number, voucherValue: number) => {
    setRedeemSuccess(null); setRedeemError(null);
    if (pointsCost !== 500 && pointsCost !== 1000) return;
    const result = financeService.redeemPointsForCoupon(user!.id, pointsCost);
    if (typeof result === 'string') setRedeemError(result);
    else { setRedeemSuccess(`Sucesso! Código ${result.code} gerado. Válido para desconto de -${voucherValue}.00€.`); loadUserRewards(); }
  };

  const handleOpenReviewModal = (bk: any) => { setReviewBooking(bk); setReviewRating(5); setReviewComment(''); setReviewModalOpen(true); };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reviewBooking) return;
    setSubmittingReview(true);
    try {
      await submitReview({
        booking_id: reviewBooking.id, business_id: reviewBooking.business_id, customer_id: user.id, customer_name: profile?.full_name || user.email?.split('@')[0] || 'Cliente Glamzo',
        rating: reviewRating, comment: reviewComment, service_id: reviewBooking.service_id, service_name: reviewBooking.service?.name || 'Serviço'
      });
      setRedeemSuccess("Avaliação guardada com sucesso.");
      setReviewModalOpen(false); setReviewComment(''); setReviewRating(5); await loadUserReviews();
    } catch (err) { console.error(err); } finally { setSubmittingReview(false); }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Eliminar esta avaliação permanentemente?')) return;
    setLoadingReviews(true);
    try {
      if (await deleteReview(reviewId)) { setRedeemSuccess('Avaliação eliminada.'); await loadUserReviews(); }
      else setRedeemError('Não foi possível eliminar a avaliação.');
    } catch (err) { setRedeemError('Erro ao eliminar a avaliação.'); } finally { setLoadingReviews(false); }
  };

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-slate-100 text-slate-700',
    cancelled: 'bg-rose-100 text-rose-700'
  };

  const statusText: Record<string, string> = {
    pending: 'Pendente',
    confirmed: 'Confirmada',
    completed: 'Concluída',
    cancelled: 'Cancelada'
  };

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchUserBookings = async () => {
    if (!user) return;
    setLoadingBookings(true); setBookingError(null);
    try {
      const { data, error } = await supabase.from('bookings').select(`*, service:services(id, name, price, duration_minutes, image_url), business:businesses(id, name, slug, phone, city, address), staff:staff(id, full_name, role_title)`).eq('customer_id', user.id).order('booking_date', { ascending: false }).order('start_time', { ascending: false });
      if (error) throw error;
      setBookings(data || []);
    } catch (err: any) { setBookingError('Falha ao recuperar reservas.'); } finally { setLoadingBookings(false); }
  };



  

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Deseja mesmo cancelar esta reserva?')) return;
    try {
      const { error } = await supabase.from('bookings').update({ booking_status: 'cancelled' }).eq('id', bookingId).eq('customer_id', user!.id);
      if (error) throw error;
      setBookingSuccess('Reserva cancelada. Horário libertado.');
      await fetchUserBookings();
    } catch (err: any) { setBookingError('Erro ao cancelar a sua reserva.'); }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm('Apagar do seu histórico?')) return;
    try {
      const { error } = await supabase.from('bookings').delete().eq('id', bookingId).eq('customer_id', user!.id);
      if (error) throw error;
      setBookingSuccess('Reserva eliminada do histórico!');
      await fetchUserBookings();
    } catch (err: any) { setBookingError('Erro ao eliminar a reserva.'); }
  };

  useEffect(() => {
    if (profile) { setFullName(profile.full_name || ''); setAvatarUrl(profile.avatar_url || ''); setPhone(profile.phone || ''); }
    if (user) setEmail(user.email || '');
  }, [profile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setErrorMsg(null); setSuccessMsg(null);
    try {
      await updateProfile(fullName, avatarUrl || null, phone || null, email || null);
      if (user && email !== user.email) await supabase.auth.updateUser({ email });
      setSuccessMsg('Perfil atualizado com sucesso!');
    } catch (err: any) { setErrorMsg('Erro ao salvar alterações.'); } finally { setSubmitting(false); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true); setErrorMsg(null); setSuccessMsg(null);
    try {
      const optimized = await optimizeImageBeforeUpload(file);
      const filePath = `avatars/${user.id}-${Date.now()}.webp`;
      const { error: uploadErr } = await supabase.storage.from('avatars').upload(filePath, optimized.blob, { cacheControl: 'public, max-age=31536000, stale-while-revalidate=86400, immutable', contentType: 'image/webp', upsert: true });
      if (uploadErr) throw new Error('Crie o bucket público "avatars" no Supabase.');
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(publicUrl); await updateProfile(fullName, publicUrl);
      setSuccessMsg('Foto de perfil atualizada!');
    } catch (err: any) { setErrorMsg(err.message); } finally { setUploading(false); }
  };

  if (authLoading) return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-8 h-8 text-purple-600 animate-spin" /></div>;
  if (!user) return <div className="max-w-md mx-auto my-12 p-6 bg-white border border-slate-100 rounded-2xl text-center shadow-sm"><ShieldAlert className="w-12 h-12 text-purple-600 mx-auto mb-4" /><h3 className="text-lg font-bold text-slate-800">Acesso Restrito</h3><a href="/login" className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700">Fazer Login</a></div>;

  return (
    <div id="account-view" className="min-h-[100dvh] bg-[#F8F9FC] font-sans pb-28 lg:pb-12">
      
      {/* Banner de Topo e Navegação */}
      <div className="bg-slate-900 pt-16 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-slate-900/40" />
        <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative group w-24 h-24">
              {avatarUrl ? <img loading="lazy" src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl" /> : <div className="w-24 h-24 rounded-full bg-white text-slate-300 border-4 border-white flex items-center justify-center"><User className="w-10 h-10" /></div>}
              <label className="absolute bottom-0 right-0 p-2 bg-purple-600 text-white rounded-full cursor-pointer hover:bg-purple-700 shadow-md">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} className="hidden" />
              </label>
            </div>
            <div className="text-white text-center md:text-left">
              <h1 className="text-3xl font-black tracking-tight">{fullName || 'O Meu Perfil'}</h1>
              <p className="text-purple-300 font-mono mt-1 text-sm">{email}</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center text-white">
             <div className="flex items-center justify-center gap-2 text-amber-400 mb-1"><Sparkles className="w-4 h-4"/> <span className="text-xs font-bold uppercase tracking-widest">Glamzo Club</span></div>
             <span className="text-3xl font-black font-mono">{currentPointsBalance}</span>
             <span className="text-xs text-slate-300 block">Pontos Acumulados</span>
          </div>
        </div>
      </div>

      {/* Conteúdo Central */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        
        {/* Menu de Abas */}
        <div className="hidden lg:flex overflow-x-auto bg-white rounded-2xl shadow-lg border border-slate-100 p-2 gap-2 mb-8 no-scrollbar items-center">
          {[
            { id: 'reservas', icon: Calendar, label: 'Minhas Reservas' },
            { id: 'apoio', icon: MessageSquare, label: 'Centro de Apoio' },
            { id: 'perfil', icon: UserCircle, label: 'Editar Dados' },
            { id: 'recompensas', icon: Gift, label: 'Recompensas' },
            { id: 'favoritos', icon: Heart, label: 'Favoritos' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as 'reservas' | 'apoio' | 'perfil' | 'recompensas' | 'favoritos')} 
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex-1 justify-center ${activeTab === tab.id ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: RESERVAS */}
        {/* ========================================================= */}
        {activeTab === 'reservas' && (
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 md:p-8 relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-100 to-transparent opacity-50 blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Histórico de Reservas</h3>
                <p className="text-sm text-slate-500 font-medium">As suas marcações ativas e passadas.</p>
              </div>
            </div>

            {loadingBookings ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-slate-800 mb-2">Nenhuma marcação</h4>
                <p className="text-slate-500 mb-6 text-sm">Ainda não fez nenhuma reserva no Glamzo.</p>
                <a href="/explore" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg transition-all"><Search className="w-4 h-4" /> Explorar Salões</a>
              </div>
            ) : (
              <div className="space-y-4 relative z-10">
                {(showAllBookings ? bookings : bookings.slice(0, 5)).map(bk => {
                  const bookingDate = new Date(bk.booking_date);
                  const isPast = bookingDate < new Date();
                  
                  return (
                    <div key={bk.id} className="group bg-white border border-slate-200 hover:border-purple-200 p-4 sm:p-5 rounded-2xl transition-all shadow-sm hover:shadow-md flex flex-col md:flex-row gap-5 items-start">
                      <div className="w-full md:w-auto flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden shrink-0">
                          {bk.service?.image_url ? (
                            <img loading="lazy" referrerPolicy="no-referrer" src={bk.service.image_url} alt="Serviço" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><Scissors className="w-6 h-6" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColors[bk.booking_status] || 'bg-slate-100'}`}>
                              {statusText[bk.booking_status] || 'Pendente'}
                            </span>
                            <h4 className="font-bold text-slate-900 truncate">{bk.service?.name || 'Serviço Personalizado'}</h4>
                          </div>
                          <p className="text-sm font-bold text-slate-700 truncate">{bk.business?.name || 'Salão Parceiro'}</p>
                          <p className="text-xs text-slate-500 mt-1 font-mono">{new Date(bk.booking_date).toLocaleDateString('pt')} • {bk.start_time} às {bk.end_time}</p>
                        </div>
                      </div>
                      
                      <div className="w-full md:w-auto flex flex-col md:items-end gap-3 shrink-0 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                        <div className="text-right">
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total</p>
                          <p className="text-lg font-black text-slate-900">{bk.service?.price ? `${bk.service.price}€` : '--'}</p>
                        </div>
                        <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto">
                          <a href={`/${bk.business?.slug || ''}`} className="flex-1 md:flex-none px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-colors text-center">Ver Loja</a>
                          
                          {bk.booking_status === 'completed' && (
                            <button onClick={() => handleOpenDispute(bk)} className="flex-1 md:flex-none px-4 py-2 border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all">Abrir Disputa</button>
                          )}
                          
                          {bk.booking_status === 'completed' && !userReviews.some(r => r.booking_id === bk.id) && (
                            <button onClick={() => handleOpenReviewModal(bk)} className="flex-1 md:flex-none px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-xs transition-colors border border-purple-200">Avaliar</button>
                          )}
                          
                          {(bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && (
                            <button onClick={() => handleCancelBooking(bk.id)} className="flex-1 md:flex-none px-4 py-2 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 font-bold rounded-xl text-xs transition-colors">Cancelar</button>
                          )}
                          
                          {(bk.booking_status === 'completed' || bk.booking_status === 'cancelled') && (
                            <button onClick={() => handleDeleteBooking(bk.id)} className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        
                {/* CENTRO DE APOIO */}
        {activeTab === 'apoio' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/60 animate-fade-in flex flex-col h-[70vh]">
            <h3 className="text-xl font-black text-slate-900 mb-6">Centro de Apoio</h3>
            <div className="flex overflow-x-auto no-scrollbar gap-4 mb-4 pb-2">
              <button 
                onClick={() => setMessageTab('mensagens')} 
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${messageTab === 'mensagens' ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <HelpCircle className="w-4 h-4" /> Suporte Glamzo
              </button>
              <button 
                onClick={() => setMessageTab('disputas')} 
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${messageTab === 'disputas' ? 'bg-rose-500 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <ShieldAlert className="w-4 h-4" /> Disputas
              </button>
              <button 
                onClick={() => setMessageTab('lojas')} 
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${messageTab === 'lojas' ? 'bg-purple-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <MessageSquare className="w-4 h-4" /> Lojas / Clientes
              </button>
            </div>
            
            <div className="flex-1 w-full relative bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
              {messageTab === 'lojas' && <ClientMessages />}
              {messageTab === 'mensagens' && <SupportChat />}
              {messageTab === 'disputas' && <ClientDisputes />}
            </div>
          </div>
        )}

        {/* 2. ABA DE PERFIL */}
        {activeTab === 'perfil' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/60 animate-fade-in">
            <h3 className="text-xl font-black text-slate-900 mb-6">Editar Dados Pessoais</h3>
            {errorMsg && <div className="mb-4 p-4 bg-rose-50 text-rose-700 rounded-xl text-sm font-bold flex items-center gap-2"><AlertCircle className="w-5 h-5" /> {errorMsg}</div>}
            {successMsg && <div className="mb-4 p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold flex items-center gap-2"><CheckCircle className="w-5 h-5" /> {successMsg}</div>}
            
            <form className="space-y-5 max-w-2xl" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nome Completo</label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-50 focus:bg-white transition-all font-medium text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Telemóvel</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-50 focus:bg-white transition-all font-medium text-slate-900" placeholder="Ex: 912345678" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">E-mail de Acesso</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-50 focus:bg-white transition-all font-medium text-slate-900" />
              </div>
              <button type="submit" disabled={submitting} className="px-8 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-md disabled:opacity-50 flex items-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar Alterações
              </button>
            </form>
          </div>
        )}

        {/* 3. RECOMPENSAS & FIDELIDADE */}
        {activeTab === 'recompensas' && (
          <div className="space-y-6 animate-fade-in">
            {redeemSuccess && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm font-bold">{redeemSuccess}</div>}
            {redeemError && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-bold">{redeemError}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/60">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4"><Gift className="w-6 h-6" /></div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Trocar Pontos por Vouchers</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">Por cada 100 pontos acumula 1€ de desconto real para gastar em qualquer espaço Glamzo.</p>
                <div className="space-y-3">
                  <button onClick={() => handleRedeemPoints(500, 5)} disabled={currentPointsBalance < 500} className="w-full py-4 bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-black transition-colors flex justify-between px-6 items-center">
                    <span>Resgatar 5.00€</span> <span className="font-mono text-xs opacity-70">500 PTS</span>
                  </button>
                  <button onClick={() => handleRedeemPoints(1000, 10)} disabled={currentPointsBalance < 1000} className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white rounded-xl font-black transition-colors flex justify-between px-6 items-center shadow-lg">
                    <span>Resgatar 10.00€</span> <span className="font-mono text-xs opacity-70">1000 PTS</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800 text-white">
                <h3 className="text-lg font-black mb-4">Meus Códigos Ativos</h3>
                {rewardsList.length === 0 ? (
                  <p className="text-sm text-slate-400">Nenhum voucher disponível.</p>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {rewardsList.map((rw, i) => (
                      <div key={i} className="bg-white/10 p-4 rounded-2xl border border-white/20">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-mono text-amber-400 font-black tracking-widest bg-black/40 px-2 py-1 rounded">{rw.code}</span>
                          <span className={`text-[10px] font-bold uppercase ${rw.used ? 'text-slate-400' : 'text-emerald-400'}`}>{rw.used ? 'Utilizado' : 'Disponível'}</span>
                        </div>
                        <p className="text-xs text-slate-300">Vale {rw.value}.00€ • Expira: {new Date(rw.expires_at).toLocaleDateString('pt')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        
        {/* FAVORITOS */}
        {activeTab === 'favoritos' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/60">
              <h3 className="text-xl font-black text-slate-900 mb-6">Salões Guardados</h3>
              {loadingFavorites ? (
                <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>
              ) : favoriteBusinesses.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-100">
                  <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-slate-800">Sem favoritos</h4>
                  <p className="text-xs text-slate-500 mt-2 mb-4">Ainda não guardou nenhum salão.</p>
                  <a href="/explore" className="px-6 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold inline-block hover:bg-purple-700">Explorar Salões</a>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favoriteBusinesses.map(biz => (
                    <div key={biz.id} className="border border-slate-200 rounded-2xl p-4 flex gap-4 items-center bg-white hover:border-purple-300 transition-colors">
                      {biz.logo_url ? (
                        <img loading="lazy" src={biz.logo_url} alt={biz.name} className="w-16 h-16 rounded-xl object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-sm">{biz.name}</h4>
                        <p className="text-xs text-slate-500">{biz.city || 'Portugal'}</p>
                        <div className="mt-2 flex gap-2">
                          <a href={`/salao/${biz.id}`} className="text-[10px] font-bold bg-purple-50 hover:bg-purple-600 hover:text-white transition-colors text-purple-700 px-3 py-1.5 rounded-lg">Reservar</a>
                          <button onClick={() => handleRemoveFavorite(biz.id)} className="text-[10px] font-bold bg-rose-50 hover:bg-rose-500 hover:text-white transition-colors text-rose-600 px-3 py-1.5 rounded-lg">Remover</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL DE DISPUTAS E REVIEWS MANTIDOS AQUI NO FUNDO INTACTOS! */}
      </div>

      {reviewModalOpen && reviewBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button onClick={() => setReviewModalOpen(false)} className="absolute top-5 right-5 p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X className="w-4 h-4" /></button>
            <h3 className="text-xl font-black text-slate-900 mb-2">Avaliar Serviço</h3>
            <p className="text-sm text-slate-500 mb-6">Como correu com <strong className="text-purple-600">{reviewBooking?.business?.name}</strong>?</p>
            <form onSubmit={handleSubmitReview} className="space-y-5">
              <div className="flex items-center gap-2 justify-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
                {[1, 2, 3, 4, 5].map((score) => (
                  <Star key={score} onClick={() => setReviewRating(score)} className={`w-10 h-10 cursor-pointer transition-transform hover:scale-110 ${score <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                ))}
              </div>
              <textarea required rows={4} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Deixe um comentário detalhado para ajudar outros clientes..." className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-purple-500 outline-none text-sm rounded-2xl resize-none" />
              <button type="submit" disabled={submittingReview} className="w-full py-4 bg-purple-600 text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30">
                {submittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />} Submeter Avaliação
              </button>
            </form>
          </div>
        </div>
      )}

      {disputeModalOpen && disputeBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative border-2 border-rose-100">
            <button onClick={() => setDisputeModalOpen(false)} className="absolute top-5 right-5 p-2 bg-slate-100 rounded-full hover:bg-rose-100 text-rose-500"><X className="w-4 h-4" /></button>
            <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2"><ShieldAlert className="text-rose-500 w-6 h-6"/> Abrir Disputa</h3>
            <p className="text-sm text-slate-500 mb-6">Reportar problema com a reserva em <strong>{disputeBooking?.business?.name}</strong>.</p>
            <form onSubmit={handleSubmitDispute} className="space-y-4">
              <select required value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 text-sm rounded-xl outline-none focus:border-rose-500">
                <option value="Qualidade do serviço insatisfatória">Serviço de má qualidade</option>
                <option value="Profissional ausente (No-show do parceiro)">O profissional/salão não apareceu</option>
                <option value="Preço cobrado diferente do anunciado">Fui cobrado a mais no local</option>
              </select>
              <textarea required rows={4} value={disputeDescription} onChange={(e) => setDisputeDescription(e.target.value)} placeholder="Detalhe o que aconteceu..." className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-rose-500 outline-none text-sm rounded-xl resize-none" />
              <button type="submit" disabled={submittingDispute} className="w-full py-4 bg-rose-600 text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30">
                {submittingDispute ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldAlert className="w-5 h-5" />} Formalizar Reclamação
              </button>
            </form>
          </div>
        </div>
      )}




      {/* Bottom Nav para Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t pb-safe pt-2 px-4 flex justify-between items-center z-[50] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {[
          { id: 'reservas', icon: Calendar, label: 'Reservas' },
          { id: 'apoio', icon: MessageSquare, label: 'Centro de Apoio' }
          
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center p-2 flex-1"
          >
            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-purple-600' : 'text-slate-400'}`} />
            <span className={`text-[10px] font-bold mt-1 ${activeTab === tab.id ? 'text-purple-600' : 'text-slate-500'}`}>{tab.label}</span>
          </button>
        ))}
        
        <Link to="/explore" className="flex flex-col items-center px-4 -mt-6">
          <div className="bg-gradient-to-r from-purple-600 to-rose-500 p-4 rounded-full shadow-lg shadow-purple-500/40 text-white mb-1">
            <Compass className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black text-slate-800">Explorar</span>
        </Link>

        {[
          { id: 'favoritos', icon: Heart, label: 'Favoritos' },
          { id: 'perfil', icon: UserCircle, label: 'Perfil' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center p-2 flex-1"
          >
            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-purple-600' : 'text-slate-400'}`} />
            <span className={`text-[10px] font-bold mt-1 ${activeTab === tab.id ? 'text-purple-600' : 'text-slate-500'}`}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
