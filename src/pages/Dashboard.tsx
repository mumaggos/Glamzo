import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { DashboardOverview } from "../components/DashboardOverview";
import { DashboardCalendar } from "../components/DashboardCalendar";
import { DashboardLoja } from "../components/DashboardLoja";
import {
  Business,
  Service,
  ServiceCategory,
  Staff,
  BusinessHours,
  Booking,
  BookingStatus,
  PaymentStatus,
} from "../types";
import {
  Building,
  LayoutDashboard,
  LayoutGrid,
  Calendar,
  Scissors,
  Users,
  Clock,
  UsersRound,
  TrendingUp,
  BarChart,
  Tag,
  Landmark,
  Smartphone,
  Settings,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  CheckSquare,
  Search,
  Phone,
  Mail,
  HelpCircle,
  Eye,
  RefreshCw,
  MapPin,
  Gift,
  Bell,
  Play,
  Truck,
  Menu,
  MessageSquare,
  Lock,
  CreditCard,
  ShieldCheck,
  Globe,
  QrCode,
  Copy,
  ExternalLink,
  Download,
  Printer,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Image,
  Upload,
  Maximize,
  Minimize,
} from "lucide-react";
import {
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as RLineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { realtimeService } from "../utils/realtimeService";
import GlamzoLogo from "../components/GlamzoLogo";
import { slugify, validateSlugUniqueness } from "../utils/slugify";
import { optimizeImageBeforeUpload } from "../utils/imageOptimizer";
import DashboardAssistant from "../components/DashboardAssistant";
import DashboardMessages from "../components/DashboardMessages";

export default function Dashboard() {
  const {
    user,
    profile,
    signOut,
    loading: authLoading,
    refreshProfile,
  } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Active tab of our dark high-contrast operational terminal
  const [activeTab, setActiveTab] = useState<
    | "visao-geral"
    | "agenda"
    | "reservas"
    | "servicos"
    | "equipa"
    | "clientes"
    | "horarios"
    | "analytics"
    | "terminal"
    | "configuracoes"
    | "financeiro"
    | "campanhas"
    | "loja"
    | "mensagens"
  >("visao-geral");

  // Core Database States
  const [business, setBusiness] = useState<Business | null>(null);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [ledgers, setLedgers] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isVerifyingSub, setIsVerifyingSub] = useState(false);
  const [verifyingText, setVerifyingText] = useState("");
  const [cancelingSubscription, setCancelingSubscription] = useState(false);

  const handleCancelSubscription = () => { setActiveTab("financeiro" as any); };
  const handleSubscribePro = (planName?: any) => { setActiveTab("financeiro" as any); };
  const handleOpenBillingPortal = () => { setActiveTab("financeiro" as any); };
  const handleConnectStripe = () => { setActiveTab("financeiro" as any); };
  const [connectingStripe, setConnectingStripe] = useState(false);


          

  // State variables for manually connecting an existing/pre-built Glamzo Pay Connect / Merchant Account ID
  const [manualStripeId, setManualStripeId] = useState("");
  const [savingManualStripe, setSavingManualStripe] = useState(false);

  const [tabletOrder, setTabletOrder] = useState<any>(null);

  

  // Real Image Uploading states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Website & QR Code States
  const [editSlugValue, setEditSlugValue] = useState("");
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugCheckResult, setSlugCheckResult] = useState<
    "available" | "taken" | null
  >(null);
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
  const [agendaMode, setAgendaMode] = useState<
    "today" | "week" | "month" | "by_staff"
  >("today");
  const [selectedAgendaDate, setSelectedAgendaDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [agendaFullScreen, setAgendaFullScreen] = useState(false);
  
  

  // Loading & status states
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<{
    visible: boolean;
    title: string;
    desc: string;
  } | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // States for Manual Booking / Blocking Times
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [manualBookingType, setManualBookingType] = useState<
    "booking" | "block"
  >("booking");
  const [manualClientName, setManualClientName] = useState("");
  const [manualReason, setManualReason] = useState("");
  const [manualServiceId, setManualServiceId] = useState("");
  const [manualStaffId, setManualStaffId] = useState("");
  const [manualDate, setManualDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [manualStartTime, setManualStartTime] = useState("09:00");
  const [manualNotes, setManualNotes] = useState("");
  const [isSavingManual, setIsSavingManual] = useState(false);

  // Helper to extract clean manual names or block labels for bookings
  const getBookingDisplayName = (bk: any) => {
    if (bk.notes) {
      if (bk.notes.startsWith("Reserva Manual:")) {
        return bk.notes.substring("Reserva Manual:".length).trim();
      }
      if (bk.notes.startsWith("Bloqueio Agenda:")) {
        return bk.notes.trim();
      }
    }
    return (
      bk.customer?.full_name ||
      bk.customer_profile?.full_name ||
      "Cliente Particular"
    );
  };

  // Drag and Drop support
  const handleDropBooking = async (
    bookingId: string,
    newStaffId: string | null,
    newStartTime: string,
  ) => {
    try {
      if (!user || !bookingId) return;

      const bkObj = bookings.find((b) => b.id === bookingId);
      if (!bkObj) return;

      const duration = bkObj.service?.duration_minutes || 30;
      const [startH, startM] = newStartTime.split(":").map(Number);
      const totalMinutes = startH * 60 + startM + duration;
      const endH = Math.floor(totalMinutes / 60) % 24;
      const endM = totalMinutes % 60;
      const endTimeStr = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

      // Optimistic update
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                staff_id: newStaffId,
                start_time: newStartTime,
                end_time: endTimeStr,
              }
            : b,
        ),
      );

      const { error } = await supabase
        .from("bookings")
        .update({
          staff_id: newStaffId,
          start_time: newStartTime,
          end_time: endTimeStr,
        })
        .eq("id", bookingId);

      if (error) {
        console.error("Error dragging booking", error);
        alert("Erro ao guardar a reagendamento.");
        // Reload list if error
        // loadTerminalData();
      } else {
        notifyTerminal(
          "Agenda Atualizada",
          `Reserva arrastada para as ${newStartTime}.`,
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !business) {
      alert("Sessão ou loja não inicializada.");
      return;
    }

    // Validate inputs
    if (manualBookingType === "booking" && !manualClientName.trim()) {
      alert("Por favor, introduza o nome do cliente.");
      return;
    }
    if (manualBookingType === "block" && !manualReason.trim()) {
      alert("Por favor, introduza o motivo do bloqueio.");
      return;
    }

    setIsSavingManual(true);
    try {
      // Find selected service for duration and price
      const selectedSvc = services.find((s) => s.id === manualServiceId);
      const svcPrice = selectedSvc ? Number(selectedSvc.price) : 0;

      // Calculate end time
      const [startH, startM] = manualStartTime.split(":").map(Number);
      const duration = selectedSvc ? Number(selectedSvc.duration_minutes) : 30;
      const totalMinutes = startH * 60 + startM + duration;
      const endH = Math.floor(totalMinutes / 60) % 24;
      const endM = totalMinutes % 60;
      const endTimeStr = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

      const payloadNotes =
        manualBookingType === "block"
          ? `Bloqueio Agenda: ${manualReason}`
          : `Reserva Manual: ${manualClientName}${manualNotes ? " - " + manualNotes : ""}`;

      // If no services were selected, use the first available service
      let finalServiceId = manualServiceId;
      if (!finalServiceId && services.length > 0) {
        finalServiceId = services[0].id;
      }

      if (!finalServiceId) {
        throw new Error(
          "Por favor, crie pelo menos um serviço no separador 'Serviços' antes de agendar manualmente.",
        );
      }

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          customer_id: user.id, // the owner is the customer for manual bookings/blocks
          business_id: business.id,
          service_id: finalServiceId,
          staff_id: manualStaffId || null,
          booking_date: manualDate,
          start_time: manualStartTime,
          end_time: endTimeStr,
          total_price: manualBookingType === "block" ? 0 : svcPrice,
          payment_method: "local",
          payment_status: manualBookingType === "block" ? "paid" : "unpaid",
          booking_status: "confirmed", // confirmed immediately
          notes: payloadNotes,
        })
        .select(
          `
          *,
          service:services(name, price, duration_minutes),
          staff:staff(full_name)
        `,
        )
        .single();

      if (error) throw error;

      // Create simulated payment for accounting compliance rules
      await supabase.from("payments").insert({
        booking_id: data.id,
        customer_id: user.id,
        business_id: business.id,
        amount_total: manualBookingType === "block" ? 0 : svcPrice,
        glamzo_fee: 0,
        business_amount: manualBookingType === "block" ? 0 : svcPrice,
        payment_method: "local",
        payment_status: manualBookingType === "block" ? "paid" : "unpaid",
        stripe_payment_intent: null,
      });

      notifyTerminal(
        manualBookingType === "block"
          ? "🛑 Horário Bloqueado"
          : "📅 Marcação Reservada",
        manualBookingType === "block"
          ? `Bloqueio registado: ${manualReason}`
          : `Reserva de ${manualClientName} foi criada com sucesso na agenda!`,
      );

      setIsManualBookingOpen(false);
      // Reset values
      setManualClientName("");
      setManualReason("");
      setManualNotes("");
      // Reload list
      loadTerminalData();
    } catch (err: any) {
      console.error(err);
      alert(
        err.message || "Erro de base de dados ao guardar a marcação manual.",
      );
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
      Jan: 0,
      Fev: 0,
      Mar: 0,
      Abr: 0,
      Mai: 0,
      Jun: 0,
      Jul: 0,
      Ago: 0,
      Set: 0,
      Out: 0,
      Nov: 0,
      Dez: 0,
    };

    const monthNamesPt = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    let hasAnyCompleted = false;
    bookings.forEach((b) => {
      if (
        b.booking_status === "completed" ||
        b.booking_status === "confirmed"
      ) {
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
    return monthNamesPt
      .map((m) => ({
        month: m,
        receita: parseFloat(monthlyAccumulators[m].toFixed(2)),
      }))
      .filter((item) => item.receita > 0);
  };

  const getDynamicPartnerWeeklyOccupancy = () => {
    const activeBookings = bookings.filter(
      (b) =>
        b.booking_status === "completed" || b.booking_status === "confirmed",
    );
    if (!activeBookings || activeBookings.length === 0) {
      return [];
    }

    // Calculate rates from actual bookings count for weekdays (0 = Sunday, 1 = Monday ...)
    const completionsByDay = [0, 0, 0, 0, 0, 0, 0];
    activeBookings.forEach((b) => {
      const d = new Date(b.starts_at || Date.now());
      const dayIdx = d.getDay();
      completionsByDay[dayIdx] += 1;
    });

    const weekdayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    // Convert counts to a nice percentage rate
    const maxCount = Math.max(...completionsByDay, 1);
    const data = weekdayLabels.map((label, idx) => {
      const count = completionsByDay[idx];
      const rate = Math.round((count / maxCount) * 100);
      return {
        day: label,
        taxa: rate,
      };
    });

    // Filter out Sunday if it has zero activity
    return data.filter((d) => d.day !== "Dom" || completionsByDay[0] > 0);
  };



  // Reschedule state managers
  const [reschedulingBooking, setReschedulingBooking] =
    useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>("");
  const [rescheduleStartTime, setRescheduleStartTime] =
    useState<string>("09:00");
  const [rescheduleEndTime, setRescheduleEndTime] = useState<string>("09:45");

  // Form states (Payout Submission)
  const [payoutAmount, setPayoutAmount] = useState<number>(100);
  const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null);

  // Active ledger item selected for Invoicing / Faturação view
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Synthesize a gorgeous operational Double-Chime sound purely in the clients browser (Web Audio API)
  const playTerminalChime = () => {
    try {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Chime 1 (High bell sound)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
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
        osc2.type = "sine";
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
      setToastNotification((prev) =>
        prev ? { ...prev, visible: false } : null,
      );
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
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (bErr) throw bErr;

      if (!bData) {
        navigate("/partner/setup", { replace: true });
        return;
      }

      if (bData.status === "setup" || !bData.setup_completed) {
        navigate("/partner/setup", { replace: true });
        return;
      }

      setBusiness(bData);
      setEditSlugValue(bData.slug || "");
      setPublicPageEnabled(bData.public_page_enabled !== false);

      // Fetch dynamic Glamzo Pay Account status from Glamzo Pay API if it exists
      if (bData?.stripe_account_id) {
        try {
          const sRes = await fetch(
            `/api/stripe/account-status?businessId=${bData.id}`,
          );
          if (sRes.ok) {
            const sPayload = await sRes.json();
            setStripeStatus(sPayload);
          }
        } catch (sErr) {
          console.warn(
            "Failed to fetch fresh Glamzo Pay account status:",
            sErr,
          );
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
      ] = await Promise.all([
        supabase.from("service_categories").select("*"),
        supabase
          .from("services")
          .select("*, category:service_categories(*)")
          .eq("business_id", bData.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("staff")
          .select("*")
          .eq("business_id", bData.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("business_hours")
          .select("*")
          .eq("business_id", bData.id)
          .order("weekday", { ascending: true }),
        supabase
          .from("bookings")
          .select("*, customer:profiles(*)")
          .eq("business_id", bData.id)
          .order("booking_date", { ascending: false })
          .order("start_time", { ascending: false }),
        supabase.from("payments").select("*").eq("business_id", bData.id),
        supabase
          .from("payouts")
          .select("*")
          .eq("business_id", bData.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("subscriptions")
          .select("*")
          .eq("business_id", bData.id)
          .order("created_at", { ascending: false }),
      ]);

      setCategories(catData || []);
      setServices(svData || []);
      setStaff(stData || []);
      setBookings(bkData || []);
      setLedgers(pyData || []);
      setPayouts(poData || []);
      setSubscriptions(subData || []);
      setTabletOrder(null);

      // Real coupons fetching
      let cpData: any[] = [];
      try {
        const { data: resCoupons, error: cpErr } = await supabase
          .from("business_coupons")
          .select("*")
          .eq("business_id", bData.id)
          .order("created_at", { ascending: false });
        if (!cpErr && resCoupons && resCoupons.length > 0) {
          cpData = resCoupons;
          // Synchronize/cache to localStorage for consumer booking modal usage
          localStorage.setItem("glamzo_coupons", JSON.stringify(resCoupons));
        } else {
          // Use local storage cache if database is empty/failing
          const localStr = localStorage.getItem("glamzo_coupons");
          if (localStr) {
            cpData = JSON.parse(localStr).filter(
              (c: any) => c.business_id === bData.id,
            );
          }
        }
      } catch (err) {
        console.warn(
          "Table business_coupons probably does not exist yet or offline sandbox active, using cached coupons list:",
          err,
        );
        const localStr = localStorage.getItem("glamzo_coupons");
        if (localStr) {
          cpData = JSON.parse(localStr).filter(
            (c: any) => c.business_id === bData.id,
          );
        }
      }
      setCoupons(cpData);
      return bData;
    } catch (err: any) {
      console.error("Failed to load terminal datasets:", err);
      setGlobalError(
        err.message || "Erro crítico ao sincronizar lote ativo de dados.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadTerminalData().then((bizData) => {
        if (bizData && !sessionStorage.getItem('stripe_synced')) {
           sessionStorage.setItem('stripe_synced', 'true');
           console.log("Running automatic Stripe sync on login...");
           fetch("/api/stripe/verify-subscription", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ businessId: bizData.id }),
           }).then(r => r.json()).then(res => {
             if (res.success && res.status) {
                // Background sync complete, could silently update state if needed,
                // but loadTerminalData will naturally refresh on next view, 
                // or we could force a refresh here. Let's just do it silently.
                console.log("Auto-sync completed. Status:", res.status);
                // Just reload data silently to refresh any status changes
                loadTerminalData();
             }
           }).catch(err => console.error("Auto-sync failed:", err));
        }
      });
    }
  }, [user]);

  // Force scroll to top on tab change for sleek navigation comforts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  // Live Real-Time Postgres Change Subscriptions via WebSockets
  useEffect(() => {
    if (!business?.id) return;

    const channel = supabase
      .channel(`realtime-bookings-${business.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookings",
          filter: `business_id=eq.${business.id}`,
        },
        async (payload) => {
          console.log("Real-time insertion captured on bookings:", payload);
          // Play sound
          playTerminalChime();
          // Read table details safely
          await loadTerminalData();
          // Dispatch beautiful alert
          notifyTerminal(
            "⚡️ Nova Marcação em Tempo Real!",
            `Uma nova reserva foi adicionada automaticamente ao calendário pelo cliente.`,
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `business_id=eq.${business.id}`,
        },
        async (payload) => {
          console.log("Real-time update captured on bookings:", payload);

          await loadTerminalData(); // Always refresh dashboard data

          if (
            payload.new.status === "completed" &&
            payload.old.status !== "completed"
          ) {
            playTerminalChime();
            notifyTerminal(
              "✅ Marcação Concluída",
              "A marcação foi registada como concluída com sucesso. Os dados e relatórios foram atualizados.",
            );
          } else if (
            payload.new.status === "cancelled" &&
            payload.old.status !== "cancelled"
          ) {
            notifyTerminal(
              "❌ Marcação Cancelada",
              "Uma marcação foi cancelada e removida da agenda.",
            );
          } else if (
            payload.new.status === "confirmed" &&
            payload.old.status !== "confirmed"
          ) {
            notifyTerminal(
              "📅 Marcação Confirmada",
              "Uma marcação foi confirmada na agenda.",
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [business?.id]);

  // useEffect for QRCode.toCanvas removed
  

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
        .from("bookings")
        .insert({
          business_id: business.id,
          customer_id: user!.id, // owner acts as client for prompt simulation
          service_id: targetServiceId,
          staff_id: targetStaffId,
          booking_date: new Date().toISOString().split("T")[0],
          start_time: "16:00",
          end_time: "16:45",
          total_price: finalPrice,
          payment_method: "terminal_offline",
          payment_status: "paid",
          booking_status: "confirmed",
          notes:
            "Reserva simulada em tempo de execução para atestar a recepção sonora do Glamzo Terminal.",
        })
        .select()
        .single();

      if (insErr) throw insErr;

      // Play chime sound & dispatch notification toast immediately
      notifyTerminal(
        "🔔 Nova Reserva Recebida!",
        `Um cliente acaba de reservar o serviço "${services[0]?.name || "Beleza Premium"}" para hoje às 16:00.`,
      );

      // Instantly reload active lists
      await loadTerminalData();

      // Broadcast globally for clients & agenda syncing
      realtimeService.broadcast("booking:change", {
        id: newBk?.id,
        status: "confirmed",
      });

      // Send Resend automated confirmation email simulated
      const clientEmail = profile.email || "parceiro@glamzo.com";
      const clientName = profile.full_name || "Profissional Glamzo";
      await realtimeService.sendEmailViaResend(
        clientEmail,
        `Reserva Confirmada • ${services[0]?.name || "Beleza Premium"}`,
        "confirmação reserva",
        {
          clientName,
          businessName: business?.name || "Glamzo Salão",
          serviceName: services[0]?.name || "Beleza Premium",
          bookingDate: new Date().toISOString().split("T")[0],
          bookingTime: "16:00",
        },
      );
    } catch (err: any) {
      console.error(err);
      setGlobalError(
        "Não foi possível simular a reserva. Crie serviços ou profissionais ativos primeiro.",
      );
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
      setSlugCheckResult("available");
      return;
    }
    const timer = setTimeout(async () => {
      setSlugChecking(true);
      setSlugCheckResult(null);
      try {
        const isAvailable = await validateSlugUniqueness(clean, business?.id);
        setSlugCheckResult(isAvailable ? "available" : "taken");
      } catch (err) {
        console.error("Error auto-checking slug:", err);
      } finally {
        setSlugChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [editSlugValue, business?.slug, business?.id]);

  const handleSaveWebsiteConfig = async () => {
    if (!business) return;
    if (!editSlugValue.trim()) {
      alert("O link público (slug) não pode estar vazio.");
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
          alert(
            "Este link (slug) já está a ser utilizado por outra loja. Escolha outro.",
          );
          setSavingWebsiteConfig(false);
          return;
        }
      }

      const { error } = await supabase
        .from("businesses")
        .update({
          slug: clean,
          public_page_enabled: publicPageEnabled,
        })
        .eq("id", business.id);

      if (error) {
        const isColumnErr =
          error.code === "42703" || error.message?.includes("column");
        if (isColumnErr) {
          console.warn(
            "public_page_enabled column not available. Saving slug only...",
          );
          const { error: retryError } = await supabase
            .from("businesses")
            .update({ slug: clean })
            .eq("id", business.id);
          if (retryError) throw retryError;
        } else {
          throw error;
        }
      }

      localStorage.setItem(
        `glamzo_public_enabled:${business.id}`,
        publicPageEnabled ? "true" : "false",
      );

      setBusiness((prev) =>
        prev
          ? { ...prev, slug: clean, public_page_enabled: publicPageEnabled }
          : null,
      );
      setGlobalSuccess(
        "Configurações do seu website público guardadas com sucesso!",
      );
      setSlugCheckResult(null);
    } catch (err: any) {
      console.error(err);
      alert("Erro ao guardar as configurações da loja.");
    } finally {
      setSavingWebsiteConfig(false);
    }
  };

  const getQrUrl = (format: 'png' | 'svg' = 'png') => {
    const data = encodeURIComponent(`${window.location.origin}/${business?.slug}?source=qrcode`);
    return `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${data}&format=${format}`;
  };

  const handleDownloadPNG = async () => {
    if (!business?.slug) return;
    try {
      const response = await fetch(getQrUrl('png'));
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${business.slug}-qrcode.png`;
      link.href = objectUrl;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Error downloading PNG:", err);
    }
  };

  const handleDownloadSVG = async () => {
    if (!business?.slug) return;
    try {
      const response = await fetch(getQrUrl('svg'));
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${business.slug}-qrcode.svg`;
      link.href = objectUrl;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Error downloading SVG:", err);
    }
  };

  const handlePrintQRCode = () => {
    if (!business?.slug) return;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>Imprimir QR Code - ${business?.name || "Glamzo Store"}</title>
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
              <h1>${business?.name || "Glamzo Store"}</h1>
              <p>Escaneie com a câmera do telemóvel para agendamento automático</p>
              <img src="${getQrUrl('png')}" onload="window.print()" />
              <div class="footer">Parceiro Oficial Glamzo • glamzo.pt</div>
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() { window.close(); }, 1500);
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
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.warn("Navigator share dismissed or failed:", err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setWebsiteLinkCopied(true);
      setTimeout(() => setWebsiteLinkCopied(false), 2000);
    }
  };

  
  // Handle Glamzo Pay Standard Connect success callback parameter capture
  useEffect(() => {
    const status = searchParams.get("status");
    const stripeAcct = searchParams.get("stripe_acct");

    if (status === "connect_success" && stripeAcct && user) {
      const syncStripeConnection = async () => {
        try {
          // 1. Update Glamzo Pay account id in database with active flags
          const { error } = await supabase
            .from("businesses")
            .update({
              stripe_account_id: stripeAcct,
              charges_enabled: true,
              payouts_enabled: true,
            })
            .eq("owner_id", user.id);

          if (error) throw error;

          // 2. Play subtle sound + show alert
          playTerminalChime();
          notifyTerminal(
            "🎉 Conta Glamzo Pay Ligada!",
            "O seu salão de beleza está agora ligado ao Glamzo Pay Standard Connect para split de pagamentos automatizado!",
          );

          // 3. Clean search params to keep URL pristine
          navigate("/dashboard", { replace: true });

          // 4. Force reload data
          await loadTerminalData();
        } catch (syncErr: any) {
          console.error("Error syncing Glamzo Pay Connect status:", syncErr);
        }
      };

      syncStripeConnection();
    }

    if (status === "NEVER_MATCH_SUCCESS_PRO" && user) {
      const handleSubscriptionSuccessCheck = async () => {
        setIsVerifyingSub(true);
        setVerifyingText("A comunicar com os servidores Glamzo Pay... ⌛");
        console.log(
          "[Stripe Debug] Callback success captured. user_id:",
          user.id,
        );
        notifyTerminal(
          "⌛ Verificando Pagamento...",
          "A aguardar confirmação segura do pagamento da subscrição com os servidores do Glamzo Pay... (Isto pode levar alguns segundos)",
        );

        const sessionId = searchParams.get("session_id");
        let found = false;

        // Try calling our backend verify-subscription endpoint first for instantaneous activation!
        try {
          const { data: bData } = await supabase
            .from("businesses")
            .select("id")
            .eq("owner_id", user.id)
            .maybeSingle();

          if (bData) {
            console.log(
              "[Stripe Debug] Found business id:",
              bData.id,
              ". Calling verify-subscription API...",
            );

            // 12-second timeout race safeguard to prevent infinite loading state
            const verifyCall = fetch("/api/stripe/verify-subscription", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                sessionId: sessionId || undefined,
                businessId: bData.id,
              }),
            }).then(async (r) => {
              if (!r.ok) {
                const errText = await r.text();
                throw new Error(
                  errText || "Invalid server response status code",
                );
              }
              return r.json();
            });

            const timeoutPromise = new Promise<never>((_, reject) => {
              setTimeout(
                () =>
                  reject(
                    new Error(
                      "Timeout de rede: Glamzo Pay webhook demorou mais que o esperado.",
                    ),
                  ),
                12000,
              );
            });

            const vResult = await Promise.race([verifyCall, timeoutPromise]);
            console.log(
              "[Stripe Debug] Verify subscription API outcome:",
              vResult,
            );

            if (vResult && vResult.success) {
              const subId = vResult.stripeSubscriptionId;
              const subStatus = vResult.status;
              const expiresAt = vResult.expiresAt;
              const custId = vResult.customerId;

              // Update customer metadata inside local client-side Supabase as secondary reinforcement
              if (custId) {
                await supabase
                  .from("businesses")
                  .update({
                    stripe_customer_id: custId,
                    stripe_subscription_id: subId,
                    subscription_status: subStatus,
                    subscription_active:
                      subStatus === "active" || subStatus === "trialing",
                  })
                  .eq("id", bData.id);
              }

              const { data: existingSub } = await supabase
                .from("subscriptions")
                .select("id")
                .eq("business_id", bData.id)
                .maybeSingle();

              if (existingSub) {
                console.log(
                  "[Stripe Debug] Syncing existing subscription entry...",
                );
                await supabase
                  .from("subscriptions")
                  .update({
                    plan_name: "PRO",
                    status: subStatus,
                    monthly_price: 19.9,
                    expires_at: expiresAt,
                    stripe_subscription_id: subId,
                  })
                  .eq("id", existingSub.id);
              } else {
                console.log(
                  "[Stripe Debug] Constructing new subscription row...",
                );
                await supabase.from("subscriptions").insert({
                  business_id: bData.id,
                  plan_name: "PRO",
                  status: subStatus,
                  monthly_price: 19.9,
                  started_at: new Date().toISOString(),
                  expires_at: expiresAt,
                  stripe_subscription_id: subId,
                });
              }

              found = true;
            }
          }
        } catch (apiErr) {
          console.error(
            "[Stripe Debug] Direct API verification failed, trying standard polling fallback:",
            apiErr,
          );
        }

        if (!found) {
          // Keep polling database for up to 6 times to check if subscription table or business has been activated
          let attempts = 0;
          const maxAttempts = 6;

          while (attempts < maxAttempts && !found) {
            attempts++;
            setVerifyingText(
              `A verificar confirmação de pagamento... (Tentativa ${attempts}/${maxAttempts}) 🔗`,
            );
            console.log(
              `[Stripe Debug] Polling db status, attempt ${attempts}...`,
            );
            try {
              const { data: bData } = await supabase
                .from("businesses")
                .select("*")
                .eq("owner_id", user.id)
                .maybeSingle();

              if (
                bData &&
                (bData.subscription_status === "active" ||
                  bData.subscription_status === "trialing")
              ) {
                console.log(
                  "[Stripe Debug] Polling found updated trialing/active status in businesses table!",
                );
                found = true;
                break;
              }

              if (bData) {
                const { data: subs } = await supabase
                  .from("subscriptions")
                  .select("*")
                  .eq("business_id", bData.id)
                  .order("created_at", { ascending: false });

                const activeSub = subs && subs.length > 0 ? subs[0] : null;
                if (
                  activeSub &&
                  (activeSub.status === "active" ||
                    activeSub.status === "trialing")
                ) {
                  console.log(
                    "[Stripe Debug] Polling found updated active/trialing row in subscriptions table!",
                  );
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
          console.log(
            "[Stripe Debug] Refreshing current user profile session details...",
          );
          if (typeof refreshProfile === "function") {
            await refreshProfile();
          }
        } catch (authRefErr) {
          console.warn(
            "[Stripe Debug] Session refresh alert wrapper issue (non-blocking):",
            authRefErr,
          );
        }

        setIsVerifyingSub(false);
        playTerminalChime();
        if (found) {
          notifyTerminal(
            "🎉 Plano PRO Ativado!",
            `Pagamento confirmado com sucesso! O seu salão de beleza está agora no plano ${business?.selected_plan === "app_tablet" ? "PRO Terminal" : "Glamzo PRO"}.`,
          );
        } else {
          notifyTerminal(
            "⚠️ Sincronização em Curso",
            "A sua conta Glamzo Pay foi conectada. A base de dados será atualizada automaticamente via webhook nos próximos instantes.",
          );
        }

        navigate("/dashboard", { replace: true });
        await loadTerminalData();
      };
      handleSubscriptionSuccessCheck();
    }

    if (status === "cancelled_pro") {
      notifyTerminal(
        "ℹ️ Checkout Cancelado",
        `O processo de subscrição ${business?.selected_plan === "app_tablet" ? "PRO Terminal" : "Glamzo PRO"} foi cancelado ou interrompido.`,
      );
      navigate("/dashboard", { replace: true });
    }

    if (status === "success_credits" && user) {
      const handleCreditsSuccess = async () => {
        try {
          playTerminalChime();
          notifyTerminal(
            "🎉 Créditos Adicionados!",
            "Os seus créditos promocionais foram creditados com sucesso na sua conta!",
          );
          navigate("/dashboard", { replace: true });
          await loadTerminalData();
        } catch (syncErr: any) {
          console.error(syncErr);
        }
      };
      handleCreditsSuccess();
    }

    if (status === "cancelled_credits") {
      notifyTerminal(
        "ℹ️ Compra de Créditos Cancelada",
        "O processo de aquisição de créditos foi cancelado.",
      );
      navigate("/dashboard", { replace: true });
    }
  }, [user, searchParams]);

  // Helper to open Stripe/Redirect URLs safely out of sandboxed iframe previews
  const safeStripeRedirect = (url: string) => {
    if (!url) return;
    try {
      if (window.self !== window.top) {
        const opened = window.open(url, "_blank");
        if (!opened) {
          // If popup is blocked or returned null (safari / pop-up issues)
          console.warn(
            "Popup blocked or not opened. Navigating directly inside top frame.",
          );
          window.location.href = url;
        }
      } else {
        window.location.href = url;
      }
    } catch (e) {
      console.warn(
        "Popup/window.open failed with error, falling back to window.location.href:",
        e,
      );
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
  

  // Manually connect an existing Merchant Account ID to skip automatic programmatic onboarding failures
  

  // Launch or open the Glamzo Pay Customer Billing Portal for subscriptions management
  

  // Launch a Glamzo Pay checkout recurring subscription with 14 days of trial
  

  // Cancel active recurring subscription and block panel
  

  // Update status of actual customer booking

  const isPastBooking = (dateStr: string, timeStr: string) => {
    try {
      if (!dateStr || !timeStr) return false;
      const [hour, minute] = timeStr.split(":").map(Number);
      const bDate = new Date(dateStr);
      bDate.setHours(hour, minute, 0, 0);
      return new Date() > bDate;
    } catch {
      return false;
    }
  };

  const handleUpdateBookingStatus = async (
    id: string,
    newStatus: BookingStatus,
  ) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ booking_status: newStatus })
        .eq("id", id);

      if (error) throw error;
      setGlobalSuccess(
        `Estado da reserva alterado para "${newStatus}" no banco de dados.`,
      );
      notifyTerminal(
        "📈 Reserva Atualizada",
        `O estado da reserva foi modificado para ${newStatus} com sucesso.`,
      );

      // Match booking info for elegant emails & notifications
      const bk = bookings.find((b) => b.id === id);
      if (bk) {
        const clientName =
          bk.customer?.full_name ||
          bk.customer_profile?.full_name ||
          "Estimado Cliente";
        const clientEmail =
          bk.customer?.email ||
          bk.customer_profile?.email ||
          "cliente@glamzo.com";
        const serviceName = bk.service?.name || "Tratamento Estético";
        const businessName = business?.name || "Salão Parceiro Glamzo";

        // 1. Add real-time Notification for customer
        realtimeService.addNotification(
          bk.customer_id || bk.user_id || "guest",
          "customer",
          newStatus === "completed"
            ? "✅ Tratamento Concluído"
            : "⚠️ Reserva Alterada",
          `O seu tratamento "${serviceName}" no salão ${businessName} foi marcado como ${newStatus}.`,
        );

        // 2. Automated Resend email template dispatch
        if (newStatus === "completed") {
          await realtimeService.sendEmailViaResend(
            clientEmail,
            `Obrigado pela sua visita a ${businessName}! 🌟`,
            "boas-verdades", // confirmation design
            { clientName, businessName, serviceName },
          );
        } else if (newStatus === "cancelled") {
          await realtimeService.sendEmailViaResend(
            clientEmail,
            `Cancelamento de Agendamento • ${businessName}`,
            "cancelamento",
            { clientName, businessName, serviceName },
          );
        }

        // Broadcast change globally to other pages/tabs (live multi-user view refreshing)
        realtimeService.broadcast("booking:change", { id, status: newStatus });
      }

      await loadTerminalData();
    } catch (err: any) {
      setGlobalError(err.message || "Falha ao atualizar estado da reserva.");
    }
  };

  // Submit actual payout requests
  

  // Services Edit Form Submission (real CRUD)

  // Staff Edit Form Submission (real CRUD)

  // Real Database Coupons Handlers
  
  
  
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
        .from("business-images")
        .upload(filePath, optimized.blob, {
          cacheControl:
            "public, max-age=31536000, stale-while-revalidate=86400, immutable",
          contentType: "image/webp",
          upsert: true,
        });

      if (uploadErr) {
        // If fail because bucket is missing, use 'avatars' as fallback
        const { error: altErr } = await supabase.storage
          .from("avatars")
          .upload(filePath, optimized.blob, {
            cacheControl:
              "public, max-age=31536000, stale-while-revalidate=86400, immutable",
            contentType: "image/webp",
            upsert: true,
          });
        if (altErr) throw altErr;
        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath);
        setBusiness((prev) => (prev ? { ...prev, logo_url: publicUrl } : null));
      } else {
        const {
          data: { publicUrl },
        } = supabase.storage.from("business-images").getPublicUrl(filePath);
        setBusiness((prev) => (prev ? { ...prev, logo_url: publicUrl } : null));
      }
      setGlobalSuccess("Logótipo carregado com sucesso!");
    } catch (err: any) {
      console.error("Logo upload failed:", err);
      setGlobalError(
        `Erro no upload da imagem: ${err.message}. Tente novamente mais tarde.`,
      );
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
        .from("business-images")
        .upload(filePath, optimized.blob, {
          cacheControl:
            "public, max-age=31536000, stale-while-revalidate=86400, immutable",
          contentType: "image/webp",
          upsert: true,
        });

      if (uploadErr) {
        // Fullback to avatars bucket
        const { error: altErr } = await supabase.storage
          .from("avatars")
          .upload(filePath, optimized.blob, {
            cacheControl:
              "public, max-age=31536000, stale-while-revalidate=86400, immutable",
            contentType: "image/webp",
            upsert: true,
          });
        if (altErr) throw altErr;
        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath);
        setBusiness((prev) =>
          prev ? { ...prev, cover_url: publicUrl } : null,
        );
      } else {
        const {
          data: { publicUrl },
        } = supabase.storage.from("business-images").getPublicUrl(filePath);
        setBusiness((prev) =>
          prev ? { ...prev, cover_url: publicUrl } : null,
        );
      }
      setGlobalSuccess("Foto de capa carregada com sucesso!");
    } catch (err: any) {
      console.error("Cover upload failed:", err);
      setGlobalError(
        `Erro no upload da imagem de capa: ${err.message}. Tente novamente mais tarde.`,
      );
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
        .from("businesses")
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
          phone_whatsapp: (business as any).phone_whatsapp || business.phone,
        } as any)
        .eq("id", business.id);

      if (error) throw error;
      setGlobalSuccess(
        "Perfil do estabelecimento revisto e guardado com sucesso.",
      );
      await loadTerminalData();
    } catch (err: any) {
      setGlobalError(err.message || "Erro ao guardar definições.");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-500 gap-3">
        <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
        <span className="text-xs font-mono select-none">
          A iniciar terminal operacional...
        </span>
      </div>
    );
  }

  // Double guard role integrity Check
  if (!user || profile?.role === "customer") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-2xl space-y-4">
          <AlertTriangle className="w-14 h-14 text-rose-500 mx-auto" />
          <h2 className="text-2xl font-black text-slate-900">
            Canal Restrito a Parceiros
          </h2>
          <p className="text-sm text-slate-500 text-slate-500 leading-relaxed">
            A sua conta atual está qualificada como Cliente Final. Para obter
            acesso profissional, por favor crie ou entre numa conta qualificada
            como Parceiro Comercial.
          </p>
          <button
            onClick={() => {
              signOut();
              navigate("/partner/login");
            }}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
          >
            Aceder ao Painel Parceiros
          </button>
        </div>
      </div>
    );
  }

  // Calculate unique customers list statistics

  // Financial statistics (FASE 10 Glamzo Financial Architecture)
  const totalVolumeBruto = ledgers.reduce(
    (sum, item) => sum + Number(item.amount_total || item.amount || 0),
    0,
  );
  const totalComissoesRetidas = ledgers.reduce((sum, item) => {
    // Glamzo commission is only taken on online transactions
    if (item.payment_method !== "stripe") return sum;
    return sum + Math.max(0, Number(item.glamzo_fee || 0));
  }, 0);
  // Real Net earnings representing partner's profit (Lucro Líquido Global - Cash and Online combined)
  const totalReceivedVolume = ledgers.reduce(
    (sum, item) =>
      sum +
      Number(item.business_amount || item.amount_total || item.amount || 0),
    0,
  );

  // Real-time digital received volume that accumulated online via Glamzo Pay and can be withdrawn online
  const totalReceivedVolumeOnline = ledgers
    .filter((item) => item.payment_method === "stripe")
    .reduce(
      (sum, item) =>
        sum +
        Number(item.business_amount || item.amount_total || item.amount || 0),
      0,
    );

  const totalPayoutTransferred = payouts
    .filter((p) => p.status === "completed")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  // Only online-received funds can be digitally withdrawn (local cash was already pocketed by merchant)
  const balanceAvailable = Math.max(
    0,
    totalReceivedVolumeOnline - totalPayoutTransferred,
  );

  // Subscription calculation and Lock logic
  const activeSubscription =
    subscriptions && subscriptions.length > 0 ? subscriptions[0] : null;

  // Real-time status resolved safely from both DB models (resilient fallback)
  // Prioritize active or trialing status from subscriptions table over general business subscription_status
  const isSubTableActiveVal =
    activeSubscription &&
    (activeSubscription.status === "active" ||
      activeSubscription.status === "trialing");
  const resolvedSubscriptionStatus = isSubTableActiveVal
    ? activeSubscription.status
    : business?.subscription_status || null;
  const resolvedSubscriptionActive =
    business?.subscription_active || isSubTableActiveVal;
  const trialEndsAt =
    activeSubscription?.expires_at || business?.trial_ends_at || null;

  const trialDaysRemaining = (() => {
    const trialEndStr = trialEndsAt;
    if (!trialEndStr) return 14;
    const diffTime = new Date(trialEndStr).getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  })();

  const isTrialExpired = (() => {
    if (resolvedSubscriptionStatus === "trialing") {
      const expiresAt = trialEndsAt ? new Date(trialEndsAt).getTime() : null;
      if (expiresAt && expiresAt <= Date.now()) return true;
      return false;
    }
    if (!activeSubscription && !resolvedSubscriptionStatus) {
      if (!business) return false;
      const createdAt = new Date(business.created_at).getTime();
      return Date.now() - createdAt > 14 * 24 * 60 * 60 * 1000;
    }
    return false;
  })();

  const isSubscriptionActive = (() => {
    if (
      resolvedSubscriptionStatus === "active" ||
      resolvedSubscriptionStatus === "trialing"
    ) {
      const expiresAt = trialEndsAt ? new Date(trialEndsAt).getTime() : null;
      if (!expiresAt || expiresAt > Date.now()) {
        return true;
      }
    }
    return false;
  })();

  // Block dashboard if subscription is explicitly past due or expired
  const isBillingBlocked = (() => {
    const isDemo = [
      "salao-spa-premium",
      "barbearia-braga-moderna",
      "estetica-beleza-braganca",
    ].includes(business?.slug || "");
    if (isDemo) return false;

    if (
      resolvedSubscriptionStatus === "past_due" ||
      resolvedSubscriptionStatus === "unpaid" ||
      resolvedSubscriptionStatus === "canceled"
    ) {
      return true;
    }

    if (resolvedSubscriptionStatus === "trialing") {
      const expiresAt = trialEndsAt ? new Date(trialEndsAt).getTime() : null;
      if (expiresAt && expiresAt <= Date.now()) {
        return true;
      }
      return false;
    }

    // Default to false, assuming setup wizard handled it
    return false;
  })();

  const subBlockReason = (() => {
    if (
      resolvedSubscriptionStatus === "past_due" ||
      resolvedSubscriptionStatus === "unpaid"
    )
      return "past_due";
    return "expired";
  })();

  return (
    <div
      id="partner-terminal-layout"
      className="min-h-screen bg-[#fafbfc] text-slate-800 flex font-sans select-none overflow-hidden h-screen"
    >
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
                <h3 className="text-lg font-black text-slate-900">
                  Sincronização Glamzo Pay PRO
                </h3>
                <p className="text-xs text-rose-400 font-mono font-bold animate-pulse">
                  {verifyingText}
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed pt-2">
                  Não feche esta página. Estamos a confirmar de forma automática
                  o estado da sua subscrição com os servidores do Glamzo Pay e a
                  atualizar a base de dados em tempo real.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md bg-slate-50 border border-slate-200 p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden">
              {/* Visual status lock/rocket/alert accent */}
              <div className="w-16 h-16 bg-white/60 rounded-2xl flex items-center justify-center border border-slate-200/80 mx-auto">
                {subBlockReason === "past_due" ? (
                  <AlertCircle className="w-8 h-8 text-amber-500 animate-bounce" />
                ) : (
                  <Lock className="w-8 h-8 text-rose-500" />
                )}
              </div>

              {subBlockReason === "past_due" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-black text-slate-900">
                      Erro na Cobrança
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      A última tentativa de cobrança automática da subscrição{" "}
                      <span className="text-amber-500 font-bold">
                        {business?.selected_plan === "app_tablet"
                          ? "PRO Terminal"
                          : "Glamzo PRO"}
                      </span>{" "}
                      falhou. Por favor, aceda ao portal de faturação seguro
                      abaixo para regularizar os dados do seu cartão.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-black text-slate-900">
                      Subscrição Expirada
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      A sua subscrição ou período de teste para o plano{" "}
                      <span className="text-rose-500 font-extrabold">
                        {business?.selected_plan === "app_tablet"
                          ? "PRO Terminal"
                          : "Glamzo PRO"}
                      </span>{" "}
                      expirou. Para reativar o seu salão e continuar a usar a
                      plataforma, regularize a sua subscrição de forma segura.
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-white/60 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between font-bold text-slate-500">
                  <span>
                    Subscrição{" "}
                    {business?.selected_plan === "app_tablet"
                      ? "PRO Terminal"
                      : "Glamzo PRO"}
                  </span>
                  <span className="text-rose-400 font-bold">
                    {business?.selected_plan === "app_tablet"
                      ? "24.99€"
                      : "19.99€"}{" "}
                    / mês
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal font-sans">
                  Insira os dados do cartão de crédito de forma segura. O
                  processamento é feito 100% pelo Glamzo Pay e a subscrição pode
                  ser livremente cancelada a qualquer instante no painel
                  financeiro.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                {business?.stripe_customer_id ? (
                  <button
                    onClick={handleOpenBillingPortal}
                    className="w-full py-4 bg-[#635BFF] hover:bg-[#5249ea] text-xs font-bold text-white uppercase tracking-wider rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] transition duration-150"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>Regularizar Assinatura (Billing Portal)</span>
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      handleSubscribePro(
                        business?.selected_plan === "app_tablet"
                          ? "TERMINAL"
                          : "PRO",
                      )
                    }
                    className="w-full py-4 bg-[#635BFF] hover:bg-[#5249ea] text-xs font-bold text-white uppercase tracking-wider rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] transition duration-150"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Ativar Assinatura</span>
                  </button>
                )}
              </div>

              <button
                onClick={async () => {
                  try {
                    setIsVerifyingSub(true);
                    setVerifyingText("A sincronizar com a Stripe...");
                    const r = await fetch("/api/stripe/verify-subscription", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ businessId: business?.id }),
                    });
                    if (r.ok) {
                      setGlobalSuccess(
                        "Estado da subscrição sincronizado com sucesso.",
                      );
                      window.location.reload();
                    } else {
                      setGlobalError("Falha ao sincronizar subscrição.");
                    }
                  } catch (e: any) {
                    setGlobalError(e.message || "Erro de ligação.");
                  } finally {
                    setIsVerifyingSub(false);
                  }
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold transition block mx-auto underline mt-4"
              >
                Já paguei / Sincronizar
              </button>

              <button
                onClick={async () => {
                  await signOut();
                  navigate("/partner/login");
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
            <h4 className="font-extrabold text-sm tracking-tight text-slate-900">
              {toastNotification.title}
            </h4>
            <p className="text-xs text-slate-500 leading-normal font-medium">
              {toastNotification.desc}
            </p>
            <button
              onClick={() => setToastNotification(null)}
              className="text-[10px] font-mono tracking-widest text-purple-400 hover:underline uppercase block font-bold pt-1.5 focus:outline-none"
            >
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
                  navigate("/");
                }}
                title="Voltar ao site inicial (Terminar Sessão)"
                className="flex items-center gap-2.5 text-left hover:opacity-80 transition-opacity"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-[11px] tracking-tight block leading-none">
                    Glamzo Terminal
                  </span>
                  <span className="text-[8px] font-mono uppercase font-bold text-purple-400 tracking-wider">
                    Painel de Controlo
                  </span>
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
              <span className="text-[8px] font-mono uppercase tracking-widest block text-slate-500 font-bold mb-1">
                Estabelecimento
              </span>
              <span className="text-xs font-bold text-purple-400 block truncate">
                {business?.name || "A sincronizar..."}
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] text-emerald-400 font-semibold uppercase font-mono">
                  Ligado
                </span>
              </div>
            </div>

            {/* Scrolling Navigation Links */}
            <nav
              className="flex-1 overflow-y-auto space-y-1 pr-1.5 scrollbar-thin"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {[
                { id: "visao-geral", label: "Resumo", icon: LayoutDashboard },
                { id: "agenda", label: "Agenda", icon: Calendar },
                { id: "reservas", label: "Reservas", icon: CheckSquare },
                { id: "clientes", label: "Clientes", icon: UsersRound },
                { id: "equipa", label: "Equipa", icon: Users },
                { id: "servicos", label: "Serviços", icon: Scissors },
                { id: "horarios", label: "Horários", icon: Clock },
                { id: "campanhas", label: "Promoções", icon: Tag },
                { id: "financeiro", label: "Pagamentos", icon: Landmark },
                { id: "loja", label: "Website & QR Code", icon: Globe },
                { id: "mensagens", label: "Mensagens", icon: MessageSquare },
                ...(tabletOrder
                  ? [
                      {
                        id: "tablet",
                        label: "Terminal Glamzo",
                        icon: Smartphone,
                      },
                    ]
                  : []),
                { id: "configuracoes", label: "Configurações", icon: Settings },
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
                        ? "bg-purple-600 text-white shadow shadow-purple-950/20"
                        : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.id === "agenda" &&
                      (() => {
                        const todayStr = new Date().toISOString().split("T")[0];
                        const bookingsToday = bookings.filter(
                          (b) => b.booking_date === todayStr,
                        );
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
                  {profile?.full_name?.substring(0, 2).toUpperCase() || "P"}
                </div>
                <div className="overflow-hidden">
                  <span className="block text-xs font-bold truncate text-slate-700">
                    {profile?.full_name || "Profissional"}
                  </span>
                  <span className="block text-[9px] text-slate-500 font-mono truncate">
                    {user?.email}
                  </span>
                </div>
              </div>
              <button
                onClick={async () => {
                  setIsMobileSidebarOpen(false);
                  await signOut();
                  navigate("/");
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
      <aside
        className={`hidden ${agendaFullScreen ? "" : "lg:flex"} w-64 border-r border-slate-200/80 bg-white flex-col justify-between shrink-0 h-full`}
      >
        <div>
          {/* Logo Brand Brand */}
          <button
            onClick={async () => {
              await signOut();
              navigate("/");
            }}
            title="Voltar ao site inicial (Terminar Sessão)"
            className="h-16 border-b border-slate-200/60 flex items-center px-6 gap-3 w-full text-left hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <GlamzoLogo size={32} glow={true} />
            <div>
              <span className="font-extrabold text-slate-900 tracking-widest block leading-none text-xs font-display">
                GLAMZO
              </span>
              <span className="text-[9px] font-mono uppercase font-bold text-purple-400 tracking-wider">
                Painel do Parceiro
              </span>
            </div>
          </button>

          {/* Quick Stats overview inside SideRail */}
          <div className="p-4 mx-4 my-2.5 bg-slate-50/40 border border-slate-200/80 rounded-xl">
            <span className="text-[9px] font-mono uppercase tracking-widest block text-slate-500 font-bold mb-1.5">
              Estabelecimento
            </span>
            <span className="text-xs font-bold text-slate-700 block truncate">
              {business?.name || "A sincronizar..."}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-semibold uppercase font-mono">
                Ligado / Sincronizado
              </span>
            </div>
          </div>

          {/* Sidebar Tabs Selectors */}
          <nav
            className="px-3 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-270px)]"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {[
              { id: "visao-geral", label: "Resumo", icon: LayoutDashboard },
              { id: "agenda", label: "Agenda", icon: Calendar },
              { id: "reservas", label: "Reservas", icon: CheckSquare },
              { id: "clientes", label: "Clientes", icon: UsersRound },
              { id: "equipa", label: "Equipa", icon: Users },
              { id: "servicos", label: "Serviços", icon: Scissors },
              { id: "horarios", label: "Horários", icon: Clock },
              { id: "campanhas", label: "Promoções", icon: Tag },
              { id: "financeiro", label: "Pagamentos", icon: Landmark },
              { id: "loja", label: "Website & QR Code", icon: Globe },
              { id: "mensagens", label: "Mensagens", icon: MessageSquare },
              ...(tabletOrder
                ? [{ id: "tablet", label: "Terminal Glamzo", icon: Smartphone }]
                : []),
              { id: "configuracoes", label: "Configurações", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs rounded-xl font-bold tracking-tight transition-all cursor-pointer ${
                    isActive
                      ? "bg-purple-600 text-white shadow shadow-purple-900/40"
                      : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.id === "agenda" &&
                    (() => {
                      const todayStr = new Date().toISOString().split("T")[0];
                      const bookingsToday = bookings.filter(
                        (b) => b.booking_date === todayStr,
                      );
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
              {profile?.full_name?.substring(0, 2).toUpperCase() || "P"}
            </div>
            <div className="overflow-hidden">
              <span className="block text-xs font-bold truncate text-slate-700">
                {profile?.full_name || "Profissional"}
              </span>
              <span className="block text-[10px] text-slate-500 font-mono truncate">
                {user?.email}
              </span>
            </div>
          </div>
          <button
            onClick={async () => {
              await signOut();
              navigate("/");
            }}
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
        <div
          className="partner-glow-ball-pink top-10 right-1/4 animate-pulse pointer-events-none"
          style={{ animationDuration: "10s" }}
        />
        <div
          className="partner-glow-ball-purple bottom-12 left-10 animate-pulse pointer-events-none"
          style={{ animationDuration: "8s" }}
        />

        {/* Top Operational Header */}
        <header
          className={`${agendaFullScreen ? "hidden" : "h-16 border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0 bg-slate-50/30 backdrop-blur-md relative z-10"}`}
        >
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
                <span>{business?.name || "Carregando..."}</span>
              </h2>
              <p className="text-[10px] text-slate-500 font-mono">
                📞 {business?.phone} • 📍 {business?.city || "Lisboa, Portugal"}
              </p>
          {/* Global Status Banner V1.5 */}
          {!agendaFullScreen && (
            <div className="mb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white border border-slate-200 p-3 rounded-xl flex flex-col justify-center shadow-sm">
                <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">Plano Atual</span>
                <span className="text-xs font-black text-purple-600">{business?.selected_plan === 'app_tablet' ? 'PRO + TERMINAL' : 'PRO'}</span>
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-xl flex flex-col justify-center shadow-sm">
                <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">Estado Trial</span>
                <span className={`text-xs font-black ${resolvedSubscriptionStatus === 'trialing' ? 'text-emerald-600' : 'text-slate-800'}`}>{resolvedSubscriptionStatus === 'trialing' ? `${trialDaysRemaining} dias restam` : 'Esgotado / Pago'}</span>
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-xl flex flex-col justify-center shadow-sm">
                <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">Renovação</span>
                <span className="text-xs font-bold text-slate-800">{resolvedSubscriptionStatus === 'trialing' ? 'Fim do Trial' : 'Mensal'}</span>
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-xl flex flex-col justify-center shadow-sm">
                <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">Subscrição Stripe</span>
                <span className={`text-xs font-black ${business?.stripe_subscription_id ? 'text-emerald-600' : 'text-amber-500'}`}>{business?.stripe_subscription_id ? 'Ativa' : 'Pendente'}</span>
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-xl flex flex-col justify-center shadow-sm">
                <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">Stripe Connect</span>
                <span className={`text-xs font-black ${business?.charges_enabled ? 'text-emerald-600' : 'text-amber-500'}`}>{business?.charges_enabled ? 'Configurado' : 'Requer Ação'}</span>
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-xl flex flex-col justify-center shadow-sm">
                <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">Marketplace</span>
                <span className={`text-xs font-black ${business?.status === 'active' ? 'text-emerald-600' : 'text-rose-500'}`}>{business?.status === 'active' ? 'Online' : 'Oculto'}</span>
              </div>
            </div>
          )}
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
        <div
          className={`flex-1 ${agendaFullScreen ? "" : "overflow-y-auto p-4 sm:p-8 pb-36"} scrollbar-thin scrollbar-thumb-slate-900`}
          style={agendaFullScreen ? {} : { WebkitOverflowScrolling: "touch" }}
        >
          {/* Active Trial State Reminder Header Banner (Only when card/subscription is real) */}
          {resolvedSubscriptionStatus === "trialing" &&
            business?.stripe_subscription_id &&
            business.stripe_subscription_id.trim() !== "" && (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/20 text-purple-300 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/25 shrink-0">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 leading-normal">
                      Período de Testes Ativo —{" "}
                      {business?.selected_plan === "app_tablet"
                        ? "PRO Terminal"
                        : "Glamzo PRO"}
                    </p>
                    <p className="text-[11px] text-purple-400">
                      Tem acesso total a todas as funcionalidades profissionais
                      premium por mais{" "}
                      <span className="text-slate-900 font-bold">
                        {trialDaysRemaining}{" "}
                        {trialDaysRemaining === 1 ? "dia" : "dias"}
                      </span>
                      .
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleSubscribePro(
                      business?.selected_plan === "app_tablet"
                        ? "TERMINAL"
                        : "PRO",
                    )
                  }
                  className="p-2.5 px-3.5 bg-purple-600 hover:bg-purple-550 text-[10px] text-white font-bold uppercase rounded-xl transition-all cursor-pointer shadow shadow-purple-950/40 shrink-0 self-start sm:self-auto"
                >
                  Gerir Subscrição
                </button>
                <button
                  onClick={async () => {
                    try {
                      setIsVerifyingSub(true);
                      setVerifyingText("A sincronizar com a Stripe...");
                      const r = await fetch("/api/stripe/verify-subscription", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ businessId: business?.id }),
                      });
                      if (r.ok) {
                        setGlobalSuccess(
                          "Estado da subscrição sincronizado com sucesso.",
                        );
                        window.location.reload();
                      } else {
                        setGlobalError("Falha ao sincronizar subscrição.");
                      }
                    } catch (e: any) {
                      setGlobalError(e.message || "Erro de ligação.");
                    } finally {
                      setIsVerifyingSub(false);
                    }
                  }}
                  className="p-2.5 px-3.5 bg-white border border-purple-200 text-purple-600 hover:bg-purple-50 text-[10px] font-bold uppercase rounded-xl transition-all cursor-pointer shadow-sm shrink-0 self-start sm:self-auto"
                >
                  Sincronizar
                </button>
              </div>
            )}

          {/* Past Due Alert Banner */}
          {resolvedSubscriptionStatus === "past_due" && (
            <div className="mb-6 p-4 bg-rose-950/45 border border-rose-900 text-rose-400 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/25 shrink-0">
                  <AlertCircle className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <p className="font-extrabold text-slate-900 leading-normal">
                    Aviso de Cobrança — Subscrição Pendente
                  </p>
                  <p className="text-[11px] text-rose-400 leading-normal">
                    A última tentativa de cobrança automática da sua mensalidade
                    falhou. Por favor, regularize os seus dados de pagamento
                    usando o Glamzo Pay Billing Portal.
                  </p>
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

          {globalSuccess && (
            <div className="mb-6 p-4 bg-emerald-950/45 border border-emerald-900 text-emerald-400 rounded-2xl text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{globalSuccess}</span>
              </div>
              <button
                onClick={() => setGlobalSuccess(null)}
                className="text-emerald-400 hover:underline text-[10px]"
              >
                OK
              </button>
            </div>
          )}

          {globalError && (
            <div className="mb-6 p-4 bg-rose-950/45 border border-[1px] border-rose-900 text-rose-400 rounded-2xl text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{globalError}</span>
              </div>
              <button
                onClick={() => setGlobalError(null)}
                className="text-rose-450 text-rose-400 hover:underline text-[10px]"
              >
                Limpar
              </button>
            </div>
          )}

          {loading ? (
            <div className="w-full h-full space-y-6 animate-pulse p-2">
              <div className="flex justify-between items-center mb-8">
                <div className="w-64 h-10 bg-slate-200 rounded-2xl"></div>
                <div className="w-32 h-10 bg-slate-200 rounded-2xl"></div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white p-5 rounded-3xl border border-slate-200 h-32 flex flex-col justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-100"></div>
                    <div className="w-1/2 h-6 bg-slate-100 rounded-md"></div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2 h-80 bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                  <div className="w-1/3 h-6 bg-slate-100 rounded-md"></div>
                  <div className="w-full h-40 bg-slate-50 rounded-2xl"></div>
                </div>
                <div className="h-80 bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                  <div className="w-1/2 h-6 bg-slate-100 rounded-md"></div>
                  <div className="space-y-3 mt-6">
                    {[1,2,3].map(i => <div key={i} className="w-full h-12 bg-slate-50 rounded-xl"></div>)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* ==================================================== */}
              {/* VIEW 0: VISAO GERAL (DASHBOARD)                      */}
              {/* ==================================================== */}
              {activeTab === "visao-geral" && (
                <DashboardOverview 
                  business={business}
                  bookings={bookings}
                  services={services}
                  staff={staff}
                  resolvedSubscriptionStatus={resolvedSubscriptionStatus}
                  trialDaysRemaining={trialDaysRemaining}
                  setActiveTab={setActiveTab}
                />
              )}

              {/* ==================================================== */}
              {/* VIEW 1: AGENDA DIÁRIA (PREMIUM TABLET/TERMINAL GRID) */}
              {/* ==================================================== */}
              {activeTab === "agenda" && (
                <div id="view-agenda" className="space-y-6 text-left animate-fade-in text-slate-700">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold mb-4">Migração da Agenda em Progresso</h2>
                    <p className="text-slate-500">
                      Esta secção foi movida para a nova rota de Agenda isolada. 
                      Navegue no menu lateral caso queira testá-la de forma isolada!
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "servicos" && (
                <div id="view-servicos" className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold mb-4">Migração do Catálogo em Progresso</h2>
                    <p className="text-slate-500">
                      Esta secção foi movida para a nova rota de Serviços isolada.
                      Navegue no menu lateral caso queira testá-la de forma isolada!
                    </p>
                  </div>
                </div>
              )}
              {/* ==================================================== */}
              {/* VIEW 4: ESCALAS DE EQUIPA (CRUD)                      */}
              {/* ==================================================== */}
              {activeTab === "equipa" && (
                <div id="view-equipa" className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold mb-4">Migração em Progresso</h2>
                    <p className="text-slate-500">
                      Esta secção foi movida para a nova rota de Equipa isolada.
                    </p>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW 5: HORAS DE SERVIÇO (BUSINESS HOURS)            */}
              {/* ==================================================== */}
              {activeTab === "horarios" && (
                <div id="view-horarios" className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold mb-4">Migração em Progresso</h2>
                    <p className="text-slate-500">
                      Esta secção foi movida para a nova rota de Horários isolada.
                    </p>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW 6: REGISTO DE CLIENTES (SPENDINGS + POINTS)      */}
              {/* ==================================================== */}
              {activeTab === "clientes" && (
                <div id="view-clientes" className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold mb-4">Migração em Progresso</h2>
                    <p className="text-slate-500">
                      Esta secção foi movida para a nova rota de Clientes isolada.
                    </p>
                  </div>
                </div>
              )}
              {/* VIEW 7: PERFORMANCE CHARTS & METRICS                 */}
              {/* ==================================================== */}
              {activeTab === "analytics" && (
                <div id="view-analytics" className="space-y-6 animate-fade-in">
                  <div className="border-b border-slate-100 pb-5">
                    <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
                      Gráficos de Desempenho
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Analise o crescimento do seu negócio com dados
                      transparentes originando do Glamzo Pay e faturas da base.
                    </p>
                  </div>

                  {/* Operational Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest text-slate-500 leading-none">
                          Vendas Realizadas
                        </span>
                        <span className="text-2xl font-black text-slate-900 mt-1.5 block">
                          {
                            bookings.filter(
                              (b) => b.booking_status === "completed",
                            ).length
                          }
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-white text-slate-500 flex items-center justify-center border border-slate-200">
                        <CheckSquare className="w-5 h-5 text-slate-500" />
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest text-slate-500 leading-none">
                          Receita Total
                        </span>
                        <span className="text-2xl font-black text-emerald-400 mt-1.5 block">
                          {bookings
                            .filter((b) => b.booking_status === "completed")
                            .reduce(
                              (sum, item) => sum + Number(item.total_price),
                              0,
                            )
                            .toFixed(2)}{" "}
                          €
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-900/60">
                        <DollarSign className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest text-slate-500 leading-none">
                          Agendamentos Pendentes
                        </span>
                        <span className="text-2xl font-black text-amber-400 mt-1.5 block">
                          {
                            bookings.filter(
                              (b) => b.booking_status === "pending",
                            ).length
                          }
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-amber-950 text-amber-400 flex items-center justify-center border border-amber-900">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest text-slate-500 leading-none">
                          Tickets Suporte
                        </span>
                        <span className="text-2xl font-black text-slate-900 mt-1.5 block">
                          0
                        </span>
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
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                        Volume de Vendas Mensal
                      </h4>
                      <div className="h-64 flex items-center justify-center">
                        {getDynamicPartnerVolumeData().length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <RBarChart data={getDynamicPartnerVolumeData()}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#1e293b"
                              />
                              <XAxis
                                dataKey="month"
                                stroke="#64748b"
                                fontSize={11}
                              />
                              <YAxis stroke="#64748b" fontSize={11} unit="€" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#0f172a",
                                  borderColor: "#334155",
                                }}
                                labelStyle={{ color: "#fff" }}
                              />
                              <Legend />
                              <Bar
                                dataKey="receita"
                                fill="#e11d48"
                                name="Facturação Bruta"
                                radius={[4, 4, 0, 0]}
                              />
                            </RBarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-center p-6 border border-dashed border-slate-200 rounded-2xl w-full h-full flex flex-col items-center justify-center self-stretch bg-white/20">
                            <BarChart className="w-8 h-8 text-slate-500 mb-2" />
                            <p className="text-slate-900 font-bold text-xs">
                              Sem dados disponíveis
                            </p>
                            <p className="text-[10px] text-slate-550 text-slate-500 mt-1">
                              Os dados serão apresentados após atividade real.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bookings Distribution LineChart */}
                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-3 min-w-0 flex flex-col justify-between">
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                        Frequência Semanal de Ocupação
                      </h4>
                      <div className="h-64 flex items-center justify-center">
                        {getDynamicPartnerWeeklyOccupancy().length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <RLineChart
                              data={getDynamicPartnerWeeklyOccupancy()}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#1e293b"
                              />
                              <XAxis
                                dataKey="day"
                                stroke="#64748b"
                                fontSize={11}
                              />
                              <YAxis stroke="#64748b" fontSize={11} unit="%" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#0f172a",
                                  borderColor: "#334155",
                                }}
                                labelStyle={{ color: "#fff" }}
                              />
                              <Line
                                type="monotone"
                                dataKey="taxa"
                                stroke="#d97706"
                                name="Taxa Ocupação"
                                strokeWidth={2.5}
                                activeDot={{ r: 8 }}
                              />
                            </RLineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-center p-6 border border-dashed border-slate-200 rounded-2xl w-full h-full flex flex-col items-center justify-center self-stretch bg-white/20">
                            <TrendingUp className="w-8 h-8 text-slate-500 mb-2" />
                            <p className="text-slate-900 font-bold text-xs">
                              Sem dados disponíveis
                            </p>
                            <p className="text-[10px] text-slate-550 text-slate-500 mt-1">
                              Os dados serão apresentados após atividade real.
                            </p>
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
              {activeTab === "mensagens" && (
                <div
                  id="view-mensagens"
                  className="space-y-6 animate-fade-in max-w-5xl"
                >
                  <div className="border-b border-slate-100 pb-5">
                    <h3 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                      Mensagens e Suporte
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Responda rapidamente aos seus clientes. Dê suporte direto
                      via portal.
                    </p>
                  </div>
                  {business && <DashboardMessages businessId={business.id} />}
                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW 12: TABLET ORDER STATUS                         */}
              {/* ==================================================== */}
              {activeTab === "tablet" && tabletOrder && (
                <div
                  id="view-tablet"
                  className="space-y-6 animate-fade-in max-w-2xl"
                >
                  <div className="border-b border-slate-100 pb-5">
                    <h3 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-purple-600" />{" "}
                      Terminal Glamzo
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Acompanhe o estado do envio do seu equipamento PRO.
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-lg shadow flex items-center justify-center">
                        <Truck className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                          Estado do Envio
                        </span>
                        <h4 className="font-bold text-slate-900 text-lg capitalize">
                          {tabletOrder.status}
                        </h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                          Transportadora
                        </span>
                        <h4 className="font-bold text-slate-900 mt-1">
                          {tabletOrder.carrier || "Aguardando envio"}
                        </h4>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                          Tracking #
                        </span>
                        <h4 className="font-mono text-slate-900 mt-1 text-sm">
                          {tabletOrder.tracking_code || "---"}
                        </h4>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold mb-2 block">
                        Morada de Entrega
                      </span>
                      <p>
                        <strong>Nome:</strong> {tabletOrder.shipping_name}
                      </p>
                      <p>
                        <strong>Telefone:</strong> {tabletOrder.shipping_phone}
                      </p>
                      <p>
                        <strong>Morada:</strong> {tabletOrder.shipping_address},{" "}
                        {tabletOrder.shipping_postal_code}{" "}
                        {tabletOrder.shipping_city}
                      </p>
                    </div>

                    <button className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2">
                      <HelpCircle className="w-4 h-4" /> Relatar problema de
                      entrega
                    </button>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW 8: CONFIGURAÇÕES - EDIT SHOP PROFILE            */}
              {/* ==================================================== */}
              {activeTab === "configuracoes" && (
                <div
                  id="view-configuracoes"
                  className="space-y-6 max-w-7xl animate-fade-in"
                >
                  <div className="border-b border-slate-200 pb-5 text-left">
                    <h3 className="text-xl font-display font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      <span>Configurações do Estabelecimento</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Mantenha a sua foto de capa, logótipo, endereço e dados de
                      marca atualizados no marketplace real.
                    </p>
                  </div>

                  {business && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      {/* Left: Interactive Input Form */}
                      <form
                        onSubmit={handleUpdateConfiguracoes}
                        className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-xs font-semibold [box-shadow:0_20px_50px_rgba(0,0,0,0.35)]"
                      >
                        {/* Name & Phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-500 text-slate-500 mb-1.5">
                              Nome do Salão
                            </label>
                            <input
                              type="text"
                              required
                              value={business.name}
                              onChange={(e) =>
                                setBusiness((prev) =>
                                  prev
                                    ? { ...prev, name: e.target.value }
                                    : null,
                                )
                              }
                              className="w-full bg-white border border-slate-200 p-3 rounded-xl text-slate-900 text-xs outline-none focus:border-purple-500 font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-500 text-slate-500 mb-1.5">
                              Telefone de Atendimento
                            </label>
                            <input
                              type="tel"
                              required
                              value={business.phone}
                              onChange={(e) =>
                                setBusiness((prev) =>
                                  prev
                                    ? { ...prev, phone: e.target.value }
                                    : null,
                                )
                              }
                              className="w-full bg-white border border-slate-200 p-3 rounded-xl text-slate-900 text-xs outline-none focus:border-purple-500 font-sans font-mono"
                            />
                          </div>
                        </div>

                        {/* District & City */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-500 text-slate-500 mb-1.5">
                              Distrito / Concelho
                            </label>
                            <input
                              type="text"
                              required
                              value={business.district}
                              onChange={(e) =>
                                setBusiness((prev) =>
                                  prev
                                    ? { ...prev, district: e.target.value }
                                    : null,
                                )
                              }
                              className="w-full bg-white border border-slate-200 p-3 rounded-xl text-slate-900 text-xs outline-none focus:border-purple-500 font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-500 text-slate-500 mb-1.5">
                              Cidade (Freguesia)
                            </label>
                            <input
                              type="text"
                              required
                              value={business.city}
                              onChange={(e) =>
                                setBusiness((prev) =>
                                  prev
                                    ? { ...prev, city: e.target.value }
                                    : null,
                                )
                              }
                              className="w-full bg-white border border-slate-200 p-3 rounded-xl text-slate-900 text-xs outline-none focus:border-purple-500 font-sans"
                            />
                          </div>
                        </div>

                        {/* Address */}
                        <div className="text-left">
                          <label className="block text-[10px] font-mono uppercase text-slate-500 text-slate-500 mb-1.5">
                            Endereço de Portaria (Rua, Número, Código Postal)
                          </label>
                          <input
                            type="text"
                            required
                            value={business.address}
                            onChange={(e) =>
                              setBusiness((prev) =>
                                prev
                                  ? { ...prev, address: e.target.value }
                                  : null,
                              )
                            }
                            placeholder="Avenida da Liberdade Nº 42, 1250-142 Lisboa"
                            className="w-full bg-white border border-slate-200 p-3 rounded-xl text-slate-900 text-xs outline-none focus:border-purple-500 font-sans"
                          />
                        </div>

                        {/* Biography description */}
                        <div className="text-left">
                          <label className="block text-[10px] font-mono uppercase text-slate-500 text-slate-500 mb-1.5">
                            Apresentação Editorial do Salão
                          </label>
                          <textarea
                            value={business.description || ""}
                            onChange={(e) =>
                              setBusiness((prev) =>
                                prev
                                  ? { ...prev, description: e.target.value }
                                  : null,
                              )
                            }
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

                      {/* Right: Connect and Sub Manager */}
                      <div className="lg:col-span-5 space-y-6">
                        {/* Gestão da Subscrição Glamzo PRO */}
                        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 text-left shadow-lg">
                          <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
                            <div>
                              <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                                <span>Subscrição & Plano Atual</span>
                              </h4>
                              <p className="text-[10px] text-slate-500 mt-0.5 leading-normal font-sans">
                                Acompanhe o estado da sua assinatura de
                                software.
                              </p>
                            </div>
                            <span
                              className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full tracking-wider font-mono uppercase ${
                                resolvedSubscriptionStatus === "active"
                                  ? "bg-emerald-500/10 border border-emerald-200 text-emerald-600"
                                  : resolvedSubscriptionStatus === "trialing"
                                    ? "bg-amber-500/10 border border-amber-200 text-amber-600"
                                    : "bg-rose-500/10 border border-rose-200 text-rose-600"
                              }`}
                            >
                              {resolvedSubscriptionStatus === "active"
                                ? "Ativo"
                                : resolvedSubscriptionStatus === "trialing"
                                  ? "Em Período Experimental"
                                  : resolvedSubscriptionStatus === "past_due"
                                    ? "Pagamento Falhado"
                                    : resolvedSubscriptionStatus === "canceled"
                                      ? "Cancelado"
                                      : "Expirado / Inativo"}
                            </span>
                          </div>

                          <div className="flex flex-col gap-4 bg-white/40 p-4 rounded-2xl border border-slate-200 text-xs">
                            <div className="space-y-1">
                              <span className="text-slate-500 block text-[9px] uppercase font-mono tracking-wider font-bold">
                                Plano Ativo
                              </span>
                              <span className="text-slate-900 font-extrabold text-xs sm:text-sm leading-none block">
                                {business?.selected_plan === "app_tablet"
                                  ? "Plano Terminal"
                                  : "Plano Base"}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                {business?.selected_plan === "app_tablet"
                                  ? "Plataforma completa + Terminal físico."
                                  : "Acesso ilimitado à plataforma."}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-slate-500 block text-[9px] uppercase font-mono tracking-wider font-bold">
                                Próxima Cobrança
                              </span>
                              <span className="text-slate-900 font-extrabold text-xs sm:text-sm leading-none block">
                                {trialEndsAt
                                  ? new Date(trialEndsAt).toLocaleDateString(
                                      "pt-PT",
                                    )
                                  : "N/A"}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                {resolvedSubscriptionStatus === "trialing"
                                  ? "Fim do período experimental."
                                  : "Data de renovação do ciclo."}
                              </span>
                            </div>
                            {business?.stripe_subscription_id &&
                              business.stripe_subscription_id.trim() !== "" && (
                                <div className="space-y-1 mt-1 border-t border-slate-200/50 pt-3">
                                  <span className="text-slate-500 block text-[9px] uppercase font-mono tracking-wider font-bold">
                                    Método de Pagamento
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-5 rounded bg-slate-200 flex items-center justify-center shrink-0 border border-slate-300">
                                      <span className="text-[8px] font-bold text-slate-600">
                                        VISA
                                      </span>
                                    </div>
                                    <span className="text-slate-900 font-bold text-xs">
                                      •••• 4242
                                    </span>
                                  </div>
                                </div>
                              )}
                          </div>

                          <div className="flex flex-col gap-3 pt-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setActiveTab("financeiro" as any);
                                setTimeout(() => {
                                  const financeiroEl = document.getElementById("view-financeiro");
                                  if (financeiroEl) financeiroEl.scrollIntoView({ behavior: 'smooth' });
                                }, 100);
                              }}
                              className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold px-4 py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 w-full border border-purple-200"
                            >
                              <Sparkles className="w-4 h-4" />
                              <span>Alterar Plano de Subscrição</span>
                            </button>
                            
                            {business?.stripe_subscription_id &&
                            business.stripe_subscription_id.trim() !== "" ? (
                              <>
                                <button
                                  onClick={handleOpenBillingPortal}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 w-full"
                                >
                                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                  <span>Gerir faturas e cartão</span>
                                </button>
                                {resolvedSubscriptionStatus !== "active" &&
                                  resolvedSubscriptionStatus !== "trialing" && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          setIsVerifyingSub(true);
                                          setGlobalError(null);
                                          setVerifyingText(
                                            "A sincronizar com a Stripe...",
                                          );
                                          const r = await fetch(
                                            "/api/stripe/verify-subscription",
                                            {
                                              method: "POST",
                                              headers: {
                                                "Content-Type":
                                                  "application/json",
                                              },
                                              body: JSON.stringify({
                                                businessId: business?.id,
                                              }),
                                            },
                                          );
                                          if (r.ok) {
                                            setGlobalSuccess(
                                              "Estado da subscrição sincronizado com sucesso.",
                                            );
                                            setTimeout(
                                              () => window.location.reload(),
                                              1500,
                                            );
                                          } else {
                                            setGlobalError(
                                              "Falha ao sincronizar subscrição.",
                                            );
                                          }
                                        } catch (e: any) {
                                          setGlobalError(
                                            e.message || "Erro de ligação.",
                                          );
                                        } finally {
                                          setIsVerifyingSub(false);
                                        }
                                      }}
                                      disabled={isVerifyingSub}
                                      className="bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 text-xs font-bold px-4 py-3 rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 w-full"
                                    >
                                      <RefreshCw
                                        className={`w-4 h-4 ${isVerifyingSub ? "animate-spin" : ""}`}
                                      />
                                      <span>
                                        {isVerifyingSub
                                          ? "A Sincronizar..."
                                          : "Sincronizar Subscrição"}
                                      </span>
                                    </button>
                                  )}
                                <button
                                  onClick={handleCancelSubscription}
                                  disabled={cancelingSubscription}
                                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold px-4 py-3 rounded-xl transition cursor-pointer border border-rose-500/20 disabled:opacity-45 w-full"
                                >
                                  {cancelingSubscription
                                    ? "A Processar..."
                                    : "Cancelar Subscrição"}
                                </button>
                              </>
                            ) : (
                              <div className="space-y-3 w-full">
                                <p className="text-[11px] text-amber-500 leading-normal bg-amber-950/10 border border-amber-500/20 p-3.5 rounded-xl">
                                  Associe um cartão de pagamento para ativar a
                                  faturação automática assim que o período de
                                  teste terminar.
                                </p>
                                <button
                                  onClick={() => handleSubscribePro("PRO")}
                                  className="bg-gradient-to-tr from-[#9333ea] to-[#db2777] hover:opacity-95 text-white text-xs font-extrabold uppercase px-5 py-3.5 rounded-xl transition cursor-pointer shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 w-full"
                                >
                                  <CreditCard className="w-4.5 h-4.5" />
                                  <span>
                                    Ativar{" "}
                                    {business?.selected_plan === "app_tablet"
                                      ? "PRO Terminal"
                                      : "Glamzo PRO"}
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Dynamic Glamzo Pay Express Connect Manager */}
                        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg text-left">
                          <div className="border-b border-slate-200 pb-2">
                            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider font-mono">
                              Conta de Recebimentos
                            </h4>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                              Configure a sua conta bancária para
                              transferências.
                            </p>
                          </div>

                          {business?.stripe_account_id ? (
                            <div className="space-y-4">
                              {stripeStatus ? (
                                <>
                                  {stripeStatus.charges_enabled &&
                                  stripeStatus.payouts_enabled ? (
                                    /* STATUS ACTIVE */
                                    <div className="bg-emerald-950/20 border border-emerald-900/45 rounded-2xl p-4 text-left flex items-start gap-4">
                                      <div className="p-2 bg-emerald-950/60 text-emerald-400 rounded-lg border border-emerald-900 shrink-0">
                                        <Building className="w-4 h-4" />
                                      </div>
                                      <div className="space-y-1 grow">
                                        <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider font-mono">
                                          CONTA ATIVA
                                        </h4>
                                        <p className="text-[11px] text-slate-500 font-sans">
                                          Totalmente verificada. ID:{" "}
                                          <span className="font-mono text-[10px] bg-slate-100 border border-slate-200 px-1 py-0.5 rounded">
                                            {business.stripe_account_id}
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    /* STATUS INCOMPLETE */
                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left space-y-3">
                                      <div className="flex items-start gap-3">
                                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0">
                                          <AlertTriangle className="w-4 h-4" />
                                        </div>
                                        <div className="space-y-1">
                                          <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider font-mono">
                                            CONEXÃO INCOMPLETA
                                          </h4>
                                          <p className="text-[11px] text-slate-500">
                                            ID Associado:{" "}
                                            {business.stripe_account_id}.
                                            Complete o onboarding.
                                          </p>
                                        </div>
                                      </div>
                                      <button
                                        onClick={handleConnectStripe}
                                        disabled={connectingStripe}
                                        className="text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl w-full flex items-center justify-center gap-1.5"
                                      >
                                        {connectingStripe
                                          ? "A carregar..."
                                          : "Completar Cadastro"}
                                      </button>
                                    </div>
                                  )}
                                </>
                              ) : (
                                /* FETCHING STATUS SKELETON */
                                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3">
                                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0 animate-pulse">
                                    <Building className="w-4 h-4" />
                                  </div>
                                  <div className="space-y-1">
                                    <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider font-mono">
                                      A verificar conta...
                                    </h4>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            /* NO ACCOUNT ID LINKED */
                            <div className="space-y-3">
                              <p className="text-[11px] text-slate-500 leading-normal font-sans">
                                (Opcional) É necessário interligar uma conta
                                para receber pagamentos de marcações online.
                              </p>
                              <button
                                onClick={handleConnectStripe}
                                disabled={connectingStripe}
                                className="text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-3 rounded-xl w-full flex items-center justify-center gap-1.5 shadow"
                              >
                                {connectingStripe ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Conectando...</span>
                                  </>
                                ) : (
                                  <>
                                    <Building className="w-3.5 h-3.5" />
                                    <span>Ligar Recebimentos Online</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "financeiro" && (
                <div id="view-financeiro" className="space-y-6 max-w-3xl animate-fade-in">
                  <div className="bg-amber-50 text-amber-800 p-6 rounded-2xl border border-amber-200">
                    <h3 className="font-bold mb-2">Módulo Financeiro Migrado</h3>
                    <p className="text-sm">
                      A visualização do Módulo Financeiro foi migrada para o componente <code>FinanceTab.tsx</code>. 
                      Navegue para a aba correspondente no menu lateral.
                    </p>
                  </div>
                </div>
              )}
              {activeTab === "loja" && (
                <DashboardLoja 
                  business={business}
                  setBusiness={setBusiness}
                  bookings={bookings}
                  uniqueClientsCount={new Set(bookings.map(b => b.customer_id)).size}
                />
              )}
              {activeTab === "terminal" && (
                <div
                  id="view-terminal"
                  className="space-y-6 animate-fade-in max-w-2xl"
                >
                  <div className="border-b border-slate-100 pb-5">
                    <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
                      Terminal de Balcão (Estação Desk)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Visor de balcão otimizado para acompanhamento rápido e
                      Alertas Sonoros em tempo real no salão.
                    </p>
                  </div>

                  {/* Device Specification */}
                  <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shrink-0 text-amber-500 shadow-xl">
                        <Smartphone className="w-10 h-10 animate-pulse" />
                      </div>
                      <div className="space-y-1.5 text-left md:text-left text-xs">
                        <span className="text-[10px] font-mono uppercase font-bold text-amber-400">
                          Equipamento de Apoio
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900">
                          Ecrã de Balcão Glamzo Desk
                        </h4>
                        <p className="text-slate-500 leading-normal text-[11px] font-medium font-sans max-w-md">
                          Estação para balcão de receção com som de alta
                          amplificação, para pings e confirmações de reservas na
                          chegada dos clientes.
                        </p>
                      </div>
                    </div>

                    {/* Operational Details Grid */}
                    <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-5 text-xs">
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-1">
                        <span className="block text-[9px] font-mono text-slate-500 uppercase font-black">
                          Estado de Comodato
                        </span>
                        <span className="font-extrabold text-emerald-400 flex items-center gap-1.5 mt-1 leading-none uppercase text-[10px] font-mono">
                          <Check className="w-3.5 h-3.5 border border-emerald-900/60 rounded-full bg-emerald-950/25" />
                          <span>Ativo & Vinculado</span>
                        </span>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-1">
                        <span className="block text-[9px] font-mono text-slate-500 uppercase font-black">
                          Caução (Segurança)
                        </span>
                        <span className="font-extrabold text-slate-900 block mt-1 leading-none font-mono">
                          150.00 €{" "}
                          <span className="text-[10px] text-slate-500 font-sans ml-1">
                            (Isento)
                          </span>
                        </span>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-1">
                        <span className="block text-[9px] font-mono text-slate-500 uppercase font-black">
                          Logística / Entrega
                        </span>
                        <span className="font-extrabold text-slate-700 flex items-center gap-1.5 mt-1 leading-none font-mono text-[10px] uppercase">
                          <Truck className="w-3.5 h-3.5 text-amber-500" />
                          <span>Enviado via CTT</span>
                        </span>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-1">
                        <span className="block text-[9px] font-mono text-slate-500 uppercase font-black">
                          Identificador de LAN
                        </span>
                        <span className="font-extrabold text-slate-500 block mt-1 leading-none font-mono select-all">
                          GZ-TERM-90218-W
                        </span>
                      </div>
                    </div>

                    {/* Real-time Operations Console for Tablet Mode */}
                    <div className="border-t border-slate-200 pt-5 space-y-4 text-xs">
                      <span className="block text-[10px] font-mono text-slate-500 uppercase font-black">
                        Consola Operacional de Balcão
                      </span>

                      <div className="flex flex-wrap gap-2">
                        {/* Audio Chime test */}
                        <button
                          onClick={() => {
                            playTerminalChime();
                            notifyTerminal(
                              "🔊 Teste de Sirene",
                              "Sinal sonoro de volume amplificado disparado na estação física.",
                            );
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
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-black">
                          Fila de Check-in (Chegadas Hoje)
                        </span>
                        <span className="text-[9px] font-mono bg-rose-950/20 text-rose-400 px-1.5 pb-0.5 rounded">
                          Tempo Real
                        </span>
                      </div>

                      <div className="space-y-2">
                        {bookings.filter(
                          (b) =>
                            b.booking_status !== "completed" &&
                            b.booking_status !== "cancelled" &&
                            b.booking_status !== "no_show" &&
                            !isPastBooking(
                              b.booking_date,
                              b.end_time || b.start_time,
                            ),
                        ).length > 0 ? (
                          bookings
                            .filter(
                              (b) =>
                                b.booking_status !== "completed" &&
                                b.booking_status !== "cancelled" &&
                                b.booking_status !== "no_show" &&
                                !isPastBooking(
                                  b.booking_date,
                                  b.end_time || b.start_time,
                                ),
                            )
                            .slice(0, 3)
                            .map((bk) => (
                              <div
                                key={bk.id}
                                className="p-3 bg-white rounded-2xl border border-slate-100 flex items-center justify-between text-xs transition"
                              >
                                <div className="space-y-0.5">
                                  <div className="font-extrabold text-slate-900 text-[12px]">
                                    {bk.customer?.full_name ||
                                      bk.customer_profile?.full_name ||
                                      "Particular"}
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
                                    await handleUpdateBookingStatus(
                                      bk.id,
                                      "completed",
                                    );
                                    notifyTerminal(
                                      "✅ Check-in Efetuado",
                                      `O cliente ${bk.customer?.full_name || "Particular"} deu entrada física no salão!`,
                                    );
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
                      A sirene sonora e toque de recepção estão sincronizados
                      localmente com o barramento do browser.
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
                      <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-black">
                        Fatura Simpli-Certificada
                      </span>
                    </div>
                    <h3 className="text-sm font-black mt-1 font-mono">{`FT_GZ_${selectedInvoice.id.substring(0, 8).toUpperCase()}`}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                  >
                    <span className="font-bold text-slate-600">X</span>
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-1">
                        Cliente
                      </p>
                      <p className="text-xs font-semibold text-slate-800">
                        {selectedInvoice.customer?.full_name ||
                          "Consumidor Final"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-1">
                        Data de Emissão
                      </p>
                      <p className="text-xs font-semibold text-slate-800">
                        {new Date(
                          selectedInvoice.created_at,
                        ).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border text-left border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Subtotal (Serviços)</span>
                      <span>
                        {Number(
                          selectedInvoice.amount_total ||
                            selectedInvoice.amount ||
                            0,
                        ).toFixed(2)}{" "}
                        €
                      </span>
                    </div>

                    {Number(selectedInvoice.glamzo_fee || 0) <
                      Number(
                        selectedInvoice.amount_total ||
                          selectedInvoice.amount ||
                          0,
                      ) *
                        0.05 && (
                      <div className="flex justify-between text-xs font-bold text-rose-500">
                        <span>Cupão / Desconto Glamzo aplicado</span>
                        <span>
                          -{" "}
                          {(
                            Number(
                              selectedInvoice.amount_total ||
                                selectedInvoice.amount ||
                                0,
                            ) * 0.05
                          ).toFixed(2)}{" "}
                          €
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Taxa Glamzo (Absorvida)</span>
                      <span className="text-emerald-500">0.00 €</span>
                    </div>
                    <div className="border-t border-slate-100 pt-3 flex justify-between font-black text-slate-900">
                      <span>TOTAL LIQUIDADO (SEU LUCRO)</span>
                      <span>
                        {Number(selectedInvoice.business_amount || 0).toFixed(
                          2,
                        )}{" "}
                        €
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex gap-3 text-left">
                    <div className="text-[9px] text-slate-500 leading-relaxed font-mono">
                      Este documento serve como prova de liquidação do serviço
                      via Glamzo Pay. O IVA está incluído à taxa legal em vigor
                      quando aplicável. Os pagamentos são processados de forma
                      100% segura.
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="px-5 py-2 hover:bg-slate-200 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
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
                    <h3 className="font-extrabold text-lg text-slate-900 font-sans">
                      Gestão Manual de Agenda
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-sans">
                      Reserve um horário para clientes habituais ou bloqueie
                      indisponibilidades.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsManualBookingOpen(false)}
                    className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form
                  onSubmit={handleSaveManualBooking}
                  className="flex-1 overflow-y-auto p-6 space-y-5"
                >
                  {/* Selector: Booking vs Block */}
                  <div className="grid grid-cols-2 p-1 bg-white rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setManualBookingType("booking")}
                      className={`py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer font-sans ${
                        manualBookingType === "booking"
                          ? "bg-rose-600 text-white shadow"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      📅 Reserva Manual
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualBookingType("block")}
                      className={`py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer font-sans ${
                        manualBookingType === "block"
                          ? "bg-slate-100 text-amber-400 border border-slate-300 shadow"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      🛑 Bloquear Horário
                    </button>
                  </div>

                  {/* Booking Fields */}
                  {manualBookingType === "booking" ? (
                    <>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider font-sans">
                          Nome do Cliente
                        </label>
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
                          <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider font-sans">
                            Escolher Serviço
                          </label>
                          <select
                            aria-label="Selecione uma opção"
                            value={manualServiceId}
                            onChange={(e) => setManualServiceId(e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-rose-500 focus:outline-none rounded-xl p-3 text-xs text-slate-900 appearance-none cursor-pointer"
                          >
                            {services.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} ({s.price}€ - {s.duration_minutes} min)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider font-sans">
                            Profissional (Staff)
                          </label>
                          <select
                            aria-label="Selecione uma opção"
                            value={manualStaffId}
                            onChange={(e) => setManualStaffId(e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-rose-500 focus:outline-none rounded-xl p-3 text-xs text-slate-900 appearance-none cursor-pointer"
                          >
                            <option value="">Selecione Profissional...</option>
                            {staff.map((st) => (
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
                        <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider font-sans">
                          Motivo do Bloqueio
                        </label>
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
                        <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider font-sans">
                          Duração Estimada
                        </label>
                        <select
                          aria-label="Selecione uma opção"
                          value={manualServiceId}
                          onChange={(e) => setManualServiceId(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-amber-500 focus:outline-none rounded-xl p-3 text-xs text-slate-900 appearance-none cursor-pointer"
                        >
                          {services.map((s) => (
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
                      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider font-sans">
                        Data do Evento
                      </label>
                      <input
                        type="date"
                        style={{ colorScheme: "dark" }}
                        required
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl p-3 text-xs text-slate-900 cursor-pointer animate-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider font-sans">
                        Hora de Início
                      </label>
                      <select
                        aria-label="Selecione uma opção"
                        value={manualStartTime}
                        onChange={(e) => setManualStartTime(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl p-3 text-xs text-slate-900 appearance-none cursor-pointer text-left"
                      >
                        {[
                          "08:00",
                          "08:30",
                          "09:00",
                          "09:30",
                          "10:00",
                          "10:30",
                          "11:00",
                          "11:30",
                          "12:00",
                          "12:30",
                          "13:00",
                          "13:30",
                          "14:00",
                          "14:30",
                          "15:00",
                          "15:30",
                          "16:00",
                          "16:30",
                          "17:00",
                          "17:30",
                          "18:00",
                          "18:30",
                          "19:00",
                          "19:30",
                          "20:00",
                          "20:30",
                        ].map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {manualBookingType === "booking" && (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider font-sans">
                        Observações / Notas Extras
                      </label>
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
                      {isSavingManual ? "A guardar..." : "Confirmar & Guardar"}
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
