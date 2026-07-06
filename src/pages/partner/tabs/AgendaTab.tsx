import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { Calendar, Sparkles, X, Bell, Maximize, Minimize } from "lucide-react";
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
  const [bookingFilter, setBookingFilter] = useState<"all" | "pending" | "confirmed" | "completed" | "cancelled" | "no_show">("all");
  const [bookingSearch, setBookingSearch] = useState("");

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
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

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

  // Realtime subscription for bookings
  useEffect(() => {
    if (!business) return;

    const channel = supabase
      .channel(`realtime-bookings-agenda-${business.id}`)
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
          playTerminalChime();
          await loadLayoutData();
          notifyTerminal(
            "⚡️ Nova Marcação em Tempo Real!",
            "Uma nova reserva foi adicionada automaticamente ao calendário pelo cliente.",
          );
        },
      )
      .subscribe((status) => {
        console.log("Realtime agenda status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [business, loadLayoutData]);

  const handleDropBooking = async (
    bookingId: string,
    newStaffId: string | null,
    newStartTime: string,
    newDate: string,
    endStr: string
  ) => {
    try {
      if (!user || !bookingId) return;

      const { error } = await supabase
        .from("bookings")
        .update({
          staff_id: newStaffId,
          start_time: newStartTime,
          end_time: endStr,
          booking_date: newDate,
        })
        .eq("id", bookingId);

      if (error) {
        console.error("Error dragging booking", error);
        setGlobalError("Erro ao guardar o reagendamento.");
        throw error;
      } else {
        notifyTerminal(
          "Agenda Atualizada",
          `Reserva arrastada para as ${newStartTime}.`,
        );
        loadLayoutData();
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleSaveManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !business) {
      alert("Sessão ou loja não inicializada.");
      return;
    }

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
      const selectedSvc = services.find((s) => s.id === manualServiceId);
      const svcPrice = selectedSvc ? Number(selectedSvc.price) : 0;

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
          customer_id: user.id,
          business_id: business.id,
          service_id: finalServiceId,
          staff_id: manualStaffId || null,
          booking_date: manualDate,
          start_time: manualStartTime,
          end_time: endTimeStr,
          total_price: manualBookingType === "block" ? 0 : svcPrice,
          payment_method: "local",
          payment_status: manualBookingType === "block" ? "paid" : "unpaid",
          booking_status: "confirmed",
          notes: payloadNotes,
        })
        .select()
        .single();

      if (error) throw error;

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
        manualBookingType === "block" ? "🛑 Horário Bloqueado" : "📅 Marcação Reservada",
        manualBookingType === "block"
          ? `Bloqueio registado: ${manualReason}`
          : `Reserva de ${manualClientName} foi criada com sucesso na agenda!`,
      );

      setIsManualBookingOpen(false);
      setManualClientName("");
      setManualReason("");
      setManualNotes("");
      loadLayoutData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erro de base de dados ao guardar a marcação manual.");
    } finally {
      setIsSavingManual(false);
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in text-slate-700 max-w-[1600px] mx-auto w-full">
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

      {globalError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold animate-fade-in">
          {globalError}
        </div>
      )}

      
      {/* Agenda Header & Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 pb-5 mb-5">
        <div>
          <h3 className="text-xl font-display font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span>Agenda Profissional</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Gira as marcações com arrastar & largar.
          </p>
        </div>
        
        {/* Staff Filter (Avatars) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar max-w-[50%]">
          <button
            onClick={() => setSelectedStaffFilter("all")}
            className={`flex items-center justify-center px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              selectedStaffFilter === "all" ? "bg-slate-800 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Todos
          </button>
          {staff.map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStaffFilter(st.id)}
              className={`flex items-center gap-2 px-1 pr-4 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                selectedStaffFilter === st.id ? "bg-purple-100 text-purple-900 ring-2 ring-purple-500 shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden shrink-0">
                 {st.avatar_url ? (
                   <img src={st.avatar_url} alt={st.full_name} className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full bg-gradient-to-br from-purple-500 to-rose-500 text-white flex items-center justify-center text-[10px]">
                     {st.full_name.charAt(0)}
                   </div>
                 )}
              </div>
              {st.full_name.split(' ')[0]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={toggleFullScreen}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold p-2.5 rounded-xl text-xs flex items-center gap-2 transition"
            title="Ecrã Completo"
          >
            {agendaFullScreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              setManualBookingType("booking");
              setIsManualBookingOpen(true);
              if (services.length > 0) setManualServiceId(services[0].id);
              if (staff.length > 0) setManualStaffId(staff[0].id);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition shadow-lg shadow-purple-900/30"
          >
            <Calendar className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Nova Reserva</span>
          </button>
        </div>
      </div>

      
      {isLoadingData || (loading && bookings.length === 0) ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col gap-4 shadow-sm h-[600px] overflow-hidden">
          <div className="flex gap-4 border-b border-slate-100 pb-4">
            <Skeleton className="w-24 h-8" />
            <Skeleton className="w-24 h-8" />
            <Skeleton className="w-32 h-8 ml-auto" />
            <Skeleton className="w-24 h-8" />
          </div>
          <div className="flex-1 grid grid-cols-7 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex flex-col gap-3 border-r border-slate-50 pr-4 last:border-0">
                <Skeleton className="w-full h-6" />
                <Skeleton className="w-full h-24" />
                <Skeleton className="w-full h-32" />
                <Skeleton className="w-full h-20" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div ref={containerRef} className={`${agendaFullScreen ? 'bg-white p-4 overflow-y-auto w-full h-full fixed inset-0 z-50' : 'w-full'}`}>
        {agendaFullScreen && (
          <button 
            onClick={toggleFullScreen}
            className="fixed top-4 right-4 z-[60] bg-slate-900 text-white p-3 rounded-xl shadow-lg hover:bg-black transition flex items-center gap-2"
          >
            <Minimize className="w-5 h-5" />
            <span className="font-bold text-sm hidden sm:inline">Sair de Ecrã Completo</span>
          </button>
        )}
        <DashboardCalendar 
          bookings={selectedStaffFilter === "all" ? bookings : bookings.filter(b => b.staff_id === selectedStaffFilter)}
          services={services}
          staff={staff}
          selectedStaffFilter={selectedStaffFilter}
          onStaffClick={(staffId) => setSelectedStaffFilter(staffId)}
          onEventClick={(info) => {
            const booking = info.event.extendedProps.booking;
            alert(`Reserva de: ${booking.customer_profile?.full_name || "Cliente"} às ${booking.start_time}`);
          }}
          onEventDrop={async (info) => {
            const event = info.event;
            const booking = event.extendedProps.booking;
            const newDate = event.start.toISOString().split('T')[0];
            const newStartTime = event.start.toTimeString().split(' ')[0].substring(0, 5);
            let endStr = event.end ? event.end.toTimeString().split(' ')[0].substring(0, 5) : booking.end_time;
            
            setLoading(true);
            try {
              await handleDropBooking(booking.id, booking.staff_id, newStartTime, newDate, endStr);
            } catch (err) {
              info.revert();
            } finally {
              setLoading(false);
            }
          }}
          onDateSelect={(info) => {
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

      {/* Manual Booking / Block Modal */}
      {isManualBookingOpen && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col text-slate-800 max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white/50">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 font-sans">
                  Gestão Manual de Agenda
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-sans">
                  Reserve um horário para clientes habituais ou bloqueie indisponibilidades.
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

            <form onSubmit={handleSaveManualBooking} className="p-6 overflow-y-auto space-y-5">
              <div className="flex p-1 bg-slate-200/50 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setManualBookingType("booking")}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${
                    manualBookingType === "booking"
                      ? "bg-white text-slate-900 shadow shadow-slate-200"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Marcação Manual
                </button>
                <button
                  type="button"
                  onClick={() => setManualBookingType("block")}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${
                    manualBookingType === "block"
                      ? "bg-amber-100 text-amber-900 shadow shadow-amber-200"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Bloqueio Horário
                </button>
              </div>

              {manualBookingType === "booking" ? (
                <>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider font-sans">
                      Nome do Cliente
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Maria Santos"
                      value={manualClientName}
                      onChange={(e) => setManualClientName(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-purple-500 focus:outline-none rounded-xl p-3 text-xs text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider font-sans">
                        Serviço Requerido
                      </label>
                      <select
                        aria-label="Selecione uma opção"
                        value={manualServiceId}
                        onChange={(e) => setManualServiceId(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-purple-500 focus:outline-none rounded-xl p-3 text-xs text-slate-900 appearance-none cursor-pointer"
                      >
                        {services.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.duration_minutes}m)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider font-sans">
                        Profissional
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider font-sans">
                    Data do Evento
                  </label>
                  <input
                    type="date"
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
                      "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00",
                      "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
                      "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00",
                      "18:30", "19:00", "19:30", "20:00", "20:30",
                    ].map((t) => (
                      <option key={t} value={t}>{t}</option>
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
  );
}
