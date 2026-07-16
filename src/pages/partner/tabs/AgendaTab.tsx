import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import toast from 'react-hot-toast';
import { supabase } from "../../../lib/supabase";
import { Calendar, Sparkles, X, Bell, Plus, CheckCircle, Trash2, ChevronLeft, ChevronRight, ShieldAlert, Loader2 } from "lucide-react";
import { processBookingPoints } from '../../../utils/rewardsHelper';
import { DashboardCalendar } from "../../../components/DashboardCalendar";

export default function AgendaTab() {
  const { business, user, services, staff, bookings, businessHours, loadLayoutData } = useOutletContext<any>();

  const [agendaMode, setAgendaMode] = useState<"day" | "3days" | "week">("day");
  const [selectedAgendaDate, setSelectedAgendaDate] = useState<string>((() => { const d = new Date(); return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-'); })());
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>("all");
  
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [manualBookingType, setManualBookingType] = useState<"booking" | "block">("booking");
  const [manualClientName, setManualClientName] = useState("");
  const [manualReason, setManualReason] = useState("");
  const [manualBlockDuration, setManualBlockDuration] = useState(60);
  const [manualServiceId, setManualServiceId] = useState("");
  const [manualStaffId, setManualStaffId] = useState("");
  const [manualDate, setManualDate] = useState((() => { const d = new Date(); return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-'); })());
  const [manualStartTime, setManualStartTime] = useState("09:00");
  const [manualNotes, setManualNotes] = useState("");
  const [isSavingManual, setIsSavingManual] = useState(false);
  const [isUpdatingBooking, setIsUpdatingBooking] = useState(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Cliente não compareceu');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);


  const [toastNotification, setToastNotification] = useState<{ visible: boolean; title: string; desc: string; } | null>(null);

  const notifyTerminal = (title: string, desc: string) => {
    setToastNotification({ visible: true, title, desc });
    setTimeout(() => setToastNotification(null), 6000);
  };

  const handleSaveManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingManual(true);
    try {
      // 1. Validar se a hora da marcação está dentro das regras da loja
      const [inputHour, inputMin] = manualStartTime.split(":").map(Number);
      const inputTotalMin = inputHour * 60 + inputMin;

      let startLimitMin = 0;
      let endLimitMin = 24 * 60;
      if (businessHours && businessHours.length > 0) {
         const d = new Date(manualDate);
         const dayHours = businessHours.find((h: any) => h.weekday === d.getDay());
         if (dayHours && !dayHours.is_closed) {
             const [sh, sm] = dayHours.open_time.split(":").map(Number);
             const [eh, em] = dayHours.close_time.split(":").map(Number);
             startLimitMin = sh * 60 + sm;
             endLimitMin = eh * 60 + em;
         } else {
             alert(`Operação cancelada! O teu espaço está fechado nesta data.`);
             setIsSavingManual(false); return;
         }
      } else if (business?.opening_time && business?.closing_time) {
         const [sh, sm] = business.opening_time.split(":").map(Number);
         const [eh, em] = (business.end_time || business.closing_time || "20:00").split(":").map(Number);
         startLimitMin = sh * 60 + sm;
         endLimitMin = eh * 60 + em;
      }

      if (inputTotalMin < startLimitMin || inputTotalMin >= endLimitMin) {
          alert(`Operação cancelada! Fora do horário de expediente.`);
          setIsSavingManual(false); return;
      }

      let finalServiceId = manualServiceId || (services.length > 0 ? services[0].id : null);
      const selectedSvc = services.find((s: any) => s.id === finalServiceId);
      const svcPrice = selectedSvc ? Number(selectedSvc.price) : 0;
      const [startH, startM] = manualStartTime.split(":").map(Number);
      const duration = manualBookingType === "block" ? manualBlockDuration : (selectedSvc ? Number(selectedSvc.duration_minutes) : 15);
      const totalMinutes = startH * 60 + startM + duration;
      const endTimeStr = `${String(Math.floor(totalMinutes / 60) % 24).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;

      const checkOverlap = (b: any, sId: string | null) => {
        const bStart = b.start_time.split(':').map(Number);
        const bEnd = b.end_time.split(':').map(Number);
        const bStartMin = bStart[0] * 60 + bStart[1];
        const bEndMin = bEnd[0] * 60 + bEnd[1];
        
        const overlapsTime = inputTotalMin < bEndMin && bStartMin < totalMinutes;
        
        if (!overlapsTime) return false;
        if (b.staff_id === null) return true;
        if (sId !== null && b.staff_id !== sId) return false;
        
        return true;
      };

      const bookingsOnDay = bookings.filter((b: any) => b.booking_date === manualDate && b.booking_status !== 'cancelled');
      const targetStaffId = (manualStaffId === "all" || manualStaffId === "") ? null : manualStaffId;
      
      let hasOverlap = bookingsOnDay.some(b => checkOverlap(b, targetStaffId));

      if (hasOverlap) {
         alert("Operação cancelada! Já existe uma marcação ou bloqueio neste horário para o profissional selecionado.");
         setIsSavingManual(false);
         return;
      }
      
      const payloadNotes = manualBookingType === "block" 
        ? `🛑 BLOQUEIO: ${manualReason}` 
        : `Manual: ${manualClientName} ${manualNotes}`;

      // CORRIGIDO: Se for bloqueio geral (all), guardamos staff_id como null, senão vinculamos ao staff escolhido
      

      const { error } = await supabase.from("bookings").insert({
        customer_id: user.id, business_id: business.id, service_id: finalServiceId, staff_id: targetStaffId,
        booking_date: manualDate, start_time: manualStartTime, end_time: endTimeStr,
        total_price: manualBookingType === "block" ? 0 : svcPrice, payment_method: "local",
        payment_status: manualBookingType === "block" ? "paid" : "unpaid", booking_status: "confirmed", notes: payloadNotes,
      });

      if (error) throw error;
      
      notifyTerminal(manualBookingType === "block" ? "🛑 Bloqueio Ativado" : "📅 Gravado", `Agenda atualizada.`);
      setIsManualBookingOpen(false);
      setManualClientName(""); setManualReason(""); setManualNotes("");
      loadLayoutData();
    } catch (err: any) { alert("Erro ao guardar dados."); } finally { setIsSavingManual(false); }
  };

    const handleOpenDispute = () => {
    setDisputeReason('Cliente não compareceu');
    setDisputeDescription('');
    setDisputeModalOpen(true);
  };
  
  const submitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setSubmittingDispute(true);
    try {
      const { error } = await supabase.from('disputes').insert({
        booking_id: selectedBooking.id,
        business_id: business.id,
        user_id: business.owner_id,
        title: disputeReason,
        reason: `${disputeReason} - ${disputeDescription}`,
        status: 'open'
      });
      if (error) throw error;
      toast.success('Queixa registada com sucesso. A equipa vai analisar.');
      setDisputeReason('');
      setDisputeDescription('');
      setDisputeModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao abrir disputa.");
    } finally {
      setSubmittingDispute(false);
    }
  };


  const handleUpdateBookingStatus = async (status: string) => {
    if (!selectedBooking) return;
    setIsUpdatingBooking(true);
    try {
      if (status === 'completed') {
        const res = await fetch('/api/business/complete-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: selectedBooking.id })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to complete booking');
      } else {
        const { error } = await supabase.from('bookings').update({ booking_status: status }).eq('id', selectedBooking.id);
        if (error) throw error;
      }
      if (status === 'completed') notifyTerminal("✅ Concluída!", "Serviço fechado e pontos atribuídos.");
      setSelectedBooking(null); 
      loadLayoutData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar o estado.");
      console.error(err);
    } finally { 
      setIsUpdatingBooking(false); 
    }
  };

  return (
    <div className="w-full text-slate-700 animate-fade-in bg-[#f8f9fc] rounded-3xl h-full flex flex-col relative">
      {/* Toast */}
      {toastNotification?.visible && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] bg-white border p-4 rounded-2xl shadow-2xl min-w-[320px] flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-600 text-white flex items-center justify-center shrink-0"><Bell className="w-5 h-5 animate-swing" /></div>
          <div className="flex-1"><h4 className="font-extrabold text-sm text-slate-900">{toastNotification.title}</h4><p className="text-xs text-slate-500 font-medium">{toastNotification.desc}</p></div>
          <button onClick={() => setToastNotification(null)} className="p-1"><X className="w-4 h-4 text-slate-400" /></button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 shrink-0 w-full flex-wrap">
        <div><h3 className="text-2xl font-black text-slate-900 flex items-center gap-2"><Sparkles className="w-6 h-6 text-purple-500" /> Agenda</h3></div>
        
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          <button onClick={() => {
            const d = new Date(selectedAgendaDate);
            d.setDate(d.getDate() - 1);
            setSelectedAgendaDate([d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-'));
          }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <input 
            type="date" 
            value={selectedAgendaDate} 
            onChange={(e) => setSelectedAgendaDate(e.target.value)}
            className="bg-transparent border-none outline-none font-bold text-sm text-slate-800 text-center w-36 cursor-pointer"
          />
          <button onClick={() => {
            const d = new Date(selectedAgendaDate);
            d.setDate(d.getDate() + 1);
            setSelectedAgendaDate([d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-'));
          }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="flex bg-slate-200/50 p-1 rounded-xl w-full sm:w-auto">
            <button onClick={() => setAgendaMode("day")} className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${agendaMode === 'day' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Dia</button>
            <button onClick={() => setAgendaMode("3days")} className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${agendaMode === '3days' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>3 Dias</button>
            <button onClick={() => setAgendaMode("week")} className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${agendaMode === 'week' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Semana</button>
          </div>
          <button onClick={() => { setIsManualBookingOpen(true); if (services.length > 0) setManualServiceId(services[0].id); if (staff.length > 0) setManualStaffId(staff[0].id); }} className="w-full sm:w-auto bg-slate-900 text-white font-extrabold px-6 py-2.5 rounded-xl text-sm flex justify-center items-center gap-2 shadow-lg"><Plus className="w-4 h-4" /> Nova</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        <div className="lg:col-span-3 flex flex-col h-full">
            <DashboardCalendar business={business} bookings={bookings} services={services} staff={staff} businessHours={businessHours} selectedStaffFilter={selectedStaffFilter} agendaMode={agendaMode} selectedAgendaDate={selectedAgendaDate} onDateSelect={(info: any) => { setSelectedAgendaDate(info.date); setManualDate(info.date); setManualStartTime(info.time); if(info.staffId !== 'all') setManualStaffId(info.staffId); setManualBookingType("booking"); setIsManualBookingOpen(true); }} onBookingClick={(booking: any) => setSelectedBooking(booking)} />
        </div>
        <div className="lg:col-span-1 space-y-6 shrink-0">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60">
            <h3 className="font-black text-slate-800 mb-4">Filtrar</h3>
            <div className="space-y-2">
              <button onClick={() => setSelectedStaffFilter("all")} className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all font-bold text-sm ${selectedStaffFilter === "all" ? "bg-slate-900 text-white" : "hover:bg-slate-50 text-slate-600 border border-slate-100"}`}><div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">👥</div> Ver Todos</button>
              {staff.map((st: any) => (
                <button key={st.id} onClick={() => setSelectedStaffFilter(st.id)} className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all font-bold text-sm ${selectedStaffFilter === st.id ? "bg-purple-100 text-purple-900 ring-2 ring-purple-500" : "hover:bg-slate-50 text-slate-600 border border-slate-100"}`}><img loading="lazy" src={st.avatar_url || `https://ui-avatars.com/api/?name=${st.full_name}`} className="w-8 h-8 rounded-full object-cover shrink-0" /> <span className="truncate">{st.full_name}</span></button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL EDITAR / CONCLUIR */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl flex flex-col text-slate-800 overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b flex justify-between items-center bg-slate-50"><h3 className="font-extrabold text-lg">Detalhes da Reserva</h3><button onClick={() => setSelectedBooking(null)} className="w-8 h-8 rounded-full bg-white shadow-sm border flex items-center justify-center"><X className="w-4 h-4" /></button></div>
            <div className="p-6 space-y-4">
               <div><p className="text-[10px] uppercase font-bold text-slate-400">Serviço & Notas</p><p className="text-sm font-black text-slate-800">{selectedBooking.notes || 'Marcação'}</p></div>
               <div className="flex justify-between"><div><p className="text-[10px] uppercase font-bold text-slate-400">Hora</p><p className="text-sm font-bold text-slate-800">{selectedBooking.start_time}</p></div><div className="text-right"><p className="text-[10px] uppercase font-bold text-slate-400">Profissional</p><p className="text-sm font-bold text-purple-600">{selectedBooking.staff?.full_name || 'Equipa'}</p></div></div>
            </div>
            <div className="p-4 bg-slate-50 border-t space-y-2">
                              {(() => {
                 const bookingDate = new Date(selectedBooking.booking_date);
                 const isFullyCompleted = (selectedBooking.client_completed && selectedBooking.business_completed) || (selectedBooking.business_completed && (new Date().getTime() - bookingDate.getTime()) > 48 * 60 * 60 * 1000);
                 return (
                   <>
                     {selectedBooking.booking_status === "pending" && (
                       <button onClick={() => handleUpdateBookingStatus("confirmed")} disabled={isUpdatingBooking} className="w-full bg-blue-500 hover:bg-blue-600 transition-colors text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 mb-2"><CheckCircle className="w-5 h-5" /> Confirmar Marcação</button>
                     )}
                     {selectedBooking.booking_status === "completed" ? (
                       <div className="space-y-2">
                         <div className="w-full bg-gradient-to-r from-emerald-500 to-purple-500 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-not-allowed opacity-90">
                           <CheckCircle className="w-5 h-5" /> Serviço Concluído
                         </div>
                       </div>
                     ) : (
                       <button onClick={() => handleUpdateBookingStatus("completed")} disabled={isUpdatingBooking} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-[1.02] transition-transform text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> Confirmar Conclusão</button>
                     )}
                     {selectedBooking.booking_status !== "completed" && selectedBooking.booking_status !== "cancelled" && (
                       <button onClick={() => handleUpdateBookingStatus("cancelled")} disabled={isUpdatingBooking} className="w-full bg-white text-rose-500 hover:bg-rose-50 font-bold py-3 border rounded-xl flex items-center justify-center gap-2 transition-colors mt-2">Cancelar Marcação</button>
                     )}
                   </>
                 );
               })()}
            </div>
          </div>
        </div>
      )}

      
      {/* MODAL DISPUTA */}
      {disputeModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative border-2 border-rose-100 animate-in zoom-in-95">
            <button onClick={() => setDisputeModalOpen(false)} className="absolute top-5 right-5 p-2 bg-slate-100 rounded-full hover:bg-rose-100 text-rose-500"><X className="w-4 h-4" /></button>
            <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2"><ShieldAlert className="text-rose-500 w-6 h-6"/> Reportar Problema</h3>
            <p className="text-sm text-slate-500 mb-6">Esta ação irá abrir uma queixa formal junto da equipa de Suporte Glamzo.</p>
            <form onSubmit={submitDispute} className="space-y-4">
              <select required value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 text-sm rounded-xl outline-none focus:border-rose-500">
                <option value="Cliente não compareceu">Cliente não compareceu (No-show)</option>
                <option value="Cliente recusou-se a pagar">Cliente recusou-se a pagar</option>
                <option value="Comportamento inadequado">Comportamento inadequado</option>
                <option value="Outro problema de cobrança">Outro problema de cobrança</option>
              </select>
              <textarea required rows={4} value={disputeDescription} onChange={(e) => setDisputeDescription(e.target.value)} placeholder="Detalhe o que aconteceu..." className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-rose-500 outline-none text-sm rounded-xl resize-none" />
              <button type="submit" disabled={submittingDispute} className="w-full py-4 bg-rose-600 hover:bg-rose-700 transition-colors text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30">
                {submittingDispute ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldAlert className="w-5 h-5" />} Enviar Queixa Oficial
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVA MARCAÇÃO MANUAL */}
      {isManualBookingOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col text-slate-800 max-h-[85vh] animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl"><h3 className="font-extrabold text-xl text-slate-900">Nova Marcação</h3><button onClick={() => setIsManualBookingOpen(false)} className="w-10 h-10 rounded-full bg-white shadow-sm border flex items-center justify-center"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSaveManualBooking} className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
              <div className="flex p-1 bg-slate-100 rounded-2xl">
                <button type="button" onClick={() => setManualBookingType("booking")} className={`flex-1 text-sm font-bold py-2.5 rounded-xl ${manualBookingType === "booking" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>Cliente</button>
                <button type="button" onClick={() => setManualBookingType("block")} className={`flex-1 text-sm font-bold py-2.5 rounded-xl ${manualBookingType === "block" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500"}`}>Bloqueio</button>
              </div>
              {manualBookingType === "booking" ? (
                <>
                  <div className="space-y-1.5"><label className="text-[11px] font-black uppercase text-slate-400">Nome</label><input type="text" required placeholder="Ex: Maria" value={manualClientName} onChange={(e) => setManualClientName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 outline-none rounded-2xl p-4 text-sm font-bold" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="text-[11px] font-black uppercase text-slate-400">Serviço</label><select value={manualServiceId} onChange={(e) => setManualServiceId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 outline-none rounded-2xl p-4 text-sm font-bold">{services.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                    <div className="space-y-1.5"><label className="text-[11px] font-black uppercase text-slate-400">Equipa</label><select value={manualStaffId} onChange={(e) => setManualStaffId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 outline-none rounded-2xl p-4 text-sm font-bold">{staff.length === 0 ? <option value="all">Toda a Equipa</option> : <option value="" disabled hidden>Selecione um funcionário</option>}{staff.map((st:any) => <option key={st.id} value={st.id}>{st.full_name}</option>)}</select></div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><label className="text-[11px] font-black uppercase text-slate-400">Motivo</label><input type="text" required value={manualReason} onChange={(e) => setManualReason(e.target.value)} className="w-full bg-slate-50 border outline-none rounded-2xl p-4 text-sm font-bold" /></div><div className="space-y-1.5"><label className="text-[11px] font-black uppercase text-slate-400">Duração</label><select value={manualBlockDuration} onChange={(e) => setManualBlockDuration(Number(e.target.value))} className="w-full bg-slate-50 border outline-none rounded-2xl p-4 text-sm font-bold"><option value={15}>15 min</option><option value={30}>30 min</option><option value={45}>45 min</option><option value={60}>1h</option><option value={90}>1h 30m</option><option value={120}>2h</option><option value={180}>3h</option><option value={240}>4h</option><option value={300}>5h</option><option value={480}>8h</option></select></div></div>
              )}
              <div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><label className="text-[11px] font-black uppercase text-slate-400">Data</label><input type="date" required value={manualDate} onChange={(e) => setManualDate(e.target.value)} className="w-full bg-slate-50 border outline-none rounded-2xl p-4 text-sm font-bold" /></div><div className="space-y-1.5"><label className="text-[11px] font-black uppercase text-slate-400">Hora</label><input type="time" required value={manualStartTime} onChange={(e) => setManualStartTime(e.target.value)} className="w-full bg-slate-50 border outline-none rounded-2xl p-4 text-sm font-bold" /></div></div>
              <div className="pt-4 flex gap-3"><button type="button" onClick={() => setIsManualBookingOpen(false)} className="flex-1 bg-white text-slate-700 border text-sm font-bold py-4 rounded-2xl">Cancelar</button><button type="submit" disabled={isSavingManual} className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-black py-4 rounded-2xl shadow-lg">{isSavingManual ? "A guardar..." : "Confirmar"}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
