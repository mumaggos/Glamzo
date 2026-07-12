import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { DashboardCalendar } from "../../components/DashboardCalendar";
import { LogOut, Calendar, Clock, User, Scissors, Settings, Camera, Plus, X, Trash2 } from "lucide-react";
import { optimizeImageBeforeUpload } from "../../utils/imageOptimizer";
import { Staff, Booking, Service } from "../../types";

export default function StaffDashboard() {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"agenda" | "settings">("agenda");
  const [businessHours, setBusinessHours] = useState<any[]>([]);
  const [business, setBusiness] = useState<any>(null);
  const [agendaMode, setAgendaMode] = useState<"day" | "3days" | "week">("day");
  const [selectedAgendaDate, setSelectedAgendaDate] = useState<string>(new Date().toISOString().split("T")[0]);
  
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [manualBookingType, setManualBookingType] = useState<"booking" | "block">("booking");
  const [manualClientName, setManualClientName] = useState("");
  const [manualReason, setManualReason] = useState("");
  const [manualBlockDuration, setManualBlockDuration] = useState(60);
  const [manualServiceId, setManualServiceId] = useState("");
  const [manualDate, setManualDate] = useState(new Date().toISOString().split("T")[0]);
  const [manualStartTime, setManualStartTime] = useState("09:00");
  const [manualNotes, setManualNotes] = useState("");
  const [isSavingManual, setIsSavingManual] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  
  // Settings state
  const [newPassword, setNewPassword] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const session = localStorage.getItem('staff_session');
    if (!session) {
      navigate('/staff/login');
      return;
    }
    
    try {
      const parsedStaff = JSON.parse(session);
      setStaff(parsedStaff);
      loadDashboardData(parsedStaff.id, parsedStaff.business_id);
    } catch (e) {
      navigate('/staff/login');
    }
  }, [navigate]);


  const handleSaveManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff) return;
    setIsSavingManual(true);
    try {
      let finalServiceId = manualServiceId || (services.length > 0 ? services[0].id : null);
      const selectedSvc = services.find((s: any) => s.id === finalServiceId);
      const svcPrice = selectedSvc ? Number(selectedSvc.price) : 0;
      const [startH, startM] = manualStartTime.split(":").map(Number);
      const duration = manualBookingType === "block" ? manualBlockDuration : (selectedSvc ? Number(selectedSvc.duration_minutes) : 15);
      const totalMinutes = startH * 60 + startM + duration;
      const endTimeStr = `${String(Math.floor(totalMinutes / 60) % 24).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;
      
      const payloadNotes = manualBookingType === "block" 
        ? `🛑 BLOQUEIO: ${manualReason}` 
        : `Manual: ${manualClientName} ${manualNotes}`;

      const { data: bData } = await supabase.from('businesses').select('owner_id').eq('id', staff.business_id).single();
      const fallbackCustomerId = bData?.owner_id || null;


      const payload = {
        customer_id: fallbackCustomerId, business_id: staff.business_id, service_id: finalServiceId, staff_id: staff.id,
        booking_date: manualDate, start_time: manualStartTime, end_time: endTimeStr,
        total_price: manualBookingType === "block" ? 0 : svcPrice, payment_method: "local",
        payment_status: manualBookingType === "block" ? "paid" : "unpaid", booking_status: "confirmed", notes: payloadNotes,
      };
      const response = await fetch('/api/staff/bookings/create', {
         method: 'POST', headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ payload })
      });
      const resData = await response.json();
      if (resData.error) throw new Error(resData.error);

      
      setIsManualBookingOpen(false);
      setManualClientName(""); setManualReason(""); setManualNotes("");
      loadDashboardData(staff.id, staff.business_id);
    } catch (err: any) { alert("Erro: " + err.message); } finally { setIsSavingManual(false); }
  };


  const handleUpdateBookingStatus = async (status: string) => {
    if (!selectedBooking) return;
    try {
      const response = await fetch('/api/staff/bookings/update', {
         method: 'POST', headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ id: selectedBooking.id, payload: { booking_status: status } })
      });
      const resData = await response.json();
      if (resData.error) throw new Error(resData.error);
      
      setSelectedBooking(null);
      if (staff) loadDashboardData(staff.id, staff.business_id);
    } catch (err: any) { alert("Erro ao atualizar o estado."); }
  };

  const loadDashboardData = async (staffId: string, businessId: string) => {
    try {
      setLoading(true);
      
      // Verify if staff is still active
      const { data: staffData } = await supabase.from('staff').select('is_active').eq('id', staffId).single();
      if (!staffData || !staffData.is_active) {
        handleLogout();
        return;
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const limitDate = thirtyDaysAgo.toISOString().split('T')[0];

      const [bookingsRes, servicesRes, businessHoursRes, businessRes] = await Promise.all([
        fetch('/api/staff/bookings/query', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId, staffId, limitDate })
        }).then(res => res.json()),
        supabase
          .from("services")
          .select("*")
          .eq("business_id", businessId),
        supabase
          .from("business_hours")
          .select("*")
          .eq("business_id", businessId),
        supabase
          .from("businesses")
          .select("*")
          .eq("id", businessId)
          .single()
      ]);

      if (bookingsRes.data) setBookings(bookingsRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
      if (businessHoursRes.data) setBusinessHours(businessHoursRes.data);
      if (businessRes.data) setBusiness(businessRes.data);
      
    } catch (error) {
      console.error("Error loading staff dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('staff_session');
    navigate('/staff/login');
  };
  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !staff) return;
    
    setUploadingAvatar(true);
    try {
      const optimized = await optimizeImageBeforeUpload(file);
      const filePath = `staff_avatars/${staff.id}-${Date.now()}.webp`;
      
      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(filePath, optimized.blob, {
          cacheControl: "public, max-age=31536000",
          contentType: "image/webp",
        });
        
      if (uploadErr) throw uploadErr;
      
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      
      const { error: updateErr } = await supabase
        .from('staff')
        .update({ avatar_url: data.publicUrl })
        .eq('id', staff.id);
        
      if (updateErr) throw updateErr;
      
      const updatedStaff = { ...staff, avatar_url: data.publicUrl };
      localStorage.setItem('staff_session', JSON.stringify(updatedStaff));
      setStaff(updatedStaff);
      setSettingsSuccess("Foto de perfil atualizada!");
    } catch (err: any) {
      setSettingsError(err.message || "Erro ao fazer upload da foto.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff) return;
    setSettingsError("");
    setSettingsSuccess("");
    
    try {
      if (!newPassword || newPassword.length < 6) {
        throw new Error("A password deve ter pelo menos 6 caracteres.");
      }
      
      const { error } = await supabase
        .from('staff')
        .update({ temp_password: newPassword })
        .eq('id', staff.id);
        
      if (error) throw error;
      
      setSettingsSuccess("Password alterada com sucesso.");
      
      // Update local storage
      const updatedStaff = { ...staff, temp_password: newPassword };
      localStorage.setItem('staff_session', JSON.stringify(updatedStaff));
      setStaff(updatedStaff);
      setNewPassword("");
      
    } catch (err: any) {
      setSettingsError(err.message || "Erro ao atualizar.");
    }
  };

  if (loading || !staff) {
    return (
      <div className="absolute inset-0 bg-slate-50 z-50 flex items-center justify-center">
        <div className="animate-spin text-purple-600">
          <Scissors className="w-8 h-8" />
        </div>
      </div>
    );
  }

  const hasValidSubscription = business?.subscription_status === 'active' || (business?.subscription_status === 'trialing' && business?.trial_ends_at && new Date(business.trial_ends_at) > new Date());

  if (business && !hasValidSubscription) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
          <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Sistema em Pausa</h2>
        <p className="text-sm text-slate-500 max-w-sm mb-8 leading-relaxed">
          O acesso à plataforma do seu espaço encontra-se temporariamente suspenso. Por favor, contacte a gerência para restabelecer a ligação.
        </p>
        <button 
          onClick={async () => { await supabase.auth.signOut(); navigate('/staff/login'); }} 
          className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100 transition shadow-sm"
        >
          Terminar Sessão
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-slate-50 z-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0">
            {staff.avatar_url ? (
               <img loading="lazy" src={staff.avatar_url} alt={staff.full_name} className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full bg-gradient-to-br from-purple-500 to-rose-500 text-white flex items-center justify-center font-bold">
                 {staff.full_name.charAt(0)}
               </div>
            )}
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-slate-900">{staff.full_name.split(' ')[0]}</h1>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{staff.role_title || 'Profissional'}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-slate-600 transition bg-slate-50 rounded-lg"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        {view === "agenda" ? (
          <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                A Minha Agenda
              </h2>
              <div className="flex gap-2">
                 <button onClick={() => { setAgendaMode('day'); setSelectedAgendaDate(new Date().toISOString().split('T')[0]) }} className="text-xs px-3 py-1.5 rounded-full bg-slate-100 font-bold hover:bg-slate-200">Hoje</button>
                 <select value={agendaMode} onChange={(e: any) => setAgendaMode(e.target.value)} className="text-xs px-3 py-1.5 rounded-full bg-slate-100 font-bold hover:bg-slate-200 outline-none">
                    <option value="day">1 Dia</option>
                    <option value="3days">3 Dias</option>
                    <option value="week">Semana</option>
                 </select>
                 <button onClick={() => setIsManualBookingOpen(true)} className="text-xs px-3 py-1.5 rounded-full bg-purple-600 text-white font-bold hover:bg-purple-700 flex items-center gap-1">
                    <Plus className="w-3 h-3"/> Nova
                 </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
               <DashboardCalendar 
                  bookings={bookings} 
                  staff={staff ? [staff] : []} 
                  businessHours={businessHours} 
                  selectedStaffFilter={staff?.id || "all"} 
                  agendaMode={agendaMode} 
                  selectedAgendaDate={selectedAgendaDate} 
                  onDateSelect={(args: any) => {
                     setManualDate(args.date);
                     setManualStartTime(args.time);
                     setIsManualBookingOpen(true);
                  }} 
                  onBookingClick={(b: any) => setSelectedBooking(b)} 
               />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              Configurações
            </h2>
            
            <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
              <div className="flex flex-col items-center justify-center py-4 border-b border-slate-100 mb-4">
                <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden relative group">
                  {staff.avatar_url ? (
                     <img loading="lazy" src={staff.avatar_url} alt={staff.full_name} className="w-full h-full object-cover" />
                  ) : (
                     <div className="w-full h-full bg-gradient-to-br from-purple-500 to-rose-500 text-white flex items-center justify-center font-bold text-3xl">
                       {staff.full_name.charAt(0)}
                     </div>
                  )}
                  <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                  </label>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <div className="animate-spin text-purple-600"><Scissors className="w-5 h-5"/></div>
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">Tocar para alterar foto</p>
                {/* Mobile tap helper */}
                <label className="sm:hidden mt-2 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                  Alterar Foto
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                </label>
              </div>
              {settingsError && (
                <div className="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl text-center">
                  {settingsError}
                </div>
              )}
              {settingsSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl text-center">
                  {settingsSuccess}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Nova Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nova password (min 6 caracteres)"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl transition"
              >
                Atualizar Password
              </button>
            </form>
          </div>
        )}
      </main>



      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white relative">
               <button onClick={() => setSelectedBooking(null)} className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition"><X className="w-4 h-4"/></button>
               <h3 className="font-extrabold text-lg mb-1">{selectedBooking.customer_profile?.full_name || "Cliente sem Nome"}</h3>
               <p className="text-sm opacity-90">{selectedBooking.service?.name || "Serviço Removido"}</p>
            </div>
            <div className="p-6 space-y-4 text-slate-700">
               <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                 <div><p className="text-[10px] font-bold text-slate-400 uppercase">Data</p><p className="font-bold">{new Date(selectedBooking.booking_date).toLocaleDateString('pt-PT')}</p></div>
                 <div className="text-right"><p className="text-[10px] font-bold text-slate-400 uppercase">Horário</p><p className="font-bold">{selectedBooking.start_time.substring(0,5)} - {selectedBooking.end_time.substring(0,5)}</p></div>
               </div>
               {selectedBooking.notes && (
                 <div className="p-3 bg-slate-50 rounded-2xl text-xs font-mono">{selectedBooking.notes}</div>
               )}
               {selectedBooking.booking_status !== 'completed' && !selectedBooking.notes?.includes('🛑 BLOQUEIO') && (
                 <div className="pt-4 flex gap-2">
                   <button onClick={() => handleUpdateBookingStatus('cancelled')} className="flex-1 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl py-3 text-sm font-bold transition">Cancelar</button>
                   <button onClick={() => handleUpdateBookingStatus('completed')} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-3 text-sm font-bold transition shadow-md">Concluir</button>
                 </div>
               )}
               {selectedBooking.notes?.includes('🛑 BLOQUEIO') && (
                 <div className="pt-4 flex gap-2">
                   <button onClick={() => handleUpdateBookingStatus('cancelled')} className="w-full border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl py-3 text-sm font-bold transition">Remover Bloqueio</button>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}


      {/* Manual Booking Modal */}
      {isManualBookingOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center"><h3 className="font-extrabold text-xl">Nova Marcação</h3><button onClick={() => setIsManualBookingOpen(false)}><X className="w-5 h-5"/></button></div>
            <form onSubmit={handleSaveManualBooking} className="p-6 overflow-y-auto space-y-5">
               <div className="flex p-1 bg-slate-100 rounded-2xl">
                 <button type="button" onClick={() => setManualBookingType("booking")} className={`flex-1 text-sm font-bold py-2.5 rounded-xl ${manualBookingType === "booking" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>Cliente</button>
                 <button type="button" onClick={() => setManualBookingType("block")} className={`flex-1 text-sm font-bold py-2.5 rounded-xl ${manualBookingType === "block" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500"}`}>Bloqueio</button>
               </div>
               
               {manualBookingType === "booking" ? (
                 <>
                   <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">Nome do Cliente</label><input type="text" required value={manualClientName} onChange={(e) => setManualClientName(e.target.value)} className="w-full bg-slate-50 border p-3 rounded-xl"/></div>
                   <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">Serviço</label><select value={manualServiceId} onChange={(e) => setManualServiceId(e.target.value)} className="w-full bg-slate-50 border p-3 rounded-xl">{services.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                 </>
               ) : (
                 <div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">Motivo</label><input type="text" required value={manualReason} onChange={(e) => setManualReason(e.target.value)} className="w-full bg-slate-50 border p-3 rounded-xl" /></div><div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">Duração</label><select value={manualBlockDuration} onChange={(e) => setManualBlockDuration(Number(e.target.value))} className="w-full bg-slate-50 border p-3 rounded-xl"><option value={15}>15 min</option><option value={30}>30 min</option><option value={45}>45 min</option><option value={60}>1h</option><option value={90}>1h 30m</option><option value={120}>2h</option><option value={180}>3h</option><option value={240}>4h</option><option value={300}>5h</option><option value={480}>8h</option></select></div></div>
               )}

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">Data</label><input type="date" required value={manualDate} onChange={(e) => setManualDate(e.target.value)} className="w-full bg-slate-50 border p-3 rounded-xl"/></div>
                 <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500">Hora</label><input type="time" required value={manualStartTime} onChange={(e) => setManualStartTime(e.target.value)} className="w-full bg-slate-50 border p-3 rounded-xl"/></div>
               </div>
               
               <button type="submit" disabled={isSavingManual} className="w-full bg-purple-600 text-white font-bold p-4 rounded-xl">{isSavingManual ? "A Guardar..." : "Confirmar"}</button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Nav */}
      <nav className="bg-white border-t border-slate-200 p-3 flex justify-around mt-auto sticky bottom-0 z-10 pb-safe">
        <button 
          onClick={() => setView("agenda")}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition w-20 \${view === "agenda" ? "text-purple-600" : "text-slate-400"}`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-bold">Agenda</span>
        </button>
        <button 
          onClick={() => setView("settings")}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition w-20 \${view === "settings" ? "text-purple-600" : "text-slate-400"}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold">Perfil</span>
        </button>
      </nav>
    </div>
  );
}
