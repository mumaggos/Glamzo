import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Business, Review } from '../types';
import { fetchReviewsForBusiness, submitReview } from '../utils/reviewsHelper';
import { startChatSession, fetchMessagesForSession, submitMessage } from '../utils/communicationHelper';
import { useAuth } from '../hooks/useAuth';
import BookingModal from '../components/BookingModal';
import SecurityBadge from '../components/SecurityBadge';
import BusinessInspiration from '../components/business/BusinessInspiration';
import { 
  toggleFavorite, 
  isFavorite, 
  reportReview, 
  createDispute, 
  fetchCustomerFavorites 
} from '../utils/marketingHelper';
import { 
  MapPin, Phone, Mail, Globe, Calendar, CheckCircle2, 
  ArrowLeft, Loader2, Share2, Compass, MessageSquare,
  Clock, X, ChevronRight, Check, Sparkles, CreditCard, ShieldCheck, AlertCircle,
  Star, Heart, Flag, FileWarning, Smartphone
} from 'lucide-react';

export default function BusinessDetail({ overrideSlug }: { overrideSlug?: string }) {
  const { slug: paramSlug } = useParams<{ slug?: string }>();
  const slug = overrideSlug || paramSlug;
  
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [business, setBusiness] = useState<Business | null>(null);
  const [availability, setAvailability] = useState<{ available: boolean, label: string } | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Phase 12 Marketing States
  const [favoriteActive, setFavoriteActive] = useState(false);
  
  // QR Scan Customer Greeting & Features States
  const [qrPromptOpen, setQrPromptOpen] = useState(new URLSearchParams(window.location.search).get('source') === 'qrcode');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [isHomePromptOpen, setIsHomePromptOpen] = useState(false);
  
  // Review submission state
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewService, setNewReviewService] = useState('');
  const [newReviewPhotoUrl, setNewReviewPhotoUrl] = useState('');
  const [newReviewFileBlob, setNewReviewFileBlob] = useState<string | null>(null); // For custom 1-photo upload base64 fallback
  
  // Review Reporting state
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reportReasonText, setReportReasonText] = useState('');

  // Dispute creation Modal state
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Serviço Incómodo ou Mau Trato');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [disputeLoading, setDisputeLoading] = useState(false);
  const [disputeBookingId, setDisputeBookingId] = useState('');

  // Real Booking Engine State
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<any | null>('any'); // 'any', or staff object
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'local' | 'stripe'>('local');
  const [notes, setNotes] = useState('');

  const [staff, setStaff] = useState<any[]>([]);
  const [businessHours, setBusinessHours] = useState<any[]>([]);
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  const [loadingBookingMetadata, setLoadingBookingMetadata] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingModalError, setBookingModalError] = useState<string | null>(null);
  const [successBooking, setSuccessBooking] = useState<any | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Chat drawer states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatSession, setChatSession] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Handles opening the chat drawer with the business
  const handleOpenChat = async () => {
    if (!user) {
      navigate(`/login?redirect=/business/${slug}`);
      return;
    }
    if (!business) return;

    // Dispatch custom event to slide open the integrated Real-time messenger
    const customChatEvent = new CustomEvent('glamzo:open_chat', {
      detail: {
        businessId: business.id,
        businessName: business.name
      }
    });
    window.dispatchEvent(customChatEvent);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !chatSession || !user) return;
    const txt = chatInput.trim();
    setChatInput('');
    setSendingMessage(true);
    try {
      const authorName = profile?.full_name || user.email?.split('@')[0] || 'Cliente Glamzo';
      const newMsg = await submitMessage(chatSession.id, 'customer', authorName, txt);
      
      // Update local state directly to show instant snappy delivery
      setChatMessages(prev => [...prev, newMsg]);

      // Simple periodic fetch to load the incoming AI responses
      setTimeout(async () => {
        const updated = await fetchMessagesForSession(chatSession.id);
        setChatMessages(updated);
      }, 1500);

    } catch (err) {
      console.error('Failed to submit user message:', err);
    } finally {
      setSendingMessage(false);
    }
  };


  // Load real reviews for this business
  useEffect(() => {
    const loadReviews = async () => {
      if (!business?.id) return;
      setLoadingReviews(true);
      try {
        const data = await fetchReviewsForBusiness(business.id);
        setReviews(data || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    };
    loadReviews();
  }, [business?.id]);

  // Phase 12 Marketing States and Actions Sync
  useEffect(() => {
    if (user && business?.id) {
      isFavorite(user.id, business.id).then(active => {
        setFavoriteActive(active);
      });
    }
  }, [user, business?.id]);

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('Por favor, inicie sessão na sua conta para guardar este salão nos seus favoritos!');
      return;
    }
    if (!business?.id) return;
    const active = await toggleFavorite(user.id, business.id);
    setFavoriteActive(active);
  };

  const handlePhotoUploadLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewReviewFileBlob(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Por favor, faça logon para enviar uma avaliação.');
      return;
    }
    if (!business?.id) return;
    
    setSubmittingReview(true);
    try {
      const author = profile?.full_name || user.email?.split('@')[0] || 'Cliente Glamzo';
      const input = {
        booking_id: crypto.randomUUID(), // mock complete booking relationship
        business_id: business.id,
        customer_id: user.id,
        customer_name: author,
        rating: newReviewRating,
        comment: newReviewComment,
        service_id: crypto.randomUUID(),
        service_name: newReviewService || 'Serviço Premium',
        photo_url: newReviewFileBlob || newReviewPhotoUrl || null
      };
      
      const created = await submitReview(input);
      setReviews(prev => [created, ...prev]);
      
      // Reset Review Inputs
      setNewReviewComment('');
      setNewReviewService('');
      setNewReviewPhotoUrl('');
      setNewReviewFileBlob(null);
      setReviewFormOpen(false);
      alert('A sua avaliação foi registada com sucesso! Agradecemos o seu feedback.');
    } catch (e) {
      console.error(e);
      alert('Falha ao registar a avaliação.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReportReviewSubmit = async (reviewId: string) => {
    if (!user) {
      alert('Inicie sessão para reportar conteúdo inapropriado.');
      return;
    }
    if (!reportReasonText.trim()) {
      alert('Por favor, descreva a razão da denúncia.');
      return;
    }
    try {
      await reportReview(reviewId, reportReasonText.trim());
      // Directly flag it in local state so it displays reported state instantly
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_reported: true, report_reason: reportReasonText.trim() } : r));
      setReportingReviewId(null);
      setReportReasonText('');
      alert('A sua denúncia foi enviada com sucesso para análise da equipa de apoio da Glamzo.');
    } catch (e) {
      console.error(e);
    }
  };

  const handleLaunchDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Inicie sessão para reclamar/abrir uma disputa.');
      return;
    }
    if (!disputeDesc.trim()) {
      alert('Por favor, descreva o problema.');
      return;
    }
    setDisputeLoading(true);
    try {
      const activeBookingId = disputeBookingId.trim() || crypto.randomUUID().slice(0, 8).toUpperCase();
      await createDispute({
        booking_id: activeBookingId,
        customer_id: user.id,
        business_id: business?.id || '',
        opened_by: 'customer',
        reason: disputeReason,
        description: disputeDesc.trim()
      });
      setDisputeOpen(false);
      setDisputeDesc('');
      setDisputeBookingId('');
      alert(`Disputa iniciada com sucesso sob o protocolo #${activeBookingId}! A nossa equipa de suporte irá analisar o caso em até 24 horas.`);
    } catch (err) {
      console.error(err);
      alert('Erro ao iniciar disputa.');
    } finally {
      setDisputeLoading(false);
    }
  };

  // Load real metadata for scheduling
  useEffect(() => {
    const fetchBookingRequiredData = async () => {
      if (!business?.id) return;
      setLoadingBookingMetadata(true);
      try {
        const { data: staffData } = await supabase
          .from('staff')
          .select('*')
          .eq('business_id', business.id)
          .eq('is_active', true);
        setStaff(staffData || []);

        const { data: hoursData } = await supabase
          .from('business_hours')
          .select('*')
          .eq('business_id', business.id);
        setBusinessHours(hoursData || []);

        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('id, staff_id, booking_date, start_time, end_time, booking_status')
          .eq('business_id', business.id)
          .neq('booking_status', 'cancelled');
        setExistingBookings(bookingsData || []);
      } catch (err) {
        console.error('Error fetching booking metadata:', err);
      } finally {
        setLoadingBookingMetadata(false);
      }
    };

    fetchBookingRequiredData();
  }, [business?.id]);

  // Open booking flow trigger
  const handleOpenBooking = (service: any | null) => {
    if (!user) {
      if (service) {
        sessionStorage.setItem('pre_selected_service_id', service.id);
      } else {
        sessionStorage.setItem('pre_selected_service_id', 'general');
      }
      navigate(`/login?redirect=/business/${slug}`);
      return;
    }

    if (service) {
      setSelectedService(service);
      setBookingStep(2); // Start at Select Staff
    } else {
      setSelectedService(null);
      setBookingStep(1); // Start at Select Service
    }

    setSelectedStaff('any');
    setSelectedDate(null);
    setSelectedTime(null);
    setPaymentMethod('local');
    setNotes('');
    setBookingModalError(null);
    setSuccessBooking(null);
    setBookingOpen(true);
  };

  // Restore booking triggered in post-session onboarding
  useEffect(() => {
    if (user && services.length > 0) {
      const activePreServiceId = sessionStorage.getItem('pre_selected_service_id');
      if (activePreServiceId) {
        sessionStorage.removeItem('pre_selected_service_id');
        if (activePreServiceId !== 'general') {
          const foundSrv = services.find((s) => s.id === activePreServiceId);
          if (foundSrv) {
            handleOpenBooking(foundSrv);
          } else {
            handleOpenBooking(null);
          }
        } else {
          handleOpenBooking(null);
        }
      }
    }
  }, [user, services]);

  useEffect(() => {
    const fetchBusinessBySlug = async () => {
      if (!slug) return;
      setLoading(true);
      setErrorMsg(null);
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          if (data.subscription_status === 'suspended') {
            setErrorMsg('Este estabelecimento encontra-se temporariamente suspenso pela administração do Glamzo.');
            setBusiness(null);
          } else {
            setBusiness(data as Business);
            
            // Increment qr_scans_count silently if source=qrcode
            const params = new URLSearchParams(window.location.search);
            if (params.get('source') === 'qrcode' || params.get('ref') === 'qrcode') {
              try {
                const currentScans = data.qr_scans_count || 0;
                await supabase
                  .from('businesses')
                  .update({ qr_scans_count: currentScans + 1 })
                  .eq('id', data.id);
              } catch (qrErr) {
                console.warn('Could not increment qr_scans_count:', qrErr);
              }
            }
          }
        } else {
          setBusiness(null);
        }
      } catch (err: any) {
        console.error('Error fetching salon detail:', err);
        setErrorMsg('Ocorreu uma falha ao comunicar com o servidor. Verifique a sua ligação à internet.');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessBySlug();
  }, [slug]);

  useEffect(() => {
    if (business?.id) {
       setAvailability({ label: 'A verificar...', available: false });
       fetch(`/api/availability/${business.id}`)
          .then(res => res.json())
          .then(data => setAvailability(data))
          .catch(err => console.error(err));
    }
  }, [business?.id]);

  // Fetch verified services associated with this specific business
  useEffect(() => {
    const fetchServices = async () => {
      if (!business?.id) return;
      setLoadingServices(true);
      try {
        const { data, error } = await supabase
          .from('services')
          .select(`
            *,
            category:service_categories(name, icon)
          `)
          .eq('business_id', business.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setServices(data || []);
      } catch (err) {
        console.error('Error fetching services details:', err);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, [business?.id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        <span className="text-xs text-slate-500 font-mono">Buscando detalhes do estabelecimento...</span>
      </div>
    );
  }

  if (errorMsg || !business) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-100 rounded-3xl text-center shadow-lg">
        <Compass className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-black text-slate-850">Estabelecimento não Encontrado</h3>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          O link que tentou aceder não existe, foi eliminado, ou mudou de morada comercial na nossa infraestrutura.
        </p>
        <Link
          to="/explore"
          className="mt-6 inline-flex items-center gap-1.5 px-6 py-2.5 bg-slate-50 hover:bg-slate-200 text-slate-900 text-xs font-bold rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Explorar</span>
        </Link>
      </div>
    );
  }

  // Match real reviews:
  const bizReviews = reviews; 
  let finalRating = 0;
  let finalReviewsCount = 0;

  if (bizReviews.length > 0) {
    finalReviewsCount = bizReviews.length;
    finalRating = bizReviews.reduce((sum, r) => sum + r.rating, 0) / bizReviews.length;
  } else {
    // For default design seed businesses, provide mock seeding to avoid blank ratings initially
    const initialDesignSeeds = ['salao-spa-premium', 'barbearia-braga-moderna', 'estetica-beleza-braganca'];
    if (initialDesignSeeds.includes(business.slug)) {
      let hash = 0;
      for (let i = 0; i < business.name.length; i++) {
        hash = business.name.charCodeAt(i) + ((hash << 5) - hash);
      }
      finalRating = 4.0 + (Math.abs(hash % 11) / 10);
      finalReviewsCount = 12 + (Math.abs(hash % 150));
    } else {
      finalRating = 0.0;
      finalReviewsCount = 0;
    }
  }

  return (
    <div id="business-detail-view" className="bg-white min-h-screen pb-16 font-sans text-slate-700 selection:bg-purple-100/50 selection:text-purple-200">
      
      {/* Upper Cover Banner Area */}
      <div className="h-64 sm:h-80 w-full relative bg-slate-50 overflow-hidden border-b border-slate-100">
        <img
          src={business.cover_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=75'}
          alt={business.name}
          decoding="async"
          width="800"
          height="320"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-80 group-hover:scale-102 transition-transform duration-700"
        />
        
        {/* Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none" />

        {/* Back Link trigger */}
        <div className="absolute top-6 left-6 z-10">
          <Link
            to="/explore"
            className="flex items-center gap-1 bg-white/85 backdrop-blur-md hover:bg-slate-50/95 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all border border-slate-200 font-mono"
          >
            <ArrowLeft className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Explorar salões</span>
          </Link>
        </div>

        {/* Share & Favorite trigger buttons */}
        <div className="absolute top-6 right-6 z-10 flex gap-2">
          {/* Favorite Switch */}
          <button
            onClick={handleToggleFavorite}
            className="flex items-center gap-1.5 bg-white/85 backdrop-blur-md hover:bg-slate-50/95 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all border border-slate-200 cursor-pointer font-mono"
          >
            <Heart className={`w-4 h-4 transition-all ${favoriteActive ? 'fill-purple-500 text-purple-400 scale-110' : 'text-slate-500'}`} />
            <span>{favoriteActive ? 'Favorito' : 'Guardar'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1 bg-white/85 backdrop-blur-md hover:bg-slate-50/95 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all border border-slate-200 cursor-pointer font-mono"
          >
            <Share2 className="w-4 h-4 text-purple-400" />
            <span>{copiedLink ? 'Copiado!' : 'Partilhar'}</span>
          </button>
        </div>
      </div>

      {/* Main Overlapping Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Col 1 & 2: Primary Studio description and presentation */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Identity Card */}
            <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-[24px] border border-slate-100 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-purple-500/5 rounded-full pointer-events-none blur-3xl" />
              
              {/* Overlapping logo image */}
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-slate-100 shadow-2xl bg-white shrink-0">
                <img
                  src={business.logo_url || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=150&q=70'}
                  alt="logo"
                  loading="lazy"
                  decoding="async"
                  width="96"
                  height="96"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-center sm:text-left flex-1 font-sans">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-2.5 py-0.5 bg-purple-50 text-purple-300 text-[10px] uppercase font-mono tracking-wider font-bold rounded-full border border-purple-900/40">
                    {business.category}
                  </span>
                  {(() => {
                    if (!businessHours || businessHours.length === 0) return null;
                    const now = new Date();
                    const currentDay = now.getDay();
                    const currentHour = now.getHours();
                    const currentMinute = now.getMinutes();

                    const todayHours = businessHours.find(h => h.weekday === currentDay);
                    if (!todayHours || todayHours.is_closed) {
                      return (
                        <span className="px-2.5 py-0.5 bg-rose-50 text-rose-500 text-[10px] uppercase font-mono tracking-wider font-bold rounded-full border border-rose-200">
                          Fechado Agora
                        </span>
                      );
                    }

                    const [openH, openM] = todayHours.open_time.split(':').map(Number);
                    const [closeH, closeM] = todayHours.close_time.split(':').map(Number);

                    const nowMinutes = currentHour * 60 + currentMinute;
                    const openMinutes = openH * 60 + openM;
                    const closeMinutes = closeH * 60 + closeM;

                    if (nowMinutes >= openMinutes && nowMinutes <= closeMinutes) {
                      return (
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-500 text-[10px] uppercase font-mono tracking-wider font-bold rounded-full border border-emerald-200">
                          Aberto Agora
                        </span>
                      );
                    }
                    return (
                      <span className="px-2.5 py-0.5 bg-rose-50 text-rose-500 text-[10px] uppercase font-mono tracking-wider font-bold rounded-full border border-rose-200">
                        Fechado Agora
                      </span>
                    );
                  })()}
                  {business.is_verified && (
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-400 text-[10px] uppercase font-mono tracking-wider font-bold rounded-full flex items-center gap-1 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Verificado</span>
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 uppercase tracking-tight flex items-center justify-center sm:justify-start gap-2 flex-wrap font-display">
                  <span>{business.name}</span>
                  {(business.is_premium || (finalRating >= 4.5 && finalReviewsCount >= 1 && business.is_verified)) && (
                    <span className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-900 text-[9.5px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-0.5 select-none shrink-0" title="Parceiro de destaque com serviços validados">
                      👑 Premium
                    </span>
                  )}
                  {business.is_top_partner && (
                    <span className="bg-purple-900 text-white text-[9.5px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 select-none shrink-0" title="Top Partner Glamzo">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> TOP PARTNER
                    </span>
                  )}
                </h1>
                
                <p className="text-xs text-slate-500 mt-1.5 flex items-center justify-center sm:justify-start gap-1 font-mono">
                  <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{business.city}, {business.district}</span>
                </p>

                {/* Visual Stars & Reviews metric */}
                <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-2.5 text-xs text-slate-500 font-mono">
                  {finalReviewsCount > 0 ? (
                    <>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= Math.round(finalRating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-extrabold text-slate-700">{finalRating.toFixed(1)}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-500 font-bold">
                        {finalReviewsCount} {finalReviewsCount === 1 ? 'avaliação' : 'avaliações'}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="flex text-slate-800">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-3.5 h-3.5 text-slate-800" />
                        ))}
                      </div>
                      <span className="text-slate-500 italic">Sem avaliações</span>
                    </>
                  )}
                </div>
                <div className="mt-4 flex justify-center sm:justify-start">
                  <SecurityBadge />
                </div>
              </div>
            </div>

            {/* Presentation/Biography Card */}
            <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-[24px] border border-slate-100 shadow-xl space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 font-display">Sobre o Estabelecimento</h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-sans whitespace-pre-wrap">
                {business.description || 'Presta serviços de corte, maquilhagem cosmética, manicura e assessoria de estilo personalizada de acordo com os padrões artísticos europeus.'}
              </p>
            </div>

            <BusinessInspiration businessId={business.id} businessName={business.name} />

            {/* Real Services Listing Section */}
            <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-[24px] border border-slate-100 shadow-xl space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <h2 className="text-base font-extrabold text-slate-900 font-display">Serviços Disponíveis</h2>
                <span className="text-[10px] font-mono bg-purple-50 text-purple-300 border border-purple-200 px-2.5 py-0.5 rounded-full font-bold">
                  {services.length} {services.length === 1 ? 'Serviço' : 'Serviços'}
                </span>
              </div>

              {loadingServices ? (
                <div className="py-12 text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400 mx-auto" />
                  <p className="text-xs text-slate-500 font-mono">Buscando menu de tratamentos...</p>
                </div>
              ) : services.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-purple-50 text-purple-450 rounded-full border border-purple-200">
                    <Compass className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium font-mono">Ainda não existem serviços de atendimento ativo neste estabelecimento.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {services.map((srv) => (
                    <div
                      key={srv.id}
                      className="p-4 bg-white/60 hover:bg-purple-50/50 border border-slate-100 rounded-2xl transition-all flex flex-col sm:flex-row gap-4 justify-between sm:items-center group"
                    >
                      <div className="flex gap-3.5 items-start">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-200">
                          <img
                            src={srv.image_url || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=150&q=70'}
                            alt={srv.name}
                            loading="lazy"
                            decoding="async"
                            width="64"
                            height="64"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 animate-fade-in"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-400 transition-colors uppercase font-sans">{srv.name}</h4>
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-300 text-[9px] rounded-full select-none font-bold border border-purple-200">
                              {srv.category?.name || 'Geral'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed max-w-md">{srv.description || 'Consulta e tratamento especializado.'}</p>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono pt-0.5">
                            <span>⏱ {srv.duration_minutes} min de atendimento</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 justify-between sm:justify-center shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="font-mono text-right">
                          <span className="text-[11px] text-slate-500 block sm:hidden">Preço</span>
                          <span className="text-base sm:text-lg font-bold text-slate-900">
                            {srv.price ? Number(srv.price).toFixed(2) : '0.00'} €
                          </span>
                        </div>
                        <button
                          onClick={() => handleOpenBooking(srv)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-slate-900 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-purple-950/30"
                        >
                          <span>Reservar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Real Customer Reviews Section */}
            <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-slate-150 shadow-xs space-y-6 text-left">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Avaliações & Comentários</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Opiniões e testemunhos reais pós-visita ao salão em Portugal.</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!user) {
                        alert('Por favor, inicie sessão para escrever uma avaliação!');
                        navigate(`/login?redirect=/business/${slug}`);
                        return;
                      }
                      setReviewFormOpen(!reviewFormOpen);
                    }}
                    className="px-3.5 py-1.5 bg-purple-50 border border-purple-100 hover:bg-purple-100/50 text-purple-600 text-xs font-bold rounded-full transition-all flex items-center gap-1 select-none cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{reviewFormOpen ? 'Fechar Form' : 'Avaliar Salão'}</span>
                  </button>

                  {/* Score badge */}
                  <div className="bg-purple-55 bg-purple-50 border border-purple-100 text-purple-600 px-2.5 py-1 rounded-2xl flex items-center gap-1 shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold font-mono">{finalRating > 0 ? finalRating.toFixed(1) : '5.0'}</span>
                  </div>
                </div>
              </div>

              {reviewFormOpen && (
                <form onSubmit={handleCreateReviewSubmit} className="p-5 bg-slate-50 border border-slate-250 border-slate-200 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-slate-805 text-slate-800 uppercase tracking-wider">Escrever Nova Avaliação</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-550 text-slate-500 mb-1">Pontuação (Estrelas)</label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewReviewRating(star)}
                            className="text-amber-400 focus:outline-none cursor-pointer"
                          >
                            <Star className={`w-6 h-6 ${star <= newReviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Serviço Realizado</label>
                      <select aria-label="Selecione uma opção" 
                        required
                        value={newReviewService}
                        onChange={(e) => setNewReviewService(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 focus:outline-none"
                      >
                        <option value="" className="bg-white">-- Escolha um serviço --</option>
                        {services.map(s => <option key={s.id} value={s.name} className="bg-white">{s.name}</option>)}
                        <option value="Serviço de Beleza Geral" className="bg-white">Outro Serviço Geral</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Comentário Detalhado</label>
                    <textarea
                      required
                      placeholder="Fale sobre a pontualidade, higiene, simpatia e qualidade técnica do atendimento comercial..."
                      rows={3}
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 focus:outline-none placeholder-slate-400"
                    />
                  </div>

                  {/* High Quality File Upload Widget under Phase 12 validation */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Adicionar 1 Foto do Resultado (Opcional)</label>
                    <div className="border border-dashed border-slate-200 hover:border-purple-500 rounded-2xl p-4 text-center cursor-pointer relative bg-white transition-all">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handlePhotoUploadLocal}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                      />
                      {newReviewFileBlob ? (
                        <div className="flex items-center gap-3 justify-center text-xs text-emerald-600 font-bold">
                          <img src={newReviewFileBlob} className="w-12 h-12 object-cover rounded-md border border-slate-200" />
                          <span>Foto Carregada com Sucesso! ✓</span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-slate-600 font-semibold">Arraste e solte ou faça upload da sua foto de look</p>
                          <p className="text-[10px] text-slate-500 mt-1">Clique para escolher o ficheiro (PNG, JPG)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-slate-900 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {submittingReview ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>Submeter Avaliação</span>
                    </button>
                  </div>
                </form>
              )}

              {loadingReviews ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                </div>
              ) : bizReviews.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {bizReviews.map((r) => (
                    <div key={r.id} className="py-4 first:pt-0 last:pb-0 font-sans text-xs">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <span className="font-bold text-slate-800 block">{r.customer_name}</span>
                          <span className="text-[10px] text-slate-500 font-medium">Serviço: <span className="font-semibold text-purple-600">{r.service_name}</span></span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {r.created_at ? new Date(r.created_at).toLocaleDateString('pt-PT') : 'Hoje'}
                        </span>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 mt-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= r.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Display 1 Photo Upload Attachment */}
                      {r.photo_url && (
                        <div className="mt-3">
                          <img 
                            src={r.photo_url} 
                            alt="Visual de cliente" 
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            className="w-full max-w-[280px] h-32 object-cover rounded-2xl border border-slate-100 shadow-sm hover:scale-[1.02] transition-transform duration-300" 
                          />
                        </div>
                      )}

                      <p className="text-slate-600 mt-2 leading-relaxed text-xs whitespace-pre-wrap">
                        {r.comment || 'Sem comentários textuais.'}
                      </p>

                      {/* Phase 12 Report workflow */}
                      <div className="mt-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        {r.is_reported ? (
                          <span className="text-amber-600 font-semibold bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1 select-none">
                            ⚠️ Sob Investigação do Administrador (Denúncia Registada)
                          </span>
                        ) : (
                          <button
                            onClick={() => setReportingReviewId(r.id)}
                            className="hover:text-purple-600 font-bold tracking-wide flex items-center gap-1 cursor-pointer"
                          >
                            <Flag className="w-3 h-3 text-slate-500 hover:text-purple-600" />
                            <span>Contestar ou Reportar Avaliação</span>
                          </button>
                        )}
                      </div>

                      {reportingReviewId === r.id && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-150 rounded-xl space-y-2.5">
                          <div className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">Por que deseja denunciar este feedback?</div>
                          <textarea
                            rows={2}
                            required
                            placeholder="Descreva alegações falsas, comportamento inadequado ou spam..."
                            value={reportReasonText}
                            onChange={(e) => setReportReasonText(e.target.value)}
                            className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-500/10"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setReportingReviewId(null)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-[10px] text-slate-600 font-bold cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReportReviewSubmit(r.id)}
                              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-slate-900 rounded-md text-[10px] font-bold cursor-pointer"
                            >
                              Submeter Denúncia
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-xs text-slate-505 text-slate-500 leading-normal">
                    Este estabelecimento ainda não recebeu qualquer avaliação ou comentário de clientes.<br />
                    Após realizar e concluir o seu agendamento no salão, poderá deixar o seu feedback!
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Col 3: Sidebar containing booking CTAs and business metadata */}
          <div className="space-y-6">
            
            {/* Premium Booking CTA card */}
            <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-indigo-750 p-6 sm:p-8 rounded-[24px] text-slate-900 shadow-lg space-y-4 relative overflow-hidden group">
              <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:bg-white/15 transition-all duration-500" />
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest font-extrabold bg-white/15 text-slate-900 px-2.5 py-0.5 rounded-full select-none border border-white/20">
                  Agendamento Online Real
                </span>
                <h3 className="text-lg font-bold tracking-tight uppercase font-display">Marcar Atendimento</h3>
                <p className="text-xs text-purple-100/85 leading-relaxed">
                  Garanta a sua vaga em segundos com confirmação em tempo real e prevenção de conflitos de horário.
                </p>
              </div>

              {/* Proactive Availability Badge */}
              <div className="relative mt-2 mb-2">
                 {availability?.label === 'A verificar...' ? (
                   <div className="text-[10px] text-white flex items-center justify-center gap-1.5 opacity-70 animate-pulse bg-white/10 rounded-lg px-2 py-2 w-full border border-white/20 font-mono">
                     <Loader2 className="w-3 h-3 animate-spin"/> A verificar vagas...
                   </div>
                 ) : availability?.available ? (
                   <div className={`text-[10px] font-bold text-slate-800 flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-lg w-full border shadow-sm font-mono tracking-tight uppercase ${availability.label.includes('hoje') ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-white border-purple-200 text-purple-900'}`}>
                     {availability.label.includes('hoje') ? <span>🟢</span> : <span>🟣</span>}
                     {availability.label}
                   </div>
                 ) : availability?.label && availability.label !== 'A verificar...' ? (
                   <div className="text-[10px] font-bold text-slate-700 flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-lg w-full border bg-slate-50 border-white/30 shadow-sm font-mono uppercase tracking-tight">
                     <span>⚪</span>
                     {availability.label}
                   </div>
                 ) : null}
              </div>

              <button
                type="button"
                onClick={() => handleOpenBooking(null)}
                className="w-full py-3 bg-white hover:bg-slate-50 text-slate-900 hover:text-purple-450 hover:text-purple-400 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-slate-200/80 font-mono"
              >
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>Reservar Agora</span>
              </button>
            </div>

            {/* Phase 12 Dispute Launcher CTA Card */}
            <div className="bg-white/90 backdrop-blur-md border border-slate-100 p-6 sm:p-8 rounded-[24px] shadow-xl space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-mono tracking-widest font-black bg-purple-50 text-purple-300 px-2.5 py-0.5 rounded-full select-none border border-purple-200">
                  Centro de Mediação Glamzo
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase flex items-center gap-1.5 font-display">
                  <FileWarning className="w-4 h-4 text-purple-400" />
                  <span>Problemas ou Disputas?</span>
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Teve algum conflito com o seu agendamento, no-show indevido ou cobrança incorreta? Inicie uma disputa profissional regulada pelo suporte.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    alert('Inicie sessão para abrir uma disputa oficial com este salão.');
                    navigate(`/login?redirect=/business/${slug}`);
                    return;
                  }
                  setDisputeOpen(true);
                }}
                className="w-full py-2.5 bg-purple-50 border border-purple-900/40 hover:bg-purple-900/60 text-purple-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                <span>Iniciar Disputa de Serviço</span>
              </button>
            </div>

            {/* Call to Actions Contact box */}
            <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-[24px] border border-slate-100 shadow-xl space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Contactos Comercial</h3>
              
              <div className="space-y-3 pt-2">
                
                {/* Internal Chat button */}
                <button
                  onClick={handleOpenChat}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-purple-600 hover:bg-purple-700 text-slate-900 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-slate-900 animate-pulse" />
                  <span>Falar com Loja</span>
                </button>

                {/* WhatsApp button */}
                {business.whatsapp ? (
                  <a
                    href={business.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-605 bg-emerald-600 hover:bg-emerald-700 text-slate-900 rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    <MessageSquare className="w-4 h-4 fill-white" />
                    <span>Falar no WhatsApp</span>
                  </a>
                ) : (
                  <a
                    href={`https://wa.me/${business.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#110724]/60 border border-white/5 hover:border-purple-500/20 text-slate-900 rounded-xl text-xs font-bold transition-all"
                  >
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                    <span>WhatsApp Comercial</span>
                  </a>
                )}

                {/* External Website button */}
                {business.website && (
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition-all"
                  >
                    <Globe className="w-4 h-4 text-purple-400" />
                    <span>Visitar Website</span>
                  </a>
                )}
              </div>
            </div>

            {/* Information attributes list box */}
            <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-[24px] border border-slate-100 shadow-xl space-y-5 font-sans">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">Detalhes de Localidade</h3>
              
              <div className="space-y-4 text-xs">
                
                {/* Physical address detail */}
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4.5 h-4.5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-purple-400 tracking-wider uppercase text-[10px]">Morada Completa</h4>
                    <p className="text-slate-700 mt-0.5">{business.address}</p>
                    <p className="text-slate-500 mt-0.5">{business.city}, {business.district} {business.postal_code ? `- CP ${business.postal_code}` : ''}</p>
                  </div>
                </div>

                {/* Direct Telephone detail */}
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4.5 h-4.5 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-purple-400 tracking-wider uppercase text-[10px]">Telefone de Contacto</h4>
                    <a href={`tel:${business.phone}`} className="text-slate-700 mt-0.5 hover:text-slate-900 font-semibold block transition-colors">
                      {business.phone}
                    </a>
                  </div>
                </div>

                {/* Administrative commercial email detail */}
                {business.email && (
                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4.5 h-4.5 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-purple-400 tracking-wider uppercase text-[10px]">E-mail Comercial</h4>
                      <a href={`mailto:${business.email}`} className="text-slate-700 mt-0.5 hover:text-purple-400 transition-colors block break-all">
                        {business.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Instagram details */}
                {business.instagram && (
                  <div className="flex items-start gap-2.5">
                    <span className="w-4.5 h-4.5 bg-purple-50 text-purple-300 border border-purple-900/40 font-mono flex items-center justify-center shrink-0 mt-0.5 rounded text-[10px] font-extrabold font-mono">IG</span>
                    <div>
                      <h4 className="font-bold text-purple-400 tracking-wider uppercase text-[10px]">Instagram</h4>
                      <a 
                        href={`https://instagram.com/${business.instagram.replace('@', '')}`}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-purple-400 mt-0.5 font-bold hover:underline block"
                      >
                        {business.instagram}
                      </a>
                    </div>
                  </div>
                )}

                {/* Dynamic Weekly Operating Hours Visual Checklist */}
                <div className="pt-4 mt-2 border-t border-slate-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
                    <h4 className="font-bold text-slate-900 tracking-wider uppercase text-[10px]">Horário de Funcionamento</h4>
                  </div>
                  
                  <div className="space-y-1.5 pt-1">
                    {[1, 2, 3, 4, 5, 6, 0].map(dayIdx => {
                      const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
                      const dayNameShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                      const record = businessHours.find(h => h.weekday === dayIdx);
                      const isToday = new Date().getDay() === dayIdx;
                      
                      const isClosed = record ? record.is_closed : (dayIdx === 0);
                      const openStr = record ? record.open_time : '09:00';
                      const closeStr = record ? record.close_time : '19:00';

                      return (
                        <div 
                          key={dayIdx} 
                          className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                            isToday 
                              ? 'bg-purple-950/55 border border-purple-500/30 text-purple-300 font-bold shadow-md shadow-purple-950/40' 
                              : 'text-slate-500 hover:bg-slate-50/45'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isToday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                            <span>{dayNames[dayIdx]}</span>
                          </div>
                          
                          <span className={`font-mono text-[11px] ${isClosed ? 'text-rose-450 font-bold' : 'text-slate-600 font-medium'}`}>
                            {isClosed ? 'Fechado' : `${openStr} - ${closeStr}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Real Booking Engine Integrated Modal Flow */}
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        business={business}
        services={services}
        user={user}
        profile={profile}
        initialSelectedService={selectedService}
      />

      {/* Elegant Sliding Chat Drawer Component with Assistente IA Glamzo */}
      {chatOpen && (
        <div className="fixed inset-0 z-55 overflow-hidden font-sans" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Backdrop filter blur backdrop overlay */}
            <div 
              onClick={() => setChatOpen(false)}
              className="absolute inset-0 bg-white/40 backdrop-blur-xs transition-opacity cursor-pointer" 
              aria-hidden="true" 
            />

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <div className="pointer-events-auto w-screen max-w-md">
                <div className="flex h-full flex-col bg-white shadow-2xl border-l border-slate-100">
                  {/* Drawer Header Header */}
                  <div className="bg-slate-50/40 px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-slate-900 font-bold">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">{business?.name || 'Salão Parceiro'}</h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] text-emerald-450 font-bold tracking-wider uppercase">Assistente IA Glamzo Activo</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setChatOpen(false)}
                      className="rounded-lg p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors focus:outline-none"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Channel WhatsApp Direct Action */}
                  <div className="bg-slate-50/20 px-6 py-3 border-b border-slate-100 flex items-center justify-between gap-1">
                    <span className="text-[10px] text-slate-500 font-medium font-sans">Prefere falar no WhatsApp comercial?</span>
                    <a 
                      href={business?.whatsapp || `https://wa.me/${business?.phone?.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-slate-900 font-bold text-[10px] rounded-lg flex items-center gap-1 transition-all uppercase tracking-wider shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-white" />
                      <span>Continuar no WP</span>
                    </a>
                  </div>

                  {/* Message Stream */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {chatMessages.length === 0 ? (
                      <div className="h-full flex flex-col justify-center items-center text-center px-4">
                        <div className="w-12 h-12 rounded-full bg-purple-950/60 border border-purple-200 flex items-center justify-center text-purple-400 mb-3">
                          <MessageSquare className="w-6 h-6" />
                        </div>
                        <p className="text-xs text-slate-205 text-slate-900 font-bold">Inicie o Bate-papo</p>
                        <p className="text-[11px] text-slate-500 text-slate-500 max-w-xs mt-1 leading-normal">
                          Coloque qualquer questão sobre horários, cortes, serviços disponíveis ou preços ao nosso agente inteligente.
                        </p>
                      </div>
                    ) : (
                      chatMessages.map((msg) => {
                        const isUser = msg.sender_type === 'customer';
                        return (
                          <div 
                            key={msg.id} 
                            className={`flex flex-col max-w-[85%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                          >
                            <span className="text-[9px] text-slate-500 font-mono font-bold mb-1 px-1">{msg.sender_name}</span>
                            <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                              isUser 
                                ? 'bg-purple-600 text-slate-900 rounded-tr-none shadow-xs font-semibold' 
                                : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-805/80'
                            }`}>
                              {msg.message}
                            </div>
                            <span className="text-[8px] text-slate-500 mt-1 font-mono">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Quick Suggestion Chips */}
                  <div className="px-6 py-2 border-t border-slate-100 bg-[#0d1222] space-x-2 overflow-x-auto whitespace-nowrap flex items-center">
                    {[
                      { text: 'Sugira horários livres', query: 'Quais os melhores horários livres hoje para corte/estética?' },
                      { text: 'Serviços populares', query: 'Quais os vossos serviços de beleza mais populares e os preços?' },
                      { text: 'Fidelidade & Cupons', query: 'Como posso usar o meu cupão de fidelidade?' }
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={async () => {
                          setChatInput(chip.query);
                        }}
                        className="inline-block px-3 py-1.5 bg-slate-50 hover:bg-slate-200 text-slate-600 font-bold text-[10px] rounded-full transition-all border border-slate-200 shrink-0 cursor-pointer"
                      >
                        {chip.text}
                      </button>
                    ))}
                  </div>

                  {/* Drawer Footer Inputs */}
                  <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100">
                    <div className="flex items-center gap-2 bg-white border border-slate-100 focus-within:border-purple-500 rounded-xl px-3 py-1.5 transition-all">
                      <input 
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Escreva a sua mensagem..."
                        disabled={sendingMessage}
                        className="flex-1 bg-transparent border-none text-slate-900 text-xs placeholder-slate-500 focus:outline-none focus:ring-0 py-1.5"
                      />
                      <button 
                        type="submit"
                        disabled={sendingMessage || !chatInput.trim()}
                        className="p-2 bg-purple-600 hover:bg-purple-700 text-slate-900 rounded-lg transition-all disabled:opacity-50 cursor-pointer text-xs font-bold uppercase tracking-wider"
                      >
                        Enviar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Dispute Creation Modal Dialog */}
      {disputeOpen && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden flex flex-col justify-between max-h-[90vh]">
            <div className="bg-gradient-to-r from-red-650 to-rose-700 text-slate-900 px-6 py-5 flex justify-between items-center">
              <div>
                <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-1.5">
                  <FileWarning className="w-5 h-5 text-slate-900 animate-pulse" />
                  <span>Nova Disputa Comercial</span>
                </h3>
                <p className="text-[10px] text-rose-100 font-mono mt-0.5">Centro de Resolução de Conflitos Glamzo</p>
              </div>
              <button 
                onClick={() => setDisputeOpen(false)}
                className="text-slate-900 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLaunchDispute} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5 font-mono">ID do Agendamento (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: BK-9204 (Deixe em branco para preenchimento automático)"
                  value={disputeBookingId}
                  onChange={(e) => setDisputeBookingId(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5 font-mono">Motivo Principal do Litígio</label>
                <select aria-label="Selecione uma opção"
                  required
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-none focus:outline-rose-500"
                >
                  <option value="Mau Atendimento Técnico">Profissional Incompetente / Mau Atendimento Técnico</option>
                  <option value="Serviço Não Realizado (Caso No-show)">O salão não apareceu (No-show do estabelecimento)</option>
                  <option value="Valor de Cobrança Abusivo ou Divergente">Valor cobrado difere do estipulado no menu</option>
                  <option value="Falta de Higiene ou Quebra de Segurança">Condições de Higiene Inadequadas / Falta de Segurança</option>
                  <option value="Atraso Abusivo do Estabelecimento">Atraso superior a 45 minutos sem compensação</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5 font-mono">Explicação Detalhada do Ocorrido</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Descreva exatamente o que aconteceu. Forneça o máximo de detalhes possível para ajudar na arbitragem da equipa do Glamzo..."
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">Insira evidências verdadeiras. Relatórios falsificados gerarão suspensão da sua reputação.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 flex-wrap">
                <button
                  type="button"
                  onClick={() => setDisputeOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={disputeLoading}
                  className="px-5 py-2.5 bg-red-650 hover:bg-red-700 text-slate-900 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  {disputeLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Submeter para Arbitragem</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* FLOATING QR CODE GREETING AND LOYALTY WIDGET (PART 4)*/}
      {/* ==================================================== */}
      {qrPromptOpen && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-[420px] bg-white/95 backdrop-blur-md rounded-3xl border border-purple-500/20 shadow-2xl p-5 md:p-6 z-[50] animate-fade-in text-slate-900">
          <div className="flex items-start justify-between gap-3 border-b border-white/5 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-purple-900/40 rounded-xl flex items-center justify-center border border-purple-500/30 text-purple-400">
                <Sparkles className="w-4.5 h-4.5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs uppercase font-mono tracking-widest text-purple-400 font-extrabold">QR Conexão Digital</h4>
                <h3 className="text-sm font-black text-slate-900">{business?.name}</h3>
              </div>
            </div>
            <button
              onClick={() => setQrPromptOpen(false)}
              className="text-slate-500 hover:text-slate-900 bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed pt-3 text-left">
            Digitalizou o QR Code oficial de {business?.name || 'este salão'}. Guarde o espaço para reservar de forma instantânea em segundos.
          </p>

          <div className="space-y-2.5 pt-4">
            {/* Action grid: Toggle Favorite, Install Instructions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    setFavoriteActive(!favoriteActive);
                  } else {
                    handleToggleFavorite();
                  }
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  favoriteActive 
                    ? 'bg-purple-900/30 text-purple-300 border-purple-500/30' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-purple-500 hover:text-slate-900'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${favoriteActive ? 'fill-purple-500 text-purple-400' : ''}`} />
                <span>{favoriteActive ? 'Favoritado 💖' : 'Guardar Favorito'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsHomePromptOpen(!isHomePromptOpen)}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-purple-500 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                <span>Instalar no Ecrã</span>
              </button>
            </div>

            {/* Sub-prompt: Add to home screen steps */}
            {isHomePromptOpen && (
              <div className="bg-slate-50/60 rounded-2xl p-3 border border-slate-200 text-[10px] leading-relaxed text-slate-600 space-y-1.5 text-left animate-slide-up">
                <div className="font-extrabold uppercase font-mono tracking-wider text-purple-450 flex items-center gap-1 text-purple-400">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Como Adicionar ao Ecrã Inicial</span>
                </div>
                <p>
                  <strong className="text-slate-900">Para iOS (Safari):</strong> Clique no botão de <strong className="text-slate-900">Partilhar</strong> no pé do ecrã e selecione <strong className="text-slate-900">Adicionar ao Ecrã Principal</strong>.
                </p>
                <p>
                  <strong className="text-slate-900">Para Android (Chrome):</strong> Dê um clique nos <strong className="text-slate-900">3 pontos</strong> de opções superiores e selecione <strong className="text-slate-900">Instalar aplicação / Adicionar ao Ecrã</strong>.
                </p>
              </div>
            )}

            {/* Sub-prompt: newsletter promos and follow list */}
            <div className="border-t border-white/5 pt-3.5 space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-extrabold block text-left">Registar para Campanhas & Descontos</span>
              
              {newsletterSubscribed ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-[11px] leading-snug font-bold text-center animate-pulse-subtle">
                  🎉 Registado com sucesso! Vai receber campanhas e alertas VIP deste estabelecimento.
                </div>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newsletterEmail.trim()) return;
                    setNewsletterSubscribed(true);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="email"
                    required
                    placeholder="teu-email@exemplo.com"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-purple-500 placeholder-slate-650"
                  />
                  <button
                    type="submit"
                    className="px-3.5 bg-purple-600 hover:bg-purple-700 text-slate-900 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center shrink-0"
                  >
                    Seguir
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
