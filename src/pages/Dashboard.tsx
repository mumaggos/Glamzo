import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { 
  Business, Service, ServiceCategory, Staff, BusinessHours, Booking, 
  BookingStatus, PaymentStatus 
} from '../types';
import { 
  Building, LayoutGrid, Calendar, Scissors, Users, Clock, UsersRound,
  TrendingUp, BarChart, Tag, Landmark, Smartphone, Settings, LogOut, 
  Plus, Edit2, Trash2, Check, X, AlertCircle, Sparkles, AlertTriangle, CheckCircle, 
  DollarSign, CheckSquare, Search, Phone, Mail, HelpCircle, Eye, RefreshCw, MapPin, Gift, Bell, Play, Truck, Menu, MessageSquare,
  Lock, CreditCard, ShieldCheck, Globe, QrCode, Copy, ExternalLink, Download, Printer, Share2, Heart,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { 
  BarChart as RBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart as RLineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { realtimeService } from '../utils/realtimeService';
import GlamzoLogo from '../components/GlamzoLogo';
import { slugify, validateSlugUniqueness } from '../utils/slugify';
import { optimizeImageBeforeUpload } from '../utils/imageOptimizer';
import DashboardAssistant from '../components/DashboardAssistant';
import DashboardMessages from '../components/DashboardMessages';

export default function Dashboard() {
  const { user, profile, signOut, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Active tab of our dark high-contrast operational terminal
  const [activeTab, setActiveTab] = useState<'agenda' | 'reservas' | 'servicos' | 'equipa' | 'clientes' | 'configuracoes' | 'financeiro' | 'campanhas' | 'loja' | 'mensagens'>('agenda');

  // Core Database States
  const [business, setBusiness] = useState<Business | null>(null);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [ledgers, setLedgers] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isVerifyingSub, setIsVerifyingSub] = useState(false);
  const [verifyingText, setVerifyingText] = useState('');
  const [cancelingSubscription, setCancelingSubscription] = useState(false);

  // State variables for manually connecting an existing/pre-built Glamzo Pay Connect / Merchant Account ID
  const [manualStripeId, setManualStripeId] = useState('');
  const [savingManualStripe, setSavingManualStripe] = useState(false);

  const [tabletOrder, setTabletOrder] = useState<any>(null);
  
  // Real database coupons state
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_percent: '',
    discount_value: '',
    valid_until: '',
    is_active: true
  });

  // Real Image Uploading states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Website & QR Code States
  const [editSlugValue, setEditSlugValue] = useState('');
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugCheckResult, setSlugCheckResult] = useState<'available' | 'taken' | null>(null);
  const [publicPageEnabled, setPublicPageEnabled] = useState(true);
  const [savingWebsiteConfig, setSavingWebsiteConfig] = useState(false);
  const [websiteLinkCopied, setWebsiteLinkCopied] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stripeStatus, setStripeStatus] = useState<{
    connected?: boolean;
    stripe_account_id?: string;
    charges_enabled?: boolean;
    payouts_enabled?: boolean;
    details_submitted?: boolean;
  } | null>(null);

  // Sub-tab / filters states
  const [agendaMode, setAgendaMode] = useState<'today' | 'week' | 'month' | 'by_staff'>('today');
  const [selectedAgendaDate, setSelectedAgendaDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'>('all');
  const [bookingSearch, setBookingSearch] = useState('');

  // Loading & status states
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<{ visible: boolean; title: string; desc: string } | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // States for Manual Booking / Blocking Times
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [manualBookingType, setManualBookingType] = useState<'booking' | 'block'>('booking');
  const [manualClientName, setManualClientName] = useState('');
  const [manualReason, setManualReason] = useState('');
  const [manualServiceId, setManualServiceId] = useState('');
  const [manualStaffId, setManualStaffId] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualStartTime, setManualStartTime] = useState('09:00');
  const [manualNotes, setManualNotes] = useState('');
  const [isSavingManual, setIsSavingManual] = useState(false);

  // Helper to extract clean manual names or block labels for bookings
  const getBookingDisplayName = (bk: any) => {
    if (bk.notes) {
      if (bk.notes.startsWith('Reserva Manual:')) {
        return bk.notes.substring('Reserva Manual:'.length).trim();
      }
      if (bk.notes.startsWith('Bloqueio Agenda:')) {
        return bk.notes.trim();
      }
    }
    return bk.customer?.full_name || bk.customer_profile?.full_name || 'Cliente Particular';
  };

  const handleSaveManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !business) {
      alert("Sessão ou loja não inicializada.");
      return;
    }
    
    // Validate inputs
    if (manualBookingType === 'booking' && !manualClientName.trim()) {
      alert("Por favor, introduza o nome do cliente.");
      return;
    }
    if (manualBookingType === 'block' && !manualReason.trim()) {
      alert("Por favor, introduza o motivo do bloqueio.");
      return;
    }
    
    setIsSavingManual(true);
    try {
      // Find selected service for duration and price
      const selectedSvc = services.find(s => s.id === manualServiceId);
      const svcPrice = selectedSvc ? Number(selectedSvc.price) : 0;
      
      // Calculate end time
      const [startH, startM] = manualStartTime.split(':').map(Number);
      const duration = selectedSvc ? Number(selectedSvc.duration_minutes) : 30;
      const totalMinutes = startH * 60 + startM + duration;
      const endH = Math.floor(totalMinutes / 60) % 24;
      const endM = totalMinutes % 60;
      const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
      
      const payloadNotes = manualBookingType === 'block' 
        ? `Bloqueio Agenda: ${manualReason}`
        : `Reserva Manual: ${manualClientName}${manualNotes ? ' - ' + manualNotes : ''}`;

      // If no services were selected, use the first available service
      let finalServiceId = manualServiceId;
      if (!finalServiceId && services.length > 0) {
        finalServiceId = services[0].id;
      }
      
      if (!finalServiceId) {
        throw new Error("Por favor, crie pelo menos um serviço no separador 'Serviços' antes de agendar manualmente.");
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          customer_id: user.id, // the owner is the customer for manual bookings/blocks
          business_id: business.id,
          service_id: finalServiceId,
          staff_id: manualStaffId || null,
          booking_date: manualDate,
          start_time: manualStartTime,
          end_time: endTimeStr,
          total_price: manualBookingType === 'block' ? 0 : svcPrice,
          payment_method: 'local',
          payment_status: manualBookingType === 'block' ? 'paid' : 'unpaid',
          booking_status: 'confirmed', // confirmed immediately
          notes: payloadNotes
        })
        .select(`
          *,
          service:services(name, price, duration_minutes),
          staff:staff(full_name)
        `)
        .single();

      if (error) throw error;

      // Create simulated payment for accounting compliance rules
      await supabase
        .from('payments')
        .insert({
          booking_id: data.id,
          customer_id: user.id,
          business_id: business.id,
          amount_total: manualBookingType === 'block' ? 0 : svcPrice,
          glamzo_fee: 0,
          business_amount: manualBookingType === 'block' ? 0 : svcPrice,
          payment_method: 'local',
          payment_status: manualBookingType === 'block' ? 'paid' : 'unpaid',
          stripe_payment_intent: null
        });

      notifyTerminal(
        manualBookingType === 'block' ? "🛑 Horário Bloqueado" : "📅 Marcação Reservada",
        manualBookingType === 'block' ? `Bloqueio registado: ${manualReason}` : `Reserva de ${manualClientName} foi criada com sucesso na agenda!`
      );
      
      setIsManualBookingOpen(false);
      // Reset values
      setManualClientName('');
      setManualReason('');
      setManualNotes('');
      // Reload list
      loadTerminalData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erro de base de dados ao guardar a marcação manual.");
    } finally {
      setIsSavingManual(false);
    }
  };

  // Dynamic real-time partner dashboard charts (Phase 12 validation)
  const getDynamicPartnerVolumeData = () => {
    // If no bookings have been generated yet, return empty to support transparent reporting fallbacks
    if (!bookings || bookings.length === 0) {
      return [];
    }

    // Build authentic dynamic revenue aggregates grouping by month of booking
    const monthlyAccumulators: { [key: string]: number } = {
      'Jan': 0, 'Fev': 0, 'Mar': 0, 'Abr': 0, 'Mai': 0,
      'Jun': 0, 'Jul': 0, 'Ago': 0, 'Set': 0, 'Out': 0, 'Nov': 0, 'Dez': 0
    };

    const monthNamesPt = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    let hasAnyCompleted = false;
    bookings.forEach(b => {
      if (b.booking_status === 'completed' || b.booking_status === 'confirmed') {
        const d = new Date(b.starts_at || Date.now());
        const mName = monthNamesPt[d.getMonth()];
        if (mName) {
          monthlyAccumulators[mName] += Number(b.price || b.total_price || 0);
          hasAnyCompleted = true;
        }
      }
    });

    if (!hasAnyCompleted) {
      return [];
    }

    // Return the active tracking months in pt
    return monthNamesPt.map(m => ({
      month: m,
      receita: parseFloat(monthlyAccumulators[m].toFixed(2))
    })).filter(item => item.receita > 0);
  };

  const getDynamicPartnerWeeklyOccupancy = () => {
    const activeBookings = bookings.filter(b => b.booking_status === 'completed' || b.booking_status === 'confirmed');
    if (!activeBookings || activeBookings.length === 0) {
      return [];
    }

    // Calculate rates from actual bookings count for weekdays (0 = Sunday, 1 = Monday ...)
    const completionsByDay = [0, 0, 0, 0, 0, 0, 0];
    activeBookings.forEach(b => {
      const d = new Date(b.starts_at || Date.now());
      const dayIdx = d.getDay();
      completionsByDay[dayIdx] += 1;
    });

    const weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    // Convert counts to a nice percentage rate
    const maxCount = Math.max(...completionsByDay, 1);
    const data = weekdayLabels.map((label, idx) => {
      const count = completionsByDay[idx];
      const rate = Math.round((count / maxCount) * 100);
      return {
        day: label,
        taxa: rate
      };
    });

    // Filter out Sunday if it has zero activity
    return data.filter(d => d.day !== 'Dom' || completionsByDay[0] > 0);
  };

  // Form states (Service Add/Edit)
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: 35,
    duration_minutes: 45,
    category_id: '',
    image_url: '',
    is_active: true
  });

  // Form states (Staff Add/Edit)
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffForm, setStaffForm] = useState({
    full_name: '',
    role_title: '',
    avatar_url: '',
    is_active: true,
    off_days: '' // comma-separated weekday indices
  });

  // Reschedule state managers
  const [reschedulingBooking, setReschedulingBooking] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleStartTime, setRescheduleStartTime] = useState<string>('09:00');
  const [rescheduleEndTime, setRescheduleEndTime] = useState<string>('09:45');

  // Form states (Payout Submission)
  const [payoutAmount, setPayoutAmount] = useState<number>(100);
  const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null);

  // Active ledger item selected for Invoicing / Faturação view
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Synthesize a gorgeous operational Double-Chime sound purely in the clients browser (Web Audio API)
  const playTerminalChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Chime 1 (High bell sound)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, ctx.currentTime); // B5 note
      gain1.gain.setValueAtTime(0.12, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.35);
      
      // Chime 2 (Sweet completion note)
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1318.51, ctx.currentTime); // E6 note
        gain2.gain.setValueAtTime(0.12, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.5);
      }, 140);
    } catch (e) {
      console.warn("Web Audio chime could not fire:", e);
    }
  };

  // Trigger Toast notifications (called on live simulation or active triggers)
  const notifyTerminal = (title: string, desc: string) => {
    playTerminalChime();
    setToastNotification({ visible: true, title, desc });
    setTimeout(() => {
      setToastNotification(prev => prev ? { ...prev, visible: false } : null);
    }, 6000);
  };

  // Fetch critical business dataset from raw production databases
  const loadTerminalData = async () => {
    if (!user) return;
    setLoading(true);
    setGlobalError(null);
    try {
      // 1. Fetch main business profile owned by this partner account
      const { data: bData, error: bErr } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (bErr) throw bErr;

      if (!bData) {
        // Business profile does not exist yet: prompt onboarding redirections
        navigate('/onboarding');
        return;
      }
      
      if (bData.status === 'setup') {
        navigate('/setup');
        return;
      }
      
      setBusiness(bData);
      setEditSlugValue(bData.slug || '');
      setPublicPageEnabled(bData.public_page_enabled !== false);

      // Fetch dynamic Glamzo Pay Account status from Glamzo Pay API if it exists
      if (bData?.stripe_account_id) {
        try {
          const sRes = await fetch(`/api/stripe/account-status?businessId=${bData.id}`);
          if (sRes.ok) {
            const sPayload = await sRes.json();
            setStripeStatus(sPayload);
          }
        } catch (sErr) {
          console.warn("Failed to fetch fresh Glamzo Pay account status:", sErr);
        }
      } else {
        setStripeStatus(null);
      }

      // 2. Load categories, services, staff, business hours, and operational client books concurrently
      const [
        { data: catData },
        { data: svData },
        { data: stData },
        { data: hrData },
        { data: bkData },
        { data: pyData },
        { data: poData },
        { data: subData },
        { data: tabletData }
      ] = await Promise.all([
        supabase.from('service_categories').select('*'),
        supabase.from('services').select('*, category:service_categories(*)').eq('business_id', bData.id).order('created_at', { ascending: false }),
        supabase.from('staff').select('*').eq('business_id', bData.id).order('created_at', { ascending: false }),
        supabase.from('business_hours').select('*').eq('business_id', bData.id).order('weekday', { ascending: true }),
        supabase.from('bookings').select('*, customer:profiles(*)').eq('business_id', bData.id).order('booking_date', { ascending: false }).order('start_time', { ascending: false }),
        supabase.from('payments').select('*').eq('business_id', bData.id),
        supabase.from('payouts').select('*').eq('business_id', bData.id).order('created_at', { ascending: false }),
        supabase.from('subscriptions').select('*').eq('business_id', bData.id).order('created_at', { ascending: false }),
        supabase.from('tablet_orders').select('*').eq('business_id', bData.id).maybeSingle()
      ]);

      setCategories(catData || []);
      setServices(svData || []);
      setStaff(stData || []);
      setHours(hrData || []);
      setBookings(bkData || []);
      setLedgers(pyData || []);
      setPayouts(poData || []);
      setSubscriptions(subData || []);
      setTabletOrder(tabletData || null);

      // Real coupons fetching
      let cpData: any[] = [];
      try {
        const { data: resCoupons, error: cpErr } = await supabase
          .from('business_coupons')
          .select('*')
          .eq('business_id', bData.id)
          .order('created_at', { ascending: false });
        if (!cpErr && resCoupons && resCoupons.length > 0) {
          cpData = resCoupons;
          // Synchronize/cache to localStorage for consumer booking modal usage
          localStorage.setItem('glamzo_coupons', JSON.stringify(resCoupons));
        } else {
          // Use local storage cache if database is empty/failing
          const localStr = localStorage.getItem('glamzo_coupons');
          if (localStr) {
            cpData = JSON.parse(localStr).filter((c: any) => c.business_id === bData.id);
          }
        }
      } catch (err) {
        console.warn("Table business_coupons probably does not exist yet or offline sandbox active, using cached coupons list:", err);
        const localStr = localStorage.getItem('glamzo_coupons');
        if (localStr) {
          cpData = JSON.parse(localStr).filter((c: any) => c.business_id === bData.id);
        }
      }
      setCoupons(cpData);

    } catch (err: any) {
      console.error("Failed to load terminal datasets:", err);
      setGlobalError(err.message || 'Erro crítico ao sincronizar lote ativo de dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadTerminalData();
    }
  }, [user]);

  // Force scroll to top on tab change for sleek navigation comforts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Live Real-Time Postgres Change Subscriptions via WebSockets
  useEffect(() => {
    if (!business?.id) return;

    const channel = supabase
      .channel(`realtime-bookings-${business.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: `business_id=eq.${business.id}`
        },
        async (payload) => {
          console.log('Real-time insertion captured on bookings:', payload);
          // Play sound
          playTerminalChime();
          // Read table details safely
          await loadTerminalData();
          // Dispatch beautiful alert
          notifyTerminal(
            "⚡️ Nova Marcação em Tempo Real!",
            `Uma nova reserva foi adicionada automaticamente ao calendário pelo cliente.`
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `business_id=eq.${business.id}`
        },
        async (payload) => {
          console.log('Real-time update captured on bookings:', payload);
          
          await loadTerminalData(); // Always refresh dashboard data

          if (payload.new.status === 'completed' && payload.old.status !== 'completed') {
            playTerminalChime();
            notifyTerminal(
              "✅ Marcação Concluída",
              "A marcação foi registada como concluída com sucesso. Os dados e relatórios foram atualizados."
            );
          } else if (payload.new.status === 'cancelled' && payload.old.status !== 'cancelled') {
             notifyTerminal(
              "❌ Marcação Cancelada",
              "Uma marcação foi cancelada e removida da agenda."
            );
          } else if (payload.new.status === 'confirmed' && payload.old.status !== 'confirmed') {
             notifyTerminal(
              "📅 Marcação Confirmada",
              "Uma marcação foi confirmada na agenda."
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [business?.id]);

  useEffect(() => {
    if (activeTab === 'loja' && business?.slug && qrCanvasRef.current) {
      const canvas = qrCanvasRef.current;
      const url = `${window.location.origin}/${business.slug}?source=qrcode`;
      QRCode.toCanvas(
        canvas,
        url,
        {
          width: 512, // High resolution
          margin: 4,
          color: {
            dark: '#03000a',
            light: '#ffffff'
          },
          errorCorrectionLevel: 'H'
        },
        (err) => {
          if (err) {
            console.error('Failed to draw QR code:', err);
            return;
          }
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          const size = canvas.width;
          const logoSize = size * 0.22;
          const halfSize = size / 2;

          // Circle backing
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(halfSize, halfSize, (logoSize / 2) + 6, 0, 2 * Math.PI);
          ctx.fill();

          // Brand backdrop badge
          ctx.fillStyle = '#6b21a8';
          ctx.beginPath();
          ctx.arc(halfSize, halfSize, logoSize / 2, 0, 2 * Math.PI);
          ctx.fill();

          // Brand letter "G"
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${logoSize * 0.65}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('G', halfSize, halfSize + 1);
        }
      );
    }
  }, [activeTab, business?.slug, qrCanvasRef.current]);

  // Handle simulations of customer bookings (live real database insert + notification bell + play audio synth chime!)
  const handleSimulateNewBooking = async () => {
    if (!business) return;
    try {
      // Find or create placeholder service & staff if unavailable
      const targetServiceId = services[0]?.id || null;
      const targetStaffId = staff[0]?.id || null;
      const finalPrice = services[0]?.price || 40;

      // Real insert on the active bookings table
      const { data: newBk, error: insErr } = await supabase
        .from('bookings')
        .insert({
          business_id: business.id,
          customer_id: user!.id, // owner acts as client for prompt simulation
          service_id: targetServiceId,
          staff_id: targetStaffId,
          booking_date: new Date().toISOString().split('T')[0],
          start_time: '16:00',
          end_time: '16:45',
          total_price: finalPrice,
          payment_method: 'terminal_offline',
          payment_status: 'paid',
          booking_status: 'confirmed',
          notes: 'Reserva simulada em tempo de execução para atestar a recepção sonora do Glamzo Terminal.'
        })
        .select()
        .single();

      if (insErr) throw insErr;

      // Play chime sound & dispatch notification toast immediately
      notifyTerminal(
        "🔔 Nova Reserva Recebida!",
        `Um cliente acaba de reservar o serviço "${services[0]?.name || 'Beleza Premium'}" para hoje às 16:00.`
      );

      // Instantly reload active lists
      await loadTerminalData();

      // Broadcast globally for clients & agenda syncing
      realtimeService.broadcast('booking:change', { id: newBk?.id, status: 'confirmed' });
      
      // Send Resend automated confirmation email simulated
      const clientEmail = profile.email || 'parceiro@glamzo.com';
      const clientName = profile.full_name || 'Profissional Glamzo';
      await realtimeService.sendEmailViaResend(
        clientEmail,
        `Reserva Confirmada • ${services[0]?.name || 'Beleza Premium'}`,
        'confirmação reserva',
        { 
          clientName,
          businessName: business?.name || 'Glamzo Salão',
          serviceName: services[0]?.name || 'Beleza Premium',
          bookingDate: new Date().toISOString().split('T')[0],
          bookingTime: '16:00'
        }
      );

    } catch (err: any) {
      console.error(err);
      setGlobalError("Não foi possível simular a reserva. Crie serviços ou profissionais ativos primeiro.");
    }
  };

  useEffect(() => {
    const term = editSlugValue.trim();
    if (!term) {
      setSlugCheckResult(null);
      return;
    }
    const clean = slugify(term);
    if (business && clean === business.slug) {
      setSlugCheckResult('available');
      return;
    }
    const timer = setTimeout(async () => {
      setSlugChecking(true);
      setSlugCheckResult(null);
      try {
        const isAvailable = await validateSlugUniqueness(clean, business?.id);
        setSlugCheckResult(isAvailable ? 'available' : 'taken');
      } catch (err) {
        console.error('Error auto-checking slug:', err);
      } finally {
        setSlugChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [editSlugValue, business?.slug, business?.id]);

  const handleSaveWebsiteConfig = async () => {
    if (!business) return;
    if (!editSlugValue.trim()) {
      alert('O link público (slug) não pode estar vazio.');
      return;
    }

    const clean = slugify(editSlugValue);
    setEditSlugValue(clean);

    setSavingWebsiteConfig(true);
    try {
      // First confirm availability if changed
      if (clean !== business.slug) {
        const isAvailable = await validateSlugUniqueness(clean, business.id);
        if (!isAvailable) {
          alert('Este link (slug) já está a ser utilizado por outra loja. Escolha outro.');
          setSavingWebsiteConfig(false);
          return;
        }
      }

      const { error } = await supabase
        .from('businesses')
        .update({
          slug: clean,
          public_page_enabled: publicPageEnabled
        })
        .eq('id', business.id);

      if (error) {
        const isColumnErr = error.code === '42703' || error.message?.includes('column');
        if (isColumnErr) {
          console.warn('public_page_enabled column not available. Saving slug only...');
          const { error: retryError } = await supabase
            .from('businesses')
            .update({ slug: clean })
            .eq('id', business.id);
          if (retryError) throw retryError;
        } else {
          throw error;
        }
      }

      localStorage.setItem(`glamzo_public_enabled:${business.id}`, publicPageEnabled ? 'true' : 'false');

      setBusiness(prev => prev ? { ...prev, slug: clean, public_page_enabled: publicPageEnabled } : null);
      setGlobalSuccess('Configurações do seu website público guardadas com sucesso!');
      setSlugCheckResult(null);
    } catch (err: any) {
      console.error(err);
      alert('Erro ao guardar as configurações da loja.');
    } finally {
      setSavingWebsiteConfig(false);
    }
  };

  const handleDownloadPNG = () => {
    if (!qrCanvasRef.current) return;
    const link = document.createElement('a');
    link.download = `${business?.slug || 'glamzo'}-qrcode.png`;
    link.href = qrCanvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleDownloadSVG = () => {
    if (!business?.slug) return;
    const url = `${window.location.origin}/${business.slug}?source=qrcode`;
    QRCode.toString(
      url,
      {
        type: 'svg',
        errorCorrectionLevel: 'H',
        margin: 4,
        color: {
          dark: '#03000a',
          light: '#ffffff'
        }
      },
      (err, rawSvg) => {
        if (err) {
          console.error(err);
          return;
        }
        const blob = new Blob([rawSvg], { type: 'image/svg+xml' });
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${business?.slug || 'glamzo'}-qrcode.svg`;
        link.href = objectUrl;
        link.click();
        URL.revokeObjectURL(objectUrl);
      }
    );
  };

  const handlePrintQRCode = () => {
    if (!qrCanvasRef.current) return;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>Imprimir QR Code - ${business?.name || 'Glamzo Store'}</title>
            <style>
              body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 95vh; font-family: system-ui, -apple-system, sans-serif; margin: 0; background: #fff; color: #111; }
              .outer-wrap { text-align: center; border: 2px solid #eaeaea; padding: 40px; border-radius: 32px; background: white; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
              img { width: 350px; height: 350px; margin: 20px 0; }
              h1 { margin: 0; font-size: 28px; font-weight: 800; color: #6b21a8; letter-spacing: -0.025em; }
              p { margin: 6px 0 0; color: #666; font-size: 15px; font-weight: 500; }
              .footer { margin-top: 24px; font-size: 11px; color: #aaa; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; font-family: monospace; }
            </style>
          </head>
          <body>
            <div class="outer-wrap">
              <h1>${business?.name || 'Glamzo Store'}</h1>
              <p>Escaneie com a câmera do telemóvel para agendamento automático</p>
              <img src="${qrCanvasRef.current.toDataURL('image/png')}" />
              <div class="footer">Parceiro Oficial Glamzo • glamzo.pt</div>
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  const handleShareStore = async () => {
    if (!business?.slug) return;
    const shareUrl = `${window.location.origin}/${business.slug}`;
    const shareData = {
      title: business.name,
      text: `Reserve já online em ${business.name} no Glamzo!`,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.warn('Navigator share dismissed or failed:', err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setWebsiteLinkCopied(true);
      setTimeout(() => setWebsiteLinkCopied(false), 2000);
    }
  };

  const [connectingStripe, setConnectingStripe] = useState(false);

  // Handle Glamzo Pay Standard Connect success callback parameter capture
  useEffect(() => {
    const status = searchParams.get('status');
    const stripeAcct = searchParams.get('stripe_acct');

    if (status === 'connect_success' && stripeAcct && user) {
      const syncStripeConnection = async () => {
        try {
          // 1. Update Glamzo Pay account id in database with active flags
          const { error } = await supabase
            .from('businesses')
            .update({ 
              stripe_account_id: stripeAcct,
              charges_enabled: true,
              payouts_enabled: true
            })
            .eq('owner_id', user.id);

          if (error) throw error;

          // 2. Play subtle sound + show alert
          playTerminalChime();
          notifyTerminal(
            "🎉 Conta Glamzo Pay Ligada!",
            "O seu salão de beleza está agora ligado ao Glamzo Pay Standard Connect para split de pagamentos automatizado!"
          );

          // 3. Clean search params to keep URL pristine
          navigate('/dashboard', { replace: true });
          
          // 4. Force reload data
          await loadTerminalData();
        } catch (syncErr: any) {
          console.error('Error syncing Glamzo Pay Connect status:', syncErr);
        }
      };
      
      syncStripeConnection();
    }

    if (status === 'success_pro' && user) {
      const handleSubscriptionSuccessCheck = async () => {
        setIsVerifyingSub(true);
        setVerifyingText("A comunicar com os servidores Glamzo Pay... ⌛");
        console.log("[Stripe Debug] Callback success captured. user_id:", user.id);
        notifyTerminal(
          "⌛ Verificando Pagamento...",
          "A aguardar confirmação segura do pagamento da subscrição com os servidores do Glamzo Pay... (Isto pode levar alguns segundos)"
        );

        const sessionId = searchParams.get('session_id');
        let found = false;

        // Try calling our backend verify-subscription endpoint first for instantaneous activation!
        try {
          const { data: bData } = await supabase
            .from('businesses')
            .select('id')
            .eq('owner_id', user.id)
            .maybeSingle();

          if (bData) {
            console.log("[Stripe Debug] Found business id:", bData.id, ". Calling verify-subscription API...");
            
            // 12-second timeout race safeguard to prevent infinite loading state
            const verifyCall = fetch('/api/stripe/verify-subscription', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                sessionId: sessionId || undefined,
                businessId: bData.id
              })
            }).then(async r => {
              if (!r.ok) {
                const errText = await r.text();
                throw new Error(errText || "Invalid server response status code");
              }
              return r.json();
            });

            const timeoutPromise = new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error("Timeout de rede: Glamzo Pay webhook demorou mais que o esperado.")), 12000);
            });

            const vResult = await Promise.race([verifyCall, timeoutPromise]);
            console.log("[Stripe Debug] Verify subscription API outcome:", vResult);

            if (vResult && vResult.success) {
              const subId = vResult.stripeSubscriptionId;
              const subStatus = vResult.status;
              const expiresAt = vResult.expiresAt;
              const custId = vResult.customerId;

              // Update customer metadata inside local client-side Supabase as secondary reinforcement
              if (custId) {
                await supabase
                  .from('businesses')
                  .update({ 
                    stripe_customer_id: custId,
                    stripe_subscription_id: subId,
                    subscription_status: subStatus,
                    subscription_active: subStatus === 'active' || subStatus === 'trialing'
                  })
                  .eq('id', bData.id);
              }

              const { data: existingSub } = await supabase
                .from('subscriptions')
                .select('id')
                .eq('business_id', bData.id)
                .maybeSingle();

              if (existingSub) {
                console.log("[Stripe Debug] Syncing existing subscription entry...");
                await supabase
                  .from('subscriptions')
                  .update({
                    plan_name: 'PRO',
                    status: subStatus,
                    monthly_price: 19.90,
                    expires_at: expiresAt,
                    stripe_subscription_id: subId
                  })
                  .eq('id', existingSub.id);
              } else {
                console.log("[Stripe Debug] Constructing new subscription row...");
                await supabase
                  .from('subscriptions')
                  .insert({
                    business_id: bData.id,
                    plan_name: 'PRO',
                    status: subStatus,
                    monthly_price: 19.90,
                    started_at: new Date().toISOString(),
                    expires_at: expiresAt,
                    stripe_subscription_id: subId
                  });
              }

              found = true;
            }
          }
        } catch (apiErr) {
          console.error("[Stripe Debug] Direct API verification failed, trying standard polling fallback:", apiErr);
        }

        if (!found) {
          // Keep polling database for up to 6 times to check if subscription table or business has been activated
          let attempts = 0;
          const maxAttempts = 6;

          while (attempts < maxAttempts && !found) {
            attempts++;
            setVerifyingText(`A verificar confirmação de pagamento... (Tentativa ${attempts}/${maxAttempts}) 🔗`);
            console.log(`[Stripe Debug] Polling db status, attempt ${attempts}...`);
            try {
              const { data: bData } = await supabase
                .from('businesses')
                .select('*')
                .eq('owner_id', user.id)
                .maybeSingle();

              if (bData && (bData.subscription_status === 'active' || bData.subscription_status === 'trialing')) {
                console.log("[Stripe Debug] Polling found updated trialing/active status in businesses table!");
                found = true;
                break;
              }

              if (bData) {
                const { data: subs } = await supabase
                  .from('subscriptions')
                  .select('*')
                  .eq('business_id', bData.id)
                  .order('created_at', { ascending: false });

                const activeSub = subs && subs.length > 0 ? subs[0] : null;
                if (activeSub && (activeSub.status === 'active' || activeSub.status === 'trialing')) {
                  console.log("[Stripe Debug] Polling found updated active/trialing row in subscriptions table!");
                  found = true;
                  break;
                }
              }
            } catch (e) {
              console.warn("[Stripe Debug] Polling attempt failed:", e);
            }
            // Wait 1.5 seconds before retrying
            await new Promise((resolve) => setTimeout(resolve, 1500));
          }
        }

        // Force a critical refresh of user auth profiles
        try {
          console.log("[Stripe Debug] Refreshing current user profile session details...");
          if (typeof refreshProfile === 'function') {
            await refreshProfile();
          }
        } catch (authRefErr) {
          console.warn("[Stripe Debug] Session refresh alert wrapper issue (non-blocking):", authRefErr);
        }

        setIsVerifyingSub(false);
        playTerminalChime();
        if (found) {
          notifyTerminal(
            "🎉 Plano PRO Ativado!",
            "Pagamento confirmado com sucesso! O seu salão de beleza está agora no plano Glamzo PRO."
          );
        } else {
          notifyTerminal(
            "⚠️ Sincronização em Curso",
            "A sua conta Glamzo Pay foi conectada. A base de dados será atualizada automaticamente via webhook nos próximos instantes."
          );
        }

        navigate('/dashboard', { replace: true });
        await loadTerminalData();
      };
      handleSubscriptionSuccessCheck();
    }

    if (status === 'cancelled_pro') {
      notifyTerminal(
        "ℹ️ Checkout Cancelado",
        "O processo de subscrição Glamzo PRO foi cancelado ou interrompido."
      );
      navigate('/dashboard', { replace: true });
    }

    if (status === 'success_credits' && user) {
      const handleCreditsSuccess = async () => {
        try {
          playTerminalChime();
          notifyTerminal(
            "🎉 Créditos Adicionados!",
            "Os seus créditos promocionais foram creditados com sucesso na sua conta!"
          );
          navigate('/dashboard', { replace: true });
          await loadTerminalData();
        } catch (syncErr: any) {
          console.error(syncErr);
        }
      };
      handleCreditsSuccess();
    }

    if (status === 'cancelled_credits') {
      notifyTerminal(
        "ℹ️ Compra de Créditos Cancelada",
        "O processo de aquisição de créditos foi cancelado."
      );
      navigate('/dashboard', { replace: true });
    }
  }, [user, searchParams]);

  // Helper to open Stripe/Redirect URLs safely out of sandboxed iframe previews
  const safeStripeRedirect = (url: string) => {
    if (!url) return;
    try {
      if (window.self !== window.top) {
        const opened = window.open(url, '_blank');
        if (!opened) {
          // If popup is blocked or returned null (safari / pop-up issues)
          console.warn("Popup blocked or not opened. Navigating directly inside top frame.");
          window.location.href = url;
        }
      } else {
        window.location.href = url;
      }
    } catch (e) {
      console.warn("Popup/window.open failed with error, falling back to window.location.href:", e);
      try {
        window.location.href = url;
      } catch (errInner) {
        console.error("Critical redirect fallback crash:", errInner);
        try {
          // Last resort fallback
          window.parent.location.href = url;
        } catch (errTop) {
          console.error("Top frame redirect also failed:", errTop);
        }
      }
    }
  };

  // Request Standard Connect onboarding link
  const handleConnectStripe = async () => {
    if (!business) return;
    setConnectingStripe(true);
    try {
      const response = await fetch('/api/stripe/connect/onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: business.id,
          businessEmail: business.email || user?.email,
          businessName: business.name,
        }),
      });

      const resData = await response.json();
      if (resData.url) {
        safeStripeRedirect(resData.url);
      } else {
        throw new Error(resData.error || 'Erro ao obter link Glamzo Pay.');
      }
    } catch (err: any) {
      console.error(err);
      notifyTerminal(
        "❌ Erro ao Ligar Glamzo Pay Connect",
        err.message || "Não foi possível gerar a ligação. Tente novamente."
      );
    } finally {
      setConnectingStripe(false);
    }
  };

  // Manually connect an existing Merchant Account ID to skip automatic programmatic onboarding failures
  const handleSaveManualStripe = async () => {
    if (!business || !manualStripeId.trim()) return;
    setSavingManualStripe(true);
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ stripe_account_id: manualStripeId.trim() })
        .eq('id', business.id);

      if (error) throw error;

      playTerminalChime();
      notifyTerminal(
        "🎉 Conta Glamzo Pay Ligada!",
        "ID de Conta Glamzo Pay Connect atualizado com sucesso no seu perfil!"
      );
      setManualStripeId('');
      await loadTerminalData();
    } catch (err: any) {
      console.error(err);
      notifyTerminal("❌ Erro ao Ligar Conta Bancária", err.message || "Tente novamente.");
    } finally {
      setSavingManualStripe(false);
    }
  };

  // Launch or open the Glamzo Pay Customer Billing Portal for subscriptions management
  const handleOpenBillingPortal = async () => {
    if (!business) return;
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ businessId: business.id })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }
    } catch (err) {
      console.warn('Falha ao abrir Billing Portal, executando checkout alternativo...', err);
    }
    // Fallback if portal cannot be opened
    handleSubscribePro();
  };

  // Launch a Glamzo Pay checkout recurring subscription with 14 days of trial
  const handleSubscribePro = async () => {
    if (!business) return;
    try {
      notifyTerminal("💳 Iniciar Checkout", "A preparar o seu Glamzo Pay Checkout do Plano PRO...");
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessId: business.id,
          planName: 'PRO',
          successUrl: window.location.origin + '/dashboard?status=success_pro&session_id={CHECKOUT_SESSION_ID}',
          cancelUrl: window.location.origin + '/dashboard?status=cancelled_pro'
        })
      });

      const resData = await response.json();
      console.log("Stripe response in Dashboard:", resData);

      if (response.ok && resData?.success && resData?.url) {
        safeStripeRedirect(resData.url);
      } else {
        const errorMsg = resData?.error || "Falha ao gerar o link do Glamzo Pay Checkout.";
        notifyTerminal("❌ Erro", errorMsg);
        alert(`Não foi possível iniciar o checkout: ${errorMsg}`);
      }
    } catch (err: any) {
      console.error('Falha ao iniciar checkout da subscrição:', err);
      notifyTerminal("❌ Erro Técnico", err.message || "Falha na ligação ao servidor.");
      alert(`Erro técnico ao processar pagamento: ${err.message || "Tente novamente."}`);
    }
  };

  // Cancel active recurring subscription and block panel
  const handleCancelSubscription = async () => {
    if (!business) return;
    const confirmCancel = window.confirm(
      "Tem a certeza absoluta de que deseja cancelar o seu plano Glamzo PRO?\r\n\r\nAo desativar o plano, o seu estabelecimento será imediatamente removido (ocultado) no Marketplace público e o seu painel de controlo será bloqueado até que associe um novo cartão."
    );
    if (!confirmCancel) return;

    try {
      setCancelingSubscription(true);
      notifyTerminal("🚫 Cancelar Subscrição", "A comunicar desativação e paragem ao Glamzo Pay...");
      
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ businessId: business.id })
      });

      const resData = await response.json();
      console.log("Stripe cancel response in Dashboard:", resData);

      if (response.ok && resData?.success) {
        notifyTerminal("✔ Desativado", "A sua subscrição foi desativada com sucesso.");
        setGlobalSuccess("A subscrição Glamzo PRO foi desativada. O seu salão foi ocultado do público.");
        
        // Instantly force local lock screen by updating state
        setBusiness(prev => {
          if (!prev) return null;
          return {
            ...prev,
            stripe_subscription_id: '',
            subscription_status: 'cancelled',
            subscription_active: false
          };
        });
        setSubscriptions([]);
      } else {
        const errorMsg = resData?.error || "Ocorreu um erro ao cancelar no servidor.";
        alert(`Não foi possível processar o cancelamento: ${errorMsg}`);
      }
    } catch (err: any) {
      console.error('Falha ao desativar subscrição:', err);
      alert(`Erro na ligação ao processar o cancelamento: ${err.message}`);
    } finally {
      setCancelingSubscription(false);
    }
  };

  // Update status of actual customer booking
  
  const isPastBooking = (dateStr: string, timeStr: string) => {
    try {
      if (!dateStr || !timeStr) return false;
      const [hour, minute] = timeStr.split(':').map(Number);
      const bDate = new Date(dateStr);
      bDate.setHours(hour, minute, 0, 0);
      return new Date() > bDate;
    } catch {
      return false;
    }
  };

  const handleUpdateBookingStatus = async (id: string, newStatus: BookingStatus) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ booking_status: newStatus })
        .eq('id', id);

      if (error) throw error;
      setGlobalSuccess(`Estado da reserva alterado para "${newStatus}" no banco de dados.`);
      notifyTerminal("📈 Reserva Atualizada", `O estado da reserva foi modificado para ${newStatus} com sucesso.`);

      // Match booking info for elegant emails & notifications
      const bk = bookings.find(b => b.id === id);
      if (bk) {
        const clientName = bk.customer?.full_name || bk.customer_profile?.full_name || 'Estimado Cliente';
        const clientEmail = bk.customer?.email || bk.customer_profile?.email || 'cliente@glamzo.com';
        const serviceName = bk.service?.name || 'Tratamento Estético';
        const businessName = business?.name || 'Salão Parceiro Glamzo';

        // 1. Add real-time Notification for customer
        realtimeService.addNotification(
          bk.customer_id || bk.user_id || 'guest',
          'customer',
          newStatus === 'completed' ? '✅ Tratamento Concluído' : '⚠️ Reserva Alterada',
          `O seu tratamento "${serviceName}" no salão ${businessName} foi marcado como ${newStatus}.`
        );

        // 2. Automated Resend email template dispatch
        if (newStatus === 'completed') {
          await realtimeService.sendEmailViaResend(
            clientEmail,
            `Obrigado pela sua visita a ${businessName}! 🌟`,
            'boas-verdades', // confirmation design
            { clientName, businessName, serviceName }
          );
        } else if (newStatus === 'cancelled') {
          await realtimeService.sendEmailViaResend(
            clientEmail,
            `Cancelamento de Agendamento • ${businessName}`,
            'cancelamento',
            { clientName, businessName, serviceName }
          );
        }
        
        // Broadcast change globally to other pages/tabs (live multi-user view refreshing)
        realtimeService.broadcast('booking:change', { id, status: newStatus });
      }

      await loadTerminalData();
    } catch (err: any) {
      setGlobalError(err.message || 'Falha ao atualizar estado da reserva.');
    }
  };

  // Submit actual payout requests
  const handleSubmitPayoutRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || payoutAmount <= 0) return;
    setPayoutSuccess(null);
    try {
      const { error } = await supabase
        .from('payouts')
        .insert({
          business_id: business.id,
          amount: payoutAmount,
          status: 'pending'
        });

      if (error) throw error;
      setPayoutSuccess("Operação efetuada. Pedido de transferência de fundos real registado com estado 'Pendente'.");
      await loadTerminalData();
    } catch (err: any) {
      setGlobalError(err.message || 'Falha ao processar pedido de transferência.');
    }
  };

  // Services Edit Form Submission (real CRUD)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    try {
      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update({
            name: serviceForm.name,
            description: serviceForm.description,
            price: Number(serviceForm.price),
            duration_minutes: Number(serviceForm.duration_minutes),
            category_id: serviceForm.category_id || null,
            image_url: serviceForm.image_url || null,
            is_active: serviceForm.is_active
          })
          .eq('id', editingService.id);

        if (error) throw error;
        setGlobalSuccess("Serviço editado com sucesso.");
      } else {
        const { error } = await supabase
          .from('services')
          .insert({
            business_id: business.id,
            name: serviceForm.name,
            description: serviceForm.description,
            price: Number(serviceForm.price),
            duration_minutes: Number(serviceForm.duration_minutes),
            category_id: serviceForm.category_id || null,
            image_url: serviceForm.image_url || null,
            is_active: serviceForm.is_active
          });

        if (error) throw error;
        setGlobalSuccess("Novo serviço adicionado com sucesso.");
      }
      setShowServiceModal(false);
      setEditingService(null);
      await loadTerminalData();
    } catch (err: any) {
      setGlobalError(err.message || 'Erro ao guardar serviço.');
    }
  };

  // Delete service record
  const handleDeleteService = async (id: string) => {
    if (!window.confirm("Pretende realmente eliminar este serviço da plataforma?")) return;
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      setGlobalSuccess("Serviço eliminado do registo real.");
      await loadTerminalData();
    } catch (err: any) {
      setGlobalError("Falha ao eliminar serviço. Certifique-se de que não existem marcações associadas a este serviço.");
    }
  };

  // Staff Edit Form Submission (real CRUD)
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    try {
      if (editingStaff) {
        const { error } = await supabase
          .from('staff')
          .update({
            full_name: staffForm.full_name,
            role_title: staffForm.role_title || null,
            avatar_url: staffForm.avatar_url || null,
            is_active: staffForm.is_active,
            off_days: staffForm.off_days || null
          })
          .eq('id', editingStaff.id);

        if (error) throw error;
        setGlobalSuccess("Ficha do profissional atualizada.");
      } else {
        const { error } = await supabase
          .from('staff')
          .insert({
            business_id: business.id,
            full_name: staffForm.full_name,
            role_title: staffForm.role_title || null,
            avatar_url: staffForm.avatar_url || null,
            is_active: staffForm.is_active,
            off_days: staffForm.off_days || null
          });

        if (error) throw error;
        setGlobalSuccess("Profissional contratado e registado com sucesso.");
      }
      setShowStaffModal(false);
      setEditingStaff(null);
      await loadTerminalData();
    } catch (err: any) {
      setGlobalError(err.message || 'Erro ao guardar ficha do profissional.');
    }
  };

  // Staff Delete record
  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm("Pretende apagar o registo deste profissional?")) return;
    try {
      const { error } = await supabase.from('staff').delete().eq('id', id);
      if (error) throw error;
      setGlobalSuccess("Profissional removido das escalas.");
      await loadTerminalData();
    } catch (err: any) {
      setGlobalError("Falha ao remover profissional. Pode haver restrições se existirem marcações no seu nome.");
    }
  };

  // Update business operational hours
  const handleUpdateHours = async (dayIndex: number, field: 'open_time' | 'close_time' | 'is_closed', value: any) => {
    if (!business) return;
    try {
      const targetDay = hours.find(h => h.weekday === dayIndex);
      
      if (!targetDay) {
        // If it doesn't exist, insert dynamic default row matched with the modified field
        const defaultOpen = field === 'open_time' ? value : '09:00';
        const defaultClose = field === 'close_time' ? value : '19:00';
        const defaultClosed = field === 'is_closed' ? value : false;

        const { error } = await supabase
          .from('business_hours')
          .insert({
            business_id: business.id,
            weekday: dayIndex,
            open_time: defaultOpen,
            close_time: defaultClose,
            is_closed: defaultClosed
          });

        if (error) throw error;
        setGlobalSuccess("Horário configurado e activo com sucesso!");
        await loadTerminalData();
        return;
      }

      const { error } = await supabase
        .from('business_hours')
        .update({ [field]: value })
        .eq('id', targetDay.id);

      if (error) throw error;
      setGlobalSuccess("Horários de funcionamento actualizados.");
      await loadTerminalData();
    } catch (err: any) {
      console.error("Error updating hours:", err);
      setGlobalError("Erro ao alterar escala de horários na base de dados.");
    }
  };

  // Replicate operational hours of a specific weekday to all other weekdays
  const handleCopyHoursToAll = async (sourceWeekday: number) => {
    if (!business) return;
    const sourceDay = hours.find(h => h.weekday === sourceWeekday);
    const openTime = sourceDay ? sourceDay.open_time : '09:00';
    const closeTime = sourceDay ? sourceDay.close_time : '19:00';
    const isClosed = sourceDay ? sourceDay.is_closed : false;

    try {
      const promises = Array.from({ length: 7 }, async (_, idx) => {
        if (idx === sourceWeekday) return;
        const targetDay = hours.find(h => h.weekday === idx);
        if (!targetDay) {
          return supabase.from('business_hours').insert({
            business_id: business.id,
            weekday: idx,
            open_time: openTime,
            close_time: closeTime,
            is_closed: isClosed
          });
        } else {
          return supabase.from('business_hours').update({
            open_time: openTime,
            close_time: closeTime,
            is_closed: isClosed
          }).eq('id', targetDay.id);
        }
      });

      await Promise.all(promises);
      setGlobalSuccess("Horário replicado com sucesso para todos os dias!");
      await loadTerminalData();
    } catch (err: any) {
      console.error("Error copy hours:", err);
      setGlobalError("Não foi possível copiar o horário para os restantes dias.");
    }
  };

  // Real Database Coupons Handlers
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    try {
      const pct = couponForm.discount_percent ? parseFloat(couponForm.discount_percent) : null;
      const val = couponForm.discount_value ? parseFloat(couponForm.discount_value) : null;
      
      if (!pct && !val) {
        setGlobalError("Forneça pelo menos uma percentagem (%) ou valor fixo (€) de desconto.");
        return;
      }

      setLoadingCoupons(true);

      const localId = 'coupon-' + Date.now();
      const newLocalCoupon = {
        id: localId,
        business_id: business.id,
        code: couponForm.code.toUpperCase().trim(),
        discount_percent: pct,
        discount_value: val,
        valid_until: couponForm.valid_until ? new Date(couponForm.valid_until).toISOString() : null,
        is_active: couponForm.is_active,
        created_at: new Date().toISOString()
      };

      // 1. Try to save on Supabase
      try {
        const { error: dbErr } = await supabase
          .from('business_coupons')
          .insert({
            business_id: business.id,
            code: couponForm.code.toUpperCase().trim(),
            discount_percent: pct,
            discount_value: val,
            valid_until: couponForm.valid_until ? new Date(couponForm.valid_until).toISOString() : null,
            is_active: couponForm.is_active
          });
        if (dbErr) {
          console.warn("Table business_coupons structure might be setup-pending on Supabase, falling back to cached local storage:", dbErr.message);
        }
      } catch (dbErr: any) {
        console.warn("Supabase network error, writing to offline-first local cache:", dbErr.message);
      }

      // 2. Always persist coupon to client-side localStorage cache for immediate booking application
      const currentLocals = JSON.parse(localStorage.getItem('glamzo_coupons') || '[]');
      // Exclude duplicates on local cache
      const updatedLocals = currentLocals.filter((lc: any) => !(lc.business_id === business.id && lc.code === newLocalCoupon.code));
      updatedLocals.push(newLocalCoupon);
      localStorage.setItem('glamzo_coupons', JSON.stringify(updatedLocals));

      setGlobalSuccess("Layout Cupão criado e ativo com sucesso!");
      setShowAddCouponModal(false);
      setCouponForm({ code: '', discount_percent: '', discount_value: '', valid_until: '', is_active: true });
      await loadTerminalData();
    } catch (err: any) {
      console.error(err);
      setGlobalError(`Erro ao registar o cupão: ${err.message}`);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handleToggleCoupon = async (id: string, currentStatus: boolean) => {
    try {
      // 1. Try online
      try {
        await supabase
          .from('business_coupons')
          .update({ is_active: !currentStatus })
          .eq('id', id);
      } catch (_) {}

      // 2. Always update local storage
      const currentLocals = JSON.parse(localStorage.getItem('glamzo_coupons') || '[]');
      const updatedLocals = currentLocals.map((c: any) => {
        if (c.id === id || (c.code && id.startsWith('coupon-') && c.id === id)) {
          return { ...c, is_active: !currentStatus };
        }
        return c;
      });
      localStorage.setItem('glamzo_coupons', JSON.stringify(updatedLocals));

      setGlobalSuccess("Estado do cupão alterado.");
      await loadTerminalData();
    } catch (err: any) {
      console.error(err);
      setGlobalError(`Falha ao alterar estado do cupão: ${err.message}`);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm("Pretende apagar definitivamente este cupão?")) return;
    try {
      // 1. Try online
      try {
        await supabase
          .from('business_coupons')
          .delete()
          .eq('id', id);
      } catch (_) {}

      // 2. Always remove from local storage
      const currentLocals = JSON.parse(localStorage.getItem('glamzo_coupons') || '[]');
      const updatedLocals = currentLocals.filter((c: any) => c.id !== id);
      localStorage.setItem('glamzo_coupons', JSON.stringify(updatedLocals));

      setGlobalSuccess("Cupão removido com sucesso.");
      await loadTerminalData();
    } catch (err: any) {
      console.error(err);
      setGlobalError(`Falha ao eliminar cupão: ${err.message}`);
    }
  };

  // Real Direct Logo Upload To Storage
  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !business) return;
    setUploadingLogo(true);
    setGlobalError(null);
    try {
      const optimized = await optimizeImageBeforeUpload(file);
      const filePath = `businesses/${business.id}/logo-${Date.now()}.webp`;
      const { error: uploadErr } = await supabase.storage
        .from('business-images')
        .upload(filePath, optimized.blob, {
          cacheControl: 'public, max-age=31536000, stale-while-revalidate=86400, immutable',
          contentType: 'image/webp',
          upsert: true
        });

      if (uploadErr) {
        // If fail because bucket is missing, use 'avatars' as fallback
        const { error: altErr } = await supabase.storage
          .from('avatars')
          .upload(filePath, optimized.blob, {
            cacheControl: 'public, max-age=31536000, stale-while-revalidate=86400, immutable',
            contentType: 'image/webp',
            upsert: true
          });
        if (altErr) throw altErr;
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
        setBusiness(prev => prev ? ({ ...prev, logo_url: publicUrl }) : null);
      } else {
        const { data: { publicUrl } } = supabase.storage.from('business-images').getPublicUrl(filePath);
        setBusiness(prev => prev ? ({ ...prev, logo_url: publicUrl }) : null);
      }
      setGlobalSuccess("Logótipo carregado com sucesso!");
    } catch (err: any) {
      console.error("Logo upload failed:", err);
      setGlobalError(`Erro no upload da imagem: ${err.message}. Tente novamente mais tarde.`);
    } finally {
      setUploadingLogo(false);
    }
  };

  // Real Direct Cover Image Upload To Storage
  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !business) return;
    setUploadingCover(true);
    setGlobalError(null);
    try {
      const optimized = await optimizeImageBeforeUpload(file);
      const filePath = `businesses/${business.id}/cover-${Date.now()}.webp`;
      const { error: uploadErr } = await supabase.storage
        .from('business-images')
        .upload(filePath, optimized.blob, {
          cacheControl: 'public, max-age=31536000, stale-while-revalidate=86400, immutable',
          contentType: 'image/webp',
          upsert: true
        });

      if (uploadErr) {
        // Fullback to avatars bucket
        const { error: altErr } = await supabase.storage
          .from('avatars')
          .upload(filePath, optimized.blob, {
            cacheControl: 'public, max-age=31536000, stale-while-revalidate=86400, immutable',
            contentType: 'image/webp',
            upsert: true
          });
        if (altErr) throw altErr;
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
        setBusiness(prev => prev ? ({ ...prev, cover_url: publicUrl }) : null);
      } else {
        const { data: { publicUrl } } = supabase.storage.from('business-images').getPublicUrl(filePath);
        setBusiness(prev => prev ? ({ ...prev, cover_url: publicUrl }) : null);
      }
      setGlobalSuccess("Foto de capa carregada com sucesso!");
    } catch (err: any) {
      console.error("Cover upload failed:", err);
      setGlobalError(`Erro no upload da imagem de capa: ${err.message}. Tente novamente mais tarde.`);
    } finally {
      setUploadingCover(false);
    }
  };

  // Direct edit physical details of the salon business profile
  const handleUpdateConfiguracoes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          name: business.name,
          category: business.category,
          phone: business.phone,
          district: business.district,
          city: business.city,
          address: business.address,
          description: business.description,
          logo_url: business.logo_url,
          cover_url: business.cover_url,
          website: business.website,
          email: business.email,
          instagram: business.instagram,
          facebook: (business as any).facebook || null,
          tiktok: (business as any).tiktok || null,
          phone_whatsapp: (business as any).phone_whatsapp || business.phone
        } as any)
        .eq('id', business.id);

      if (error) throw error;
      setGlobalSuccess("Perfil do estabelecimento revisto e guardado com sucesso.");
      await loadTerminalData();
    } catch (err: any) {
      setGlobalError(err.message || "Erro ao guardar definições.");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-500 gap-3">
        <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
        <span className="text-xs font-mono select-none">A iniciar terminal operacional...</span>
      </div>
    );
  }

  // Double guard role integrity Check
  if (!user || profile?.role === 'customer') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-2xl space-y-4">
          <AlertTriangle className="w-14 h-14 text-rose-500 mx-auto" />
          <h2 className="text-2xl font-black text-slate-900">Canal Restrito a Parceiros</h2>
          <p className="text-sm text-slate-500 text-slate-500 leading-relaxed">
            A sua conta atual está qualificada como Cliente Final. Para obter acesso profissional, por favor crie ou entre numa conta qualificada como Parceiro Comercial.
          </p>
          <button onClick={() => { signOut(); navigate('/partner/login'); }} className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer">
            Aceder ao Painel Parceiros
          </button>
        </div>
      </div>
    );
  }

  // Calculate unique customers list statistics
  const uniqueClientsMap = new Map<string, { name: string; email: string; visits: number; spend: number }>();
  bookings.forEach(bk => {
    const custId = bk.customer_id;
    const name = bk.customer?.full_name || bk.customer_profile?.full_name || 'Cliente Particular';
    const email = bk.customer?.email || bk.customer_profile?.email || 'geral@cliente.pt';
    const visitsInc = bk.booking_status === 'completed' ? 1 : 0;
    const spendInc = bk.booking_status === 'completed' ? Number(bk.total_price) : 0;

    if (!uniqueClientsMap.has(custId)) {
      uniqueClientsMap.set(custId, { name, email, visits: visitsInc, spend: spendInc });
    } else {
      const prev = uniqueClientsMap.get(custId)!;
      uniqueClientsMap.set(custId, {
        name,
        email,
        visits: prev.visits + visitsInc,
        spend: prev.spend + spendInc
      });
    }
  });
  const clientsList = Array.from(uniqueClientsMap.values());

  // Financial statistics (FASE 10 Glamzo Financial Architecture)
  const totalVolumeBruto = ledgers.reduce((sum, item) => sum + Number(item.amount_total || item.amount || 0), 0);
  const totalComissoesRetidas = ledgers.reduce((sum, item) => {
    // Glamzo commission is only taken on online transactions
    if (item.payment_method !== 'stripe') return sum;
    return sum + Math.max(0, Number(item.glamzo_fee || 0));
  }, 0);
  // Real Net earnings representing partner's profit (Lucro Líquido Global - Cash and Online combined)
  const totalReceivedVolume = ledgers.reduce((sum, item) => sum + Number(item.business_amount || item.amount_total || item.amount || 0), 0);
  
  // Real-time digital received volume that accumulated online via Glamzo Pay and can be withdrawn online
  const totalReceivedVolumeOnline = ledgers
    .filter(item => item.payment_method === 'stripe')
    .reduce((sum, item) => sum + Number(item.business_amount || item.amount_total || item.amount || 0), 0);

  const totalPayoutTransferred = payouts.filter(p => p.status === 'completed').reduce((sum, item) => sum + Number(item.amount || 0), 0);
  // Only online-received funds can be digitally withdrawn (local cash was already pocketed by merchant)
  const balanceAvailable = Math.max(0, totalReceivedVolumeOnline - totalPayoutTransferred);

  // Subscription calculation and Lock logic
  const activeSubscription = subscriptions && subscriptions.length > 0 ? subscriptions[0] : null;

  // Real-time status resolved safely from both DB models (resilient fallback)
  // Prioritize active or trialing status from subscriptions table over general business subscription_status
  const isSubTableActiveVal = activeSubscription && (activeSubscription.status === 'active' || activeSubscription.status === 'trialing');
  const resolvedSubscriptionStatus = isSubTableActiveVal ? activeSubscription.status : (business?.subscription_status || null);
  const resolvedSubscriptionActive = business?.subscription_active || isSubTableActiveVal;
  const trialEndsAt = business?.trial_ends_at || activeSubscription?.expires_at || null;

  const trialDaysRemaining = (() => {
    const trialEndStr = trialEndsAt;
    if (!trialEndStr) return 14;
    const diffTime = new Date(trialEndStr).getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  })();

  const isTrialExpired = (() => {
    if (resolvedSubscriptionStatus === 'trialing') {
      const expiresAt = trialEndsAt ? new Date(trialEndsAt).getTime() : null;
      if (expiresAt && expiresAt <= Date.now()) return true;
      return false;
    }
    if (!activeSubscription && !resolvedSubscriptionStatus) {
      if (!business) return false;
      const createdAt = new Date(business.created_at).getTime();
      return (Date.now() - createdAt) > 14 * 24 * 60 * 60 * 1000;
    }
    return false;
  })();

  const isSubscriptionActive = (() => {
    if (resolvedSubscriptionStatus === 'active' || resolvedSubscriptionStatus === 'trialing') {
      const expiresAt = trialEndsAt ? new Date(trialEndsAt).getTime() : null;
      if (!expiresAt || expiresAt > Date.now()) {
        return true;
      }
    }
    return false;
  })();

  // Block dashboard if no active/trialing subscription, or if card (stripe_subscription_id) has not been linked yet (required for marketplace & panel use)
  const isBillingBlocked = (() => {
    const isDemo = ['salao-spa-premium', 'barbearia-braga-moderna', 'estetica-beleza-braganca'].includes(business?.slug || '');
    if (isDemo) return false;

    // Must have a credit card linked/subscription configured in stripe to use the dashboard!
    if (!business?.stripe_subscription_id || business.stripe_subscription_id.trim() === '') {
      return true;
    }

    if (resolvedSubscriptionStatus === 'active' || resolvedSubscriptionStatus === 'trialing') {
      const expiresAt = trialEndsAt ? new Date(trialEndsAt).getTime() : null;
      if (expiresAt && expiresAt <= Date.now() && resolvedSubscriptionStatus !== 'active') {
        return true;
      }
      return false;
    }
    return true;
  })();

  const subBlockReason = (() => {
    const isDemo = ['salao-spa-premium', 'barbearia-braga-moderna', 'estetica-beleza-braganca'].includes(business?.slug || '');
    if (!isDemo && (!business?.stripe_subscription_id || business.stripe_subscription_id.trim() === '')) {
      return 'active_trial_requires_card';
    }
    if (!activeSubscription && !resolvedSubscriptionStatus) return 'onboarding';
    if (resolvedSubscriptionStatus === 'past_due' || resolvedSubscriptionStatus === 'unpaid') return 'past_due';
    return 'expired';
  })();

  return (
    <div id="partner-terminal-layout" className="min-h-screen bg-[#fafbfc] text-slate-800 flex font-sans select-none overflow-hidden h-screen">
      
      {/* Blocked subscription Lock Screen Overlay */}
      {isBillingBlocked && (
        <div className="fixed inset-0 z-50 bg-white/98 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-text">
          {isVerifyingSub ? (
            <div className="w-full max-w-md bg-slate-50 border border-slate-200 p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden flex flex-col items-center">
              {/* Spinning/pulsing indicators */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-rose-500/10 border-t-rose-500 animate-spin"></div>
                <CreditCard className="w-6 h-6 text-rose-500 animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900">Sincronização Glamzo Pay PRO</h3>
                <p className="text-xs text-rose-400 font-mono font-bold animate-pulse">{verifyingText}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed pt-2">
                  Não feche esta página. Estamos a confirmar de forma automática o estado da sua subscrição com os servidores do Glamzo Pay e a atualizar a base de dados em tempo real.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md bg-slate-50 border border-slate-200 p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden">
              
              {/* Visual status lock/rocket/alert accent */}
              <div className="w-16 h-16 bg-white/60 rounded-2xl flex items-center justify-center border border-slate-200/80 mx-auto">
                {subBlockReason === 'onboarding' ? (
                  <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                ) : subBlockReason === 'past_due' ? (
                  <AlertCircle className="w-8 h-8 text-amber-500 animate-bounce" />
                ) : (
                  <Lock className="w-8 h-8 text-rose-500" />
                )}
              </div>

              {subBlockReason === 'active_trial_requires_card' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-black text-slate-900 flex flex-col items-center justify-center gap-2">
                      <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
                      <span>Ativar Período Experimental Glamzo PRO</span>
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed font-sans px-2">
                      Para colocar a sua loja online é necessário ativar o período experimental Glamzo PRO.
                    </p>
                  </div>

                  <div className="text-[11px] text-left space-y-2.5 bg-white/40 p-4 rounded-2xl border border-slate-200">
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                      <span className="text-purple-400 font-extrabold shrink-0">✔</span> 14 dias gratuitos de avaliação completa
                    </p>
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                      <span className="text-purple-400 font-extrabold shrink-0">✔</span> Cancelamento 100% livre e imediato a qualquer instante
                    </p>
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                      <span className="text-purple-400 font-extrabold shrink-0">✔</span> Ativação instantânea do salão para receber reservas reais
                    </p>
                  </div>
                </div>
              ) : subBlockReason === 'onboarding' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-black text-slate-900">Ativar Glamzo PRO</h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      O seu salão precisa de ativar o plano <span className="text-indigo-400 font-extrabold font-mono">Glamzo PRO</span> para:
                    </p>
                  </div>
                  
                  <div className="text-left space-y-2.5 bg-white/30 border border-slate-200/65 p-4 rounded-2xl">
                    <p className="text-xs text-slate-600 font-medium flex items-center gap-2.5">
                      <span className="text-indigo-400 font-bold shrink-0">✔</span> aparecer no marketplace
                    </p>
                    <p className="text-xs text-slate-600 font-medium flex items-center gap-2.5">
                      <span className="text-indigo-400 font-bold shrink-0">✔</span> receber reservas de clientes
                    </p>
                    <p className="text-xs text-slate-600 font-medium flex items-center gap-2.5">
                      <span className="text-indigo-400 font-bold shrink-0">✔</span> aceitar pagamentos online seguros
                    </p>
                    <p className="text-xs text-slate-600 font-medium flex items-center gap-2.5">
                      <span className="text-indigo-400 font-bold shrink-0">✔</span> usar o painel profissional completo
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-500 pt-1 leading-normal">
                    Será feita apenas uma verificação segura do cartão via Glamzo Pay.
                  </p>

                  <div className="text-left space-y-1.5 bg-indigo-50 p-4 rounded-2xl border border-indigo-500/10">
                    <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-2">
                      <span>✔</span> 14 dias grátis de avaliação
                    </p>
                    <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-2">
                      <span>✔</span> cancelamento livre a qualquer instante
                    </p>
                    <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-2">
                      <span>✔</span> cobrança automática de 19.90€ apenas após o período gratuito
                    </p>
                  </div>
                </div>
              ) : subBlockReason === 'past_due' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-black text-slate-900">Erro na Cobrança (PRO)</h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      A última tentativa de cobrança automática da subscrição <span className="text-amber-500 font-bold">Glamzo PRO</span> falhou. Por favor, aceda ao portal de faturação seguro abaixo para regularizar os dados do seu cartão.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-black text-slate-900">Período de Teste Expirado (PRO)</h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      O seu período de teste gratuito de 14 dias para o plano <span className="text-rose-500 font-extrabold">Glamzo PRO</span> expirou. Para reativar o seu salão e continuar a receber marcações, configure a sua subscrição de forma segura via Glamzo Pay.
                    </p>
                  </div>
                </div>
              )}

              {subBlockReason !== 'onboarding' && (
                <div className="bg-white/60 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-slate-500">
                    <span>Subscrição Glamzo PRO</span>
                    <span className="text-rose-400 font-bold">19.90€ / mês</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal font-sans">
                    Insira os dados do cartão de crédito de forma segura. O processamento é feito 100% pelo Glamzo Pay e a subscrição pode ser livremente cancelada a qualquer instante no painel financeiro.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleSubscribePro}
                  className="w-full py-4 bg-gradient-to-tr from-[#9333ea] to-[#db2777] hover:opacity-95 text-xs font-bold uppercase tracking-wider text-slate-900 rounded-xl shadow-xl shadow-purple-950/15 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] transition duration-150"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {subBlockReason === 'active_trial_requires_card'
                      ? 'COMEÇAR TESTE GRATUITO'
                      : subBlockReason === 'onboarding'
                      ? 'Continuar para pagamento'
                      : 'Ativar Plano PRO'}
                  </span>
                </button>

                {business?.stripe_customer_id && (
                  <button
                    onClick={handleOpenBillingPortal}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-100 text-xs font-bold text-slate-600 rounded-xl border border-slate-300 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] transition duration-150"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Regularizar Assinatura (Billing Portal)</span>
                  </button>
                )}
              </div>

              <button
                onClick={async () => {
                  await signOut();
                  navigate('/partner/login');
                }}
                className="text-xs text-slate-500 hover:text-rose-400 font-bold transition block mx-auto underline mt-2"
              >
                Sair da Conta (Logout)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sound active Toast Notification Popup */}
      {toastNotification?.visible && (
        <div className="fixed top-6 right-6 z-50 bg-slate-50 border-2 border-rose-500/80 p-5 rounded-2xl shadow-2xl max-w-sm animate-bounce text-slate-800 flex items-start gap-4 shadow-rose-950/40">
          <div className="w-10 h-10 rounded-xl bg-rose-950/80 text-rose-400 flex items-center justify-center shrink-0 border border-rose-900">
            <Bell className="w-5 h-5 animate-swing" />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm tracking-tight text-slate-900">{toastNotification.title}</h4>
            <p className="text-xs text-slate-500 leading-normal font-medium">{toastNotification.desc}</p>
            <button onClick={() => setToastNotification(null)} className="text-[10px] font-mono tracking-widest text-purple-400 hover:underline uppercase block font-bold pt-1.5 focus:outline-none">
              Fechar Alerta
            </button>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Navigation Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/85 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          
          {/* Drawer content */}
          <div className="relative flex flex-col w-72 max-w-xs h-full bg-white border-r border-[#1f1635] p-5 shadow-2xl animate-fade-in text-slate-800 z-10 transition-transform">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4 shrink-0">
              <button 
                onClick={async () => {
                  setIsMobileSidebarOpen(false);
                  await signOut();
                  navigate('/');
                }}
                title="Voltar ao site inicial (Terminar Sessão)"
                className="flex items-center gap-2.5 text-left hover:opacity-80 transition-opacity"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-[11px] tracking-tight block leading-none">Glamzo Terminal</span>
                  <span className="text-[8px] font-mono uppercase font-bold text-purple-400 tracking-wider">Painel de Controlo</span>
                </div>
              </button>
              <button 
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                title="Fechar Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 shrink-0">
              <span className="text-[8px] font-mono uppercase tracking-widest block text-slate-500 font-bold mb-1">Estabelecimento</span>
              <span className="text-xs font-bold text-purple-400 block truncate">{business?.name || 'A sincronizar...'}</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] text-emerald-400 font-semibold uppercase font-mono">Ligado</span>
              </div>
            </div>

            {/* Scrolling Navigation Links */}
            <nav className="flex-1 overflow-y-auto space-y-1 pr-1.5 scrollbar-thin" style={{ WebkitOverflowScrolling: 'touch' }}>
              {[
                { id: 'agenda', label: 'Agenda', icon: Calendar },
                { id: 'reservas', label: 'Reservas', icon: CheckSquare },
                { id: 'clientes', label: 'Clientes', icon: UsersRound },
                { id: 'equipa', label: 'Equipa', icon: Users },
                { id: 'servicos', label: 'Serviços', icon: Scissors },
                { id: 'campanhas', label: 'Promoções', icon: Tag },
                { id: 'financeiro', label: 'Pagamentos', icon: Landmark },
                { id: 'loja', label: 'Website & QR Code', icon: Globe },
                { id: 'mensagens', label: 'Mensagens', icon: MessageSquare },
                ...(tabletOrder ? [{ id: 'tablet', label: 'Terminal Glamzo', icon: Smartphone }] : []),
                { id: 'configuracoes', label: 'Configurações', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs rounded-xl font-bold tracking-tight transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-purple-600 text-white shadow shadow-purple-950/20' 
                        : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.id === 'agenda' && (() => {
                      const todayStr = new Date().toISOString().split('T')[0];
                      const bookingsToday = bookings.filter(b => b.booking_date === todayStr);
                      return bookingsToday.length > 0 ? (
                        <span className="bg-purple-600 border border-purple-400/30 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none">
                          {bookingsToday.length}
                        </span>
                      ) : null;
                    })()}
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Bottom Profile */}
            <div className="pt-4 border-t border-slate-200 mt-4 shrink-0 col-span-1 bg-white/40">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-purple-950/30 flex items-center justify-center font-mono font-bold text-purple-400 text-xs border border-purple-900/60 shrink-0">
                  {profile?.full_name?.substring(0,2).toUpperCase() || 'P'}
                </div>
                <div className="overflow-hidden">
                  <span className="block text-xs font-bold truncate text-slate-700">{profile?.full_name || 'Profissional'}</span>
                  <span className="block text-[9px] text-slate-500 font-mono truncate">{user?.email}</span>
                </div>
              </div>
              <button 
                onClick={async () => { 
                  setIsMobileSidebarOpen(false);
                  await signOut(); 
                  navigate('/'); 
                }}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 hover:text-slate-700 border border-slate-200 text-slate-500 rounded-xl text-[10px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Terminar Sessão</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side Rail Panel */}
      <aside className="hidden lg:flex w-64 border-r border-slate-200/80 bg-white flex-col justify-between shrink-0 h-full">
        <div>
          {/* Logo Brand Brand */}
          <button 
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
            title="Voltar ao site inicial (Terminar Sessão)"
            className="h-16 border-b border-slate-200/60 flex items-center px-6 gap-3 w-full text-left hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <GlamzoLogo size={32} glow={true} />
            <div>
              <span className="font-extrabold text-slate-900 tracking-widest block leading-none text-xs font-display">GLAMZO</span>
              <span className="text-[9px] font-mono uppercase font-bold text-purple-400 tracking-wider">Painel do Parceiro</span>
            </div>
          </button>

          {/* Quick Stats overview inside SideRail */}
          <div className="p-4 mx-4 my-2.5 bg-slate-50/40 border border-slate-200/80 rounded-xl">
            <span className="text-[9px] font-mono uppercase tracking-widest block text-slate-500 font-bold mb-1.5">Estabelecimento</span>
            <span className="text-xs font-bold text-slate-700 block truncate">{business?.name || 'A sincronizar...'}</span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-semibold uppercase font-mono">Ligado / Sincronizado</span>
            </div>
          </div>

          {/* Sidebar Tabs Selectors */}
          <nav className="px-3 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-270px)]" style={{ WebkitOverflowScrolling: 'touch' }}>
            {[
              { id: 'agenda', label: 'Agenda', icon: Calendar },
              { id: 'reservas', label: 'Reservas', icon: CheckSquare },
              { id: 'clientes', label: 'Clientes', icon: UsersRound },
              { id: 'equipa', label: 'Equipa', icon: Users },
              { id: 'servicos', label: 'Serviços', icon: Scissors },
              { id: 'campanhas', label: 'Promoções', icon: Tag },
              { id: 'financeiro', label: 'Pagamentos', icon: Landmark },
              { id: 'loja', label: 'Website & QR Code', icon: Globe },
              { id: 'mensagens', label: 'Mensagens', icon: MessageSquare },
              ...(tabletOrder ? [{ id: 'tablet', label: 'Terminal Glamzo', icon: Smartphone }] : []),
              { id: 'configuracoes', label: 'Configurações', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs rounded-xl font-bold tracking-tight transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-purple-600 text-white shadow shadow-purple-900/40' 
                      : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.id === 'agenda' && (() => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const bookingsToday = bookings.filter(b => b.booking_date === todayStr);
                    return bookingsToday.length > 0 ? (
                      <span className="bg-purple-600 border border-purple-400/30 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none">
                        {bookingsToday.length}
                      </span>
                    ) : null;
                  })()}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card Profile & SignOut inside sidebar bottom */}
        <div className="p-4 border-t border-slate-200 bg-white/40">
          <div className="flex items-center gap-2.5 mb-3.5">
            <div className="w-8 h-8 rounded-full bg-purple-950/30 flex items-center justify-center font-mono font-bold text-purple-400 text-xs border border-purple-900/60">
              {profile?.full_name?.substring(0,2).toUpperCase() || 'P'}
            </div>
            <div className="overflow-hidden">
              <span className="block text-xs font-bold truncate text-slate-700">{profile?.full_name || 'Profissional'}</span>
              <span className="block text-[10px] text-slate-500 font-mono truncate">{user?.email}</span>
            </div>
          </div>
          <button 
            onClick={async () => { await signOut(); navigate('/'); }}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 hover:text-slate-700 border border-slate-200 text-slate-500 rounded-xl text-[10px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Terminar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Terminal view screen area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white relative">
        
        {/* Ambient Glowing Background Spheres (Bolas de Fundo) like landing page */}
        <div className="partner-glow-ball-pink top-10 right-1/4 animate-pulse pointer-events-none" style={{ animationDuration: '10s' }} />
        <div className="partner-glow-ball-purple bottom-12 left-10 animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />

        {/* Top Operational Header */}
        <header className="h-16 border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0 bg-slate-50/30 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Mobile Sidebar Hamburger */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 bg-slate-50 border border-slate-200 text-slate-600 hover:text-purple-400 rounded-xl transition-all cursor-pointer"
              title="Abrir Menu Lateral"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-left">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 font-display">
                <span>{business?.name || 'Carregando...'}</span>
              </h2>
              <p className="text-[10px] text-slate-500 font-mono">
                📞 {business?.phone} • 📍 {business?.city || 'Lisboa, Portugal'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadTerminalData}
              title="Sincronizar dados da base de dados"
              className="p-2 py-2.5 bg-slate-50 border border-slate-200 text-slate-500 hover:text-purple-400 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5 text-[11px] tracking-tight font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Atualizar Dados</span>
            </button>
          </div>
        </header>

        {/* Dynamic tabs render Workspace container with generous bottom spacing so layouts are never covered on mobile */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-36 scrollbar-thin scrollbar-thumb-slate-900" style={{ WebkitOverflowScrolling: 'touch' }}>
          
          {/* Simulated trial / No Card Warning Banner */}
          {resolvedSubscriptionActive && (!business?.stripe_subscription_id || business.stripe_subscription_id.trim() === '') && (
            <div className="mb-6 p-4 bg-gradient-to-r from-amber-950/45 to-yellow-950/45 border border-amber-500/20 text-amber-350 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-amber-950/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/25 shrink-0">
                  <AlertCircle className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <p className="font-extrabold text-slate-900 leading-normal">⚠️ O seu salão está ocultado do Marketplace Glamzo!</p>
                  <p className="text-[11px] text-amber-450 leading-normal">O seu período de teste PRO de 14 dias está ativo, mas para que a sua loja apareça nos resultados de pesquisa e na página de início, precisa de adicionar um cartão de pagamento seguro. O Glamzo Pay só efetuará cobranças automáticas no fim do teste.</p>
                </div>
              </div>
              <button 
                onClick={handleSubscribePro}
                className="p-2.5 px-4 bg-amber-500 hover:bg-amber-650 text-[10px] text-slate-950 font-black uppercase rounded-xl transition-all cursor-pointer shadow shrink-0 self-start sm:self-auto"
              >
                Associar Cartão Agora
              </button>
            </div>
          )}

          {/* Active Trial State Reminder Header Banner (Only when card/subscription is real) */}
          {resolvedSubscriptionStatus === 'trialing' && business?.stripe_subscription_id && business.stripe_subscription_id.trim() !== '' && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/20 text-purple-300 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/25 shrink-0">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <p className="font-extrabold text-slate-900 leading-normal">Período de Testes Ativo — Glamzo PRO</p>
                  <p className="text-[11px] text-purple-400">Tem acesso total a todas as funcionalidades profissionais premium por mais <span className="text-slate-900 font-bold">{trialDaysRemaining} {trialDaysRemaining === 1 ? 'dia' : 'dias'}</span>.</p>
                </div>
              </div>
              <button 
                onClick={handleSubscribePro}
                className="p-2.5 px-3.5 bg-purple-600 hover:bg-purple-550 text-[10px] text-white font-bold uppercase rounded-xl transition-all cursor-pointer shadow shadow-purple-950/40 shrink-0 self-start sm:self-auto"
              >
                Gerir Subscrição
              </button>
            </div>
          )}

          {/* Past Due Alert Banner */}
          {resolvedSubscriptionStatus === 'past_due' && (
            <div className="mb-6 p-4 bg-rose-950/45 border border-rose-900 text-rose-400 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/25 shrink-0">
                  <AlertCircle className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <p className="font-extrabold text-slate-900 leading-normal">Aviso de Cobrança — Subscrição Pendente</p>
                  <p className="text-[11px] text-rose-400 leading-normal">A última tentativa de cobrança automática da sua mensalidade falhou. Por favor, regularize os seus dados de pagamento usando o Glamzo Pay Billing Portal.</p>
                </div>
              </div>
              <button 
                onClick={handleOpenBillingPortal}
                className="p-2.5 px-3.5 bg-rose-600 hover:bg-rose-550 text-[10px] text-white font-bold uppercase rounded-xl transition-all cursor-pointer shadow shrink-0 self-start sm:self-auto"
              >
                Regularizar Faturação
              </button>
            </div>
          )}

          {/* Glamzo Pay Connect Pending Alert Banner */}
          {!isBillingBlocked && (!business?.stripe_account_id || !stripeStatus?.charges_enabled || !stripeStatus?.payouts_enabled) && (
            <div className="mb-6 p-4 bg-gradient-to-r from-amber-950/40 to-yellow-950/40 border border-amber-500/20 text-amber-300 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-amber-950/15 animate-fade-in text-left">
              <div className="flex items-center gap-3">
                <div className="w-8.5 h-8.5 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/25 shrink-0">
                  <Landmark className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="font-extrabold text-slate-900 leading-normal">Ative os pagamentos para receber reservas online.</p>
                  <p className="text-[11px] text-amber-450 leading-normal">Configure a sua conta Glamzo Pay Express (IBAN e verificação) para receber pagamentos de marcações diretamente na sua conta bancária de forma segura pelas marcações online.</p>
                </div>
              </div>
              <button 
                onClick={handleConnectStripe}
                disabled={connectingStripe}
                className="p-2.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-[10px] text-slate-950 font-black uppercase rounded-xl transition-all cursor-pointer shadow shrink-0 self-start sm:self-auto flex items-center gap-1.5"
              >
                {connectingStripe ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>A Processar...</span>
                  </>
                ) : (
                  <span>ATIVAR PAGAMENTOS</span>
                )}
              </button>
            </div>
          )}

          {globalSuccess && (
            <div className="mb-6 p-4 bg-emerald-950/45 border border-emerald-900 text-emerald-400 rounded-2xl text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{globalSuccess}</span>
              </div>
              <button onClick={() => setGlobalSuccess(null)} className="text-emerald-400 hover:underline text-[10px]">OK</button>
            </div>
          )}

          {globalError && (
            <div className="mb-6 p-4 bg-rose-950/45 border border-[1px] border-rose-900 text-rose-400 rounded-2xl text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{globalError}</span>
              </div>
              <button onClick={() => setGlobalError(null)} className="text-rose-450 text-rose-400 hover:underline text-[10px]">Limpar</button>
            </div>
          )}

          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-2.5 animate-pulse">
              <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
              <span className="text-xs font-mono select-none">A recolher dados reais de reservas...</span>
            </div>
          ) : (
            <>
              {/* ==================================================== */}
              {/* VIEW 1: AGENDA DIÁRIA (PREMIUM TABLET/TERMINAL GRID) */}
              {/* ==================================================== */}
              {activeTab === 'agenda' && (
                <div id="view-agenda" className="space-y-6 text-left animate-fade-in text-slate-700">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-200 pb-5">
                    <div>
                      <h3 className="text-xl font-display font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <span>Agenda do Salão</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Visualize, filtre e controle todas as marcações em tempo real de forma profissional.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                      {/* Button to Trigger Manual Booking / Blocking */}
                      <button
                        onClick={() => {
                          setManualBookingType('booking');
                          setIsManualBookingOpen(true);
                          if (services.length > 0) {
                            setManualServiceId(services[0].id);
                          }
                          if (staff.length > 0) {
                            setManualStaffId(staff[0].id);
                          }
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition shadow-lg shadow-purple-900/30"
                      >
                        <Calendar className="w-4 h-4 text-slate-900" />
                        <span className="text-slate-900">Agendar / Bloquear Horário</span>
                      </button>

                      {/* Mode Navigation selector */}
                      <div className="bg-slate-50 border border-slate-200 p-1.5 rounded-xl flex items-center gap-1 font-sans text-xs">
                        {(['today', 'week', 'month', 'by_staff'] as const).map(mode => (
                          <button
                            key={mode}
                            onClick={() => setAgendaMode(mode)}
                            className={`px-4 py-2 rounded-xl border font-bold transition cursor-pointer text-[11px] uppercase tracking-wide ${
                              agendaMode === mode 
                                ? 'bg-purple-600 border-purple-500 text-white shadow-md' 
                                : 'bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                            }`}
                          >
                            {mode === 'today' ? 'Hoje' : mode === 'week' ? 'Semanal' : mode === 'month' ? 'Mensal' : 'Por Profissional'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Hourly timeline view of selectedAgendaDate or custom calendar switcher */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Hourly Blocks (Timeline) - Elegant slate card replacing white card */}
                    <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                      
                      {/* ==================== TODAY VIEW ==================== */}
                      {agendaMode === 'today' && (
                        <div className="space-y-4">
                          {/* Rich Interactive Date Selector and Scroller */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                            <div className="flex items-center gap-2">
                              {/* Go back 1 day */}
                              <button 
                                type="button"
                                onClick={() => {
                                  const d = new Date(selectedAgendaDate + 'T12:00:00');
                                  d.setDate(d.getDate() - 1);
                                  setSelectedAgendaDate(d.toISOString().split('T')[0]);
                                }}
                                className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                                title="Dia Anterior"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>

                              {/* Selected date and custom date selector */}
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono uppercase text-purple-400 font-extrabold tracking-wider bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
                                  {new Date(selectedAgendaDate + 'T12:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' })}
                                </span>
                                
                                <input 
                                  type="date" 
                                  style={{ colorScheme: 'dark' }}
                                  value={selectedAgendaDate}
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      setSelectedAgendaDate(e.target.value);
                                    }
                                  }}
                                  className="bg-white text-slate-900 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 cursor-pointer outline-none focus:border-purple-500 font-mono"
                                />
                              </div>

                              {/* Go forward 1 day */}
                              <button 
                                type="button"
                                onClick={() => {
                                  const d = new Date(selectedAgendaDate + 'T12:00:00');
                                  d.setDate(d.getDate() + 1);
                                  setSelectedAgendaDate(d.toISOString().split('T')[0]);
                                }}
                                className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                                title="Próximo Dia"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Back to Today button */}
                            {selectedAgendaDate !== new Date().toISOString().split('T')[0] && (
                              <button 
                                type="button"
                                onClick={() => setSelectedAgendaDate(new Date().toISOString().split('T')[0])}
                                className="text-[10px] font-bold font-mono bg-purple-50 text-purple-300 hover:text-slate-900 hover:bg-purple-900/60 border border-purple-850 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                              >
                                Voltar para Hoje
                              </button>
                            )}
                          </div>

                          <span className="text-[10px] font-mono uppercase bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg text-purple-400 font-extrabold tracking-wide inline-block">
                            Fita Horária • Marcações Reais do Dia
                          </span>

                          {/* Timeline Slots */}
                          <div className="space-y-4 divide-y divide-slate-800/60">
                            {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map((hourSlot) => {
                              // Find any active booking corresponding roughly to slot
                              const activeBookingsAtHour = bookings.filter(b => 
                                b.booking_date === selectedAgendaDate && 
                                b.start_time.startsWith(hourSlot.split(':')[0])
                              );

                              return (
                                <div key={hourSlot} className="flex gap-4 sm:gap-6 pt-5 first:pt-0 group/row text-left">
                                  {/* Left Hour Indicator */}
                                  <div className="w-14 shrink-0 flex flex-col items-end pt-1 select-none">
                                    <span className="text-xs font-mono font-bold text-slate-700 tracking-tight">{hourSlot}</span>
                                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Slot</span>
                                  </div>

                                  {/* Right Content */}
                                  <div className="flex-1 min-h-[64px] space-y-3">
                                    {activeBookingsAtHour.length > 0 ? (
                                      activeBookingsAtHour.map((bk) => {
                                        const isBlock = bk.notes?.startsWith('Bloqueio Agenda:');
                                        const status = bk.booking_status;
                                        
                                        // Dynamic Left Accent Color Bar for Status
                                        let borderColor = 'border-purple-800';
                                        let leftBarColor = 'bg-purple-600';
                                        let bgClass = 'bg-slate-50/90 border-slate-200';
                                        
                                        if (isBlock) {
                                          borderColor = 'border-rose-900/30';
                                          leftBarColor = 'bg-rose-500';
                                          bgClass = 'bg-rose-50 border border-rose-900/30';
                                        } else if (status === 'completed') {
                                          borderColor = 'border-slate-200';
                                          leftBarColor = 'bg-slate-600';
                                          bgClass = 'bg-slate-50/50 border border-slate-200/80';
                                        } else if (status === 'pending') {
                                          borderColor = 'border-amber-900/60';
                                          leftBarColor = 'bg-amber-500';
                                          bgClass = 'bg-amber-50 border border-amber-900/40';
                                        }

                                        return (
                                          <div 
                                            key={bk.id} 
                                            className={`relative overflow-hidden p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs transition-colors hover:border-slate-300 ${bgClass}`}
                                          >
                                            {/* Status accent left bar */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${leftBarColor}`} />

                                            <div className="pl-2">
                                              <div className="flex items-center gap-2">
                                                <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">
                                                  {getBookingDisplayName(bk)}
                                                </h4>
                                                {!isBlock && (
                                                  <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-purple-95 border border-purple-800/50 text-purple-350">
                                                    Atendimento
                                                  </span>
                                                )}
                                              </div>
                                              
                                              {!isBlock ? (
                                                <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-medium text-slate-500 leading-none">
                                                  <span className="flex items-center gap-1">
                                                    <span className="text-purple-400">💈</span> {bk.service?.name || 'Serviço'}
                                                  </span>
                                                  <span className="text-slate-700">•</span>
                                                  <span className="flex items-center gap-1">
                                                    <span className="text-purple-405 font-bold">👥</span> {bk.staff?.full_name || 'Profissional'}
                                                  </span>
                                                  <span className="text-slate-700">•</span>
                                                  <span className="font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] text-slate-600">
                                                    ⏱ {bk.service?.duration_minutes || '0'} min
                                                  </span>
                                                  <span className="text-slate-700">•</span>
                                                  <span className="text-slate-900 font-extrabold text-xs">
                                                    {bk.total_price}€
                                                  </span>
                                                  <span className="text-slate-700">•</span>
                                                  <span className="text-[10px] inline-flex items-center gap-1 font-semibold text-slate-600">
                                                    💳 {bk.payment_method === 'stripe_online' ? 'Online' : 'No Local'} ({bk.payment_status === 'paid' ? 'Pago' : 'Não Pago'})
                                                  </span>
                                                </div>
                                              ) : (
                                                <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] font-semibold text-rose-400 font-mono">
                                                  <span>🛑 Slot Bloqueado (Intervalo / Indisponível)</span>
                                                  <span>•</span>
                                                  <span>⏱ {bk.service?.duration_minutes || '30'} min</span>
                                                </div>
                                              )}
                                            </div>

                                            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 pl-2">
                                              {bk.booking_status !== 'completed' && bk.booking_status !== 'cancelled' && bk.booking_status !== 'no_show' && (
  <div className="flex items-center gap-1.5">
    {!isPastBooking(bk.booking_date, bk.end_time || bk.start_time) ? (
      <>
        <button 
          type="button"
          onClick={() => handleUpdateBookingStatus(bk.id, 'completed')}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-[10px] font-mono cursor-pointer uppercase tracking-wider transition-all"
        >
          Concluir
        </button>
        <button 
          type="button"
          onClick={() => handleUpdateBookingStatus(bk.id, 'cancelled')}
          className="px-3.5 py-2 bg-white hover:bg-rose-50 border border-slate-200 text-slate-500 hover:text-rose-400 rounded-xl text-[10px] font-mono cursor-pointer transition-all"
        >
          Mover/Cancelar
        </button>
      </>
    ) : (
      <button 
        type="button"
        onClick={() => handleUpdateBookingStatus(bk.id, 'no_show')}
        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-200 rounded-xl text-[10px] font-extrabold font-mono cursor-pointer uppercase tracking-wider transition-all"
      >
        Reclamar: Falta de Comparência
      </button>
    )}
  </div>
)}
                                              <span className={"px-2.5 py-1 rounded-full text-[9px] font-extrabold font-mono uppercase tracking-wider " + (
        (((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status) === 'completed' ? 'bg-slate-50 text-slate-500 border border-slate-200' :
        (((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status) === 'cancelled' ? 'bg-rose-50 text-rose-400 border border-rose-200' :
        (((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status) === 'no_show' ? 'bg-orange-50 text-orange-500 border border-orange-200' : 'bg-indigo-50 text-indigo-400 border border-indigo-200'
      )}>
        {(((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status) === 'completed' ? 'concluída' :
         (((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status) === 'no_show' ? 'Falta de Comparência' : 
         (((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status)}
      </span>
                                            </div>
                                          </div>
                                        );
                                      })
                                    ) : (
                                      /* Quick Book / Block Event placeholder button: Fresha style with premium Dark Look */
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setManualStartTime(hourSlot);
                                          setManualBookingType('booking');
                                          setManualDate(selectedAgendaDate);
                                          setIsManualBookingOpen(true);
                                          if (services.length > 0) setManualServiceId(services[0].id);
                                          if (staff.length > 0) setManualStaffId(staff[0].id);
                                        }}
                                        className="w-full h-14 bg-white hover:bg-purple-50 border border-dashed border-slate-200 hover:border-purple-800/80 text-slate-500 hover:text-purple-400 rounded-2xl flex items-center justify-between px-5 text-left transition-all duration-150 group cursor-pointer"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="text-lg font-bold font-mono opacity-65 group-hover:opacity-100 text-purple-400">+</span>
                                          <span className="text-[11px] font-bold font-mono tracking-tight uppercase text-slate-500 group-hover:text-slate-900">Disponível</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 group-hover:text-purple-400 bg-white border border-slate-200 px-2 py-1 rounded-lg">
                                          Reservar {hourSlot}
                                        </span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* ==================== WEEKLY VIEW ==================== */}
                      {agendaMode === 'week' && (
                        <div className="space-y-4">
                          <span className="text-[10px] font-mono uppercase bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg text-purple-400 font-extrabold tracking-wide inline-block">
                            Visualização Semanal Dinâmica • Multi-Colunas
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 pt-2">
                            {(() => {
                              const baseDate = new Date(selectedAgendaDate + 'T12:00:00');
                              const currentDayIdx = baseDate.getDay();
                              const diffToMonday = baseDate.getDate() - currentDayIdx + (currentDayIdx === 0 ? -6 : 1);
                              const weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

                              return weekdays.map((dayLabel, idx) => {
                                const targetDay = new Date(baseDate);
                                targetDay.setDate(diffToMonday + idx);
                                const dateStr = targetDay.toISOString().split('T')[0];
                                const bookingsThisDay = bookings.filter(b => b.booking_date === dateStr);

                                return (
                                  <div 
                                    key={dayLabel} 
                                    onClick={() => {
                                      setSelectedAgendaDate(dateStr);
                                      setAgendaMode('today');
                                    }}
                                    className="bg-slate-50/80 hover:bg-slate-100/80 hover:border-purple-200 cursor-pointer transition-all border border-slate-200 p-2.5 rounded-2xl space-y-2.5 min-h-[160px] text-left group"
                                  >
                                    <div className="border-b border-slate-200 pb-1.5 text-center group-hover:border-purple-200 transition-colors">
                                      <span className="block text-[11px] font-extrabold text-purple-400 uppercase">{dayLabel}</span>
                                      <span className="block text-[10px] font-mono font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{targetDay.getDate()}</span>
                                    </div>

                                    <div className="space-y-2">
                                      {bookingsThisDay.length > 0 ? (
                                        bookingsThisDay.map(bk => (
                                          <div 
                                            key={bk.id}
                                            className={`p-2 rounded-xl border text-[9px] space-y-1 transition-all ${
                                              bk.booking_status === 'completed'
                                                ? 'bg-white border-slate-200 text-slate-500'
                                                : 'bg-purple-50 border-purple-200 text-purple-200'
                                            }`}
                                          >
                                            <div className="font-mono font-bold text-[8px] text-purple-400">{bk.start_time}</div>
                                            <div className="font-extrabold truncate text-slate-900">{bk.customer?.full_name || bk.customer_profile?.full_name || 'Particular'}</div>
                                            <div className="text-[8px] text-slate-500 truncate">💈 {bk.service?.name}</div>
                                            <div className="text-[8px] text-emerald-400 font-extrabold">{bk.total_price}€</div>
                                            <div className="text-[8px] font-mono text-slate-500 truncate">👥 {bk.staff?.full_name ? bk.staff.full_name.split(' ')[0] : 'Auto'}</div>
                                          </div>
                                        ))
                                      ) : (
                                        <span className="block text-[8px] font-mono text-slate-500 text-center py-6">Vazio</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      )}

                      {/* ==================== MONTHLY VIEW ==================== */}
                      {agendaMode === 'month' && (
                        <div className="space-y-4">
                          <span className="text-[10px] font-mono uppercase bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg text-purple-400 font-extrabold tracking-wide inline-block">
                            Visualização Mensal Dinâmica • Roster 35 Dias
                          </span>

                          <div className="grid grid-cols-7 gap-2 pt-2">
                            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(lbl => (
                              <div key={lbl} className="text-center text-[10px] font-mono font-extrabold uppercase text-slate-500 pb-1">{lbl}</div>
                            ))}

                            {(() => {
                              const baseDate = new Date(selectedAgendaDate + 'T12:00:00');
                              const year = baseDate.getFullYear();
                              const month = baseDate.getMonth();
                              const firstDayOfMonth = new Date(year, month, 1);
                              const lastDayOfMonth = new Date(year, month + 1, 0);

                              const gridCells = [];
                              const offset = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;

                              for (let o = offset; o > 0; o--) {
                                gridCells.push(new Date(year, month, 1 - o));
                              }
                              for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
                                gridCells.push(new Date(year, month, d));
                              }
                              while (gridCells.length < 35) {
                                const nextDay = gridCells.length - lastDayOfMonth.getDate() - offset + 1;
                                gridCells.push(new Date(year, month + 1, nextDay));
                              }

                              return gridCells.map((dateObj, cellIdx) => {
                                const dateStr = dateObj.toISOString().split('T')[0];
                                const isSameMonth = dateObj.getMonth() === month;
                                const isToday = dateStr === new Date().toISOString().split('T')[0];
                                const matchBookings = bookings.filter(b => b.booking_date === dateStr);

                                return (
                                  <div 
                                    key={cellIdx} 
                                    onClick={() => {
                                      setSelectedAgendaDate(dateStr);
                                      setAgendaMode('today');
                                    }}
                                    className={`min-h-[70px] bg-slate-50/60 p-2 border rounded-xl flex flex-col justify-between transition-all cursor-pointer hover:bg-slate-100/70 hover:border-purple-200 group ${
                                      isSameMonth ? 'opacity-100 border-slate-200' : 'opacity-40 hover:opacity-85 border-slate-200'
                                    } ${isToday ? 'border-purple-500 bg-purple-50' : ''}`}
                                  >
                                    <span className={`text-[9px] font-bold font-mono ${isToday ? 'text-purple-400 font-extrabold' : isSameMonth ? 'text-slate-700 group-hover:text-slate-900' : 'text-slate-500'}`}>
                                      {dateObj.getDate()}
                                    </span>

                                    <div className="space-y-1 mt-1.5 flex-1">
                                      {matchBookings.slice(0, 2).map(bk => (
                                        <div 
                                          key={bk.id} 
                                          className="text-[7.5px] px-1 py-0.5 rounded truncate leading-none bg-purple-50 border border-purple-200 text-purple-200 font-bold"
                                        >
                                          {bk.start_time} {bk.service?.name ? bk.service.name.substring(0, 8) : 'Srv'}
                                        </div>
                                      ))}
                                      {matchBookings.length > 2 && (
                                        <span className="block text-[6.5px] text-slate-500 text-center font-bold">+ {matchBookings.length - 2}</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      )}

                      {/* ==================== BY STAFF VIEW ==================== */}
                      {agendaMode === 'by_staff' && (
                        <div className="space-y-4">
                          <span className="text-[10px] font-mono uppercase bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg text-purple-400 font-extrabold tracking-wide inline-block">
                            Escalas por Profissional • Dia Selecionado
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                            {staff.map(st => {
                              const staffBookingsToday = bookings.filter(b => b.staff_id === st.id && b.booking_date === selectedAgendaDate);

                              return (
                                <div key={st.id} className="bg-slate-50/80 border border-slate-200 p-4.5 rounded-2xl space-y-4.5 min-h-[180px] text-left">
                                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500 overflow-hidden text-[10px]">
                                      {st.avatar_url ? (
                                        <img src={st.avatar_url} alt={st.full_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      ) : (
                                        st.full_name.substring(0, 2).toUpperCase()
                                      )}
                                    </div>
                                    <div>
                                      <h5 className="font-extrabold text-[12px] text-slate-900 leading-tight">{st.full_name}</h5>
                                      <span className="text-[9px] text-slate-500 block font-bold">{st.role_title || 'Artista Escala'}</span>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    {staffBookingsToday.length > 0 ? (
                                      staffBookingsToday.map(bk => (
                                        <div 
                                          key={bk.id} 
                                          className={`p-2.5 rounded-xl border text-[10px] space-y-1 ${
                                            bk.booking_status === 'completed'
                                              ? 'bg-white border-slate-200 text-slate-500'
                                              : 'bg-purple-950/30 border-purple-900/30 text-purple-200'
                                          }`}
                                        >
                                          <div className="flex justify-between items-center text-[8.5px] font-mono">
                                            <span className="font-bold text-purple-400">{bk.start_time} - {bk.end_time}</span>
                                            <span className="uppercase text-slate-500 font-bold">{bk.booking_status}</span>
                                          </div>
                                          <div className="font-black text-slate-900 leading-tight">{bk.customer?.full_name || bk.customer_profile?.full_name || 'Particular'}</div>
                                          <div className="text-[9px] text-slate-500 truncate font-semibold">💈 {bk.service?.name}</div>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="h-16 bg-white/50 border border-dashed border-slate-200 border-slate-200 rounded-2xl flex items-center justify-center text-[10px] font-mono text-slate-500 shadow-sm">
                                        Roster livre hoje
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Quick Scaled Agenda Tools - Elegant clean banners */}
                    <div className="lg:col-span-4 space-y-6">
                      <div className="bg-slate-50/60 border border-slate-200 rounded-3xl p-6 space-y-4">
                        <h4 className="font-extrabold text-xs text-slate-600 uppercase tracking-widest leading-none">Métricas Rápidas</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/40 p-4 rounded-2xl border border-slate-200 border-slate-200 text-center shadow-inner animate-fade-in">
                            <span className="block text-[24px] font-black text-purple-450 text-purple-400 leading-none mb-1">{bookings.filter(b => b.booking_status === 'confirmed').length}</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Activas</span>
                          </div>
                          <div className="bg-white/40 p-4 rounded-2xl border border-slate-200 border-slate-200 text-center shadow-inner animate-fade-in">
                            <span className="block text-[24px] font-black text-emerald-400 leading-none mb-1">{bookings.filter(b => b.booking_status === 'completed').length}</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Concluídas</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50/60 border border-slate-200 rounded-3xl p-6 space-y-4">
                        <h4 className="font-extrabold text-xs text-slate-600 uppercase tracking-widest leading-none">Escala Ativa</h4>
                        <div className="space-y-2.5">
                          {staff.length === 0 ? (
                            <p className="text-[11px] text-slate-500 font-mono">Sem dados disponíveis. Os dados serão apresentados após atividade real.</p>
                          ) : (
                            staff.map(st => (
                              <div key={st.id} className="flex items-center justify-between text-xs bg-white/40 border border-slate-200 p-3 rounded-2xl">
                                <span className="font-extrabold text-slate-700 truncate">{st.full_name}</span>
                                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase brand-pulse flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                                  <span>{st.is_active ? 'Ativo' : 'Pausa'}</span>
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW 2: RESERVAS TOTAIS (SEARCH + ACTIONS)            */}
              {/* ==================================================== */}
              {activeTab === 'reservas' && (
                <div id="view-reservas" className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Gestão das Marcações</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Consulte e gira todos os agendamentos feitos pelos seus clientes e equipa num único ecrã.</p>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="bg-slate-50/40 p-5 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:max-w-md">
                      <Search className="w-4 h-4 text-slate-550 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input 
                        type="text"
                        value={bookingSearch}
                        onChange={(e) => setBookingSearch(e.target.value)}
                        placeholder="Pesquise por cliente ou serviço..."
                        className="w-full bg-white border border-slate-200 text-sm pl-10 pr-4 py-2.5 rounded-xl text-slate-900 placeholder-slate-600 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-550 focus:ring-rose-600/25"
                      />
                    </div>

                    {/* Filter states */}
                    <div className="flex flex-wrap gap-1 items-center bg-white p-1 border border-slate-200/80 rounded-xl text-[10px] font-mono font-bold">
                      {[
                        { id: 'all', label: 'Todas' },
                        { id: 'pending', label: 'Pendentes' },
                        { id: 'confirmed', label: 'Confirmadas' },
                        { id: 'completed', label: 'Concluídas' },
                        { id: 'cancelled', label: 'Canceladas' }
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => setBookingFilter(item.id as any)}
                          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                            bookingFilter === item.id ? 'bg-rose-650 bg-rose-600 text-white' : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Operational Data Table */}
                  <div className="bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-white border-b border-slate-100 text-[10px] font-bold text-slate-500 text-slate-500 uppercase tracking-widest leading-none">
                          <tr>
                            <th className="py-4.5 px-6">Cliente</th>
                            <th className="py-4.5 px-4">Serviço Adquirido</th>
                            <th className="py-4.5 px-4">Agendamento</th>
                            <th className="py-4.5 px-4">Profissional</th>
                            <th className="py-4.5 px-4 text-right font-mono">Preço</th>
                            <th className="py-4.5 px-4 text-center">Estado</th>
                            <th className="py-4.5 px-6 text-right">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900 text-xs">
                          {bookings
                            .filter(b => {
                              const terms = bookingSearch.toLowerCase();
                              const custName = (b.customer?.full_name || b.customer_profile?.full_name || '').toLowerCase();
                              const sName = (b.service?.name || '').toLowerCase();
                              const matchesSearch = custName.includes(terms) || sName.includes(terms);

                              if (bookingFilter === 'all') return matchesSearch;
                              return b.booking_status === bookingFilter && matchesSearch;
                            })
                            .map((bk) => (
                              <tr key={bk.id} className="hover:bg-white/25 transition-colors">
                                <td className="py-4 px-6 flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-mono font-bold text-[10px]">
                                    {(bk.customer?.full_name || bk.customer_profile?.full_name || 'Particular').substring(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-extrabold text-slate-900">
                                      {bk.customer?.full_name || bk.customer_profile?.full_name || 'Cliente Particular'}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{bk.customer?.email || bk.customer_profile?.email || 'N/A'}</div>
                                  </div>
                                </td>

                                <td className="py-4 px-4">
                                  <span className="font-bold text-slate-700">{bk.service?.name || 'Serviço Premium'}</span>
                                  <span className="block text-[10px] text-slate-550 text-slate-500 font-mono mt-0.5">⏱ {bk.service?.duration_minutes || '0'} min</span>
                                </td>

                                <td className="py-4 px-4 font-mono">
                                  <div className="font-bold text-slate-900">{bk.booking_date}</div>
                                  <div className="text-[10px] text-rose-500 font-bold mt-0.5">{bk.start_time} - {bk.end_time}</div>
                                </td>

                                <td className="py-4 px-4 text-slate-500">
                                  {bk.staff?.full_name || 'Designação Automática'}
                                </td>

                                <td className="py-4 px-4 text-right font-mono font-black text-rose-400 text-sm">
                                  {bk.total_price} €
                                </td>

                                <td className="py-4 px-4 text-center">
                                  <span className={"inline-block px-2.5 py-0.5 border rounded-full text-[9px] font-bold font-mono uppercase " + (
        (((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status) === 'confirmed' ? 'bg-rose-50 text-rose-500 border-rose-200' :
        (((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status) === 'completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
        (((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status) === 'cancelled' ? 'bg-white border-slate-200 text-slate-500' :
        (((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status) === 'no_show' ? 'bg-orange-50 border-orange-200 text-orange-500' : 'bg-amber-50 border-amber-200 text-amber-500'
      )}>
        {(((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status) === 'no_show' ? 'Falta' :
         (((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status) === 'confirmed' ? 'Confirmado' :
         (((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status) === 'completed' ? 'Concluído' :
         (((bk.booking_status === 'confirmed' || bk.booking_status === 'pending') && isPastBooking(bk.booking_date, bk.end_time || bk.start_time)) ? 'completed' : bk.booking_status)}
      </span>
                                </td>

                                <td className="py-4 px-6 text-right space-x-1">
                                  {bk.booking_status !== 'completed' && bk.booking_status !== 'cancelled' && bk.booking_status !== 'no_show' ? (
  <>
    {!isPastBooking(bk.booking_date, bk.end_time || bk.start_time) ? (
      <>
        <button 
          onClick={() => handleUpdateBookingStatus(bk.id, 'completed')}
          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] font-mono rounded-lg uppercase transition-all cursor-pointer inline-block mx-0.5"
        >
          Concluir
        </button>
        <button 
          onClick={() => handleUpdateBookingStatus(bk.id, 'cancelled')}
          className="px-2 py-1 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors text-[9px] font-mono rounded-lg uppercase cursor-pointer inline-block mx-0.5"
        >
          Mover / Malsucedido
        </button>
      </>
    ) : (
      <button 
        onClick={() => handleUpdateBookingStatus(bk.id, 'no_show')}
        className="px-2 py-1 bg-rose-50 border border-rose-200 text-rose-500 hover:bg-rose-100 transition-colors text-[9px] font-mono rounded-lg uppercase cursor-pointer inline-block mx-0.5"
      >
        Reclamar (Falta)
      </button>
    )}
  </>
) : (
  <span className="text-[10px] text-slate-500 font-mono">-</span>
)}
                                </td>

                              </tr>
                            ))}

                          {bookings.length === 0 && (
                            <tr>
                              <td colSpan={7} className="text-center py-16 text-slate-500 text-xs font-mono space-y-2">
                                <AlertCircle className="w-10 h-10 text-slate-600 mx-auto" />
                                <p className="text-slate-500">Ainda não recebeu marcações. Os agendamentos futuros aparecerão aqui automaticamente.</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW 3: CATÁLOGO DE SERVIÇOS (CRUD)                  */}
              {/* ==================================================== */}
              {activeTab === 'servicos' && (
                <div id="view-servicos" className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Catálogo de Serviços</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Configuração dos seus procedimentos estéticos com preços e durações reais.</p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingService(null);
                        setServiceForm({
                          name: '',
                          description: '',
                          price: 25,
                          duration_minutes: 30,
                          category_id: categories[0]?.id || '',
                          image_url: '',
                          is_active: true
                        });
                        setShowServiceModal(true);
                      }}
                      className="bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold rounded-xl text-white inline-flex items-center gap-2 shadow shadow-rose-950 cursor-pointer text-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar Serviço</span>
                    </button>
                  </div>

                  {/* Grid of active services */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map(sv => (
                      <div key={sv.id} className="bg-slate-50 border border-slate-100 rounded-3xl p-5 hover:border-slate-200 transition-all space-y-4 flex flex-col justify-between">
                        <div>
                          <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-rose-400">{sv.category?.name || 'Geral'}</p>
                          <h4 className="text-base font-black text-slate-900 mt-1">{sv.name}</h4>
                          <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">{sv.description || 'Sem descrição cadastrada.'}</p>
                        </div>

                        <div className="border-t border-slate-200/80 pt-4 flex items-center justify-between text-xs mt-auto">
                          <div className="font-mono">
                            <span className="block text-[10px] text-slate-500 font-bold uppercase">Preço / Duração</span>
                            <span className="text-base font-black text-slate-900">{sv.price} €</span>
                            <span className="text-slate-500 text-slate-500 font-bold ml-1.5 font-sans">({sv.duration_minutes} min)</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingService(sv);
                                setServiceForm({
                                  name: sv.name,
                                  description: sv.description || '',
                                  price: sv.price,
                                  duration_minutes: sv.duration_minutes,
                                  category_id: sv.category_id || '',
                                  image_url: sv.image_url || '',
                                  is_active: sv.is_active
                                });
                                setShowServiceModal(true);
                              }}
                              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteService(sv.id)}
                              className="p-2 hover:bg-rose-950/40 rounded-xl text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                              title="Remover"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {services.length === 0 && (
                      <div className="col-span-1 md:col-span-3 text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-sm font-mono text-slate-500 space-y-3">
                        <Scissors className="w-12 h-12 text-slate-600 mx-auto" />
                        <div>
                          <p className="font-bold text-slate-600">Sem serviços criados.</p>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">Crie os seus serviços (como cortes, colorações ou unhas) para que apareçam no seu salão online.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Service Add/Edit Modal */}
                  {showServiceModal && (
                    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                      <div className="bg-slate-50 border border-slate-200 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 text-slate-800">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                          <h4 className="font-extrabold text-base text-slate-900">{editingService ? "Editar Serviço Profissional" : "Adicionar Novo Serviço Real"}</h4>
                          <button onClick={() => setShowServiceModal(false)} className="text-slate-500 hover:text-slate-900"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSaveService} className="space-y-4 text-xs font-semibold">
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-500 text-slate-500 mb-1.5">Designação de Atendimento</label>
                            <input 
                              type="text" required
                              value={serviceForm.name}
                              onChange={e => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Ex: Corte Degradê Clássico"
                              className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-900 text-xs outline-none focus:border-rose-600 transition-all font-sans"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-500 text-slate-500 mb-1.5">Descrição</label>
                            <textarea 
                              value={serviceForm.description}
                              onChange={e => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Fórmula, produtos especiais de shampoo ou lavagem incluídos..."
                              className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-900 text-xs h-20 outline-none focus:border-rose-600 transition-all font-sans"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-mono uppercase text-slate-500 text-slate-500 mb-1.5">Preço (€)</label>
                              <input 
                                type="number" required min={5}
                                value={serviceForm.price}
                                onChange={e => setServiceForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                                className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-900 text-xs font-mono outline-none focus:border-rose-600 transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono uppercase text-slate-500 text-slate-500 mb-1.5">Duração (minutos)</label>
                              <input 
                                type="number" required min={10} step={5}
                                value={serviceForm.duration_minutes}
                                onChange={e => setServiceForm(prev => ({ ...prev, duration_minutes: Number(e.target.value) }))}
                                className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-900 text-xs font-mono outline-none focus:border-rose-600 transition-all"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-500 text-slate-500 mb-1.5">Categoria Associada</label>
                            <select aria-label="Selecione uma opção"
                              value={serviceForm.category_id}
                              onChange={e => setServiceForm(prev => ({ ...prev, category_id: e.target.value }))}
                              className="w-full bg-white border border-slate-200 p-2.5 pr-8 rounded-xl text-slate-600 text-xs outline-none focus:border-rose-600 transition-all appearance-none"
                            >
                              <option value="">Selecione a Categoria</option>
                              {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>

                          <button 
                            type="submit"
                            className="w-full bg-rose-600 hover:bg-rose-700 py-3 rounded-xl font-bold text-white tracking-wide transition-all uppercase cursor-pointer text-xs"
                          >
                            {editingService ? "Salvar Escalonamentos" : "Cadastrar no Banco de Dados"}
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW 4: ESCALAS DE EQUIPA (CRUD)                      */}
              {/* ==================================================== */}
              {activeTab === 'equipa' && (
                <div id="view-equipa" className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Equipa e Escalas</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Gira as escalas, competências e horários de folga dos membros da equipa.</p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingStaff(null);
                        setStaffForm({
                          full_name: '',
                          role_title: '',
                          avatar_url: '',
                          is_active: true,
                          off_days: ''
                        });
                        setShowStaffModal(true);
                      }}
                      className="bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold rounded-xl text-white inline-flex items-center gap-2 shadow shadow-rose-950 cursor-pointer text-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar Profissional</span>
                    </button>
                  </div>

                  {/* Grid layout staff */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {staff.map(st => (
                      <div key={st.id} className="bg-slate-50 border border-slate-100 rounded-3xl p-5 hover:border-slate-200 text-center flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-slate-100 bg-white/80 border border-slate-200 text-slate-600 font-bold flex items-center justify-center font-mono text-xl overflow-hidden">
                          {st.avatar_url ? (
                            <img src={st.avatar_url} alt={st.full_name} className="w-full h-full object-cover" />
                          ) : (
                            st.full_name.substring(0, 2).toUpperCase()
                          )}
                        </div>

                        <div>
                          <h4 className="font-black text-sm text-slate-900">{st.full_name}</h4>
                          <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 block">{st.role_title || 'Artista Cabelo'}</span>
                        </div>

                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-bold leading-none ${
                          st.is_active ? 'bg-emerald-900/30 text-emerald-400' : 'bg-white text-slate-500'
                        }`}>
                          {st.is_active ? 'Em Atendimento' : 'Fora de Escala'}
                        </span>

                        <div className="border-t border-slate-200 w-full pt-3 flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingStaff(st);
                              setStaffForm({
                                full_name: st.full_name,
                                role_title: st.role_title || '',
                                avatar_url: st.avatar_url || '',
                                is_active: st.is_active,
                                off_days: st.off_days || ''
                              });
                              setShowStaffModal(true);
                            }}
                            className="p-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors text-[10px] rounded-lg font-bold font-mono tracking-tight cursor-pointer"
                          >
                            Configurar
                          </button>
                          <button 
                            onClick={() => handleDeleteStaff(st.id)}
                            className="p-1.5 px-2 py-1.5 bg-rose-950/20 hover:bg-rose-950 text-rose-450 hover:text-rose-500 text-[10px] rounded-lg cursor-pointer"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}

                    {staff.length === 0 && (
                      <div className="col-span-1 md:col-span-4 text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-sm font-mono text-slate-500 space-y-3">
                        <Users className="w-12 h-12 text-slate-600 mx-auto" />
                        <div>
                          <p className="font-bold text-slate-600">Ainda não tem profissionais adicionados.</p>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">Adicione a sua equipa para que as suas clientes possam agendar diretamente com os profissionais favoritos.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Staff Modal */}
                  {showStaffModal && (
                    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                      <div className="bg-slate-50 border border-slate-200 rounded-3xl w-full max-w-sm p-6 sm:p-8 space-y-6 text-slate-800">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                          <h4 className="font-extrabold text-base text-slate-900">{editingStaff ? "Editar Detalhes do Profissional" : "Adicionar Novo Profissional"}</h4>
                          <button onClick={() => setShowStaffModal(false)} className="text-slate-500 hover:text-slate-900"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSaveStaff} className="space-y-4 text-xs font-semibold">
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">Nome Completo</label>
                            <input 
                              type="text" required
                              value={staffForm.full_name}
                              onChange={e => setStaffForm(prev => ({ ...prev, full_name: e.target.value }))}
                              placeholder="Fábio Henriques"
                              className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-900 text-xs outline-none focus:border-rose-605"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">Cargo / Especialização</label>
                            <input 
                              type="text"
                              value={staffForm.role_title}
                              onChange={e => setStaffForm(prev => ({ ...prev, role_title: e.target.value }))}
                              placeholder="Ex: Barbeiro Escalonador"
                              className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-900 text-xs outline-none focus:border-rose-605"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">Link da foto</label>
                            <input 
                              type="text"
                              value={staffForm.avatar_url}
                              onChange={e => setStaffForm(prev => ({ ...prev, avatar_url: e.target.value }))}
                              placeholder="https://exemplo.com/fotoperfil.jpg"
                              className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-900 text-xs outline-none focus:border-rose-605"
                            />
                          </div>

                           <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">Dias de Folga Semanais</label>
                            <div className="flex flex-wrap gap-1">
                              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((letter, dayIdx) => {
                                const offDaysArr = staffForm.off_days ? staffForm.off_days.split(',').map(item => item.trim()) : [];
                                const isSelected = offDaysArr.includes(String(dayIdx));
                                return (
                                  <button
                                    type="button"
                                    key={dayIdx}
                                    onClick={() => {
                                      let newArr;
                                      if (isSelected) {
                                        newArr = offDaysArr.filter(d => d !== String(dayIdx));
                                      } else {
                                        newArr = [...offDaysArr, String(dayIdx)];
                                      }
                                      setStaffForm(prev => ({ ...prev, off_days: newArr.join(',') }));
                                    }}
                                    className={`w-8 h-8 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer ${
                                      isSelected 
                                        ? 'bg-rose-600 text-white border border-rose-600' 
                                        : 'bg-white text-slate-500 hover:text-slate-900 border border-slate-200'
                                    }`}
                                    title={['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][dayIdx]}
                                  >
                                    {letter}
                                  </button>
                                );
                              })}
                            </div>
                            <p className="text-[10px] text-slate-500 font-sans mt-1 leading-normal">
                              O profissional selecionado ficará indisponível para marcação automática nestes dias.
                            </p>
                          </div>

                          <div className="flex items-center gap-2 pt-2">
                            <input 
                              type="checkbox"
                              id="staff-active-check"
                              checked={staffForm.is_active}
                              onChange={e => setStaffForm(prev => ({ ...prev, is_active: e.target.checked }))}
                              className="w-4 h-4 accent-rose-600 rounded"
                            />
                            <label htmlFor="staff-active-check" className="text-slate-600 font-bold">Activo na Escala Diária</label>
                          </div>

                          <button 
                            type="submit"
                            className="w-full bg-rose-600 hover:bg-rose-700 py-3 rounded-xl font-bold text-white tracking-wide transition-all uppercase cursor-pointer"
                          >
                            Confirmar Registo Profissional
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW 5: HORAS DE SERVIÇO (BUSINESS HOURS)            */}
              {/* ==================================================== */}
              {activeTab === 'horarios' && (() => {
                const timeList = Array.from({ length: 34 }, (_, i) => {
                  const h = Math.floor(6 + i / 2);
                  const m = i % 2 === 0 ? '00' : '30';
                  return `${String(h).padStart(2, '0')}:${m}`;
                });

                const weekdaysOrdered = [
                  { name: 'Segunda-feira', idx: 1 },
                  { name: 'Terça-feira', idx: 2 },
                  { name: 'Quarta-feira', idx: 3 },
                  { name: 'Quinta-feira', idx: 4 },
                  { name: 'Sexta-feira', idx: 5 },
                  { name: 'Sábado', idx: 6 },
                  { name: 'Domingo', idx: 0 },
                ];

                return (
                  <div id="view-horarios" className="space-y-6 animate-fade-in max-w-3xl">
                    <div className="border-b border-slate-100 pb-5 text-left">
                      <h3 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-400" />
                        <span>Horário de Funcionamento Oficial</span>
                      </h3>
                      <p className="text-xs text-slate-500 text-slate-500 mt-1 leading-normal">
                        Defina de forma simples as horas de funcionamento reais e dias de encerramento do salão. A sua agenda online atualizará instantaneamente no marketplace da Glamzo.
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-100/50 rounded-3xl p-5 sm:p-7 space-y-4">
                      <div className="space-y-3.5">
                        {weekdaysOrdered.map(({ name, idx }) => {
                          const match = hours.find(h => h.weekday === idx);
                          const isClosed = match ? match.is_closed : true;
                          const currentOpen = match ? match.open_time : '09:00';
                          const currentClose = match ? match.close_time : '19:00';

                          return (
                            <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-100/80 hover:border-slate-200 transition-all text-left">
                              <div className="flex items-center gap-3 shrink-0">
                                <span className={`w-2.5 h-2.5 rounded-full ${isClosed ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
                                <span className="font-extrabold text-sm text-slate-900 w-28 uppercase tracking-wide font-mono">{name}</span>
                              </div>

                              <div className="flex flex-wrap items-center gap-3">
                                {/* Aperture Select */}
                                <div className="flex items-center gap-2">
                                  <label className="text-[10px] text-slate-500 uppercase font-bold font-mono">Abertura</label>
                                  <select aria-label="Selecione uma opção"
                                    disabled={isClosed}
                                    value={currentOpen}
                                    onChange={e => handleUpdateHours(idx, 'open_time', e.target.value)}
                                    className="bg-slate-50 border border-slate-200 p-2 px-3 rounded-xl text-slate-900 text-xs font-bold font-mono outline-none disabled:opacity-40 select-all transition-all"
                                  >
                                    {timeList.map(t => <option key={t} value={t}>{t}</option>)}
                                  </select>
                                </div>

                                <span className="text-slate-600 font-extrabold text-[10px] font-mono uppercase">até</span>

                                {/* Closing Select */}
                                <div className="flex items-center gap-2">
                                  <label className="text-[10px] text-slate-500 uppercase font-bold font-mono">Fecho</label>
                                  <select aria-label="Selecione uma opção"
                                    disabled={isClosed}
                                    value={currentClose}
                                    onChange={e => handleUpdateHours(idx, 'close_time', e.target.value)}
                                    className="bg-slate-50 border border-slate-200 p-2 px-3 rounded-xl text-slate-900 text-xs font-bold font-mono outline-none disabled:opacity-40 select-all transition-all"
                                  >
                                    {timeList.map(t => <option key={t} value={t}>{t}</option>)}
                                  </select>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 justify-end">
                                {/* Copy hours to all buttons */}
                                {!isClosed && (
                                  <button
                                    onClick={() => handleCopyHoursToAll(idx)}
                                    className="p-1 px-2.5 bg-purple-950 hover:bg-purple-900 text-purple-300 hover:text-slate-900 border border-purple-900/60 transition-all rounded-lg text-[10px] uppercase font-black tracking-wider font-mono cursor-pointer flex items-center gap-1"
                                    title="Replica este mesmo horário de abertura/fecho para todos os dias úteis."
                                  >
                                    <Copy className="w-3 h-3" />
                                    <span>Copiar para todos</span>
                                  </button>
                                )}

                                {/* Closed Button Toggle */}
                                <button
                                  onClick={() => handleUpdateHours(idx, 'is_closed', !isClosed)}
                                  className={`px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase font-black tracking-wider transition-all cursor-pointer border ${
                                    isClosed 
                                      ? 'bg-rose-950/60 text-rose-450 border-rose-900 h-8 flex items-center justify-center' 
                                      : 'bg-slate-50 text-slate-500 hover:text-slate-900 border-slate-200 hover:bg-slate-100 h-8 flex items-center justify-center'
                                  }`}
                                >
                                  {isClosed ? 'Encerrado' : 'Aberto'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ==================================================== */}
              {/* VIEW 6: REGISTO DE CLIENTES (SPENDINGS + POINTS)      */}
              {/* ==================================================== */}
              {activeTab === 'clientes' && (
                <div id="view-clientes" className="space-y-6">
                  <div className="border-b border-slate-100 pb-5">
                    <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Livro de Clientes Registados</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Histórico automático de visitas e gastos individuais de cada cliente.</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-white text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none border-b border-slate-100">
                          <tr>
                            <th className="py-4.5 px-6">Cliente Registado</th>
                            <th className="py-4.5 px-4">Correio Electrónico</th>
                            <th className="py-4.5 px-4 text-center font-mono">Visitas Concluídas</th>
                            <th className="py-4.5 px-4 text-right font-mono">Gasto Bruto</th>
                            <th className="py-4.5 px-4 text-center font-mono">Pontos de Fidelização</th>
                            <th className="py-4.5 px-6 text-center">Nível</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900 text-xs">
                          {clientsList.map((client, idx) => {
                            const fidelityPoints = client.visits * 15;
                            let loyaltyTier = 'Membro Standard';
                            let tierBadge = 'bg-white border-slate-200 text-slate-500 text-slate-500';
                            if (fidelityPoints >= 60) {
                              loyaltyTier = 'VIP Platinum';
                              tierBadge = 'bg-amber-950 text-amber-400 border-amber-900';
                            } else if (fidelityPoints >= 30) {
                              loyaltyTier = 'Fidelizado Ouro';
                              tierBadge = 'bg-purple-950 text-purple-400 border-purple-900';
                            }

                            return (
                              <tr key={idx} className="hover:bg-white/20 transition-colors">
                                <td className="py-4.5 px-6 font-bold text-slate-900 flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-mono font-bold text-[10px] text-slate-500">
                                    {client.name.substring(0, 2).toUpperCase()}
                                  </div>
                                  <span>{client.name}</span>
                                </td>
                                <td className="py-4.5 px-4 text-slate-500 font-mono select-all">
                                  {client.email}
                                </td>
                                <td className="py-4.5 px-4 text-center font-mono font-extrabold text-slate-700 text-slate-700">
                                  {client.visits}
                                </td>
                                <td className="py-4.5 px-4 text-right font-mono font-black text-rose-450 text-rose-400">
                                  {client.spend.toFixed(2)} €
                                </td>
                                <td className="py-4.5 px-4 text-center font-mono text-emerald-400 font-extrabold">
                                  ⭐ {fidelityPoints} pts
                                </td>
                                <td className="py-4.5 px-6 text-center">
                                  <span className={`inline-block px-2.5 py-0.5 border rounded-full text-[9px] font-mono font-bold uppercase tracking-tight ${tierBadge}`}>
                                    {loyaltyTier}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}

                          {clientsList.length === 0 && (
                            <tr>
                              <td colSpan={6} className="text-center py-16 text-slate-500 text-xs font-mono">
                                <UsersRound className="w-12 h-12 text-slate-700 mx-auto mb-2" />
                                <p>Ainda não tem clientes registados no seu histórico.</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW 7: PERFORMANCE CHARTS & METRICS                 */}
              {/* ==================================================== */}
              {activeTab === 'analytics' && (
                <div id="view-analytics" className="space-y-6 animate-fade-in">
                  <div className="border-b border-slate-100 pb-5">
                    <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Gráficos de Desempenho</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Analise o crescimento do seu negócio com dados transparentes originando do Glamzo Pay e faturas da base.</p>
                  </div>

                  {/* Operational Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest text-slate-500 leading-none">Vendas Realizadas</span>
                        <span className="text-2xl font-black text-slate-900 mt-1.5 block">{bookings.filter(b => b.booking_status === 'completed').length}</span>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-white text-slate-500 flex items-center justify-center border border-slate-200">
                        <CheckSquare className="w-5 h-5 text-slate-500" />
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest text-slate-500 leading-none">Receita Total</span>
                        <span className="text-2xl font-black text-emerald-400 mt-1.5 block">
                          {bookings.filter(b => b.booking_status === 'completed').reduce((sum, item) => sum + Number(item.total_price), 0).toFixed(2)} €
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-900/60">
                        <DollarSign className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest text-slate-500 leading-none">Agendamentos Pendentes</span>
                        <span className="text-2xl font-black text-amber-400 mt-1.5 block">{bookings.filter(b => b.booking_status === 'pending').length}</span>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-amber-950 text-amber-400 flex items-center justify-center border border-amber-900">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest text-slate-500 leading-none">Tickets Suporte</span>
                        <span className="text-2xl font-black text-slate-900 mt-1.5 block">0</span>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-white text-slate-500 flex items-center justify-center border border-slate-200">
                        <HelpCircle className="w-5 h-5 text-slate-500" />
                      </div>
                    </div>
                  </div>

                  {/* Recharts Graphical charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-w-0">
                    {/* Monthly Volume BarChart */}
                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-3 min-w-0 flex flex-col justify-between">
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Volume de Vendas Mensal</h4>
                      <div className="h-64 flex items-center justify-center">
                        {getDynamicPartnerVolumeData().length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <RBarChart data={getDynamicPartnerVolumeData()}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                              <YAxis stroke="#64748b" fontSize={11} unit="€" />
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} labelStyle={{ color: '#fff' }} />
                              <Legend />
                              <Bar dataKey="receita" fill="#e11d48" name="Facturação Bruta" radius={[4, 4, 0, 0]} />
                            </RBarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-center p-6 border border-dashed border-slate-200 rounded-2xl w-full h-full flex flex-col items-center justify-center self-stretch bg-white/20">
                            <BarChart className="w-8 h-8 text-slate-500 mb-2" />
                            <p className="text-slate-900 font-bold text-xs">Sem dados disponíveis</p>
                            <p className="text-[10px] text-slate-550 text-slate-500 mt-1">Os dados serão apresentados após atividade real.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bookings Distribution LineChart */}
                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-3 min-w-0 flex flex-col justify-between">
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Frequência Semanal de Ocupação</h4>
                      <div className="h-64 flex items-center justify-center">
                        {getDynamicPartnerWeeklyOccupancy().length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <RLineChart data={getDynamicPartnerWeeklyOccupancy()}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                              <YAxis stroke="#64748b" fontSize={11} unit="%" />
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} labelStyle={{ color: '#fff' }} />
                              <Line type="monotone" dataKey="taxa" stroke="#d97706" name="Taxa Ocupação" strokeWidth={2.5} activeDot={{ r: 8 }} />
                            </RLineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-center p-6 border border-dashed border-slate-200 rounded-2xl w-full h-full flex flex-col items-center justify-center self-stretch bg-white/20">
                            <TrendingUp className="w-8 h-8 text-slate-500 mb-2" />
                            <p className="text-slate-900 font-bold text-xs">Sem dados disponíveis</p>
                            <p className="text-[10px] text-slate-550 text-slate-500 mt-1">Os dados serão apresentados após atividade real.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW: MENSAGENS (CHAT)                               */}
              {/* ==================================================== */}
              {activeTab === 'mensagens' && (
                <div id="view-mensagens" className="space-y-6 animate-fade-in max-w-5xl">
                  <div className="border-b border-slate-100 pb-5">
                    <h3 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                      Mensagens e Suporte
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Responda rapidamente aos seus clientes. Dê suporte direto via portal.</p>
                  </div>
                  {business && <DashboardMessages businessId={business.id} />}
                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW 12: TABLET ORDER STATUS                         */}
              {/* ==================================================== */}
              {activeTab === 'tablet' && tabletOrder && (
                <div id="view-tablet" className="space-y-6 animate-fade-in max-w-2xl">
                  <div className="border-b border-slate-100 pb-5">
                    <h3 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                       <Smartphone className="w-5 h-5 text-purple-600" /> Terminal Glamzo
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Acompanhe o estado do envio do seu equipamento PRO.</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-lg shadow flex items-center justify-center">
                        <Truck className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Estado do Envio</span>
                        <h4 className="font-bold text-slate-900 text-lg capitalize">{tabletOrder.status}</h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Transportadora</span>
                        <h4 className="font-bold text-slate-900 mt-1">{tabletOrder.carrier || 'Aguardando envio'}</h4>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Tracking #</span>
                        <h4 className="font-mono text-slate-900 mt-1 text-sm">{tabletOrder.tracking_code || '---'}</h4>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold mb-2 block">Morada de Entrega</span>
                      <p><strong>Nome:</strong> {tabletOrder.shipping_name}</p>
                      <p><strong>Telefone:</strong> {tabletOrder.shipping_phone}</p>
                      <p><strong>Morada:</strong> {tabletOrder.shipping_address}, {tabletOrder.shipping_postal_code} {tabletOrder.shipping_city}</p>
                    </div>
                    
                    <button className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2">
                       <HelpCircle className="w-4 h-4" /> Relatar problema de entrega
                    </button>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW 8: CONFIGURAÇÕES - EDIT SHOP PROFILE            */}
              {/* ==================================================== */}
              {activeTab === 'configuracoes' && (
                <div id="view-configuracoes" className="space-y-6 max-w-7xl animate-fade-in">
                  <div className="border-b border-slate-200 pb-5 text-left">
                    <h3 className="text-xl font-display font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      <span>Configurações do Estabelecimento</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Mantenha a sua foto de capa, logótipo, endereço e dados de marca atualizados no marketplace real.</p>
                  </div>

                  {business && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      
                      {/* Left: Interactive Input Form */}
                      <form onSubmit={handleUpdateConfiguracoes} className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-xs font-semibold [box-shadow:0_20px_50px_rgba(0,0,0,0.35)]">
                        
                        {/* Name & Phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-500 text-slate-500 mb-1.5">Nome do Salão</label>
                            <input 
                              type="text" required
                              value={business.name}
                              onChange={e => setBusiness(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                              className="w-full bg-white border border-slate-200 p-3 rounded-xl text-slate-900 text-xs outline-none focus:border-purple-500 font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-500 text-slate-500 mb-1.5">Telefone de Atendimento</label>
                            <input 
                              type="tel" required
                              value={business.phone}
                              onChange={e => setBusiness(prev => prev ? ({ ...prev, phone: e.target.value }) : null)}
                              className="w-full bg-white border border-slate-200 p-3 rounded-xl text-slate-900 text-xs outline-none focus:border-purple-500 font-sans font-mono"
                            />
                          </div>
                        </div>

                        {/* District & City */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-500 text-slate-500 mb-1.5">Distrito / Concelho</label>
                            <input 
                              type="text" required
                              value={business.district}
                              onChange={e => setBusiness(prev => prev ? ({ ...prev, district: e.target.value }) : null)}
                              className="w-full bg-white border border-slate-200 p-3 rounded-xl text-slate-900 text-xs outline-none focus:border-purple-500 font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-500 text-slate-500 mb-1.5">Cidade (Freguesia)</label>
                            <input 
                              type="text" required
                              value={business.city}
                              onChange={e => setBusiness(prev => prev ? ({ ...prev, city: e.target.value }) : null)}
                              className="w-full bg-white border border-slate-200 p-3 rounded-xl text-slate-900 text-xs outline-none focus:border-purple-500 font-sans"
                            />
                          </div>
                        </div>

                        {/* Address */}
                        <div className="text-left">
                          <label className="block text-[10px] font-mono uppercase text-slate-500 text-slate-500 mb-1.5">Endereço de Portaria (Rua, Número, Código Postal)</label>
                          <input 
                            type="text" required
                            value={business.address}
                            onChange={e => setBusiness(prev => prev ? ({ ...prev, address: e.target.value }) : null)}
                            placeholder="Avenida da Liberdade Nº 42, 1250-142 Lisboa"
                            className="w-full bg-white border border-slate-200 p-3 rounded-xl text-slate-900 text-xs outline-none focus:border-purple-500 font-sans"
                          />
                        </div>

                        {/* Logo and Cover URL */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-500 text-slate-500 mb-1.5">Link URL do Logótipo</label>
                            <input 
                              type="url"
                              value={business.logo_url || ''}
                              onChange={e => setBusiness(prev => prev ? ({ ...prev, logo_url: e.target.value }) : null)}
                              className="w-full bg-white border border-slate-200 p-3 rounded-xl text-slate-900 text-xs outline-none focus:border-purple-500"
                              placeholder="https://exemplo.com/logotipo.jpg"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-500 text-slate-500 mb-1.5">Link URL da Foto de Capa</label>
                            <input 
                              type="url"
                              value={business.cover_url || ''}
                              onChange={e => setBusiness(prev => prev ? ({ ...prev, cover_url: e.target.value }) : null)}
                              className="w-full bg-white border border-slate-200 p-3 rounded-xl text-slate-900 text-xs outline-none focus:border-purple-500"
                              placeholder="https://exemplo.com/capasalao.jpg"
                            />
                          </div>
                        </div>

                        {/* Biography description */}
                        <div className="text-left">
                          <label className="block text-[10px] font-mono uppercase text-slate-500 text-slate-500 mb-1.5">Apresentação Editorial do Salão</label>
                          <textarea 
                            value={business.description || ''}
                            onChange={e => setBusiness(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                            rows={3}
                            className="w-full bg-white border border-slate-200 p-3 rounded-xl text-slate-900 text-xs outline-none focus:border-purple-500 font-sans"
                            placeholder="Escreva brevemente sobre o conceito e estilo do salão..."
                          />
                        </div>

                        <button 
                          type="submit"
                          className="bg-purple-600 hover:bg-purple-700 w-full py-3.5 rounded-xl font-bold uppercase tracking-wide text-white transition-all cursor-pointer text-xs"
                        >
                          Guardar Definições
                        </button>
                      </form>

                      {/* Right: Live Identity Visual Mockup Card mirroring the Brand Manual template */}
                      <div className="lg:col-span-5 bg-slate-50 border border-slate-200 p-6 rounded-3xl space-y-6 [box-shadow:0_15px_40px_rgba(0,0,0,0.4)] lg:sticky lg:top-24 text-left">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600 font-bold">Manual de Identidade Visual</span>
                          </div>
                          <span className="text-[8px] bg-purple-950/80 text-purple-400 border border-purple-800/60 px-2 py-0.5 rounded-full font-mono uppercase">Ref Ativo</span>
                        </div>

                        {/* Interactive Dark Navy Card mimicking Option 3 from reference image */}
                        <div className="bg-[#fafbfc] border border-slate-200 rounded-2xl p-5 space-y-5 shadow-inner select-none relative overflow-hidden group">
                          
                          {/* Top bar with url slug mock */}
                          <div className="flex items-center justify-between text-slate-500">
                            <div className="flex items-center gap-1.5 text-[10px] font-mono hover:text-slate-900 transition-colors">
                              <Globe className="w-3.5 h-3.5 text-purple-400" />
                              <span className="underline truncate max-w-[200px]">glamzo.com/salon/{business?.slug || 'parceiro'}</span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                          </div>

                          {/* Logo Display representation segment */}
                          <div className="flex items-center gap-4 py-1">
                            {business?.logo_url ? (
                              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
                                <img src={business.logo_url} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-purple-50 border-2 border-dashed border-purple-800/40 flex flex-col items-center justify-center shrink-0 shadow-sm grow-0 group-hover:border-purple-500 transition-colors">
                                <Plus className="w-4 h-4 text-purple-400" />
                                <span className="text-[7px] text-slate-500 block font-mono font-bold leading-none mt-1">Logo URL</span>
                              </div>
                            )}
                            <div>
                              <span className="block text-sm font-display font-black text-slate-900 tracking-tight">{business?.name || 'Seu Salão Glamzo'}</span>
                              <span className="block text-[9px] text-slate-500 font-mono mt-0.5 uppercase tracking-widest">{business?.city || 'Lisboa'}, Portugal</span>
                            </div>
                          </div>

                          {/* Fonts Division: Aa Outfit and Aa Inter layout like reference guide */}
                          <div className="grid grid-cols-2 gap-4 border-t border-slate-200/50 pt-4">
                            <div>
                              <span className="text-[8px] font-mono uppercase text-slate-500 block mb-1">Display Headings</span>
                              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                                <span className="block text-xs font-display font-black text-slate-900">Aa Outfit</span>
                                <span className="text-[9px] text-purple-400 block mt-0.5 leading-none">Elegant & Tech</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-[8px] font-mono uppercase text-slate-500 block mb-1">Body Text</span>
                              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                                <span className="block text-xs font-sans font-bold text-slate-700">Aa Inter</span>
                                <span className="text-[9px] text-slate-500 block mt-0.5 leading-none">Clean & Modern</span>
                              </div>
                            </div>
                          </div>

                          {/* Color Palette circle row + hex labels exactly mirroring the mockup layout */}
                          <div className="space-y-2 border-t border-slate-200/50 pt-4">
                            <span className="text-[8px] font-mono uppercase text-slate-500 block">Esquema de Cores do Guidelines</span>
                            <div className="grid grid-cols-4 gap-2 text-center">
                              <div className="space-y-1 animate-pulse" style={{ animationDuration: '4s' }}>
                                <div className="w-8 h-8 rounded-full bg-[#9333ea] border border-white/10 mx-auto shadow-md shadow-purple-900/40" />
                                <span className="font-mono text-[8px] block text-purple-400 font-bold">#9333ea</span>
                              </div>
                              <div className="space-y-1">
                                <div className="w-8 h-8 rounded-full bg-[#fafbfc] border border-white/10 mx-auto shadow-md" />
                                <span className="font-mono text-[8px] block text-slate-600 font-bold">#fafbfc</span>
                              </div>
                              <div className="space-y-1">
                                <div className="w-8 h-8 rounded-full bg-[#fafbfc] border border-white/10 mx-auto shadow-md" />
                                <span className="font-mono text-[8px] block text-slate-500 font-bold">#0f172a</span>
                              </div>
                              <div className="space-y-1 animate-pulse" style={{ animationDuration: '6s' }}>
                                <div className="w-8 h-8 rounded-full bg-[#f43f5e] border border-white/10 mx-auto shadow-md shadow-rose-900/10" />
                                <span className="font-mono text-[8px] block text-rose-400 font-bold font-mono">#f43f5e</span>
                              </div>
                            </div>
                          </div>

                          {/* Tagline editor mirroring tagline box in brand layout (incorporates salon description) */}
                          <div className="p-3 bg-slate-50/60 border border-slate-200 rounded-xl space-y-1.5 border-l-2 border-purple-500 mt-2">
                            <span className="text-[8px] font-mono uppercase text-slate-500 block font-bold">Apresentação / Editorial</span>
                            <p className="text-[11px] font-sans text-slate-600 italic leading-relaxed">
                              "{business?.description || 'Descubra e marque os melhores serviços de beleza e bem-estar de Portugal.'}"
                            </p>
                          </div>

                          {/* Section: Voice of Tone pills */}
                          <div className="space-y-2 border-t border-slate-200/40 pt-3">
                            <span className="text-[8px] font-mono uppercase text-slate-500 block">Tom de Voz da Marca (Voice)</span>
                            <div className="flex flex-wrap gap-1.5">
                              {['Elegante', 'Profissional', 'Moderno', 'Confiante'].map((tone) => (
                                <span key={tone} className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-slate-50 text-purple-300 border border-purple-200 shadow-sm">
                                  {tone}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Section: Values pills */}
                          <div className="space-y-2 mt-2">
                            <span className="text-[8px] font-mono uppercase text-slate-500 block">Valores de Marca (Values)</span>
                            <div className="flex flex-wrap gap-1.5">
                              {['Qualidade Elite', 'Foco no Cliente', 'Modernidade Digital', 'Organização'].map((value) => (
                                <span key={value} className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-slate-50 text-rose-300 border border-slate-200/80 shadow-sm">
                                  {value}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Section: Aesthetics pills */}
                          <div className="space-y-2 mt-2">
                            <span className="text-[8px] font-mono uppercase text-slate-500 block">Linha Estética (Aesthetic)</span>
                            <div className="flex flex-wrap gap-1.5">
                              {['Minimalismo Moderno', 'High-End Beauty Tech', 'Energia de Gradientes'].map((aes) => (
                                <span key={aes} className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                  <span>{aes}</span>
                                </span>
                              ))}
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'financeiro' && (
                <div id="view-financeiro" className="space-y-6 max-w-3xl animate-fade-in">
                  <div className="border-b border-slate-100 pb-5 text-left">
                    <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Subscrição e Faturação</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Acompanhe a sua subscrição Glamzo Pro, consulte as suas faturas reais e verifique o estado do Glamzo Pay Connect.</p>
                  </div>

                  {/* Operational Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left border-l-2 border-l-purple-500">
                      <span className="block text-[9px] font-mono text-slate-500 uppercase font-black tracking-wider leading-none">Faturação Bruta</span>
                      <span className="text-base sm:text-lg font-black text-slate-900 mt-1.5 block font-mono">{totalVolumeBruto.toFixed(2)} €</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left border-l-2 border-l-orange-500">
                      <span className="block text-[9px] font-mono text-slate-500 uppercase font-black tracking-wider leading-none">Comissões Glamzo</span>
                      <span className="text-base sm:text-lg font-black text-rose-350 mt-1.5 block font-mono">-{totalComissoesRetidas.toFixed(2)} €</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left border-l-2 border-l-emerald-500">
                      <span className="block text-[9px] font-mono text-slate-500 uppercase font-black tracking-wider leading-none">Faturação Líquida</span>
                      <span className="text-base sm:text-lg font-black text-emerald-400 mt-1.5 block font-mono">{totalReceivedVolume.toFixed(2)} €</span>
                    </div>
                  </div>

                  {/* Gestão da Subscrição Glamzo PRO */}
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 text-left">
                    <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          <span>Subscrição & Plano Atual (Glamzo PRO)</span>
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-normal font-sans">
                          Acompanhe o estado da sua assinatura de software e os seus dias de teste ativo.
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-200 text-purple-400 text-[10px] font-extrabold rounded-full tracking-wider font-mono uppercase">
                        {business?.subscription_status || 'Trialing'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/40 p-4 rounded-2xl border border-slate-200 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-500 block text-[9px] uppercase font-mono tracking-wider font-bold">Plano Ativo</span>
                        <span className="text-slate-900 font-extrabold text-xs sm:text-sm leading-none block">Glamzo PRO</span>
                        <span className="text-[10px] text-slate-500 block">Acesso ilimitado à plataforma, agenda e comissões integradas.</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-500 block text-[9px] uppercase font-mono tracking-wider font-bold">Mensalidade Recorrente</span>
                        <span className="text-purple-400 font-extrabold text-xs sm:text-sm leading-none block">19.90€ <span className="text-[10px] text-slate-500 font-medium font-sans">/ mês</span></span>
                        <span className="text-[10px] text-slate-500 block">Cobrança segura automática processada pelo Glamzo Pay.</span>
                      </div>
                    </div>

                    {/* Subscriptions Info Details */}
                    <div className="text-xs text-slate-500 leading-relaxed space-y-2">
                      <p>
                        O plano <span className="font-extrabold text-slate-900">Glamzo PRO</span> inclui 14 dias de teste gratuito na ativação inicial. Se optar por cancelar antes de terminar o período técnico de 14 dias, nenhuma cobrança será efetuada ao seu cartão bancário.
                      </p>
                      {trialEndsAt && (
                        <p className="font-mono text-[10px] text-indigo-400 bg-indigo-950/25 p-2 px-3 rounded-lg border border-indigo-950/45 w-fit">
                          ⏳ Fim do período/Renovação: {new Date(trialEndsAt).toLocaleDateString('pt-PT')} ({trialDaysRemaining} dias restantes)
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      {business?.stripe_subscription_id && business.stripe_subscription_id.trim() !== '' ? (
                        <>
                          <button
                            onClick={handleOpenBillingPortal}
                            className="bg-slate-100 hover:bg-slate-100 text-slate-700 text-xs font-bold px-4 py-3 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>Gerir faturas no portal de pagamentos</span>
                          </button>
                          <button
                            onClick={handleCancelSubscription}
                            disabled={cancelingSubscription}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold px-4 py-3 rounded-xl transition cursor-pointer border border-rose-500/20 disabled:opacity-45"
                          >
                            {cancelingSubscription ? 'A Processar...' : 'Cancelar Subscrição'}
                          </button>
                        </>
                      ) : (
                        <div className="space-y-3 w-full">
                          <p className="text-[11px] text-amber-400 leading-normal bg-amber-950/10 border border-amber-500/20 p-3.5 rounded-xl">
                            ⚠️ Atualmente, a sua parceria está ativa apenas em teste local ou sem cartão registado no Glamzo Pay. Para garantir a visibilidade do estabelecimento no Marketplace, ative a sua assinatura abaixo:
                          </p>
                          <button
                            onClick={handleSubscribePro}
                            className="bg-gradient-to-tr from-[#9333ea] to-[#db2777] hover:opacity-95 text-slate-900 text-xs font-extrabold uppercase px-5 py-3.5 rounded-xl transition cursor-pointer shadow-lg shadow-purple-950/30 flex items-center justify-center gap-2"
                          >
                            <CreditCard className="w-4.5 h-4.5" />
                            <span>Ativar Glamzo PRO (Pagamento online)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Glamzo Pay Express Connect Manager */}
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
                    <div className="border-b border-slate-200 pb-2 text-left">
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider font-mono">Definições de Recebimentos</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                        Configure a sua conta Glamzo Pay Express obrigatória para receber pagamentos de marcações diretamente na sua conta bancária.
                      </p>
                    </div>

                    {business?.stripe_account_id ? (
                      <div className="space-y-4">
                        {stripeStatus ? (
                          <>
                            {stripeStatus.charges_enabled && stripeStatus.payouts_enabled ? (
                              /* STATUS ACTIVE */
                              <div className="bg-emerald-950/20 border border-emerald-900/45 rounded-2xl p-5 text-left flex items-start gap-4 animate-fade-in">
                                <div className="p-2.5 bg-emerald-950/60 text-emerald-400 rounded-xl border border-emerald-900 shrink-0">
                                  <Building className="w-5 h-5" />
                                </div>
                                <div className="space-y-1 grow">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider font-mono">CONTA DE PAGAMENTOS ATIVA</h4>
                                    <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-900 rounded text-[8px] font-mono tracking-wider font-bold uppercase leading-none">PRONTO</span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                                    A sua conta está totalmente verificada e operacional com o ID <span className="text-slate-900 font-bold font-mono text-[10px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">{business.stripe_account_id}</span>.
                                  </p>
                                  <div className="bg-white/40 rounded-xl p-3 border border-slate-100 text-[10px] space-y-1 mt-2">
                                    <p className="text-emerald-400 font-bold">✓ Split de Fundos Ativo: Loja recebe 95% do valor; Plataforma retém comissão de 5%.</p>
                                    <p className="text-slate-500 text-slate-500 font-sans">✓ Transferências Automáticas: Processadas pelo Glamzo Pay diretamente para o seu IBAN associado de acordo com a sua calendarização no parceiro de pagamentos.</p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* STATUS INCOMPLETE */
                              <div className="bg-amber-950/20 border border-amber-900/40 rounded-2xl p-5 text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
                                <div className="flex items-start gap-3 grow">
                                  <div className="p-2.5 bg-amber-950/60 text-amber-500 rounded-xl border border-amber-900/60 shrink-0 mt-0.5 animate-pulse">
                                    <AlertTriangle className="w-5 h-5" />
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider font-mono">CONEXÃO BANCÁRIA INCOMPLETA</h4>
                                      <span className="px-1.5 py-0.2 bg-amber-950 text-amber-400 border border-amber-900 rounded text-[8px] font-mono tracking-wider font-bold uppercase leading-none">PENDENTE</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                                      O seu ID de conta <span className="text-slate-900 font-mono text-[10px] bg-white border border-slate-100 px-1 py-0.5 rounded">{business.stripe_account_id}</span> foi associado, mas ainda precisa completar o fluxo de onboarding para ativar cobranças e transferências.
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={handleConnectStripe}
                                  disabled={connectingStripe}
                                  className="text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl shrink-0 font-sans transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-amber-600"
                                >
                                  {connectingStripe ? 'A carregar...' : 'Completar Cadastro'}
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          /* FETCHING STATUS OR SIMPLE ID LINKED SKELETON */
                          <div className="bg-indigo-50 border border-indigo-900/40 rounded-2xl p-5 text-left flex items-start gap-4">
                            <div className="p-2.5 bg-indigo-950 text-indigo-400 rounded-xl border border-indigo-900 shrink-0">
                              <Building className="w-5 h-5" />
                            </div>
                            <div className="space-y-1 grow">
                              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider font-mono">Carregando Informações do Connect...</h4>
                              <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                                ID Associado: <span className="text-slate-900 font-mono text-[10px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">{business.stripe_account_id}</span>. A obter status em tempo real...
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* NO ACCOUNT ID LINKED */
                      <div className="space-y-4 font-sans text-left">
                        <div className="bg-amber-950/15 border border-amber-900/40 rounded-2xl p-5 text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex items-start gap-3 grow">
                            <div className="p-2.5 bg-amber-950/60 text-amber-500 rounded-xl border border-amber-900/60 shrink-0 mt-0.5">
                              <AlertTriangle className="w-5 h-5 animate-pulse" />
                            </div>
                            <div className="space-y-0.5 grow">
                              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider font-mono">CONTA BANCÁRIA REQUERIDA</h4>
                              <p className="text-[11px] text-slate-500 leading-normal font-sans">
                                É necessário interligar uma conta Glamzo Pay Express para receber pagamentos online. O valor pago pelo cliente será dividido automaticamente (95% para si / 5% comissão Glamzo) e transferido para o seu banco conforme o calendário de transferências configurado no Glamzo Pay.
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleConnectStripe}
                            disabled={connectingStripe}
                            className="text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl shrink-0 font-sans transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-amber-600 shadow"
                          >
                            {connectingStripe ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Conectando...</span>
                              </>
                            ) : (
                              <>
                                <Building className="w-3.5 h-3.5" />
                                <span>Ligar Glamzo Pay Connect</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Direct manual key-in box for testing if needed */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-3">
                          <div className="space-y-1">
                            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">Ou Associe ID Connect Existente</h4>
                            <p className="text-[10px] text-slate-500 leading-normal font-sans font-medium">
                              Se já possui uma conta Connect Express configurada, introduza o seu ID abaixo:
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={manualStripeId}
                              onChange={(e) => setManualStripeId(e.target.value)}
                              placeholder="acct_1OuX..."
                              className="grow bg-white text-slate-900 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 transition"
                            />
                            <button
                              onClick={handleSaveManualStripe}
                              disabled={savingManualStripe || !manualStripeId.trim()}
                              className="text-xs font-bold bg-slate-100 hover:bg-slate-100 text-slate-800 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl transition shrink-0 disabled:opacity-50"
                            >
                              {savingManualStripe ? 'A Guardar...' : 'Salvar ID'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Transaction Ledger List with Automated Receipts Explanation */}
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 text-left font-sans">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">Transações & Faturação de Clientes</h4>
                        <p className="text-[10px] text-slate-500 text-slate-500 mt-0.5 font-medium">Histórico de liquidações e processos de faturação automática integrada via Glamzo Pay.</p>
                      </div>
                    </div>

                    <div className="bg-white/40 p-4 border border-slate-200 rounded-2xl text-[11px] leading-relaxed text-slate-500 space-y-2">
                      <p className="text-slate-900 font-extrabold flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-indigo-400" /> Faturação 100% Automatizada e Integrada</p>
                      <p>
                        No ambiente de produção da Glamzo, <span className="text-slate-700 font-bold">não necessita de preencher SAF-T manuais nem de emitir PDFs temporários</span>. 
                      </p>
                      <p>
                        No exato momento em que um cliente final efetua o pagamento de uma marcação via Glamzo Pay Checkout, a <span className="text-slate-900">plataforma emite e envia automaticamente o recibo oficial e termo de faturação correspondente</span> diretamente para o email do cliente. O histórico fiscal fica arquivado na sua conta bancária conectada e no e-mail do cliente, cumprindo todas as diretrizes regulatórias e fiscais aplicáveis.
                      </p>
                    </div>

                    <div className="space-y-3 max-h-[350px] overflow-y-auto scrollbar-thin">
                      {ledgers.map((item, idx) => {
                        const originalPrice = Number(item.amount_total || item.amount || 0);
                        const platformFee = Number(item.glamzo_fee || 0);
                        const merchantProfit = Number(item.business_amount || 0);
                        const txDate = new Date(item.created_at || new Date()).toLocaleDateString('pt-PT');

                        return (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 gap-3 text-xs">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono text-slate-700 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-[9px]">
                                  TX-{String(item.id).substring(0,8).toUpperCase()}
                                </span>
                                <span className="text-[10px] text-slate-500">{txDate}</span>
                                <span className="px-1.5 py-0.2 bg-emerald-950/50 text-emerald-400 border border-emerald-900/35 rounded text-[8px] font-mono tracking-wider uppercase font-black">
                                  Faturado digitalmente
                                </span>
                              </div>
                              <div className="text-slate-500 text-[11px] font-medium leading-normal font-mono">
                                Total Pago: <span className="text-slate-900 font-bold">{originalPrice.toFixed(2)}€</span> • 
                                Comissão Glamzo (5%): <span className="text-rose-450 font-bold">-{platformFee.toFixed(2)}€</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 justify-between sm:justify-end text-right">
                              <div>
                                <span className="text-[9px] uppercase font-mono text-slate-500 block font-bold">Teu Lucro Líquido</span>
                                <span className="text-[11px] font-black text-emerald-400 font-mono">{merchantProfit.toFixed(2)} €</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {ledgers.length === 0 && (
                        <p className="text-xs text-slate-500 font-mono text-center py-10">Sem dados disponíveis. Os dados serão apresentados após atividade real.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW 10: MARKETING CAMPANHAS                         */}
              {/* ==================================================== */}
              {activeTab === 'campanhas' && (
                <div id="view-campanhas" className="space-y-6 animate-fade-in max-w-2xl">
                  <div className="border-b border-slate-100 pb-5">
                    <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Campanhas & Cupões</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Promova promoções, atraia clientes em dias de menor afluência e defina cupões promocionais reais.</p>
                  </div>

                  {/* Coupon Creator & List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-left">
                    
                    {/* LEFT CONTAINER: List of active coupons */}
                    <div className="bg-slate-50 border border-slate-100/50 rounded-3xl p-5 sm:p-6 space-y-4">
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                        <Tag className="w-4.5 h-4.5 text-rose-500" />
                        <span>Cupões no Checkout Real</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Os clientes introduzem estes códigos dinamicamente no checkout da Glamzo para aplicar descontos reais.
                      </p>

                      <div className="space-y-3.5 max-h-[380px] overflow-y-auto scrollbar-thin">
                        {coupons.map((cp, idx) => {
                          const hasPct = cp.discount_percent !== null && cp.discount_percent !== undefined;
                          const hasVal = cp.discount_value !== null && cp.discount_value !== undefined;
                          const discountStr = hasPct 
                            ? `${cp.discount_percent}% de Desconto` 
                            : hasVal 
                              ? `${cp.discount_value}€ de Desconto (Fixo)` 
                              : 'Sem Desconto';

                          const expiryStr = cp.valid_until 
                            ? `Expira em: ${new Date(cp.valid_until).toLocaleDateString('pt-PT')}`
                            : 'Sem expiração';

                          return (
                            <div key={cp.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 gap-3 text-xs">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-mono bg-rose-950/60 border border-rose-900/40 px-2.5 py-0.5 rounded text-rose-400 font-extrabold select-all uppercase text-[10px] tracking-wide">
                                    {cp.code}
                                  </span>
                                  <button
                                    onClick={() => handleToggleCoupon(cp.id, cp.is_active)}
                                    className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase transition-all cursor-pointer ${
                                      cp.is_active 
                                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40' 
                                        : 'bg-slate-50 text-slate-500 border border-slate-200'
                                    }`}
                                  >
                                    {cp.is_active ? 'Ativo' : 'Inativo'}
                                  </button>
                                </div>
                                <p className="text-[11px] font-bold text-slate-900 leading-normal">{discountStr}</p>
                                <p className="text-[10px] text-slate-550 text-slate-500 leading-normal font-medium">{expiryStr}</p>
                              </div>

                              <button
                                onClick={() => handleDeleteCoupon(cp.id)}
                                className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-950/25 border border-transparent hover:border-rose-900/40 rounded-xl transition cursor-pointer self-end sm:self-center"
                                title="Eliminar Cupão"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}

                        {coupons.length === 0 && (
                          <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-white/20">
                            <p className="text-xs text-slate-500 font-bold">Sem cupões promocionais criados.</p>
                            <p className="text-[10px] text-slate-500 mt-1">Crie códigos de desconto no formulário ao lado para oferecer promoções especiais aos seus clientes.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT CONTAINER: Creator card */}
                    <div className="bg-slate-50 border border-slate-100/50 rounded-3xl p-5 sm:p-6 space-y-4">
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                        <Plus className="w-4.5 h-4.5 text-purple-400" />
                        <span>Criar Código Promocional</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Configure um novo código promocional específico para atrair e fidelizar a sua clientela.
                      </p>

                      <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs font-semibold">
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">Código Único (Letras/Números)</label>
                          <input 
                            type="text" required 
                            value={couponForm.code}
                            onChange={e => setCouponForm(prev => ({ ...prev, code: e.target.value.toUpperCase().replace(/\s+/g, '') }))}
                            placeholder="EX: GLAMZO10"
                            className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-900 font-mono text-xs outline-none focus:border-rose-600"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">Desconto Percentual (%)</label>
                            <input 
                              type="number" min={1} max={100}
                              value={couponForm.discount_percent}
                              onChange={e => setCouponForm(prev => ({ ...prev, discount_percent: e.target.value, discount_value: '' }))}
                              placeholder="Ex: 15"
                              disabled={!!couponForm.discount_value}
                              className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-900 font-mono text-xs outline-none focus:border-rose-600 disabled:opacity-40"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">Desconto Fixo (€)</label>
                            <input 
                              type="number" min={1} max={500}
                              value={couponForm.discount_value}
                              onChange={e => setCouponForm(prev => ({ ...prev, discount_value: e.target.value, discount_percent: '' }))}
                              placeholder="Ex: 5"
                              disabled={!!couponForm.discount_percent}
                              className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-900 font-mono text-xs outline-none focus:border-rose-600 disabled:opacity-40"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">Data de Validade (Opcional)</label>
                          <input 
                            type="date"
                            style={{ colorScheme: 'dark' }}
                            value={couponForm.valid_until}
                            onChange={e => setCouponForm(prev => ({ ...prev, valid_until: e.target.value }))}
                            className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-900 font-mono text-xs outline-none focus:border-rose-600"
                          />
                        </div>

                        <button 
                          type="submit"
                          disabled={loadingCoupons}
                          className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-45 py-3 rounded-xl font-bold uppercase tracking-wide text-white cursor-pointer transition-colors text-center text-xs leading-none h-11"
                        >
                          {loadingCoupons ? 'A Criar...' : 'Ativar Código de Desconto'}
                        </button>
                      </form>
                    </div>

                  </div>

                  {/* Growth campaign simulation triggers */}
                  <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-4">
                    <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Gift className="w-4.5 h-4.5 text-amber-500" />
                      <span>Disparar Automação de WhatsApp (Fidelizados)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-normal font-sans">
                      Selecione um lote de clientes com mais de 3 meses de inatividade e dispare uma notificação automática apelando ao retorno.
                    </p>
                    <button 
                      onClick={() => {
                        notifyTerminal("🚀 Campanha Iniciada!", "A sua notificação automática foi disparada e enviada via SMS/WhatsApp para 15 destinatários.");
                      }}
                      className="px-4 py-2 bg-white border border-slate-200 hover:border-amber-950 hover:text-amber-400 hover:bg-slate-50 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer text-nowrap block text-center"
                    >
                      Avançar com Notificações Automáticas
                    </button>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW: MY WEBSITE & QR CODE PANEL (FASE 14+)          */}
              {/* ==================================================== */}
              {activeTab === 'loja' && (
                <div id="view-loja" className="space-y-6 animate-fade-in max-w-5xl">
                  <div className="border-b border-slate-100 pb-5">
                    <h3 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-300 text-[10px] uppercase font-black tracking-widest rounded-md border border-purple-500/20">Website</span>
                      Página Online & QR Code
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Gira o website do seu salão, personalize o endereço exclusivo e descarregue o seu QR Code oficial.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT PANEL: CONFIGURATION & EXCLUSIVE LINK (8 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                      <div className="bg-slate-50 border border-slate-100/50 rounded-3xl p-6 sm:p-7 space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">Status do Website</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">Defina se a sua página está visível na internet.</p>
                          </div>
                          <button
                            onClick={() => setPublicPageEnabled(!publicPageEnabled)}
                            className={`p-1.5 px-3 rounded-xl text-xs font-bold font-mono transition-all uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
                              publicPageEnabled 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-white text-slate-500 border border-slate-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${publicPageEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                            <span>{publicPageEnabled ? 'Ativo (Público)' : 'Inativo (Offline)'}</span>
                          </button>
                        </div>

                        {/* URL Slug customization */}
                        <div className="space-y-2.5">
                          <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-widest font-mono">Link Único Exclusivo (Slug)</label>
                          <div className="relative bg-white border border-slate-200 rounded-xl px-3.5 py-3.5 flex items-center text-xs text-slate-500 font-mono select-none overflow-hidden">
                            <span className="opacity-60 text-slate-500">{window.location.origin.replace(/^https?:\/\//, '')}/</span>
                            <input
                              type="text"
                              value={editSlugValue}
                              onChange={(e) => {
                                setEditSlugValue(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                              }}
                              placeholder="oseunome"
                              className="flex-1 bg-transparent border-none text-slate-900 font-bold outline-none pl-0.5 select-text font-mono placeholder-slate-400"
                            />
                            {slugChecking && (
                              <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin shrink-0 ml-1.5" />
                            )}
                            {!slugChecking && slugCheckResult === 'available' && (
                              <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-1.5" />
                            )}
                            {!slugChecking && slugCheckResult === 'taken' && (
                              <X className="w-4 h-4 text-rose-500 shrink-0 ml-1.5" />
                            )}
                          </div>

                          {/* Quick availability hints */}
                          {slugCheckResult === 'available' && (
                            <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 font-mono">
                              <Check className="w-3.5 h-3.5" /> Link disponível para reserva rápida!
                            </p>
                          )}
                          {slugCheckResult === 'taken' && (
                            <p className="text-[10px] text-rose-450 font-bold flex items-center gap-1 font-mono">
                              <X className="w-3.5 h-3.5" /> Link já se encontra ocupado ou indisponível.
                            </p>
                          )}

                          <p className="text-[10px] text-slate-500 leading-normal">
                            💡 Use um link focado na sua marca (ex: <span className="text-purple-400 select-all">hair-studio-lisboa</span>).
                            Evite maiúsculas, cedilhas ou caracteres especiais.
                          </p>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={handleSaveWebsiteConfig}
                            disabled={savingWebsiteConfig}
                            className="bg-purple-600 hover:bg-purple-700 hover:scale-[1.02] text-white font-extrabold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
                          >
                            {savingWebsiteConfig ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>A Gravar...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Gravar Link Público</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* GOOGLE SEARCH PREVIEW ENGINE (SEO PREVIEW MOCK) */}
                      <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 sm:p-7 space-y-4">
                        <span className="text-[9px] font-mono tracking-widest uppercase block text-slate-550 font-extrabold">Pré-visualização SEO (Google)</span>
                        <div className="space-y-1.5 bg-white border border-slate-100 p-4.5 rounded-2xl">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 bg-purple-950 border border-purple-500/20 rounded-full flex items-center justify-center text-[10px] font-bold text-purple-400 font-mono">G</div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-500 leading-tight">Glamzo Portugal</span>
                              <span className="text-[9px] text-slate-500 leading-none font-mono">{window.location.origin.replace(/^https?:\/\//, '')}/{business?.slug}</span>
                            </div>
                          </div>
                          <h4 className="text-[#8ab4f8] text-sm font-semibold hover:underline cursor-pointer leading-tight pt-1">
                            {business?.name} | Agendamento Online no Glamzo
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                            {business?.description || `Marque o seu serviço de estética ou barbearia em ${business?.district}, ${business?.city}. Reservas automáticas no Glamzo com confirmação instantânea.`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT PANEL: LIVE AUTOMATIC QR CODE CARD (5 cols) */}
                    <div className="lg:col-span-5 space-y-6">
                      <div className="bg-slate-50 border border-slate-200/40 rounded-3xl p-6 sm:p-7 text-center flex flex-col items-center justify-center">
                        <span className="text-[9px] font-mono tracking-widest uppercase block text-slate-550 font-black mb-1.5 leading-none">QR Code de Alta Definição</span>
                        <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-5">Digitalizar para Reservar</h4>

                        {/* Interactive Canvas frame with professional safety bounding & max sizes */}
                        <div className="p-5 bg-white border border-slate-200/80 rounded-3xl [box-shadow:0_15px_35px_rgba(0,0,0,0.5)] space-y-3.5 flex flex-col items-center justify-center">
                          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-inner">
                            <canvas 
                              ref={qrCanvasRef} 
                              style={{ maxWidth: '190px', maxHeight: '190px', width: '100%', height: 'auto' }}
                              className="select-none"
                            />
                          </div>
                          <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-500 text-slate-500 font-bold uppercase font-mono tracking-wider pt-0.5 select-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                            <span>Integrado com Logo Glamzo</span>
                          </div>
                        </div>

                        {/* Action controllers */}
                        <div className="w-full grid grid-cols-2 gap-2 pt-6">
                          <button
                            onClick={handleDownloadPNG}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 hover:border-purple-650 hover:text-purple-400 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer font-mono"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Código PNG</span>
                          </button>
                          <button
                            onClick={handleDownloadSVG}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 hover:border-purple-650 hover:text-purple-400 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer font-mono"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Código SVG</span>
                          </button>
                          <button
                            onClick={handlePrintQRCode}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 hover:border-purple-650 hover:text-purple-400 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer font-mono"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Imprimir QR</span>
                          </button>
                          <button
                            onClick={handleShareStore}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 hover:border-purple-650 hover:text-purple-400 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer font-mono"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>{websiteLinkCopied ? 'Copiado!' : 'Partilhar'}</span>
                          </button>
                        </div>

                        <div className="w-full pt-4 space-y-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/${business?.slug}`);
                              setWebsiteLinkCopied(true);
                              setTimeout(() => setWebsiteLinkCopied(false), 2000);
                            }}
                            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 hover:border-slate-200 rounded-2xl text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
                          >
                            <span className="font-mono truncate mr-2 text-slate-600 select-all">{window.location.origin.replace(/^https?:\/\//, '')}/{business?.slug}</span>
                            <div className="flex items-center gap-1 uppercase tracking-wider text-[9px] text-purple-400 font-mono shrink-0">
                              <Copy className="w-3 h-3" />
                              <span>{websiteLinkCopied ? 'Copiado' : 'Copiar'}</span>
                            </div>
                          </button>

                          <a
                            href={`/${business?.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full block py-3 text-center bg-white border border-slate-200 hover:bg-slate-50 border-purple-900/30 text-purple-300 hover:text-purple-200 hover:border-purple-500 rounded-2xl text-[11px] font-bold transition-all cursor-pointer"
                          >
                            <span className="flex items-center justify-center gap-1.5">
                              <span>Abrir Página Pública Oficial</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM BENTO GRAPHIC: VISISTS & SCANS STATS (Part 5) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                    {/* Stat 1: Visitas de página */}
                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200/40 relative overflow-hidden flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-extrabold block text-slate-500">Visitas Página</span>
                        <span className="text-2xl font-black text-slate-500 font-mono">0</span>
                        <p className="text-[9px] text-slate-500 font-mono leading-none">Sem visitas disponíveis</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-500 border border-slate-200">
                        <Eye className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Stat 2: Favoritos */}
                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200/40 relative overflow-hidden flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-extrabold block text-slate-500">Favoritos</span>
                        <span className="text-2xl font-black text-slate-500 font-mono">0</span>
                        <p className="text-[9px] text-slate-500 font-mono leading-none">Sem favoritos guardados</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-500 border border-slate-200">
                        <Heart className="w-5 h-5 text-slate-500" />
                      </div>
                    </div>

                    {/* Stat 3: Leituras de QR Code */}
                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200/40 relative overflow-hidden flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-extrabold block text-slate-500">Leituras QR Code</span>
                        <span className="text-2xl font-black text-slate-900 font-mono">{business?.qr_scans_count || 0}</span>
                        <p className="text-[9px] text-slate-500 font-bold font-mono">Leituras físicas ao balcão</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-450 border border-purple-500/10">
                        <QrCode className="w-5 h-5 text-purple-405" />
                      </div>
                    </div>

                    {/* Stat 4: Reservas via QR */}
                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200/40 relative overflow-hidden flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-extrabold block text-slate-500">Reservas via QR</span>
                        <span className="text-2xl font-black text-slate-900 font-mono">{Math.round((business?.qr_scans_count || 0) * 0.18)}</span>
                        <p className="text-[9px] text-slate-500 font-bold font-mono">Conversão estimada: 18%</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-450 border border-purple-500/10">
                        <Calendar className="w-5 h-5 text-purple-405" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW 11: GLAMZO TERMINAL INTERACTIVE (TABLET DECK)   */}
              {/* ==================================================== */}
              {activeTab === 'terminal' && (
                <div id="view-terminal" className="space-y-6 animate-fade-in max-w-2xl">
                  <div className="border-b border-slate-100 pb-5">
                    <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Terminal de Balcão (Estação Desk)</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Visor de balcão otimizado para acompanhamento rápido e Alertas Sonoros em tempo real no salão.</p>
                  </div>

                  {/* Device Specification */}
                  <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shrink-0 text-amber-500 shadow-xl">
                        <Smartphone className="w-10 h-10 animate-pulse" />
                      </div>
                      <div className="space-y-1.5 text-left md:text-left text-xs">
                        <span className="text-[10px] font-mono uppercase font-bold text-amber-400">Equipamento de Apoio</span>
                        <h4 className="font-extrabold text-sm text-slate-900">Ecrã de Balcão Glamzo Desk</h4>
                        <p className="text-slate-500 leading-normal text-[11px] font-medium font-sans max-w-md">
                          Estação para balcão de receção com som de alta amplificação, para pings e confirmações de reservas na chegada dos clientes.
                        </p>
                      </div>
                    </div>

                    {/* Operational Details Grid */}
                    <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-5 text-xs">
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-1">
                        <span className="block text-[9px] font-mono text-slate-500 uppercase font-black">Estado de Comodato</span>
                        <span className="font-extrabold text-emerald-400 flex items-center gap-1.5 mt-1 leading-none uppercase text-[10px] font-mono">
                          <Check className="w-3.5 h-3.5 border border-emerald-900/60 rounded-full bg-emerald-950/25" />
                          <span>Ativo & Vinculado</span>
                        </span>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-1">
                        <span className="block text-[9px] font-mono text-slate-500 uppercase font-black">Caução (Segurança)</span>
                        <span className="font-extrabold text-slate-900 block mt-1 leading-none font-mono">150.00 € <span className="text-[10px] text-slate-500 font-sans ml-1">(Isento)</span></span>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-1">
                        <span className="block text-[9px] font-mono text-slate-500 uppercase font-black">Logística / Entrega</span>
                        <span className="font-extrabold text-slate-700 flex items-center gap-1.5 mt-1 leading-none font-mono text-[10px] uppercase">
                          <Truck className="w-3.5 h-3.5 text-amber-500" />
                          <span>Enviado via CTT</span>
                        </span>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-1">
                        <span className="block text-[9px] font-mono text-slate-500 uppercase font-black">Identificador de LAN</span>
                        <span className="font-extrabold text-slate-500 block mt-1 leading-none font-mono select-all">GZ-TERM-90218-W</span>
                      </div>
                    </div>

                    {/* Real-time Operations Console for Tablet Mode */}
                    <div className="border-t border-slate-200 pt-5 space-y-4 text-xs">
                      <span className="block text-[10px] font-mono text-slate-500 uppercase font-black">Consola Operacional de Balcão</span>
                      
                      <div className="flex flex-wrap gap-2">
                        {/* Audio Chime test */}
                        <button
                          onClick={() => {
                            playTerminalChime();
                            notifyTerminal("🔊 Teste de Sirene", "Sinal sonoro de volume amplificado disparado na estação física.");
                          }}
                          className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl font-bold flex items-center gap-1.5 transition-all text-[11px] cursor-pointer text-slate-500 hover:text-slate-900"
                        >
                          <Play className="w-3.5 h-3.5 text-rose-500" />
                          <span>Testar Chime Sonoro</span>
                        </button>
                      </div>
                    </div>

                    {/* Check-in Clientes (Today's physical queue) */}
                    <div className="border-t border-slate-200 pt-5 space-y-3">
                      <div className="flex justify-between items-center bg-white p-2.5 rounded-lg">
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-black">Fila de Check-in (Chegadas Hoje)</span>
                        <span className="text-[9px] font-mono bg-rose-950/20 text-rose-400 px-1.5 pb-0.5 rounded">Tempo Real</span>
                      </div>

                      <div className="space-y-2">
                        {bookings.filter(b => b.booking_status !== 'completed' && b.booking_status !== 'cancelled' && b.booking_status !== 'no_show' && !isPastBooking(b.booking_date, b.end_time || b.start_time)).length > 0 ? (
  bookings
    .filter(b => b.booking_status !== 'completed' && b.booking_status !== 'cancelled' && b.booking_status !== 'no_show' && !isPastBooking(b.booking_date, b.end_time || b.start_time))
    .slice(0, 3)
    .map(bk => (
      <div key={bk.id} className="p-3 bg-white rounded-2xl border border-slate-100 flex items-center justify-between text-xs transition">
        <div className="space-y-0.5">
          <div className="font-extrabold text-slate-900 text-[12px]">
            {bk.customer?.full_name || bk.customer_profile?.full_name || 'Particular'}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <span>⏱ {bk.start_time}</span>
            <span>•</span>
            <span>💈 {bk.service?.name}</span>
          </div>
        </div>

        <button
          onClick={async () => {
            playTerminalChime();
            await handleUpdateBookingStatus(bk.id, 'completed');
            notifyTerminal("✅ Check-in Efetuado", `O cliente ${bk.customer?.full_name || 'Particular'} deu entrada física no salão!`);
          }}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase font-mono tracking-wider rounded-lg transition cursor-pointer"
        >
          Fazer Check-in
        </button>
      </div>
    ))
) : (
                          <div className="py-6 text-center text-slate-500 font-mono text-[10px] border border-dashed border-slate-100 rounded-2xl">
                            Sem clientes pendentes de check-in na fila hoje.
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-normal font-sans italic text-center pt-2 border-t border-slate-200">
                       A sirene sonora e toque de recepção estão sincronizados localmente com o barramento do browser.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* PROFESSIONAL AT-COMPLIANT INVOICE MODAL OVERLAY (SISTEMA DE FATURAÇÃO REAL GLAMZO) */}
          {selectedInvoice && (
  <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-slate-100 text-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col border border-slate-200 text-left">
      <div className="bg-white text-slate-900 p-5 flex justify-between items-center border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-black">Fatura Simpli-Certificada</span>
          </div>
          <h3 className="text-sm font-black mt-1 font-mono">{`FT_GZ_${selectedInvoice.id.substring(0,8).toUpperCase()}`}</h3>
        </div>
        <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all cursor-pointer">
          <span className="font-bold text-slate-600">X</span>
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-1">Cliente</p>
            <p className="text-xs font-semibold text-slate-800">{selectedInvoice.customer?.full_name || 'Consumidor Final'}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-1">Data de Emissão</p>
            <p className="text-xs font-semibold text-slate-800">{new Date(selectedInvoice.created_at).toLocaleDateString('pt-PT')}</p>
          </div>
        </div>

        <div className="bg-white border text-left border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Subtotal (Serviços)</span>
            <span>{Number(selectedInvoice.amount_total || selectedInvoice.amount || 0).toFixed(2)} €</span>
          </div>
          
          {(Number(selectedInvoice.glamzo_fee || 0) < (Number(selectedInvoice.amount_total || selectedInvoice.amount || 0) * 0.05)) && (
            <div className="flex justify-between text-xs font-bold text-rose-500">
              <span>Cupão / Desconto Glamzo aplicado</span>
              <span>- {(Number(selectedInvoice.amount_total || selectedInvoice.amount || 0) * 0.05).toFixed(2)} €</span>
            </div>
          )}

          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Taxa Glamzo (Absorvida)</span>
            <span className="text-emerald-500">0.00 €</span>
          </div>
          <div className="border-t border-slate-100 pt-3 flex justify-between font-black text-slate-900">
            <span>TOTAL LIQUIDADO (SEU LUCRO)</span>
            <span>{Number(selectedInvoice.business_amount || 0).toFixed(2)} €</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex gap-3 text-left">
          <div className="text-[9px] text-slate-500 leading-relaxed font-mono">
            Este documento serve como prova de liquidação do serviço via Glamzo Pay. O IVA está incluído à taxa legal em vigor quando aplicável.
            Os pagamentos são processados de forma 100% segura.
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
        <button onClick={() => setSelectedInvoice(null)} className="px-5 py-2 hover:bg-slate-200 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer">
          Fechar
        </button>
      </div>
    </div>
  </div>
)}

{isManualBookingOpen && (

        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col text-slate-800 max-h-[90vh]">
            
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white/50">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 font-sans">Gestão Manual de Agenda</h3>
                <p className="text-xs text-slate-500 mt-0.5 font-sans">Reserve um horário para clientes habituais ou bloqueie indisponibilidades.</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsManualBookingOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManualBooking} className="flex-1 overflow-y-auto p-6 space-y-5">
              
              {/* Selector: Booking vs Block */}
              <div className="grid grid-cols-2 p-1 bg-white rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setManualBookingType('booking')}
                  className={`py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer font-sans ${
                    manualBookingType === 'booking' 
                      ? 'bg-rose-600 text-white shadow' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  📅 Reserva Manual
                </button>
                <button
                  type="button"
                  onClick={() => setManualBookingType('block')}
                  className={`py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer font-sans ${
                    manualBookingType === 'block' 
                      ? 'bg-slate-100 text-amber-400 border border-slate-300 shadow' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  🛑 Bloquear Horário
                </button>
              </div>

              {/* Booking Fields */}
              {manualBookingType === 'booking' ? (
                <>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider font-sans">Nome do Cliente</label>
                    <input 
                      type="text"
                      required
                      placeholder="Ex: Maria Silva (Telefone / Habitual)" 
                      value={manualClientName}
                      onChange={(e) => setManualClientName(e.target.value)}
                      className="w-full bg-white bg-white border border-slate-200 focus:border-rose-500 focus:outline-none rounded-xl p-3 text-xs text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider font-sans">Escolher Serviço</label>
                      <select aria-label="Selecione uma opção"
                        value={manualServiceId}
                        onChange={(e) => setManualServiceId(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-rose-500 focus:outline-none rounded-xl p-3 text-xs text-slate-900 appearance-none cursor-pointer"
                      >
                        {services.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.price}€ - {s.duration_minutes} min)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider font-sans">Profissional (Staff)</label>
                      <select aria-label="Selecione uma opção"
                        value={manualStaffId}
                        onChange={(e) => setManualStaffId(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-rose-500 focus:outline-none rounded-xl p-3 text-xs text-slate-900 appearance-none cursor-pointer"
                      >
                        <option value="">Selecione Profissional...</option>
                        {staff.map(st => (
                          <option key={st.id} value={st.id}>
                            {st.full_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                /* Block Fields */
                <>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider font-sans">Motivo do Bloqueio</label>
                    <input 
                      type="text"
                      required
                      placeholder="Ex: Almoço, Reunião de Equipa, Folga ou Formação" 
                      value={manualReason}
                      onChange={(e) => setManualReason(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-amber-500 focus:outline-none rounded-xl p-3 text-xs text-slate-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider font-sans">Duração Estimada</label>
                    <select aria-label="Selecione uma opção"
                      value={manualServiceId}
                      onChange={(e) => setManualServiceId(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-amber-500 focus:outline-none rounded-xl p-3 text-xs text-slate-900 appearance-none cursor-pointer"
                    >
                      {services.map(s => (
                        <option key={s.id} value={s.id}>
                          Bloquear por {s.duration_minutes} min ({s.name})
                        </option>
                      ))}
                      <option value="">Bloqueio Curto (30 minutos)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Shared Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider font-sans">Data do Evento</label>
                  <input 
                    type="date"
                    style={{ colorScheme: 'dark' }}
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl p-3 text-xs text-slate-900 cursor-pointer animate-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider font-sans">Hora de Início</label>
                  <select aria-label="Selecione uma opção"
                    value={manualStartTime}
                    onChange={(e) => setManualStartTime(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl p-3 text-xs text-slate-900 appearance-none cursor-pointer text-left"
                  >
                    {['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {manualBookingType === 'booking' && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider font-sans">Observações / Notas Extras</label>
                  <textarea 
                    placeholder="Ex: Corte habitual degrade com caracol, trouxe cupão de papel..." 
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-rose-500 focus:outline-none rounded-xl p-3 text-xs text-slate-900 h-20"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsManualBookingOpen(false)}
                  className="flex-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold py-3 px-4 rounded-xl cursor-pointer text-center transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingManual}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white text-xs font-black uppercase tracking-wider py-3 px-4 rounded-xl cursor-pointer text-center transition shadow-lg shadow-purple-900/30 disabled:opacity-50"
                >
                  {isSavingManual ? 'A guardar...' : 'Confirmar & Guardar'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

        </div>
      </main>

    </div>
  );
}
