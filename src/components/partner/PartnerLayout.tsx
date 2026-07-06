import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { Business } from "../../types";
import { LayoutDashboard, Calendar, CheckSquare, UsersRound, Users, Scissors, Clock, Tag, Landmark, Globe, MessageSquare, Smartphone, Settings, LogOut, X, Menu, Bell } from "lucide-react";
import GlamzoLogo from "../../components/GlamzoLogo";

export default function PartnerLayout() {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [business, setBusiness] = useState<Business | null>(null);
  const [tabletOrder, setTabletOrder] = useState<any>(null);
  const [bookingsTodayCount, setBookingsTodayCount] = useState(0);

  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/partner/login");
    if (user) loadLayoutData();
  }, [user, authLoading]);

  const loadLayoutData = async () => {
    setIsLoadingData(true);
    if (!user) return;
    try {
      const { data: bData } = await supabase.from("businesses").select("*").eq("owner_id", user.id).maybeSingle();
      if (!bData) { navigate("/partner/setup", { replace: true }); return; }
      setBusiness(bData);

      const [{ data: catData }, { data: svData }, { data: stData }, { data: bkData }] = await Promise.all([
        supabase.from("service_categories").select("*").eq("business_id", bData.id).order("order_index"),
        supabase.from("services").select("*").eq("business_id", bData.id).order("name"),
        supabase.from("staff").select("*").eq("business_id", bData.id).order("full_name"),
        supabase.from("bookings").select(`*, service:services(name, price, duration_minutes), staff:staff(full_name), customer_profile:profiles(full_name, avatar_url)`).eq("business_id", bData.id).order("booking_date", { ascending: false }).order("start_time", { ascending: false })
      ]);

      setCategories(catData || []); setServices(svData || []); setStaff(stData || []); setBookings(bkData || []);
      setBookingsTodayCount((bkData || []).filter(b => b.booking_date === new Date().toISOString().split("T")[0]).length);
    } catch (err) { console.error(err); } finally { setIsLoadingData(false); }
  };

  useEffect(() => { setIsMobileSidebarOpen(false); setIsNotificationsOpen(false); }, [location.pathname]);

  const navItems = [
    { id: "overview", label: "Resumo", icon: LayoutDashboard, path: "/partner/dashboard/overview" },
    { id: "agenda", label: "Agenda", icon: Calendar, path: "/partner/dashboard/agenda" },
    { id: "reservas", label: "Reservas", icon: CheckSquare, path: "/partner/dashboard/reservas" },
    { id: "clientes", label: "Clientes", icon: UsersRound, path: "/partner/dashboard/clientes" },
    { id: "equipa", label: "Equipa", icon: Users, path: "/partner/dashboard/equipa" },
    { id: "servicos", label: "Serviços", icon: Scissors, path: "/partner/dashboard/servicos" },
    { id: "configuracoes", label: "Definições", icon: Settings, path: "/partner/dashboard/configuracoes" },
  ];

  if (authLoading || !business) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]"><div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" /></div>;

  return (
    <div id="partner-terminal-layout" className="min-h-screen bg-[#F8F9FC] text-slate-800 flex font-sans select-none overflow-hidden h-screen relative">
      
      {/* MAGIA: Esconde o Navbar e o Footer globais públicos */}
      <style>{`
        header, nav.sticky, footer { display: none !important; }
        body { background-color: #F8F9FC !important; }
      `}</style>

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-[80] flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)} />
          <div className="relative flex flex-col w-72 h-full bg-white border-r shadow-2xl z-10">
            <div className="flex items-center justify-between p-5 border-b shrink-0 bg-slate-50">
              <div className="flex items-center gap-3"><GlamzoLogo size={28} glow={false} /><span className="font-extrabold text-sm">Menu</span></div>
              <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 rounded-xl text-slate-500 bg-white shadow-sm border"><X className="w-4 h-4" /></button>
            </div>
            <nav className="flex-1 overflow-y-auto space-y-1 p-3">
              {navItems.map((tab) => {
                const isActive = location.pathname.startsWith(tab.path);
                return (
                  <Link key={tab.id} to={tab.path} className={`w-full flex items-center px-4 py-3 text-sm rounded-2xl font-bold transition-all ${isActive ? "bg-purple-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}>
                    <tab.icon className="w-4 h-4 mr-3 shrink-0" /> {tab.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 bg-slate-50">
              <button onClick={async () => { await signOut(); navigate("/"); }} className="w-full py-3 bg-white hover:bg-slate-100 border text-slate-600 rounded-xl text-xs font-bold flex justify-center items-center gap-2">
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Mantida igual) */}
      <aside className="hidden lg:flex w-[260px] border-r bg-white flex-col shrink-0 h-full z-20 shadow-sm">
         <button onClick={async () => { await signOut(); navigate("/"); }} className="h-20 border-b flex items-center px-6 gap-3 w-full text-left hover:bg-slate-50">
            <div className="bg-purple-100 p-2 rounded-xl"><GlamzoLogo size={24} glow={true} /></div>
            <div><span className="font-black text-sm block">Glamzo</span><span className="text-[10px] font-bold text-slate-500">Workspace de Elite</span></div>
          </button>
          <div className="p-4 mx-4 my-4 bg-slate-50 border rounded-2xl">
            <span className="text-xs font-black block truncate">{business?.name}</span>
            <div className="flex items-center gap-1.5 mt-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[10px] text-slate-500 font-bold">Sistema Ativo</span></div>
          </div>
          <nav className="px-4 py-2 space-y-1.5 overflow-y-auto flex-1">
            {navItems.map((tab) => {
              const isActive = location.pathname.startsWith(tab.path);
              return (
                <Link key={tab.id} to={tab.path} className={`w-full flex items-center justify-between px-4 py-3 text-xs rounded-2xl font-bold transition-all ${isActive ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}>
                  <div className="flex items-center gap-3"><tab.icon className="w-4 h-4 shrink-0" /> <span>{tab.label}</span></div>
                </Link>
              );
            })}
          </nav>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 px-4 sm:px-8 flex items-center justify-between shrink-0 bg-white/50 backdrop-blur-md pt-4 border-b border-slate-100/50">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-slate-900 hidden lg:block">Bom dia, <span className="text-purple-600">{profile?.full_name?.split(" ")[0] || "Profissional"}</span> 👋</h2>
            <h2 className="text-lg font-black text-slate-900 lg:hidden">{business?.name}</h2>
          </div>
          
          <div className="flex items-center gap-3">
            {/* SINO DE NOTIFICAÇÕES FUNCIONAL */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
                className="relative p-2.5 bg-white text-slate-500 hover:text-purple-600 transition-colors shadow-sm border border-slate-200 rounded-full cursor-pointer z-50"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
              </button>
              
              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 shadow-2xl rounded-3xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4">
                    <div className="p-4 border-b border-slate-100 bg-slate-50"><h4 className="font-extrabold text-slate-900">Notificações</h4></div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-purple-500 shrink-0" />
                        <div><p className="text-xs font-bold text-slate-800">Nova Marcação de João</p><p className="text-[10px] text-slate-500 mt-0.5">Corte Fade - Hoje às 15:00</p></div>
                      </div>
                      <div className="flex items-start gap-3">
                         <div className="w-2 h-2 mt-1.5 rounded-full bg-slate-300 shrink-0" />
                         <div><p className="text-xs font-bold text-slate-600">Sistema Atualizado</p><p className="text-[10px] text-slate-400 mt-0.5">O teu terminal Glamzo Elite está online.</p></div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex bg-white shadow-sm border border-slate-200 px-3 py-2.5 rounded-full items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest hidden sm:inline">Online</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 pb-24 md:pb-6 relative z-0">
           <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full">
            <Outlet context={{ business, user, profile, tabletOrder, categories, services, staff, bookings, loadLayoutData, isLoadingData }} />
          </motion.div>
        </div>
      </main>

      {/* Bottom Navigation Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t pb-safe pt-2 px-6 flex justify-between items-center z-[50] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <Link to="/partner/dashboard/overview" className="flex flex-col items-center p-2"><LayoutDashboard className={`w-6 h-6 ${location.pathname.includes('overview') ? 'text-slate-900' : 'text-slate-400'}`} /><span className="text-[10px] font-bold mt-1 text-slate-500">Resumo</span></Link>
        <Link to="/partner/dashboard/clientes" className="flex flex-col items-center p-2"><UsersRound className={`w-6 h-6 ${location.pathname.includes('clientes') ? 'text-slate-900' : 'text-slate-400'}`} /><span className="text-[10px] font-bold mt-1 text-slate-500">Clientes</span></Link>
        <Link to="/partner/dashboard/agenda" className="relative -top-5 flex flex-col items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-600/30 border-4 border-[#F8F9FC]"><Calendar className="w-6 h-6" /></Link>
        <Link to="/partner/dashboard/reservas" className="flex flex-col items-center p-2"><CheckSquare className={`w-6 h-6 ${location.pathname.includes('reservas') ? 'text-slate-900' : 'text-slate-400'}`} /><span className="text-[10px] font-bold mt-1 text-slate-500">Reservas</span></Link>
        <button onClick={() => setIsMobileSidebarOpen(true)} className="flex flex-col items-center p-2"><Menu className="w-6 h-6 text-slate-400" /><span className="text-[10px] font-bold mt-1 text-slate-400">Menu</span></button>
      </div>
    </div>
  );
}
