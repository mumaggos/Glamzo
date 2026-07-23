import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import UniversalInbox from '../components/UniversalInbox';
import UniversalDisputes from '../components/UniversalDisputes';
import GlamzoClubModal from '../components/GlamzoClubModal';
import { supabase } from '../lib/supabase';
import { optimizeImageBeforeUpload } from '../utils/imageOptimizer';
import { Review } from '../types';
import { fetchReviewsByCustomer, submitReview, deleteReview } from '../utils/reviewsHelper';
import { processBookingPoints } from '../utils/rewardsHelper';
import { submitSupportQuery, fetchSupportTickets, createSupportTicket } from '../utils/communicationHelper';
import { financeService } from '../utils/financeService';
import { User, KeyRound, MessageSquare, ShieldAlert, Search, Scissors, Mail, Calendar, Upload, Loader2, Save, CheckCircle,  Gift, Sparkles, Copy, Check, Star,  AlertCircle, X, Shield, Phone, Trash2, HelpCircle, Heart, UserCircle, ShoppingBag, Compass } from 'lucide-react';
import { toggleFavorite } from '../utils/marketingHelper';

export default function Account() {
  const { t } = useTranslation();
  const { user, profile, updateProfile, refreshProfile, loading: authLoading } = useAuth();

  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [glamzoPoints, setGlamzoPoints] = useState<number | null>(null);

  // Realtime subscription & initial fetch for wallet and points
  useEffect(() => {
    if (!user) return;

    const searchParams = new URLSearchParams(window.location.search);
    const statusParam = searchParams.get('status');
    if (statusParam === 'cancelled' || statusParam === 'success') {
      const handleCheckoutReturn = async () => {
        try {
          if (statusParam === 'cancelled') {
            const { data: recentBooking } = await supabase
              .from('bookings')
              .select('id, business_id')
              .eq('customer_id', user.id)
              .eq('booking_status', 'pending')
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
              
            if (recentBooking) {
              await supabase.from('bookings').update({ booking_status: 'cancelled' }).eq('id', recentBooking.id);
              
              const { data: recentCoupon } = await supabase
                .from('reward_coupons')
                .select('id, used_at')
                .eq('customer_id', user.id)
                .eq('used', true)
                .order('used_at', { ascending: false })
                .limit(1)
                .maybeSingle();
                
              if (recentCoupon && recentCoupon.used_at) {
                 const usedAt = new Date(recentCoupon.used_at).getTime();
                 if (Date.now() - usedAt < 30 * 60 * 1000) {
                   await supabase.from('reward_coupons').update({ used: false, used_at: null }).eq('id', recentCoupon.id);
                 }
              }
              toast.error("Pagamento cancelado. Reserva anulada e cupão devolvido.");
            }
          } else if (statusParam === 'success') {
             toast.success("Pagamento concluído com sucesso! A reserva está confirmada.");
          }
        } catch (e) {
           console.error(e);
        }
        window.history.replaceState({}, '', window.location.pathname);
      };
      handleCheckoutReturn();
    }

    const fetchBalances = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('glamzo_points, wallet_balance, affiliate_balance')
          .eq('id', user.id)
          .maybeSingle();
        
        if (data) {
          setGlamzoPoints(data.glamzo_points || 0);
          setWalletBalance(data.wallet_balance || data.affiliate_balance || 0);
        }
      } catch (err) {
        console.error('Error fetching balances:', err);
      }
    };

    fetchBalances();

    const channel = supabase.channel(`account_balances_${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          if (payload.new) {
            setGlamzoPoints(payload.new.glamzo_points || 0);
            setWalletBalance(payload.new.wallet_balance || payload.new.affiliate_balance || 0);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  
  // Tabs Navigation State
  const [isClubModalOpen, setIsClubModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('reservas');
  const [messageTab, setMessageTab] = useState<'mensagens' | 'disputas'>('mensagens');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingDisputes, setPendingDisputes] = useState(0);

  useEffect(() => {
    if (!user) return;
    
    const fetchCounts = async () => {
      const { count: msgCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);
        
      if (msgCount !== null) setUnreadMessages(msgCount);
      
      const { count: dispCount } = await supabase
        .from('disputes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'open');
        
      if (dispCount !== null) setPendingDisputes(dispCount);
    };
    
    fetchCounts();
    
    const channelMsg = supabase.channel('account_msg_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, () => fetchCounts())
      .subscribe();
      
    const channelDisp = supabase.channel('account_disp_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'disputes', filter: `user_id=eq.${user.id}` }, () => fetchCounts())
      .subscribe();
      
    return () => {
      supabase.removeChannel(channelMsg);
      supabase.removeChannel(channelDisp);
    };
  }, [user]);

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
    const [dateFilter, setDateFilter] = useState<'hoje'|'semana'|'mes'|'intervalo'|'todos'>('hoje');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
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
        user_id: user.id,
        business_id: disputeBooking.business_id,
        title: disputeReason,
        reason: `${disputeReason}\n${disputeDescription}`,
        status: 'open'
      });
      if (error) throw error;
      toast.success('Queixa registada com sucesso. A equipa vai analisar.');
      setDisputeReason('');
      setDisputeDescription('');
      setDisputeModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao abrir disputa');
    } finally {
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

  const currentPointsBalance = glamzoPoints !== null ? glamzoPoints : (profile?.glamzo_points || 0);
  const currentAffiliateBalance = walletBalance !== null ? walletBalance : (profile?.wallet_balance || profile?.affiliate_balance || 0);

  const handleRedeemPoints = async (pointsCost: number, voucherValue: number) => {
    setRedeemSuccess(null); setRedeemError(null);
    if (pointsCost !== 500 && pointsCost !== 1000) return;
    if (!user || !profile) return;
    
    if (currentPointsBalance < pointsCost) {
      setRedeemError("Pontos insuficientes para este voucher.");
      return;
    }

    try {
      const code = `GLAMZO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 6);

      const { error: coupErr } = await supabase.from('reward_coupons').insert({
        customer_id: user.id,
        code,
        value: voucherValue,
        expires_at: expiresAt.toISOString()
      });
      if (coupErr) throw coupErr;

      const newPoints = currentPointsBalance - pointsCost;
      const { error: updateErr } = await supabase.from('profiles').update({ glamzo_points: newPoints }).eq('id', user.id);
      if (updateErr) throw updateErr;

      setRedeemSuccess(`Sucesso! Código ${code} gerado. Válido para desconto de -${voucherValue}.00€.`);
      
      // Update local state to feel snappy
      setGlamzoPoints(newPoints);
      refreshProfile();
      loadUserRewards();
    } catch (err: any) {
      console.error("Erro ao gerar voucher:", err);
      setRedeemError("Ocorreu um erro ao gerar o cupão. Tente novamente.");
    }
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
  const [providers, setProviders] = useState<string[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{type: "error" | "success", text: string} | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.app_metadata?.providers) {
        setProviders(data.user.app_metadata.providers);
      }
    });
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "A password deve ter pelo menos 6 caracteres." });
      return;
    }
    setSavingPassword(true);
    setPasswordMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordMsg({ type: "success", text: "Password atualizada com sucesso." });
      setNewPassword("");
    } catch (err: any) {
      setPasswordMsg({ type: "error", text: err.message || "Erro ao atualizar password." });
    } finally {
      setSavingPassword(false);
    }
  };


  const fetchUserBookings = async () => {
    if (!user) return;
    setLoadingBookings(true); setBookingError(null);
    try {
      const { data, error } = await supabase.from('bookings').select(`*, service:services(id, name, price, duration_minutes, image_url), business:businesses(id, name, slug, phone, city, address), staff:staff(id, full_name, role_title)`).eq('customer_id', user.id).order('booking_date', { ascending: false }).order('start_time', { ascending: false });
      if (error) throw error;
      setBookings(data || []);
      // Auto-process points for fully completed bookings
      if (data) {
        data.forEach(b => processBookingPoints(b));
      }
    } catch (err: any) { setBookingError('Falha ao recuperar reservas.'); } finally { setLoadingBookings(false); }
  };



  

  const handleClientCompleteBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase.from('bookings').update({ booking_status: 'completed', business_completed: true, client_completed: true }).eq('id', bookingId);
      if (error) throw error;
      
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        await processBookingPoints({ ...booking, business_completed: true, client_completed: true });
      }
      
      setBookings(prev => {
        return prev.map(b => b.id === bookingId ? { ...b, client_completed: true, business_completed: true, booking_status: 'completed' } : b);
      });
      
      toast.success('Reserva concluída! Pontos creditados com sucesso (se aplicável).');
      // Refresh user profile to get updated points
      refreshProfile();
    } catch (err: any) {
      toast.error('Erro ao concluir reserva: ' + err.message);
    }
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
    if (profile) { 
      setFullName(profile.full_name || ''); 
      setAvatarUrl(profile.avatar_url || ''); 
      setPhone(profile.phone || ''); 
      setGlamzoPoints(profile.glamzo_points || 0);
      setWalletBalance(profile.wallet_balance || profile.affiliate_balance || 0);
    }
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
  if (!user) return <div className="max-w-md mx-auto my-12 p-6 bg-white border border-slate-100 rounded-2xl text-center shadow-sm"><ShieldAlert className="w-12 h-12 text-purple-600 mx-auto mb-4" /><h3 className="text-lg font-bold text-slate-800">{t('restricted_access') || 'Acesso Restrito'}</h3><a href="/login" className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700">{t('login') || 'Fazer Login'}</a></div>;


  const filteredBookings = bookings.filter(bk => {
    if (dateFilter === 'todos') return true;
    
    const bkDate = new Date(bk.booking_date);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (dateFilter === 'hoje') {
      const bDate = new Date(bkDate);
      bDate.setHours(0,0,0,0);
      return bDate.getTime() === today.getTime();
    }
    
    if (dateFilter === 'semana') {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return bkDate >= today && bkDate <= nextWeek;
    }
    
    if (dateFilter === 'mes') {
      return bkDate.getMonth() === today.getMonth() && bkDate.getFullYear() === today.getFullYear();
    }
    
    if (dateFilter === 'intervalo') {
      if (!customStartDate && !customEndDate) return true;
      let start = customStartDate ? new Date(customStartDate) : new Date(0);
      let end = customEndDate ? new Date(customEndDate) : new Date(8640000000000000);
      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999);
      const bDate = new Date(bkDate);
      return bDate >= start && bDate <= end;
    }
    return false;
  });

  return (
    <div id="account-view" className="min-h-[100dvh] bg-[#F8F9FC] font-sans pb-40 lg:pb-12">
      
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
          <button onClick={() => setIsClubModalOpen(true)} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center text-white hover:bg-white/20 transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95 group relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-400/10 to-amber-500/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
             <div className="flex items-center justify-center gap-2 text-amber-400 mb-1"><Sparkles className="w-4 h-4"/> <span className="text-xs font-bold uppercase tracking-widest">Glamzo Club</span></div>
             <span className="text-3xl font-black font-mono">{currentPointsBalance}</span>
             <span className="text-xs text-slate-300 block">{t('manage_points') || 'Gerir Pontos e Saldo'}  <span className="inline-block transition-transform group-hover:translate-x-1">→</span></span>
          </button>
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
          ].map(tab => {
            const hasNotification = tab.id === 'apoio' && (unreadMessages > 0 || pendingDisputes > 0);
            return (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as 'reservas' | 'apoio' | 'perfil' | 'recompensas' | 'favoritos')} 
              className={`relative flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex-1 justify-center ${activeTab === tab.id ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <div className="relative">
                <tab.icon className="w-4 h-4" />
                {hasNotification && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                )}
              </div>
              {tab.label}
            </button>
          )})}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: RESERVAS */}
        {/* ========================================================= */}
        {activeTab === 'reservas' && (
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 md:p-8 relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-100 to-transparent opacity-50 blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{t('booking_history') || 'Histórico de Reservas'}</h3>
                <p className="text-sm text-slate-500 font-medium">{t('booking_history_desc') || 'As suas marcações ativas e passadas.'}</p>
              </div>
            </div>


            {/* Filtro de Reservas */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <button 
                onClick={() => setDateFilter('todos')} 
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${dateFilter === 'todos' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Todas
              </button>
              <button 
                onClick={() => setDateFilter('hoje')} 
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${dateFilter === 'hoje' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Hoje
              </button>
              <button 
                onClick={() => setDateFilter('semana')} 
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${dateFilter === 'semana' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Esta Semana
              </button>
              <button 
                onClick={() => setDateFilter('mes')} 
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${dateFilter === 'mes' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Este Mês
              </button>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setDateFilter('intervalo')} 
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${dateFilter === 'intervalo' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Data Específica
                </button>
                {dateFilter === 'intervalo' && (
                  <div className="flex items-center gap-2">
                    <input 
                      type="date" 
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-700 outline-none focus:border-purple-500 bg-white"
                    />
                    <span className="text-slate-400 text-xs font-bold">até</span>
                    <input 
                      type="date" 
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-700 outline-none focus:border-purple-500 bg-white"
                    />
                  </div>
                )}
              </div>
            </div>

            {loadingBookings ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-16 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-slate-800 mb-2">{t('no_bookings') || 'Nenhuma marcação'}</h4>
                <p className="text-slate-500 mb-6 text-sm">{t('no_bookings_desc') || 'Ainda não fez nenhuma reserva no Glamzo.'}</p>
                <a href="/explore" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg transition-all"><Search className="w-4 h-4" /> Explorar Salões</a>
              </div>
            ) : (
              <div className="space-y-4 relative z-10">
                {(showAllBookings ? filteredBookings : filteredBookings.slice(0, 5)).map(bk => {
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
                          <a href={`/${bk.business?.slug || ''}`} className="flex-1 md:flex-none px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-colors text-center">{t('view_store') || 'Ver Loja'}</a>
                          
                          
                          {bk.booking_status === 'completed' &&  (
                            <button onClick={() => handleOpenDispute(bk)} className="flex-1 md:flex-none px-4 py-2 border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all">{t('open_dispute') || 'Abrir Disputa'}</button>
                          )}
                          
                          {bk.booking_status === 'completed' && !userReviews.some(r => r.booking_id === bk.id) && (
                            <button onClick={() => handleOpenReviewModal(bk)} className="flex-1 md:flex-none px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-xs transition-colors border border-purple-200">{t('rate') || 'Avaliar'}</button>
                          )}
                          
                          {(bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && (
                            <button onClick={() => handleCancelBooking(bk.id)} className="flex-1 md:flex-none px-4 py-2 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 font-bold rounded-xl text-xs transition-colors">{t('cancel') || 'Cancelar'}</button>
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
            <h3 className="text-xl font-black text-slate-900 mb-6">{t('support_center') || 'Centro de Apoio'}</h3>
            <div className="flex overflow-x-auto no-scrollbar gap-4 mb-4 pb-2">
              <button 
                onClick={() => setMessageTab('mensagens')} 
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${messageTab === 'mensagens' ? 'bg-purple-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <MessageSquare className="w-4 h-4" /> 
                Mensagens
                {unreadMessages > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{unreadMessages}</span>
                )}
              </button>
              <button 
                onClick={() => setMessageTab('disputas')} 
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${messageTab === 'disputas' ? 'bg-rose-500 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <ShieldAlert className="w-4 h-4" /> 
                Disputas
                {pendingDisputes > 0 && (
                  <span className="bg-white text-rose-600 text-[10px] px-2 py-0.5 rounded-full">{pendingDisputes}</span>
                )}
              </button>
            </div>
            
            <div className="flex-1 w-full relative bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
              {messageTab === 'mensagens' && <UniversalInbox myId={user.id} myType="customer" />}
              {messageTab === 'disputas' && <UniversalDisputes myId={user.id} myType="customer" />}
            </div>
          </div>
        )}

        {/* 2. ABA DE PERFIL */}
        {activeTab === 'perfil' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/60 animate-fade-in">
            <h3 className="text-xl font-black text-slate-900 mb-6">{t('edit_personal_data') || 'Editar Dados Pessoais'}</h3>
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
            
            <div className="mt-12 pt-8 border-t border-slate-200/60">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><KeyRound className="w-5 h-5 text-purple-600" /> Segurança e Autenticação</h3>
              {providers.includes('google') ? (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-bold text-purple-800">A sua conta é gerida de forma segura pelo Google.</span>
                </div>
              ) : (
                <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-sm">
                  {passwordMsg && (
                    <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${passwordMsg.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {passwordMsg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      {passwordMsg.text}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nova Password</label>
                    <input type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-50 focus:bg-white transition-all font-medium text-slate-900" placeholder="••••••••" />
                  </div>
                  <button type="submit" disabled={savingPassword} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-md">
                    {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Atualizar Password
                  </button>
                </form>
              )}
            </div>
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
                  <a href="/explore" className="px-6 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold inline-block hover:bg-purple-700">{t('explore_salons') || 'Explorar Salões'}</a>
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
                          <button onClick={() => handleRemoveFavorite(biz.id)} className="text-[10px] font-bold bg-rose-50 hover:bg-rose-500 hover:text-white transition-colors text-rose-600 px-3 py-1.5 rounded-lg">{t('remove') || 'Remover'}</button>
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

            <GlamzoClubModal 
              isOpen={isClubModalOpen} 
              onClose={() => setIsClubModalOpen(false)} 
              user={user} 
              profile={profile}
              currentPoints={currentPointsBalance}
              currentBalance={currentAffiliateBalance}
              onPointsUpdate={() => { loadUserRewards(); refreshProfile(); }} 
            />
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
          
        ].map(tab => {
          const hasNotification = tab.id === 'apoio' && (unreadMessages > 0 || pendingDisputes > 0);
          return (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center p-2 flex-1 relative"
          >
            <div className="relative">
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-purple-600' : 'text-slate-400'}`} />
              {hasNotification && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
              )}
            </div>
            <span className={`text-[10px] font-bold mt-1 ${activeTab === tab.id ? 'text-purple-600' : 'text-slate-500'}`}>{tab.label}</span>
          </button>
        )})}
        
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
