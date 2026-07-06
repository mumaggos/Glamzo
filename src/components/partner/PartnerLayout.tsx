import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion"; // Atenção: alterado para framer-motion se tiveres erro
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

      const { data: tData } = await supabase
        .from("hardware_orders")
        .select("*")
        .eq("business_id", bData.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (tData) setTabletOrder(tData);

      const [
        { data: catData },
        { data: svData },
        { data: stData },
        { data: bkData },
      ] = await Promise.all([
        supabase.from("service_categories").select("*").eq("business_id", bData.id).order("order_index"),
        supabase.from("services").select("*").eq("business_id", bData.id).order("name"),
        supabase.from("staff").select("*").eq("business_id", bData.id).order("full_name"),
        supabase.from("bookings").select(`*, service:services(name, price, duration_minutes), staff:staff(full_name), customer_profile:profiles(full_name, avatar_url)`).eq("business_id", bData.id).order("booking_date", { ascending: false }).order("start_time", { ascending: false })
      ]);

      setCategories(catData || []);
      setServices(svData || []);
      setStaff(stData || []);
      setBookings(bkData || []);

      const todayStr = new Date().toISOString().split("T")[0];
      const todaysCount = (bkData || []).filter(b => b.booking_date === todayStr).length;
      setBookingsTodayCount(todaysCount);

    } catch (err) {
      console.error("Error loading layout data", err);
    } finally {
      setIsLoadingData(false);
    }
  };

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
    { id: "website", label: "Website", icon: Globe, path: "/partner/dashboard/website" },
    { id: "mensagens", label: "Mensagens", icon: MessageSquare, path: "/partner/dashboard/mensagens" },
    ...(tabletOrder ? [{ id: "tablet", label: "Terminal Glamzo", icon: Smartphone, path: "/partner/dashboard/tablet" }] : []),
    { id: "configuracoes", label: "Configurações", icon: Settings, path: "/partner/dashboard/configuracoes" },
  ];

  if (authLoading || !business) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" /></div>;
  }

  const agendaFullScreen = false;

  return (
    <div id="partner-terminal-layout" className="min-h-screen bg-[#F8F9FC] text-slate-800 flex font-sans select-none overflow-hidden h-screen relative">
      
      {/* Mobile Sidebar Navigation Drawer (Abre quando clicas em "Menu" na Bottom Nav) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-[60] flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)} />
          <div className="relative flex flex-col w-72 max-w-xs h-full bg-white border-r border-slate-200 shadow-2xl animate-fade-in text-slate-800 z-10 transition-transform">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0 bg-slate-50">
              <div className="flex items-center gap-3">
                <GlamzoLogo size={28} glow={false} />
                <span className="font-extrabold text-slate-900 tracking-tight block text-sm">Menu</span>
              </div>
              <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 rounded-xl text-slate-500 hover:text-slate-900 bg-white shadow-sm border border-slate-200 transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <nav className="flex-1 overflow-y-auto space-y-1 p-3 scrollbar-thin">
              {navItems.map((tab) => {
                const Icon = tab.icon;
                const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + "/");
                return (
                  <Link key={tab.id} to={tab.path} className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-2xl font-bold tracking-tight transition-all ${isActive ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "bg-transparent text-slate-600 hover:bg-slate-50"}`}>
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
               <button onClick={async () => { setIsMobileSidebarOpen(false); await signOut(); navigate("/"); }} className="w-full py-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" />
                <span>Terminar Sessão</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side Rail Panel (Desktop Apenas - Fica escondido no Mobile) */}
      <aside className={`hidden ${agendaFullScreen ? "" : "lg:flex"} w-[260px] border-r border-slate-200/80 bg-white flex-col justify-between shrink-0 h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}>
        <div>
          <button onClick={async () => { await signOut(); navigate("/"); }} className="h-20 border-b border-slate-100 flex items-center px-6 gap-3 w-full text-left hover:bg-slate-50 transition-colors">
            <div className="bg-purple-100 p-2 rounded-xl"><GlamzoLogo size={24} glow={true} /></div>
            <div>
              <span className="font-black text-slate-900 tracking-tight block text-sm">Glamzo</span>
              <span className="text-[10px] font-bold text-slate-500">Workspace de Elite</span>
            </div>
          </button>

          <div className="p-4 mx-4 my-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <span className="text-xs font-black text-slate-800 block truncate">{business?.name || "A sincronizar..."}</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-500 font-bold">Sistema Ativo</span>
            </div>
          </div>

          <nav className="px-4 py-2 space-y-1.5 overflow-y-auto max-h-[calc(100vh-270px)] scrollbar-hide">
            {navItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + "/");
              return (
                <Link key={tab.id} to={tab.path} className={`w-full flex items-center justify-between px-4 py-3 text-xs rounded-2xl font-bold tracking-tight transition-all ${isActive ? "bg-slate-900 text-white shadow-md" : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}>
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.id === "agenda" && bookingsTodayCount > 0 && (
                    <span className="bg-purple-600 text-white text-[9px] px-2 py-0.5 rounded-full">{bookingsTodayCount}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Screen Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header (Desktop & Mobile) - Sem o botão hambúrguer no mobile */}
        <header className={`${agendaFullScreen ? "hidden" : "h-16 px-4 sm:px-8 flex items-center justify-between shrink-0 bg-transparent relative z-10 pt-4"}`}>
          <div className="flex items-center gap-3">
            <div className="text-left">
              <h2 className="text-xl font-black text-slate-900 tracking-tight hidden lg:block">
                Bom dia, <span className="text-purple-600">{profile?.full_name?.split(" ")[0] || "Profissional"}</span> 👋
              </h2>
              {/* No mobile, mostramos o nome da loja no topo como título */}
              <h2 className="text-lg font-black text-slate-900 tracking-tight lg:hidden">
                {business?.name || "O teu espaço"}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-white shadow-sm border border-slate-200 px-3 py-2 rounded-xl items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest hidden sm:inline">Sistema Online</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto relative z-10 px-4 sm:px-8 py-4 pb-24 md:pb-6">
           <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full"
          >
            <Outlet context={{ business, user, profile, tabletOrder, categories, services, staff, bookings, loadLayoutData, isLoadingData }} />
          </motion.div>
        </div>
      </main>

      {/* --- A MAGIA: BOTTOM NAVIGATION APP NATIVA (MOBILE APENAS) --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200/60 pb-safe pt-2 px-6 flex justify-between items-center z-[50] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        
        <Link to="/partner/dashboard/overview" className="flex flex-col items-center p-2 transition-transform active:scale-95">
          <LayoutDashboard className={`w-6 h-6 ${location.pathname.includes('overview') ? 'text-slate-900' : 'text-slate-400'}`} />
          <span className={`text-[10px] font-bold mt-1 ${location.pathname.includes('overview') ? 'text-slate-900' : 'text-slate-400'}`}>Resumo</span>
        </Link>
        
        <Link to="/partner/dashboard/clientes" className="flex flex-col items-center p-2 transition-transform active:scale-95">
          <UsersRound className={`w-6 h-6 ${location.pathname.includes('clientes') ? 'text-slate-900' : 'text-slate-400'}`} />
          <span className={`text-[10px] font-bold mt-1 ${location.pathname.includes('clientes') ? 'text-slate-900' : 'text-slate-400'}`}>Clientes</span>
        </Link>

        {/* Botão Central de Agenda em Destaque */}
        <Link to="/partner/dashboard/agenda" className="relative -top-5 flex flex-col items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-600/30 transition-transform active:scale-95 border-4 border-[#F8F9FC]">
          <Calendar className="w-6 h-6" />
        </Link>

        <Link to="/partner/dashboard/reservas" className="flex flex-col items-center p-2 transition-transform active:scale-95">
          <CheckSquare className={`w-6 h-6 ${location.pathname.includes('reservas') ? 'text-slate-900' : 'text-slate-400'}`} />
          <span className={`text-[10px] font-bold mt-1 ${location.pathname.includes('reservas') ? 'text-slate-900' : 'text-slate-400'}`}>Reservas</span>
        </Link>

        {/* Abre o Drawer com os restantes Links */}
        <button onClick={() => setIsMobileSidebarOpen(true)} className="flex flex-col items-center p-2 transition-transform active:scale-95">
          <Menu className="w-6 h-6 text-slate-400" />
          <span className="text-[10px] font-bold mt-1 text-slate-400">Menu</span>
        </button>
      </div>

    </div>
  );
}
