import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Business, Review } from '../types';
import { fetchReviewsForBusiness, submitReview } from '../utils/reviewsHelper';
import { startChatSession, fetchMessagesForSession, submitMessage } from '../utils/communicationHelper';
import { useAuth } from '../hooks/useAuth';
import BookingModal from '../components/BookingModal';
import SecurityBadge from '../components/SecurityBadge';
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
, ArrowRight} from 'lucide-react';

export default function BusinessDetail() {
  const { slug } = useParams<{ slug: string }>();
  
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
      alert('Inicie sessão para adicionar aos favoritos');
      return;
    }
    const isFav = !favoriteActive;
    setFavoriteActive(isFav);
    try {
      await toggleFavorite(user.id, business!.id);
    } catch(err) {}
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleOpenBookingFromService = (svc: any) => {
    if (svc) setSelectedService(svc);
    setBookingOpen(true);
  };

  return (
    <div id="business-detail-view" className="bg-white min-h-screen pb-24 font-sans text-slate-800">
      
      {/* Premium Cover Area */}
      <div className="relative h-[300px] md:h-[400px] w-full bg-slate-100">
        <img
          src={business.cover_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80'}
          alt={business.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute top-4 left-4 z-10">
          <Link to="/explore" className="bg-white/90 backdrop-blur p-2 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button onClick={handleToggleFavorite} className="bg-white/90 backdrop-blur p-2 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm">
            <Heart className={`w-5 h-5 ${favoriteActive ? 'fill-rose-500 text-rose-500' : 'text-slate-700'}`} />
          </button>
          <button onClick={handleShareLink} className="bg-white/90 backdrop-blur p-2 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm text-slate-700">
            {copiedLink ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-5 h-5" />}
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 max-w-5xl mx-auto flex items-end gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white p-1.5 shadow-xl shrink-0 relative overflow-hidden hidden sm:block">
            <img src={business.logo_url || 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=400&q=80'} alt="Logo" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{business.category}</span>
              {business.accepts_online_payments && (
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider hidden sm:inline-block">Pagamento Online</span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight">{business.name}</h1>
            <div className="flex flex-wrap items-center text-white/90 text-sm gap-4">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 mr-1" />
                <span className="font-bold">{(business.rating || 5.0).toFixed(1)}</span>
                <span className="mx-1 opacity-60">•</span>
                <span className="underline cursor-pointer">{reviews.length} avaliações</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1 opacity-70" />
                <span>{business.address_line_1 || business.city}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 flex flex-col lg:flex-row gap-8">
        
        {/* Main Content */}
        <div className="flex-1 space-y-12">
          
          {/* About */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Sobre o espaço</h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              {business.description || "Um espaço dedicado a cuidar da sua beleza e bem-estar, com profissionais qualificados e um ambiente relaxante."}
            </p>
          </section>

          {/* Services */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Serviços</h2>
            {loadingServices ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-xl" />)}
              </div>
            ) : services.length === 0 ? (
              <p className="text-slate-500 text-sm italic bg-slate-50 p-6 rounded-2xl text-center">Nenhum serviço disponível no momento.</p>
            ) : (
              <div className="space-y-4">
                {services.map((svc) => (
                  <div key={svc.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 hover:shadow-sm transition-all group">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm md:text-base group-hover:text-purple-600 transition-colors">{svc.name}</h3>
                      <div className="flex items-center text-xs text-slate-500 mt-1 gap-3">
                        <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {svc.duration} min</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="block font-bold text-slate-900">{svc.price}€</span>
                      </div>
                      <button 
                        onClick={() => { setSelectedService(svc); handleOpenBookingFromService(svc); }}
                        className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-xl"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Staff */}
          {staff.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Equipa</h2>
              <div className="flex overflow-x-auto gap-4 hide-scrollbar pb-2">
                {staff.map(s => (
                  <div key={s.id} className="w-24 shrink-0 flex flex-col items-center">
                    <img src={s.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=f8fafc&color=64748b`} className="w-20 h-20 rounded-full object-cover mb-2 border border-slate-100 shadow-sm" />
                    <span className="font-bold text-xs text-slate-900 text-center">{s.name}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Avaliações</h2>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="font-black text-xl text-slate-900">{(business.rating || 5.0).toFixed(1)}</span>
              </div>
            </div>
            
            {loadingReviews ? (
              <div className="h-32 bg-slate-50 animate-pulse rounded-2xl" />
            ) : reviews.length === 0 ? (
              <p className="text-slate-500 text-sm bg-slate-50 p-6 rounded-2xl text-center">Ainda sem avaliações.</p>
            ) : (
              <div className="space-y-4">
                {reviews.slice(0, 3).map((r, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-slate-900">{r.reviewer_name || 'Cliente'}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, idx) => (
                          <Star key={idx} className={`w-3 h-3 ${idx < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-slate-600">{r.comment}</p>}
                    {r.service_name && <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider mt-2">{r.service_name}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Sidebar Info & Booking Button */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="sticky top-24 bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
            
            <button 
              onClick={() => handleOpenBookingFromService(services[0] || null)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg py-4 rounded-2xl mb-6 shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
            >
              Reservar Agora <ArrowRight className="w-5 h-5" />
            </button>

            <div className="space-y-4 text-sm">
              {/* Horário */}
              <div>
                <h4 className="font-bold text-slate-900 mb-3 flex items-center"><Clock className="w-4 h-4 mr-2 text-slate-400" /> Horário</h4>
                <div className="space-y-1.5 pl-6">
                  {businessHours.length > 0 ? businessHours.map((h, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-slate-500 capitalize">{['dom','seg','ter','qua','qui','sex','sab'][h.day_of_week]}</span>
                      <span className="font-medium text-slate-900">
                        {h.is_closed ? <span className="text-rose-500">Encerrado</span> : `${h.open_time.slice(0,5)} - ${h.close_time.slice(0,5)}`}
                      </span>
                    </div>
                  )) : (
                    <p className="text-xs text-slate-500">Horário não disponível.</p>
                  )}
                </div>
              </div>
              
              <hr className="border-slate-200" />

              {/* Contactos */}
              <div>
                <h4 className="font-bold text-slate-900 mb-3 flex items-center"><MapPin className="w-4 h-4 mr-2 text-slate-400" /> Localização</h4>
                <p className="text-xs text-slate-600 pl-6 leading-relaxed mb-3">
                  {business.address_line_1}<br/>
                  {business.postal_code} {business.city}
                </p>
                <div className="w-full h-32 rounded-xl bg-slate-200 overflow-hidden ml-6 mb-3">
                  {/* Fake map or real map integration */}
                  <img src={`https://maps.googleapis.com/maps/api/staticmap?center=${business.latitude},${business.longitude}&zoom=15&size=400x200&key=${process.env.GOOGLE_MAPS_PLATFORM_KEY || ''}`} className="w-full h-full object-cover" alt="Map" />
                </div>
              </div>
              
            </div>
            
          </div>
        </div>

      </div>

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        business={business}
        services={services}
        user={user} profile={profile}
      />
    </div>
  );
}
