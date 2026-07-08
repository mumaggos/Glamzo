import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { LogOut, Calendar, Clock, User, Scissors, Settings, Camera } from "lucide-react";
import { optimizeImageBeforeUpload } from "../../utils/imageOptimizer";
import { Staff, Booking, Service } from "../../types";

export default function StaffDashboard() {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"agenda" | "settings">("agenda");
  
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

  const loadDashboardData = async (staffId: string, businessId: string) => {
    try {
      setLoading(true);
      
      // Verify if staff is still active
      const { data: staffData } = await supabase.from('staff').select('is_active').eq('id', staffId).single();
      if (!staffData || !staffData.is_active) {
        handleLogout();
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      
      const [bookingsRes, servicesRes] = await Promise.all([
        supabase
          .from("bookings")
          .select("*, customer_profile:customer_profiles(*)")
          .eq("business_id", businessId)
          .eq("booking_date", today)
          .eq("staff_id", staffId)
          .neq("booking_status", "cancelled")
          .order("start_time", { ascending: true }),
        supabase
          .from("services")
          .select("*")
          .eq("business_id", businessId)
      ]);

      if (bookingsRes.data) setBookings(bookingsRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
      
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin text-purple-600">
          <Scissors className="w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0">
            {staff.avatar_url ? (
               <img src={staff.avatar_url} alt={staff.full_name} className="w-full h-full object-cover" />
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
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              A Minha Agenda de Hoje
            </h2>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {bookings.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {bookings.map((booking) => {
                    const service = services.find(s => s.id === booking.service_id);
                    return (
                      <div key={booking.id} className="p-4 flex gap-4 hover:bg-slate-50 transition">
                        <div className="flex flex-col items-center justify-start pt-1">
                          <span className="text-sm font-black text-slate-900">{booking.start_time.substring(0, 5)}</span>
                          <span className="text-[10px] font-bold text-slate-400">{booking.end_time.substring(0, 5)}</span>
                        </div>
                        <div className="flex-1 border-l-2 border-purple-200 pl-4">
                          <h3 className="font-bold text-sm text-slate-900">
                            {booking.customer_profile?.full_name || "Cliente"}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {service?.name || "Serviço"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <Clock className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                  <p className="font-bold text-sm">Sem marcações para hoje</p>
                  <p className="text-xs mt-1">Aproveite para descansar!</p>
                </div>
              )}
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
                     <img src={staff.avatar_url} alt={staff.full_name} className="w-full h-full object-cover" />
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
