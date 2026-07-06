import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "motion/react";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { Business } from "../../types";
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  UsersRound,
  Users,
  Scissors,
  Clock,
  Tag,
  Landmark,
  Globe,
  MessageSquare,
  Smartphone,
  Settings,
  LogOut,
  Sparkles,
  X,
  Menu,
} from "lucide-react";
import GlamzoLogo from "../../components/GlamzoLogo";

export default function PartnerLayout() {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [business, setBusiness] = useState<Business | null>(null);
  const [tabletOrder, setTabletOrder] = useState<any>(null);
  const [bookingsTodayCount, setBookingsTodayCount] = useState(0);

  // Core Data States for Tabs
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/partner/login");
      return;
    }

    if (user) {
      loadLayoutData();
    }
  }, [user, authLoading]);

  const loadLayoutData = async () => {
    setIsLoadingData(true);
    if (!user) return;
    try {
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
      setBusiness(bData);

      // Fetch tablet order if any
      const { data: tData } = await supabase
        .from("hardware_orders")
        .select("*")
        .eq("business_id", bData.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (tData) setTabletOrder(tData);

      // Fetch core data in parallel
      const [
        { data: catData },
        { data: svData },
        { data: stData },
        { data: bkData },
      ] = await Promise.all([
        supabase.from("service_categories").select("*").eq("business_id", bData.id).order("order_index"),
        supabase.from("services").select("*").eq("business_id", bData.id).order("name"),
        supabase.from("staff").select("*").eq("business_id", bData.id).order("full_name"),
        supabase.from("bookings").select(`
          *,
          service:services(name, price, duration_minutes),
          staff:staff(full_name),
          customer_profile:profiles(full_name, avatar_url)
        `).eq("business_id", bData.id).order("booking_date", { ascending: false }).order("start_time", { ascending: false })
      ]);

      setCategories(catData || []);
      setServices(svData || []);
      setStaff(stData || []);
      setBookings(bkData || []);

      // Calculate bookings for today
      const todayStr = new Date().toISOString().split("T")[0];
      const todaysCount = (bkData || []).filter(b => b.booking_date === todayStr).length;
      setBookingsTodayCount(todaysCount);

    } catch (err) {
      console.error("Error loading layout data", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Close sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  const navItems = [
    { id: "overview", label: "Resumo", icon: LayoutDashboard, path: "/partner/dashboard/overview" },
    { id: "agenda", label: "Agenda", icon: Calendar, path: "/partner/dashboard/agenda" },
    { id: "reservas", label: "Reservas", icon: CheckSquare, path: "/partner/dashboard/reservas" },
    { id: "clientes", label: "Clientes", icon: UsersRound, path: "/partner/dashboard/clientes" },
    { id: "equipa", label: "Equipa", icon: Users, path: "/partner/dashboard/equipa" },
    { id: "servicos", label: "Serviços", icon: Scissors, path: "/partner/dashboard/servicos" },
    { id: "horarios", label: "Horários", icon: Clock, path: "/partner/dashboard/horarios" },
    { id: "campanhas", label: "Promoções", icon: Tag, path: "/partner/dashboard/campanhas" },
    { id: "financeiro", label: "Pagamentos", icon: Landmark, path: "/partner/dashboard/financeiro" },
    { id: "website", label: "Website & QR Code", icon: Globe, path: "/partner/dashboard/website" },
    { id: "mensagens", label: "Mensagens", icon: MessageSquare, path: "/partner/dashboard/mensagens" },
    ...(tabletOrder ? [{ id: "tablet", label: "Terminal Glamzo", icon: Smartphone, path: "/partner/dashboard/tablet" }] : []),
    { id: "configuracoes", label: "Configurações", icon: Settings, path: "/partner/dashboard/configuracoes" },
  ];

  if (authLoading || !business) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" /></div>;
  }

  // To support legacy full-screen agenda if needed, though we can use routes
  const agendaFullScreen = false;

  return (
    <div
      id="partner-terminal-layout"
      className="min-h-screen bg-[#fafbfc] text-slate-800 flex font-sans select-none overflow-hidden h-screen"
    >
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
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 shrink-0">
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
              {navItems.map((tab) => {
                const Icon = tab.icon;
                const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + "/");
                return (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs rounded-xl font-bold tracking-tight transition-all cursor-pointer ${
                      isActive
                        ? "bg-purple-600 text-white shadow shadow-purple-950/20"
                        : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.id === "agenda" && bookingsTodayCount > 0 && (
                      <span className="bg-purple-600 border border-purple-400/30 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none">
                        {bookingsTodayCount}
                      </span>
                    )}
                  </Link>
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
            {navItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + "/");
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs rounded-xl font-bold tracking-tight transition-all cursor-pointer ${
                    isActive
                      ? "bg-purple-600 text-white shadow shadow-purple-900/40"
                      : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.id === "agenda" && bookingsTodayCount > 0 && (
                    <span className="bg-purple-600 border border-purple-400/30 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none">
                      {bookingsTodayCount}
                    </span>
                  )}
                </Link>
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
        {/* Ambient Glowing Background Spheres */}
        <div
          className="partner-glow-ball-pink top-10 right-1/4 animate-pulse pointer-events-none absolute w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-rose-400/10 rounded-full blur-[100px] z-0"
          style={{ animationDuration: "10s" }}
        />
        <div
          className="partner-glow-ball-purple bottom-12 left-10 animate-pulse pointer-events-none absolute w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple-600/10 rounded-full blur-[100px] z-0"
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
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                  Online
                </span>
             </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto relative z-10 px-4 sm:px-8 py-6 pb-24">
           {/* Outlet passes context to child routes to avoid refetching basic data if needed */}
           <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Outlet context={{ business, user, profile, tabletOrder, categories, services, staff, bookings, loadLayoutData, isLoadingData }} />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
