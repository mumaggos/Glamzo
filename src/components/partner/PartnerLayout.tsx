import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { Business } from "../../types";
import { LayoutDashboard, Calendar, CheckSquare, UsersRound, Users, Scissors, Clock, Tag, Landmark, Globe, MessageSquare, Smartphone, Settings, LogOut, X, Menu, Bell, CreditCard, Star } from "lucide-react";
import GlamzoLogo from "../../components/GlamzoLogo";

export default function PartnerLayout() {
  const { user, profile, signOut, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    // Update presence initially and every minute
    const updatePresence = async () => {
      try {
        await supabase
          .from('profiles')
          .update({ last_active: new Date().toISOString() })
          .eq('id', user.id);
      } catch (err) {
        console.error("Failed to update presence:", err);
      }
    };
    
    updatePresence();
    const interval = setInterval(updatePresence, 60000);
    return () => clearInterval(interval);
  }, [user]);
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [business, setBusiness] = useState<Business | null>(null);
  const [tabletOrder, setTabletOrder] = useState<any>(null);
  const [bookingsTodayCount, setBookingsTodayCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [unreadCountByCustomer, setUnreadCountByCustomer] = useState<Record<string, number>>({});

  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [businessHours, setBusinessHours] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // ESTADO DAS NOTIFICAÇÕES (Fixo por agora, mas depois ligamos à DB)
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Sistema Atualizado', desc: 'O teu terminal Glamzo Elite está online e otimizado.', time: 'Agora' }
  ]);

  const dismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

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

      const { data: tData } = await supabase.from("hardware_orders").select("*").eq("business_id", bData.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (tData) setTabletOrder(tData);

      const [{ data: catData }, { data: svData }, { data: stData }, { data: bkData }, { data: bhData }] = await Promise.all([
        supabase.from("service_categories").select("*").eq("business_id", bData.id).order("order_index"),
        supabase.from("services").select("*").eq("business_id", bData.id).order("name"),
        supabase.from("staff").select("*").eq("business_id", bData.id).order("full_name"),
        (() => {
          const now = new Date();
          const start = new Date(now);
          start.setDate(now.getDate() - 30);
          const end = new Date(now);
          end.setDate(now.getDate() + 90);
          return supabase.from("bookings")
            .select(`*, service:services(name, price, duration_minutes), staff:staff(full_name), customer_profile:profiles(full_name, avatar_url, email, phone)`)
            .eq("business_id", bData.id)
            
            
            .order("booking_date", { ascending: false })
            .order("start_time", { ascending: false })
            .limit(3000);
        })(),
        supabase.from("business_hours").select("*").eq("business_id", bData.id)
      ]);

      setCategories(catData || []); setServices(svData || []); setStaff(stData || []); setBookings(bkData || []);
      setBusinessHours(bhData || []);
      setBookingsTodayCount((bkData || []).filter(b => b.booking_date === new Date().toISOString().split("T")[0]).length);

      const { data: messagesData } = await supabase
        .from("messages")
        .select("id, customer_id, sender, is_read, content")
        .eq("business_id", bData.id)
        .eq("sender", "customer")
        .eq("is_read", false);
        
      if (messagesData && messagesData.length > 0) {
        setUnreadMessages(messagesData.length);
        
        // Count by customer (for future use or notifications)
        const counts = {};
        messagesData.forEach(m => {
           counts[m.customer_id] = (counts[m.customer_id] || 0) + 1;
        });
        setUnreadCountByCustomer(counts);
        
        // Add a notification for unread messages
        setNotifications([{
          id: 999,
          title: "Novas Mensagens Recebidas",
          desc: `Você tem ${messagesData.length} mensagem(s) não lida(s) de clientes.`,
          time: "Agora"
        }]);
      } else {
        setUnreadMessages(0);
        setNotifications([]);
      }

    } catch (err) { console.error(err); } finally { setIsLoadingData(false); }
  };

  useEffect(() => { setIsMobileSidebarOpen(false); setIsNotificationsOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!business) return;
    const channel = supabase.channel('partner_layout_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `business_id=eq.${business.id}` }, payload => {
        if (payload.new.sender === 'customer') {
          loadLayoutData();
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [business]);


  const hasValidSubscription = !business || business.subscription_status === 'active' || (business.subscription_status === 'trialing' && business.trial_ends_at && new Date(business.trial_ends_at) > new Date());

  useEffect(() => {
    if (business && !hasValidSubscription && !location.pathname.includes('/subscricao')) {
      navigate('/partner/dashboard/subscricao', { replace: true });
    }
  }, [business, hasValidSubscription, location.pathname, navigate]);

  const navItems = [
    { id: "overview", label: "Resumo", icon: LayoutDashboard, path: "/partner/dashboard/overview" },
    { id: "agenda", label: "Agenda", icon: Calendar, path: "/partner/dashboard/agenda" },
    { id: "reservas", label: "Reservas", icon: CheckSquare, path: "/partner/dashboard/reservas" },
    { id: "clientes", label: "Clientes", icon: UsersRound, path: "/partner/dashboard/clientes" },
    { id: "equipa", label: "Equipa", icon: Users, path: "/partner/dashboard/equipa" },
    { id: "servicos", label: "Serviços", icon: Scissors, path: "/partner/dashboard/servicos" },
    { id: "horarios", label: "Horários", icon: Clock, path: "/partner/dashboard/horarios" },
    { id: "avaliacoes", label: "Avaliações", icon: Star, path: "/partner/dashboard/avaliacoes" },
    { id: "campanhas", label: "Promoções", icon: Tag, path: "/partner/dashboard/campanhas" },
    { id: "financeiro", label: "Faturação", icon: Landmark, path: "/partner/dashboard/financeiro" },
    { id: "subscricao", label: "Subscrição", icon: CreditCard, path: "/partner/dashboard/subscricao" },
    { id: "website", label: "Website & QR Code", icon: Globe, path: "/partner/dashboard/website" },
    { id: "mensagens", label: "Mensagens", icon: MessageSquare, path: "/partner/dashboard/mensagens" },
    ...(tabletOrder ? [{ id: "tablet", label: "Terminal Glamzo", icon: Smartphone, path: "/partner/dashboard/tablet" }] : []),
    { id: "configuracoes", label: "Configurações", icon: Settings, path: "/partner/dashboard/configuracoes" },
  ];

  if (authLoading || !business) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]"><div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" /></div>;

  return (
    <div id="partner-terminal-layout" className="min-h-[100dvh] h-[100dvh] bg-[#F8F9FC] text-slate-800 flex font-sans select-none overflow-hidden relative overflow-x-hidden">
      
      <style>{`
        header, nav.sticky, footer { display: none !important; }
        body { background-color: #F8F9FC !important; }
      `}</style>

      {/* Drawer Mobile / Tablet */}
      <div className={`fixed inset-0 z-[100] flex lg:hidden transition-opacity duration-300 ${isMobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)} />
        <div className={`relative flex flex-col w-72 h-full bg-white border-r shadow-2xl z-10 transform transition-transform duration-300 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-5 border-b shrink-0 bg-slate-50">
            <div className="flex items-center gap-3"><GlamzoLogo size={28} glow={false} /><span className="font-extrabold text-sm">Menu</span></div>
            <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 rounded-xl text-slate-500 bg-white shadow-sm border"><X className="w-4 h-4" /></button>
          </div>
          <nav className="flex-1 overflow-y-auto space-y-1 p-3 pb-24 custom-scrollbar">
            {navItems.map((tab) => {
              const isActive = location.pathname.startsWith(tab.path);
              const isDisabled = !hasValidSubscription && tab.id !== "subscricao";
              if (isDisabled) {
                return (
                  <div key={tab.id} className="w-full flex items-center px-4 py-3 text-sm rounded-2xl font-bold opacity-50 cursor-not-allowed text-slate-400 bg-slate-50">
                    <tab.icon className="w-4 h-4 mr-3 shrink-0" /> {tab.label}
                  </div>
                );
              }
              return (
                <Link key={tab.id} to={tab.path} onClick={() => setIsMobileSidebarOpen(false)} className={`w-full flex items-center px-4 py-3 text-sm rounded-2xl font-bold transition-all ${isActive ? "bg-purple-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}>
                  <tab.icon className="w-4 h-4 mr-3 shrink-0" /> {tab.label}
                  {tab.id === "mensagens" && unreadMessages > 0 && (
                    <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadMessages}</span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <button onClick={async () => { await signOut(); navigate("/"); }} className="w-full py-3 bg-white hover:bg-slate-100 border border-slate-200 text-rose-500 rounded-xl text-xs font-bold flex justify-center items-center gap-2">
              <LogOut className="w-4 h-4" /> Terminar Sessão
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-[260px] border-r border-slate-200 bg-white flex-col shrink-0 h-full z-20 shadow-sm">
         <button onClick={async () => { await signOut(); navigate("/"); }} className="h-20 border-b border-slate-100 flex items-center px-6 gap-3 w-full text-left hover:bg-slate-50">
            <div className="bg-purple-100 p-2 rounded-xl"><GlamzoLogo size={24} glow={true} /></div>
            <div><span className="font-black text-sm block">Glamzo</span><span className="text-[10px] font-bold text-slate-500">Workspace de Elite</span></div>
          </button>
          <div className="p-4 mx-4 my-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <span className="text-xs font-black block truncate">{business?.name}</span>
            <div className="flex items-center gap-1.5 mt-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[10px] text-slate-500 font-bold">Sistema Ativo</span></div>
          </div>
          <nav className="px-4 py-2 space-y-1.5 overflow-y-auto flex-1 custom-scrollbar">
            {navItems.map((tab) => {
              const isActive = location.pathname.startsWith(tab.path);
              const isDisabled = !hasValidSubscription && tab.id !== "subscricao";
              if (isDisabled) {
                return (
                  <div key={tab.id} className="w-full flex items-center justify-between px-4 py-3 text-xs rounded-2xl font-bold opacity-50 cursor-not-allowed text-slate-400">
                    <div className="flex items-center gap-3"><tab.icon className="w-4 h-4 shrink-0" /> <span>{tab.label}</span></div>
                  </div>
                );
              }
              return (
                <Link key={tab.id} to={tab.path} className={`w-full flex items-center justify-between px-4 py-3 text-xs rounded-2xl font-bold transition-all ${isActive ? "bg-slate-900 text-white shadow-md" : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}>
                  <div className="flex items-center gap-3"><tab.icon className="w-4 h-4 shrink-0" /> <span>{tab.label}</span>
                    {tab.id === "mensagens" && unreadMessages > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadMessages}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
      </aside>

      <main className="flex-1 flex flex-col h-full relative isolate overflow-x-hidden w-full">
        <div className="relative z-[99999] h-16 px-4 sm:px-8 flex items-center justify-between shrink-0 bg-white/50 backdrop-blur-md pt-4 border-b border-slate-100/50">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-slate-900 hidden lg:block">Bom dia, <span className="text-purple-600">{profile?.full_name?.split(" ")[0] || "Profissional"}</span> 👋</h2>
            <h2 className="text-lg font-black text-slate-900 lg:hidden">{business?.name}</h2>
          </div>
          
          <div className="flex items-center gap-3 relative">
            
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
              className="relative p-2.5 bg-white text-slate-500 hover:text-purple-600 transition-colors shadow-sm border border-slate-200 rounded-full cursor-pointer z-50"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
              )}
            </button>
              
            {/* NOTIFICAÇÕES (AGORA COM Z-INDEX SUPERIOR E SEM OVERFLOW CORTADO) */}
            {isNotificationsOpen && (
              <>
                <div className="fixed inset-0 z-[99998]" onClick={() => setIsNotificationsOpen(false)} />
                <div className="absolute right-0 top-14 w-80 bg-white border border-slate-200 shadow-2xl rounded-3xl z-[99999] overflow-hidden animate-in fade-in slide-in-from-top-4">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h4 className="font-extrabold text-slate-900">Notificações</h4>
                    <span className="text-[10px] font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">{notifications.length} novas</span>
                  </div>
                  <div className="p-2 space-y-1">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500 font-medium">Sem novas notificações.</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="flex items-start justify-between gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-colors group">
                          <div className="flex gap-3">
                            <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                            <div>
                              <p className="text-xs font-bold text-slate-800">{n.title}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{n.desc}</p>
                            </div>
                          </div>
                          <button onClick={() => dismissNotification(n.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="flex bg-white shadow-sm border border-slate-200 px-3 py-2.5 rounded-full items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest hidden sm:inline">Online</span>
            </div>
          </div>
        </div>

        {/* pb-36 garante o scroll dos Insights */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden w-full px-4 sm:px-8 py-4 pb-32 lg:pb-12 relative z-0">
           <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full">
            <Outlet context={{ business, user, profile, tabletOrder, categories, services, staff, bookings, businessHours, loadLayoutData, isLoadingData }} />
          </motion.div>
        </div>
      </main>

      {/* Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t pb-safe pt-2 px-6 flex justify-between items-center z-[50] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {!hasValidSubscription ? (
          <div className="w-full text-center py-2 flex items-center justify-center gap-2 text-rose-500 font-bold text-xs">
            Acesso Bloqueado. Por favor, regulariza a tua subscrição.
          </div>
        ) : (
          <>
            <Link to="/partner/dashboard/overview" className="flex flex-col items-center p-2"><LayoutDashboard className={`w-6 h-6 ${location.pathname.includes('overview') ? 'text-purple-600' : 'text-slate-400'}`} /><span className={`text-[10px] font-bold mt-1 ${location.pathname.includes('overview') ? 'text-purple-600' : 'text-slate-500'}`}>Resumo</span></Link>
            <Link to="/partner/dashboard/clientes" className="flex flex-col items-center p-2"><UsersRound className={`w-6 h-6 ${location.pathname.includes('clientes') ? 'text-purple-600' : 'text-slate-400'}`} /><span className={`text-[10px] font-bold mt-1 ${location.pathname.includes('clientes') ? 'text-purple-600' : 'text-slate-500'}`}>Clientes</span></Link>
            <Link to="/partner/dashboard/agenda" className="relative -top-5 flex flex-col items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-600/30 border-4 border-[#F8F9FC]"><Calendar className="w-6 h-6" /></Link>
            <Link to="/partner/dashboard/reservas" className="flex flex-col items-center p-2"><CheckSquare className={`w-6 h-6 ${location.pathname.includes('reservas') ? 'text-purple-600' : 'text-slate-400'}`} /><span className={`text-[10px] font-bold mt-1 ${location.pathname.includes('reservas') ? 'text-purple-600' : 'text-slate-500'}`}>Reservas</span></Link>
            <button onClick={() => setIsMobileSidebarOpen(true)} className="flex flex-col items-center p-2"><Menu className="w-6 h-6 text-slate-400" /><span className="text-[10px] font-bold mt-1 text-slate-400">Menu</span></button>
          </>
        )}
      </div>
    </div>
  );
}
