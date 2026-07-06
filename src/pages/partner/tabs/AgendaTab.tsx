import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { Calendar, Sparkles, X, Bell, Maximize, Minimize, Plus } from "lucide-react";
import { Skeleton } from "../../../components/ui/Skeleton";
import { DashboardCalendar } from "../../../components/DashboardCalendar";
import { Business, Service, Staff, Booking } from "../../../types";

interface PartnerContextType {
  business: Business | null;
  user: any;
  profile: any;
  categories: any[];
  services: Service[];
  staff: Staff[];
  bookings: Booking[];
  loadLayoutData: () => Promise<void>;
  isLoadingData: boolean;
}

export default function AgendaTab() {
  const { business, user, services, staff, bookings, loadLayoutData, isLoadingData } = useOutletContext<PartnerContextType>();

  const [agendaMode, setAgendaMode] = useState<"today" | "week" | "month" | "by_staff">("today");
  const [selectedAgendaDate, setSelectedAgendaDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [agendaFullScreen, setAgendaFullScreen] = useState(false);
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>("all");
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [manualBookingType, setManualBookingType] = useState<"booking" | "block">("booking");
  const [manualClientName, setManualClientName] = useState("");
  const [manualReason, setManualReason] = useState("");
  const [manualServiceId, setManualServiceId] = useState("");
  const [manualStaffId, setManualStaffId] = useState("");
  const [manualDate, setManualDate] = useState(new Date().toISOString().split("T")[0]);
  const [manualStartTime, setManualStartTime] = useState("09:00");
  const [manualNotes, setManualNotes] = useState("");
  const [isSavingManual, setIsSavingManual] = useState(false);

  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [toastNotification, setToastNotification] = useState<{
    visible: boolean;
    title: string;
    desc: string;
  } | null>(null);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setAgendaFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const playTerminalChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, ctx.currentTime); 
      osc1.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
      gain1.gain.setValueAtTime(0, ctx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 1);
    } catch (e) {
      console.log("Audio not supported or disabled");
    }
  };

  const notifyTerminal = (title: string, desc: string) => {
    playTerminalChime();
    setToastNotification({ visible: true, title, desc });
    setTimeout(() => {
      setToastNotification((prev) => (prev ? { ...prev, visible: false } : null));
    }, 6000);
  };

  // Realtime subscription
  useEffect(() => {
    if (!business) return;
    const channel = supabase
      .channel(`realtime-bookings-agenda-${business.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bookings", filter: `business_id=eq.${business.id}` },
        async (payload) => {
          console.log("Real-time insertion captured on bookings:", payload);
          playTerminalChime();
          await loadLayoutData();
          notifyTerminal("⚡️ Nova Marcação em Tempo Real!", "Uma nova reserva foi adicionada automaticamente ao calendário pelo cliente.");
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [business, loadLayoutData]);

  const handleDropBooking = async (bookingId: string, newStaffId: string | null, newStartTime: string, newDate: string, endStr: string) => {
    try {
      if (!user || !bookingId) return;
      const { error } = await supabase
        .from("bookings")
        .update({ staff_id: newStaffId, start_time: newStartTime, end_time: endStr, booking_date: newDate })
        .eq("id", bookingId);

      if (error) {
        setGlobalError("Erro ao guardar o reagendamento.");
        throw error;
      } else {
        notifyTerminal("Agenda Atualizada", `Reserva arrastada para as ${newStartTime}.`);
        loadLayoutData();
      }
    } catch (e) { console.error(e); throw e; }
  };

  const handleSaveManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !business) { alert("Sessão ou loja não inicializada."); return; }
    if (manualBookingType === "booking" && !manualClientName.trim()) { alert("Por favor, introduza o nome do cliente."); return; }
    if (manualBookingType === "block" && !manualReason.trim()) { alert("Por favor, introduza o motivo do bloqueio."); return; }

    setIsSavingManual(true);
    try {
      const selectedSvc = services.find((s) => s.id === manualServiceId);
      const svcPrice = selectedSvc ? Number(selectedSvc.price) : 0;
      const [startH, startM] = manualStartTime.split(":").map(Number);
      const duration = selectedSvc ? Number(selectedSvc.duration_minutes) : 30;
      const totalMinutes = startH * 60 + startM + duration;
      const endH = Math.floor(totalMinutes / 60) % 24;
      const endM = totalMinutes % 60;
      const endTimeStr = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

      const payloadNotes = manualBookingType === "block" 
        ? `Bloqueio Agenda: ${manualReason}` 
        : `Reserva Manual: ${manualClientName}${manualNotes ? " - " + manualNotes : ""}`;

      let finalServiceId = manualServiceId || (services.length > 0 ? services[0].id : null);
      if (!finalServiceId) throw new Error("Por favor, crie pelo menos um serviço no separador 'Serviços'.");

      const { data, error } = await supabase.from("bookings").insert({
        customer_id: user.id, business_id: business.id, service_id: finalServiceId, staff_id: manualStaffId || null,
        booking_date: manualDate, start_time: manualStartTime, end_time: endTimeStr,
        total_price: manualBookingType === "block" ? 0 : svcPrice, payment_method: "local",
        payment_status: manualBookingType === "block" ? "paid" : "unpaid", booking_status: "confirmed", notes: payloadNotes,
      }).select().single();

      if (error) throw error;

      await supabase.from("payments").insert({
        booking_id: data.id, customer_id: user.id, business_id: business.id,
        amount_total: manualBookingType === "block" ? 0 : svcPrice, glamzo_fee: 0,
        business_amount: manualBookingType === "block" ? 0 : svcPrice, payment_method: "local",
        payment_status: manualBookingType === "block" ? "paid" : "unpaid", stripe_payment_intent: null,
      });

      notifyTerminal(
        manualBookingType === "block" ? "🛑 Horário Bloqueado" : "📅 Marcação Reservada",
        manualBookingType === "block" ? `Bloqueio registado: ${manualReason}` : `Reserva de ${manualClientName} criada.`
      );

      setIsManualBookingOpen(false);
      setManualClientName(""); setManualReason(""); setManualNotes("");
      loadLayoutData();
    } catch (err: any) {
      alert(err.message || "Erro de base de dados ao guardar a marcação manual.");
    } finally { setIsSavingManual(false); }
  };

  return (
    <div className="w-full text-slate-700 animate-fade-in bg-[#f8f9fc] rounded-3xl pb-20 md:pb-0">
      
      {/* Toast Notification */}
      {toastNotification?.visible && (
        <div className="fixed top-6 right-6 z-50 bg-slate-50 border-2 border-purple-500/80 p-5 rounded-2xl shadow-2xl max-w-sm animate-bounce text-slate-800 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200">
            <Bell className="w-5 h-5 animate-swing" />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm tracking-tight text-slate-900">{toastNotification.title}</h4>
            <p className="text-xs text-slate-500 leading-normal font-medium">{toastNotification.desc}</p>
            <button onClick={() => setToastNotification(null)} className="text-[10px] font-bold text-purple-600 hover:underline uppercase pt-1.5">
              Fechar Alerta
            </button>
          </div>
        </div>
      )}

      {globalError && <div className="p-4 mb-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold">{globalError}</div>}

      {/* Header & Controls (Bento Grid Look) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            Agenda Elite
          </h3>
          <p className="text-sm text-slate-500 font-medium">Gestão inteligente e em tempo real.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button
            onClick={toggleFullScreen}
            className="hidden md:flex bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold p-3 rounded-2xl shadow-sm items-center gap-2 transition"
            title="Ecrã Completo"
          >
            {agendaFullScreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
          <button
            onClick={() => {
              setManualBookingType("booking");
              setIsManualBookingOpen(true);
              if (services.length > 0) setManualServiceId(services[0].id);
              if (staff.length > 0) setManualStaffId(staff[0].id);
            }}
            className="flex-1 lg:flex-none bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold px-6 py-3 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5" />
            Nova Marcação
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Calendar Area */}
        <div className="lg:col-span-3 min-h-[600px] md:min-h-[750px]">
          {isLoadingData || (loading && bookings.length === 0) ? (
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 flex flex-col gap-4 shadow-sm h-full">
              <Skeleton className="w-full h-12 rounded-xl" />
              <div className="flex-1 grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="w-full h-full rounded-xl" />)}
              </div>
            </div>
          ) : (
            <div ref={containerRef} className={`${agendaFullScreen ? 'bg-[#f8f9fc] p-6 overflow-y-auto w-full h-full fixed inset-0 z-50' : 'h-full'}`}>
              {agendaFullScreen && (
                <button onClick={toggleFullScreen} className="fixed top-6 right-6 z-[60] bg-slate-900 text-white p-3 rounded-2xl shadow-xl hover:bg-black transition flex items-center gap-2">
                  <Minimize className="w-5 h-5" />
                  <span className="font-bold text-sm">Sair</span>
                </button>
              )}
              <DashboardCalendar 
                bookings={selectedStaffFilter === "all" ? bookings : bookings.filter(b => b.staff_id === selectedStaffFilter)}
                services={services}
                staff={staff}
                selectedStaffFilter={selectedStaffFilter}
                onDateSelect={(info: any) => {
                  const start = info.start;
                  const date = start.toISOString().split('T')[0];
                  const time = start.toTimeString().split(' ')[0].substring(0, 5);
                  setSelectedAgendaDate(date);
                  setManualDate(date);
                  setManualStartTime(time);
                  setManualBookingType("booking");
                  setIsManualBookingOpen(true);
                  if (services.length > 0) setManualServiceId(services[0].id);
                  if (staff.length > 0) setManualStaffId(staff[0].id);
                }}
              />
            </div>
          )}
        </div>

        {/* Sidebar / Filters (Right side on Desktop) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60">
            <h3 className="font-black text-slate-800 mb-4">Filtrar Profissional</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedStaffFilter("all")}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all font-bold text-sm ${
                  selectedStaffFilter === "all" ? "bg-slate-900 text-white shadow-md" : "hover:bg-slate-50 text-slate-600 border border-slate-100"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">👥</div>
                Ver Toda a Equipa
              </button>
              {staff.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStaffFilter(st.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all font-bold text-sm ${
                    selectedStaffFilter === st.id ? "bg-purple-100 text-purple-900 ring-2 ring-purple-500 shadow-sm" : "hover:bg-slate-50 text-slate-600 border border-slate-100"
                  }`}
                >
                  <img src={st.avatar_url || `https://ui-avatars.com/api/?name=${st.full_name}&background=f1f5f9&color=64748b`} className="w-8 h-8 rounded-full border border-slate-200 object-cover shrink-0" alt="" />
                  <span className="truncate">{st.full_name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* MODAL ORIGINAL DA MARCAÇÃO MANUAL INTACTO */}
      {isManualBookingOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white border border-slate-200 rounded-t-3xl md:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col text-slate-800 max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-xl text-slate-900">Nova Marcação</h3>
                <p className="text-xs text-slate-500 font-medium">Insira os detalhes do agendamento manual.</p>
              </div>
              <button onClick={() => setIsManualBookingOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualBooking} className="p-6 overflow-y-auto space-y-5">
              <div className="flex p-1 bg-slate-100 rounded-2xl mb-4">
                <button type="button" onClick={() => setManualBookingType("booking")} className={`flex-1 text-sm font-bold py-2.5 rounded-xl transition-all ${manualBookingType === "booking" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>Marcação Cliente</button>
                <button type="button" onClick={() => setManualBookingType("block")} className={`flex-1 text-sm font-bold py-2.5 rounded-xl transition-all ${manualBookingType === "block" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500"}`}>Bloqueio Pausa</button>
              </div>

              {manualBookingType === "booking" ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-slate-400">Nome do Cliente</label>
                    <input type="text" required placeholder="Ex: Maria Santos" value={manualClientName} onChange={(e) => setManualClientName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none rounded-2xl p-4 text-sm font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase text-slate-400">Serviço</label>
                      <select value={manualServiceId} onChange={(e) => setManualServiceId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 outline-none rounded-2xl p-4 text-sm font-bold appearance-none">
                        {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase text-slate-400">Profissional</label>
                      <select value={manualStaffId} onChange={(e) => setManualStaffId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 outline-none rounded-2xl p-4 text-sm font-bold appearance-none">
                        {staff.map((st) => <option key={st.id} value={st.id}>{st.full_name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-slate-400">Notas Opcionais</label>
                    <textarea placeholder="Ex: Cliente prefere máquina a zero..." value={manualNotes} onChange={(e) => setManualNotes(e.target.value)} className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 outline-none rounded-2xl p-4 text-sm font-bold h-20" />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase text-slate-400">Motivo do Bloqueio</label>
                    <input type="text" required placeholder="Ex: Almoço" value={manualReason} onChange={(e) => setManualReason(e.target.value)} className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none rounded-2xl p-4 text-sm font-bold" />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-400">Data</label>
                  <input type="date" required value={manualDate} onChange={(e) => setManualDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 outline-none rounded-2xl p-4 text-sm font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-400">Hora de Início</label>
                  <input type="time" required value={manualStartTime} onChange={(e) => setManualStartTime(e.target.value)} className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 outline-none rounded-2xl p-4 text-sm font-bold" />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsManualBookingOpen(false)} className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-bold py-4 rounded-2xl transition">Cancelar</button>
                <button type="submit" disabled={isSavingManual} className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-black py-4 rounded-2xl shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50">
                  {isSavingManual ? "A guardar..." : "Confirmar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
