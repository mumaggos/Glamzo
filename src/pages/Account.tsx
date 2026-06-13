import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { optimizeImageBeforeUpload } from '../utils/imageOptimizer';
import { Review } from '../types';
import { fetchReviewsByCustomer, submitReview, deleteReview } from '../utils/reviewsHelper';
import { submitSupportQuery, fetchSupportTickets, createSupportTicket } from '../utils/communicationHelper';
import { financeService } from '../utils/financeService';
import { User, Mail, Calendar, Upload, Loader2, Link, Save, CheckCircle, ShieldAlert, Gift, Sparkles, Copy, Check, Star, MessageSquare, AlertCircle, X, Shield, Phone, Trash2, HelpCircle, Heart } from 'lucide-react';
import { toggleFavorite } from '../utils/marketingHelper';

export default function Account() {
  const { user, profile, updateProfile, loading: authLoading } = useAuth();

  // Favorites management state
  const [favoriteBusinesses, setFavoriteBusinesses] = useState<any[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  const fetchUserFavoritesList = async () => {
    if (!user) return;
    setLoadingFavorites(true);
    try {
      const { data: favIds, error: favErr } = await supabase
        .from('favorites')
        .select('business_id')
        .eq('customer_id', user.id);
      
      let ids: string[] = [];
      if (!favErr && favIds && favIds.length > 0) {
        ids = favIds.map((f: any) => f.business_id);
      } else {
        try {
          const stored = JSON.parse(localStorage.getItem(`glamzo_customer_favorites_${user.id}`) || '[]');
          ids = stored;
        } catch (_) {}
      }

      if (ids.length === 0) {
        setFavoriteBusinesses([]);
        return;
      }

      const { data: bizData, error: bizErr } = await supabase
        .from('businesses')
        .select('*')
        .in('id', ids);

      if (bizErr) throw bizErr;
      setFavoriteBusinesses(bizData || []);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoadingFavorites(false);
    }
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

  // Bookings engine integration state
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  
  // Loyalty and Rewards list states
  const [rewardsList, setRewardsList] = useState<any[]>([]);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  // Load rewards from localStorage on mount/user change
  const loadUserRewards = () => {
    if (!user) return;
    try {
      const stored = JSON.parse(localStorage.getItem(`glamzo_rewards_${user.id}`) || '[]');
      setRewardsList(stored);
    } catch (_) {}
  };

  // Real Reviews state
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Dispute Filing Modal state
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeBooking, setDisputeBooking] = useState<any | null>(null);
  const [disputeReason, setDisputeReason] = useState('Serviço não condizente com a descrição');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  const handleOpenDispute = (bk: any) => {
    setDisputeBooking(bk);
    setDisputeReason('Qualidade do serviço insatisfatória');
    setDisputeDescription('');
    setDisputeModalOpen(true);
  };

  const handleSubmitDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !disputeBooking) return;
    setSubmittingDispute(true);

    const clientName = profile?.full_name || user.email?.split('@')[0] || 'Cliente Glamzo';
    financeService.openDispute(
      disputeBooking.id,
      disputeBooking.business_id,
      disputeBooking.business?.name || 'Salão de Beleza',
      user.id,
      clientName,
      'customer',
      disputeReason,
      disputeDescription
    );

    setRedeemSuccess(`🚨 Reclamação registada com sucesso! A equipa Glamzo abriu uma disputa formal para a marcação. O reembolso do Stripe será analisado em 24h.`);
    setDisputeModalOpen(false);
    setSubmittingDispute(false);
  };

  // Review submission modal states
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadUserReviews = async () => {
    if (!user?.id) return;
    setLoadingReviews(true);
    try {
      const revs = await fetchReviewsByCustomer(user.id);
      setUserReviews(revs || []);
    } catch (err) {
      console.error('Error fetching user reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Support state managers
  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [supportInput, setSupportInput] = useState('');
  const [sendingSupport, setSendingSupport] = useState(false);
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [successTicketMsg, setSuccessTicketMsg] = useState<string | null>(null);

  const loadTickets = async () => {
    if (!user) return;
    try {
      const tickets = await fetchSupportTickets();
      setUserTickets(tickets.filter((t: any) => t.customer_id === user.id));
    } catch (_) {}
  };

  const handleSendSupportMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportInput.trim() || !user) return;
    const text = supportInput.trim();
    setSupportInput('');
    setSendingSupport(true);
    try {
      const nameOfUser = profile?.full_name || user.email?.split('@')[0] || 'Cliente Glamzo';
      const resMsgs = await submitSupportQuery(user.id, nameOfUser, text);
      setSupportMessages(resMsgs);
      await loadTickets();
    } catch (err) {
      console.error(err);
    } finally {
      setSendingSupport(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserRewards();
      loadUserReviews();
      loadTickets();
      fetchUserFavoritesList();
    }
  }, [user]);

  useEffect(() => {
    // Scroll to favorites section if tab parameter is specified
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'favorites') {
      setTimeout(() => {
        const target = document.getElementById('meus-favoritos');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.classList.add('ring-4', 'ring-rose-500/30', 'transition-all', 'duration-500');
          setTimeout(() => {
            target.classList.remove('ring-4', 'ring-rose-500/30');
          }, 4000);
        }
      }, 500);
    }
  }, [favoriteBusinesses]);

  // Synchronized Loyalty points using financeService
  const currentPointsBalance = financeService.getCustomerPoints(user?.id || 'default');

  const handleRedeemPoints = (pointsCost: number, voucherValue: number) => {
    setRedeemSuccess(null);
    setRedeemError(null);

    if (pointsCost !== 500 && pointsCost !== 1000) return;

    const result = financeService.redeemPointsForCoupon(user!.id, pointsCost);
    if (typeof result === 'string') {
      setRedeemError(result);
    } else {
      setRedeemSuccess(`Sucesso! Código de Desconto fidelidade ${result.code} gerado. Utilize-o no checkout de qualquer salão para descontar -${voucherValue}.00€.`);
      loadUserRewards();
    }
  };

  const handleOpenReviewModal = (bk: any) => {
    setReviewBooking(bk);
    setReviewRating(5);
    setReviewComment('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reviewBooking) return;
    setSubmittingReview(true);
    try {
      const authorName = profile?.full_name || user.email?.split('@')[0] || 'Cliente Glamzo';
      await submitReview({
        booking_id: reviewBooking.id,
        business_id: reviewBooking.business_id,
        customer_id: user.id,
        customer_name: authorName,
        rating: reviewRating,
        comment: reviewComment,
        service_id: reviewBooking.service_id,
        service_name: reviewBooking.service?.name || 'Serviço'
      });
      
      // No longer giving points on comment submission
      setRedeemSuccess("Obrigado pelo seu comentário! A sua avaliação foi guardada com sucesso.");
      setReviewModalOpen(false);
      setReviewComment('');
      setReviewRating(5);
      
      // Reload reviews
      await loadUserReviews();
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Tem a certeza que deseja eliminar esta avaliação de forma permanente?')) {
      return;
    }
    setLoadingReviews(true);
    try {
      const success = await deleteReview(reviewId);
      if (success) {
        setRedeemSuccess('Avaliação eliminada com sucesso!');
        await loadUserReviews();
      } else {
        setRedeemError('Não foi possível eliminar a avaliação.');
      }
    } catch (err: any) {
      console.error('Error deleting review:', err);
      setRedeemError('Ocorreu um erro ao eliminar a avaliação.');
    } finally {
      setLoadingReviews(false);
    }
  };

  // Status states
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchUserBookings = async () => {
    if (!user) return;
    setLoadingBookings(true);
    setBookingError(null);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(id, name, price, duration_minutes, image_url),
          business:businesses(id, name, slug, phone, city, address),
          staff:staff(id, full_name, role_title)
        `)
        .eq('customer_id', user.id)
        .order('booking_date', { ascending: false })
        .order('start_time', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err: any) {
      console.error('Error fetching customer bookings:', err);
      setBookingError(err.message || 'Falha ao recuperar suas reservas reais.');
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Certeza de que deseja cancelar esta marcação de horário?')) {
      return;
    }
    setBookingError(null);
    setBookingSuccess(null);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ booking_status: 'cancelled' })
        .eq('id', bookingId)
        .eq('customer_id', user!.id);

      if (error) throw error;
      setBookingSuccess('Marcação cancelada com sucesso! O horário correspondente foi libertado na agenda.');
      await fetchUserBookings();
    } catch (err: any) {
      console.error('Cancel booking error:', err);
      setBookingError(err.message || 'Erro ao cancelar a sua reserva.');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm('Tem a certeza de que deseja apagar esta reserva concluída ou cancelada do seu histórico?')) {
      return;
    }
    setBookingError(null);
    setBookingSuccess(null);
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)
        .eq('customer_id', user!.id);

      if (error) throw error;
      setBookingSuccess('Reserva eliminada com sucesso do seu histórico!');
      await fetchUserBookings();
    } catch (err: any) {
      console.error('Delete booking error:', err);
      setBookingError(err.message || 'Erro ao eliminar a reserva.');
    }
  };

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url || '');
      setPhone(profile.phone || '');
    }
    if (user) {
      setEmail(user.email || '');
    }
  }, [profile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Update profile record in business db profiles table
      await updateProfile(fullName, avatarUrl || null, phone || null, email || null);
      
      // Update authenticated user email in supabase if edited
      if (user && email !== user.email) {
        const { error: authEmailErr } = await supabase.auth.updateUser({ email });
        if (authEmailErr) {
          console.warn('Auth email upgrade warning:', authEmailErr.message);
        }
      }
      setSuccessMsg('Seu perfil foi atualizado com sucesso na base de dados!');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao salvar alterações.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Direct WebP browser-side optimization & compression
      const optimized = await optimizeImageBeforeUpload(file);
      const filePath = `avatars/${user.id}-${Date.now()}.webp`;

      // Upload file directly to 'avatars' Supabase Bucket with Cache-Control headers
      const { data, error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(filePath, optimized.blob, {
          cacheControl: 'public, max-age=31536000, stale-while-revalidate=86400, immutable',
          contentType: 'image/webp',
          upsert: true,
        });

      if (uploadErr) {
        throw new Error(
          `${uploadErr.message}. Certifique-se de que criou um bucket público chamado "avatars" nas configurações do seu Supabase Storage.`
        );
      }

      // Retrieve public URL from storage
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      
      // Update metadata
      await updateProfile(fullName, publicUrl);
      setSuccessMsg('Foto de perfil carregada e salva com sucesso!');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Falha ao processar arquivo no Supabase Storage.');
    } finally {
      setUploading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white border border-slate-100 rounded-2xl text-center shadow-sm">
        <ShieldAlert className="w-12 h-12 text-purple-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800">Acesso Restrito</h3>
        <p className="text-sm text-slate-500 mt-2">Você precisa estar autenticado para visualizar esta página.</p>
        <a href="/login" className="inline-block mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors">
          Fazer Login Real
        </a>
      </div>
    );
  }

  return (
    <div id="account-view" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans font-medium text-slate-800">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Minha Conta</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie os seus agendamentos e dados de cadastro com o padrão do site principal.</p>
        </div>
        <div className="flex gap-2">
          {profile?.role === 'business' && (
            <a href="/dashboard" className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[11px] font-bold transition-all shadow-sm">
              🏢 Gerir Loja / Dashboard
            </a>
          )}
          <a href="/explore" className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-purple-650 hover:bg-purple-750 text-white rounded-2xl text-[11px] font-bold transition-all shadow-sm">
            📍 Pesquisar Salões
          </a>
        </div>
      </div>

      {/* Bookings Engine Manager Section - FIRST */}
      <div className="mb-12 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-lg font-black text-gray-950">Histórico de Pedidos & Reservas</h3>
            <p className="text-xs text-slate-500 mt-0.5">Consulte e acompanhe o estado real de todos os seus pedidos de agendamento e histórico.</p>
          </div>
          <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full font-mono text-xs font-bold font-extrabold select-none">
            {bookings.length} {bookings.length === 1 ? 'marcação' : 'marcações'}
          </span>
        </div>

        {bookingSuccess && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{bookingSuccess}</span>
          </div>
        )}

        {bookingError && (
          <div className="mb-4 p-4 bg-purple-50 border border-purple-100 text-purple-800 rounded-2xl text-xs font-semibold">
            {bookingError}
          </div>
        )}

        {loadingBookings ? (
          <div className="py-12 text-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
            <p className="text-xs text-slate-400 font-mono">Carregando seus agendamentos reais em tempo de execução...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-50 rounded-2xl text-purple-600">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Você ainda não possui reservas.</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Explore os estabelecimentos no marketplace digital Glamzo, selecione um serviço com profissionais qualificados e marque o seu horário real!
            </p>
            <a href="/explore" className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer mt-2 text-center">
              Explorar Salões & Estúdios
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="pb-3.5 pl-2">Salão / Estabelecimento</th>
                  <th className="pb-3.5">Serviço Adquirido</th>
                  <th className="pb-3.5">Data & Hora</th>
                  <th className="pb-3.5">Profissional</th>
                  <th className="pb-3.5 text-right font-mono">Preço</th>
                  <th className="pb-3.5 text-center">Estado</th>
                  <th className="pb-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-705">
                {bookings.map((bk) => {
                  const bookingDateFormatted = new Date(bk.booking_date + 'T00:00:00').toLocaleDateString('pt-PT', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  // Format status pills
                  let statusBg = 'bg-amber-50 text-amber-700 border-amber-100';
                  let statusText = 'Pendente';
                  if (bk.booking_status === 'confirmed') {
                    statusBg = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                    statusText = 'Confirmada';
                  } else if (bk.booking_status === 'completed') {
                    statusBg = 'bg-slate-100 text-slate-600 border-slate-200';
                    statusText = 'Concluída';
                  } else if (bk.booking_status === 'cancelled') {
                    statusBg = 'bg-purple-50 text-purple-700 border-purple-150';
                    statusText = 'Cancelada';
                  } else if (bk.booking_status === 'no_show') {
                    statusBg = 'bg-purple-50 text-purple-700 border-purple-100';
                    statusText = 'Falta (No-show)';
                  }

                  return (
                    <tr key={bk.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Business */}
                      <td className="py-4 pl-2">
                        <div className="font-bold text-slate-850">{bk.business?.name || 'Estabelecimento Excluído'}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>📍 {bk.business?.city || 'Localidade'}</span>
                          <span>•</span>
                          <span>📞 {bk.business?.phone || ''}</span>
                        </div>
                      </td>

                      {/* Service */}
                      <td className="py-4">
                        <span className="font-semibold text-slate-700">{bk.service?.name || 'Serviço Excluído'}</span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">⏱ {bk.service?.duration_minutes || '0'} min</div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-4">
                        <div className="font-bold text-slate-800">{bookingDateFormatted}</div>
                        <div className="text-[10px] font-mono font-bold text-purple-600 mt-0.5">⏱ {bk.start_time} - {bk.end_time}</div>
                      </td>

                      {/* Professional */}
                      <td className="py-4">
                        <span className="text-slate-600">{bk.staff?.full_name || 'Qualquer profissional'}</span>
                        {bk.staff?.role_title && (
                          <div className="text-[10px] text-slate-400">{bk.staff.role_title}</div>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-4 text-right font-mono font-bold text-slate-850">
                        {bk.total_price ? Number(bk.total_price).toFixed(2) : '0.00'} €
                      </td>

                      {/* Status */}
                      <td className="py-4 text-center">
                        <span className={`inline-block px-2 py-0.5 border rounded-full text-[10px] font-bold leading-none ${statusBg}`}>
                          {statusText}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 text-right flex items-center justify-end gap-1 px-1">
                        {bk.booking_status === 'completed' && (
                          userReviews.some(r => r.booking_id === bk.id) ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-full select-none">
                              ✓ Avaliado
                            </span>
                          ) : (
                            <button
                              onClick={() => handleOpenReviewModal(bk)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold cursor-pointer transition-colors border border-emerald-100"
                            >
                              Avaliar
                            </button>
                          )
                        )}

                        {bk.booking_status !== 'cancelled' && bk.booking_status !== 'no_show' && (
                          <button
                            onClick={() => handleOpenDispute(bk)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                            title="Reportar problema ou abrir disputa"
                          >
                            ⚠️ Disputa
                          </button>
                        )}

                        {bk.booking_status !== 'cancelled' && bk.booking_status !== 'no_show' && bk.booking_status !== 'completed' && (
                          <button
                            onClick={() => handleCancelBooking(bk.id)}
                            className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg text-[10px] font-bold cursor-pointer transition-colors border border-purple-100"
                          >
                            Cancelar
                          </button>
                        )}

                        {(bk.booking_status === 'completed' || bk.booking_status === 'cancelled' || bk.booking_status === 'no_show') && (
                          <button
                            onClick={() => handleDeleteBooking(bk.id)}
                            className="px-2 py-1 bg-slate-50 hover:bg-purple-50 text-slate-500 hover:text-purple-600 rounded-lg text-[10px] font-bold cursor-pointer transition-colors border border-slate-200 hover:border-purple-100"
                            title="Apagar esta reserva do histórico"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left column: Quick details and avatar update */}
        <div className="bg-white p-6 border border-slate-100 rounded-2xl shadow-sm text-center flex flex-col items-center">
          
          <div className="relative group w-24 h-24 mb-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-2 border-purple-100"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center">
                <User className="w-10 h-10" />
              </div>
            )}
            
            {/* Supabase Storage file input overlay trigger */}
            <label className="absolute bottom-0 right-0 p-1.5 bg-slate-900 text-white text-xs rounded-full cursor-pointer hover:bg-slate-800 transition-all border border-white flex items-center justify-center shadow">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          <p className="text-xs text-slate-400 mb-4 font-mono leading-relaxed">
            Clique na câmera para fazer upload real via Supabase Storage.
          </p>

          <div className="w-full border-t border-slate-100 pt-4 text-left space-y-3.5">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">E-mail de Login</span>
              <div className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{user.email}</span>
              </div>
            </div>

            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Nível de Conta (Role)</span>
              <span className="bg-purple-50 text-purple-850 text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border border-purple-100 inline-block mt-1">
                {profile?.role || 'customer'}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Pontuação Glamzo</span>
              <span className="bg-purple-50 text-purple-750 text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full border border-purple-100 inline-block mt-1 animate-pulse">
                ⭐ {currentPointsBalance} PONTOS
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Membro desde</span>
              <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Profile Details */}
        <div className="md:col-span-2 bg-white p-6 sm:p-8 border border-slate-100 rounded-2xl shadow-sm text-left">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-50 pb-3">Dados Cadastrais</h3>

          {errorMsg && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold leading-normal">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold leading-normal flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Full Name input */}
            <div>
              <label htmlFor="edit-name-field" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Nome completo
              </label>
              <input
                id="edit-name-field"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800"
                placeholder="Seu nome completo"
              />
            </div>

            {/* E-mail de Contacto */}
            <div>
              <label htmlFor="edit-email-field" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                E-mail de Contacto
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="edit-email-field"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800"
                  placeholder="exemplo@dominio.com"
                />
              </div>
            </div>

            {/* Número de Telefone */}
            <div>
              <label htmlFor="edit-phone-field" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Número de Telemóvel / Telefone
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="edit-phone-field"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 font-mono"
                  placeholder="Ex: 912345678"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all disabled:opacity-50 cursor-pointer"
                id="btn-save-profile"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Salvar Alterações</span>
              </button>
            </div>

          </form>
        </div>

      </div>

      {/* ========== CLUB DE FIDELIZAÇÃO & RECOMPENSAS GLAMZO (FASE 10) ========== */}
      <div className="mt-12 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm text-left">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-5 border-b border-slate-100 mb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-100 rounded-full text-xs font-semibold text-purple-600 mb-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Glamzo VIP Loyalty Club</span>
            </div>
            <h3 className="text-xl font-black text-slate-800">Clube de Fidelidade & Recompensa</h3>
            <p className="text-xs text-slate-400 mt-0.5">Acumule pontos em cada reserva paga online diretamente na aplicação e converta-os em vouchers de desconto!</p>
          </div>
          
          <div className="bg-slate-900 text-white rounded-2xl px-5 py-4 flex items-center gap-4 shrink-0 shadow">
            <div className="w-10 h-10 bg-slate-800 text-amber-500 rounded-xl flex items-center justify-center">
              <Gift className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="block text-[9px] font-mono text-slate-400 uppercase font-black leading-none">Teu Saldo de Pontos</span>
              <span className="text-xl font-black text-white mt-1.5 block font-mono">{currentPointsBalance} PTS</span>
            </div>
          </div>
        </div>

        {redeemSuccess && (
          <div className="mb-5 p-4 bg-emerald-55 bg-emerald-50 border border-emerald-100 text-emerald-855 text-emerald-800 rounded-2xl text-xs font-bold leading-relaxed">
            {redeemSuccess}
          </div>
        )}

        {redeemError && (
          <div className="mb-5 p-4 bg-purple-50 border border-purple-100 text-purple-800 rounded-2xl text-xs font-bold font-mono">
            {redeemError}
          </div>
        )}

        {/* Reward conversion rules grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-8">
          
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4">
            <h4 className="font-extrabold text-sm text-slate-800">Trocar Pontos por Vouchers Recompensa</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              A cada 100 pontos terá direito a 1.00 € de desconto real. Troque os seus pontos acumulados e receba um código único de uso imediato e exclusivo!
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => handleRedeemPoints(500, 5)}
                disabled={currentPointsBalance < 500}
                className="flex-1 bg-slate-900 border border-transparent hover:bg-purple-750 hover:bg-purple-700 disabled:opacity-45 text-white py-3 px-4 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer text-center"
              >
                Resgatar 5.00€ <span className="block text-[9px] font-mono font-normal text-slate-350 tracking-wider mt-0.5">(Custo: 500 Pontos)</span>
              </button>

              <button
                onClick={() => handleRedeemPoints(1000, 10)}
                disabled={currentPointsBalance < 1000}
                className="flex-grow bg-purple-600 border border-transparent hover:bg-purple-700 disabled:opacity-45 text-white py-3 px-4 rounded-xl text-xs font-extrabold tracking-wide transition-all cursor-pointer text-center"
              >
                Resgatar 10.00€ <span className="block text-[9px] font-mono font-normal text-purple-200 tracking-wider mt-0.5">(Custo: 1000 Pontos)</span>
              </button>
            </div>

            {/* Informação sobre como obter pontos de fidelidade reais */}
            <div className="border-t border-slate-200 pt-4">
              <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-widest leading-none">Como Ganhar Pontos</span>
              <p className="text-[10px] text-slate-500 font-sans mt-1.5 leading-relaxed">
                Ganhe <strong className="text-slate-700">1 ponto por cada 1€ gasto</strong> em reservas pagas online diretamente na aplicação. Pagamentos efetuados nas lojas parceiras não acumulam pontos.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4">
            <h4 className="font-extrabold text-sm text-slate-800">Meus Códigos de Recompensa Ativos</h4>
            <p className="text-xs text-slate-500 leading-normal font-medium">
              Vouchers gerados via resgate de pontos associados à sua conta. Copie-os e insira no campo "Código Promocional" no checkout da sua reserva!
            </p>

            <div className="space-y-3 max-h-[220px] overflow-y-auto scrollbar-thin">
              {rewardsList.map((rw, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-150 gap-2 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono bg-purple-50 border border-purple-200 px-2 py-0.5 rounded text-[10px] text-purple-700 font-black tracking-wide select-all">
                        {rw.code}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(rw.code);
                          alert("Código copiado para a Área de Transferência!");
                        }}
                        className="text-slate-400 hover:text-slate-600 transition"
                        title="Copiar código"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium block mt-1 leading-none">
                      Desconto de {rw.value}.00 € • Expira em {new Date(rw.expires_at).toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                  
                  <span className={`px-2 py-0.5 border rounded-full text-[9px] font-mono font-bold uppercase self-start sm:self-auto ${
                    rw.used 
                      ? 'bg-slate-100 text-slate-400 border-slate-200' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {rw.used ? 'Utilizado' : 'Ativo'}
                  </span>
                </div>
              ))}

              {rewardsList.length === 0 && (
                <p className="text-[10px] text-slate-400 font-mono text-center py-6">Não possui nenhum código de recompensa ativo no momento.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========== MEUS COMENTÁRIOS E AVALIAÇÕES ========== */}
      <div className="mt-8 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm text-left">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-5 h-5 text-purple-600 animate-bounce" />
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Meus Comentários Realistas</h3>
        </div>
        <p className="text-xs text-slate-400">As avaliações e classificações de serviços que submeteu diretamente para os salões de beleza.</p>
        
        <div className="mt-6 space-y-4 max-h-[300px] overflow-y-auto scrollbar-thin">
          {userReviews.length > 0 ? (
            userReviews.map((rev) => (
              <div key={rev.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800 text-sm">
                      {rev.service_name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(rev.created_at).toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-1.5 leading-relaxed text-xs">
                    "{rev.comment || 'Sem comentário escrito, apenas pontuação.'}"
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0 justify-end">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-205 text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    className="p-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 hover:border-rose-200 text-rose-600 rounded-xl transition-all flex items-center gap-1 cursor-pointer font-semibold hover:scale-[1.02]"
                    title="Apagar Avaliação"
                    aria-label="Apagar Avaliação"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline text-[10px]">Apagar</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-mono">Ainda não escreveu nenhum comentário. Conclua marcações para poder avaliar os serviços!</p>
            </div>
          )}
        </div>
      </div>

      {/* ========== GLAMZO CUSTOMER SUPPORT & FAQ SEGMENT ========== */}
      <div id="customer-support-faq" className="mt-12 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm text-left">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-5 border-b border-slate-100 mb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-100 rounded-full text-xs font-semibold text-purple-600 mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Glamzo Apoio Técnico</span>
            </div>
            <h3 className="text-xl font-black text-slate-800">Ajuda & Contacto</h3>
            <p className="text-xs text-slate-400 mt-0.5">Esclareça as suas dúvidas de imediato ou submeta pedidos de intervenção humana.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FAQ Accordion list */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <span>Perguntas Frequentes (FAQ)</span>
            </h4>
            <div className="space-y-3">
              {[
                {
                  q: "Como posso remarcar ou cancelar o meu agendamento?",
                  a: "Pode cancelar ou remarcar na sua conta até 24h antes sem custos. Se faltar menos de 24h, o cancelamento ou reembolso fica sujeito aos termos e condições do próprio estabelecimento. Utilize a tabela de reservas acima para solicitar cancelamentos."
                },
                {
                  q: "Quais são as plataformas de pagamento e cartões aceites?",
                  a: "Todos os pagamentos integrados no checkout digital são processados de forma encriptada através do Stripe, líder mundial de transação online. Aceitamos cartões de crédito e débito (Visa, Mastercard), além de opções dinâmicas como Apple Pay e MB Way."
                },
                {
                  q: "Como funciona o reembolso das minhas marcações?",
                  a: "Em caso de cancelamento elegível no prazo, o estorno na conta bancária do seu cartão de crédito é processado de forma autónoma e automática pela central do Stripe num prazo de 3 a 5 dias úteis."
                },
                {
                  q: "Acumulação de descontos virtuais com o Clube VIP?",
                  a: "Ganha 1 ponto por cada 1€ de consumo real e verificado nas lojas do ecossistema Glamzo. Ao acumular saldo de fidelização suficiente, pode trocá-los aqui por vales promocionais de 5€ ou 10€ de redução direta na sua próxima reserva."
                }
              ].map((faq, idx) => (
                <details key={idx} className="group bg-slate-50 border border-slate-100 rounded-2xl p-4 transition-all duration-300 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between cursor-pointer focus:outline-none select-none">
                    <span className="text-xs font-bold text-slate-700">{faq.q}</span>
                    <span className="shrink-0 transition duration-300 group-open:-rotate-180 text-slate-400">
                      ▼
                    </span>
                  </summary>
                  <p className="mt-2.5 text-xs text-slate-500 leading-relaxed font-sans">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>

          {/* Instant contact methods and Chat Form */}
          <div className="bg-slate-50 border border-slate-150 p-6 rounded-3xl space-y-5">
            <div>
              <h4 className="font-extrabold text-sm text-slate-800">Canal de Atendimento Oferecido</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Tem alguma dúvida ou precisa de suporte com a sua conta? Contacte-nos diretamente por qualquer um dos meios oficiais listados abaixo.
              </p>
            </div>

            {/* Direct WhatsApp Callout */}
            <div className="space-y-3">
              <a 
                href="https://wa.me/351912345678"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-sm shadow-emerald-500/10"
              >
                <Phone className="w-4 h-4 text-white" />
                <span className="text-white">Conversar via WhatsApp</span>
              </a>

              <a 
                href="mailto:glamzo.suporte@gmail.com"
                className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer shadow-xs"
              >
                <Mail className="w-4 h-4 text-slate-500" />
                <span>Enviar E-mail Oficial</span>
              </a>
            </div>

            {/* Direct message ticket creation */}
            <div className="border-t border-slate-200/60 pt-4 space-y-3">
              <h5 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest">Enviar Mensagem Direta</h5>
              <form onSubmit={handleSendSupportMessage} className="space-y-2">
                <textarea
                  value={supportInput}
                  onChange={(e) => setSupportInput(e.target.value)}
                  required
                  rows={3}
                  placeholder="Descreva a sua situação detalhadamente..."
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 text-xs rounded-xl focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-550 resize-none font-sans"
                />
                <button
                  type="submit"
                  disabled={sendingSupport}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {sendingSupport ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Enviar Pedido de Suporte</span>
                </button>
              </form>
            </div>

            {/* Real Tickets history */}
            {userTickets.length > 0 && (
              <div className="border-t border-slate-200/60 pt-4 space-y-2.5">
                <h5 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest">Os Seus Pedidos Realizados</h5>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {userTickets.map((tk) => (
                    <div key={tk.id} className="bg-white border p-3 rounded-xl space-y-1.5 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-slate-400 text-[10px]">#{tk.id.substring(0,6)}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-bold ${
                          tk.status === 'resolved' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-800'
                        }`}>{tk.status}</span>
                      </div>
                      <p className="text-slate-700 leading-normal line-clamp-2">{tk.subject || tk.chat_history?.substring(0, 100) || 'Mensagem enviada'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ========== INTERACTIVE REVIEW SUBMISSION MODAL ========== */}
      {reviewModalOpen && reviewBooking && (
        <div className="fixed inset-0 z-50 bg-slate-905 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200 text-left">
            <button
              onClick={() => setReviewModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-450 hover:text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Avaliar de Forma Real</h3>
            </div>
            
            <p className="text-xs text-slate-505 text-slate-500 leading-relaxed mb-6">
              Classifique o serviço <span className="font-extrabold text-purple-600">{reviewBooking?.service?.name}</span> realizado em <span className="font-extrabold text-slate-800">{reviewBooking?.business?.name}</span>. A sua avaliação será imediatamente visível no salão!
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-5">
              
              {/* Star selection rating */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-400 pl-0.5">
                  Pontuação das Estrelas
                </label>
                <div className="flex items-center gap-2 py-1 font-sans">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setReviewRating(score)}
                      className="p-1 hover:scale-125 transition duration-150 cursor-pointer"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          score <= reviewRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200 hover:text-amber-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-mono font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded text-xs select-none">
                    {reviewRating}.0 / 5.0
                  </span>
                </div>
              </div>

              {/* Text comment */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-400 pl-0.5">
                  Comentário Escrito (Real)
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Conte como correu o atendimento: simpatia do profissional, qualidade técnica do corte/tratamento, tempo de espera, recomendaria este local?..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs rounded-2xl leading-relaxed text-slate-800 placeholder-slate-400 resize-none font-sans"
                />
              </div>

              {/* Actions submit */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-wide transition shadow-md hover:shadow-lg hover:shadow-purple-100 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {submittingReview ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>A Gravar...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Adicionar Avaliação</span>
                    </>
                  )
                  }
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========== INTERACTIVE DISPUTE MODAL ========== */}
      {disputeModalOpen && disputeBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200 text-left">
            <button
              onClick={() => setDisputeModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-5 h-5 text-amber-500 animate-pulse shrink-0" />
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Reportar Reclamação / Arbitragem</h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Abra um ticket de disputa para o atendimento <span className="font-extrabold text-purple-600">{disputeBooking?.service?.name}</span> em <span className="font-extrabold text-slate-800">{disputeBooking?.business?.name}</span>. A equipa Glamzo contactará as duas partes e analisará o estorno do Stripe.
            </p>

            <form onSubmit={handleSubmitDispute} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-400 pl-0.5">
                  Motivo Principal
                </label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-purple-500 focus:outline-none text-xs rounded-xl text-slate-800 font-sans"
                >
                  <option value="Qualidade do serviço insatisfatória">Qualidade do serviço insatisfatória / incompleto</option>
                  <option value="Profissional ausente (No-show do parceiro)">Profissional ausente (No-show do salão)</option>
                  <option value="Preço cobrado diferente do anunciado">Preço cobrado diferente do anunciado no site</option>
                  <option value="Erros graves de higienização ou conforto">Erros ou problemas graves de higienização</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-mono tracking-wider font-extrabold text-slate-400 pl-0.5">
                  Descrição dos Factos (Privado para o Suporte)
                </label>
                <textarea
                  required
                  rows={4}
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder="Por favor, descreva detalhadamente o ocorrido na cadeira física, comportamento do profissional ou eventuais incongruências de cobrança..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs rounded-2xl leading-relaxed text-slate-800 placeholder-slate-400 resize-none font-sans"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setDisputeModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer text-center"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={submittingDispute}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-black uppercase tracking-wide transition shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {submittingDispute ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <Shield className="w-4 h-4 text-purple-500" />
                      <span>Formalizar Disputa</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
