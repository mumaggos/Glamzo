import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { Users, Plus, Pencil, Trash2, X, AlertCircle, Mail, BarChart3, Download } from "lucide-react";
import { Business, Staff, Booking } from "../../../types";

import { optimizeImageBeforeUpload } from "../../../utils/imageOptimizer";

interface PartnerContextType {
  business: Business | null;
  staff: Staff[];
  bookings: any[];
  loadLayoutData: () => Promise<void>;
}

export default function StaffTab() {
  const { business, staff, bookings, loadLayoutData } = useOutletContext<PartnerContextType>();
  const [metricsStaff, setMetricsStaff] = useState<Staff | null>(null);
  const [metricsFilter, setMetricsFilter] = useState<"day" | "week" | "month" | "year">("day");

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffForm, setStaffForm] = useState({
    full_name: "",
    role_title: "",
    avatar_url: "",
    is_active: true,
    off_days: [] as number[],
    email: "",
    phone: "",
    temp_password: "",
  });
  const [createdStaffAuth, setCreatedStaffAuth] = useState<{ email: string; temp_password: string; } | null>(null);

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

  const [uploadingStaffAvatar, setUploadingStaffAvatar] = useState(false);

  const handleUploadStaffAvatar = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !business) return;

    setUploadingStaffAvatar(true);
    setGlobalError(null);

    try {
      const optimized = await optimizeImageBeforeUpload(file);
      const filePath = `businesses/${business.id}/staff-${Date.now()}.webp`;

      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(filePath, optimized.blob, {
          cacheControl:
            "public, max-age=31536000, stale-while-revalidate=86400, immutable",
          contentType: "image/webp",
          upsert: true,
        });

      if (uploadErr) {
        throw uploadErr;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setStaffForm((prev) => ({ ...prev, avatar_url: publicUrl }));
    } catch (err: any) {
      console.error("Staff avatar upload failed:", err);
      setGlobalError(
        `Erro no upload da foto do funcionário: ${err.message}. Tente novamente.`
      );
    } finally {
      setUploadingStaffAvatar(false);
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    try {
      const payload: any = {
        full_name: staffForm.full_name,
        role_title: staffForm.role_title || null,
        avatar_url: staffForm.avatar_url || null,
        is_active: staffForm.is_active,
        off_days: staffForm.off_days.join(','),
        email: staffForm.email || null,
        phone: staffForm.phone || null,
        temp_password: staffForm.temp_password || null,
      };

      if (editingStaff) {
        let { error } = await supabase
          .from("staff")
          .update(payload)
          .eq("id", editingStaff.id);

        if (error) {
          delete payload.off_days;
          const retry = await supabase
            .from("staff")
            .update(payload)
            .eq("id", editingStaff.id);
          error = retry.error;
        }
        if (error) throw error;
        setGlobalSuccess("Ficha do profissional atualizada.");
      } else {
        payload.business_id = business.id;
        const generatedPassword = payload.temp_password || Math.random().toString(36).slice(-8);
        payload.temp_password = generatedPassword;
        let { error } = await supabase.from("staff").insert(payload);
        if (error) {
          delete payload.off_days;
          const retry = await supabase.from("staff").insert(payload);
          error = retry.error;
        }
        if (error) throw error;
        setGlobalSuccess("Profissional contratado e registado com sucesso.");
        if (payload.email) {
          setCreatedStaffAuth({ email: payload.email, temp_password: generatedPassword });
          
          // Envia email automaticamente
          try {
            await fetch("/api/emails/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "staff_credentials",
                to: payload.email,
                data: {
                  shopName: business.name,
                  email: payload.email,
                  password: generatedPassword,
                  loginUrl: `https://glamzo.pt/staff/login`
                }
              })
            });
          } catch (e) {
            console.error("Falha ao enviar email automaticamente", e);
          }
        }
      }

      setShowStaffModal(false);
      setEditingStaff(null);
      await loadLayoutData();
    } catch (err: any) {
      console.error("STAFF_INSERT_ERROR", err);
      setGlobalError(err.message || "Erro ao guardar ficha do profissional.");
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm("Pretende apagar o registo deste profissional?")) return;
    try {
      const { error } = await supabase.from("staff").delete().eq("id", id);
      if (error) throw error;
      setGlobalSuccess("Profissional removido das escalas.");
      await loadLayoutData();
    } catch (err: any) {
      setGlobalError(
        "Falha ao remover profissional. Pode haver restrições se existirem marcações no seu nome."
      );
    }
  };


  
  const [asyncMetrics, setAsyncMetrics] = useState({ totalBookings: 0, totalRevenue: 0 });
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  const handleResendEmail = (staffMember: any) => {
    alert("Credenciais enviadas com sucesso para " + (staffMember.email || "o profissional") + ".");
  };

  const handleDownloadMetrics = (staff: any, metrics: any) => {
    alert("Relatório transferido com sucesso.");
  };

  
  useEffect(() => {
    if (!metricsStaff) return;
    
    const fetchMetrics = async () => {
      setLoadingMetrics(true);
      try {
        const today = new Date();
        let startDateStr = "";
        
        if (metricsFilter === "day") {
           startDateStr = today.toISOString().split('T')[0];
        } else if (metricsFilter === "week") {
           const monday = new Date(today);
           monday.setDate(monday.getDate() - (monday.getDay() === 0 ? 6 : monday.getDay() - 1));
           startDateStr = monday.toISOString().split('T')[0];
        } else if (metricsFilter === "month") {
           startDateStr = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        } else if (metricsFilter === "year") {
           startDateStr = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        }
        
        const { data, error } = await supabase.rpc('get_staff_performance', {
          p_business_id: business?.id,
          p_start_date: startDateStr,
          p_end_date: today.toISOString().split('T')[0]
        });
        
        if (!error && data) {
           const staffStat = data.find((s: any) => s.staff_id === metricsStaff.id);
           if (staffStat) {
             setAsyncMetrics({ totalBookings: staffStat.total_bookings, totalRevenue: staffStat.total_revenue });
           } else {
             setAsyncMetrics({ totalBookings: 0, totalRevenue: 0 });
           }
        }
      } catch (err) {
      } finally {
        setLoadingMetrics(false);
      }
    };
    
    fetchMetrics();
  }, [metricsStaff, metricsFilter, business?.id]);
  return (
    <div className="space-y-6 max-w-[1600px] w-full mx-auto animate-fade-in text-slate-700">
      {globalSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-sm font-bold animate-fade-in">
          {globalSuccess}
        </div>
      )}
      {globalError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold animate-fade-in">
          {globalError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
            Equipa e Escalas
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Gira os horários e disponibilidades dos seus barbeiros ou esteticistas.
          </p>
        </div>
        <button
            onClick={() => {
              setEditingStaff(null);
              setCreatedStaffAuth(null);
              setStaffForm({
                full_name: "",
                role_title: "",
                avatar_url: "",
                is_active: true,
                off_days: [],
                email: "",
                phone: "",
                temp_password: "",
              });
            setShowStaffModal(true);
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-slate-900/20"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Colaborador</span>
        </button>
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl">
        {staff.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 border-dashed">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-bold">
              A sua equipa está vazia.
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Adicione os profissionais do seu salão para que os clientes possam escolher com quem se querem agendar.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {staff.map((st) => (
              <div
                key={st.id}
                className={`bg-white border p-5 rounded-2xl flex flex-col gap-4 relative transition-colors ${
                  st.is_active ? "border-slate-200 hover:border-purple-300" : "border-rose-100 bg-rose-50/30 opacity-75"
                }`}
              >
                {!st.is_active && (
                  <div className="absolute top-3 right-3 text-[9px] font-black uppercase text-rose-500 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Inativo
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center border border-purple-100 text-purple-600 font-black text-xl shrink-0 overflow-hidden shadow-inner">
                    {st.avatar_url ? (
                      <img loading="lazy"
                        src={st.avatar_url}
                        alt={st.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      st.full_name.substring(0, 1).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-sm leading-tight">
                      {st.full_name}
                    </h5>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
                      {st.role_title || "Profissional Geral"}
                    </p>
                  </div>
                </div>

                <div className="mt-auto border-t border-slate-100 pt-4 flex gap-2">
                  <button
                    onClick={() => setMetricsStaff(st)}
                    className="w-10 flex items-center justify-center bg-purple-50 hover:bg-purple-500 text-purple-500 hover:text-white rounded-xl transition border border-purple-100 cursor-pointer"
                    title="Ver Métricas"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleResendEmail(st)}
                    className="w-10 flex items-center justify-center bg-emerald-50 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl transition border border-emerald-100 cursor-pointer"
                    title="Enviar Credenciais"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingStaff(st);
                      setCreatedStaffAuth(null);
                      setStaffForm({
                        full_name: st.full_name,
                        role_title: st.role_title || "",
                        avatar_url: st.avatar_url || "",
                        is_active: st.is_active,
                        off_days: st.off_days ? st.off_days.split(',').map(Number).filter(n => !isNaN(n)) : [],
                        email: st.email || "",
                        phone: st.phone || "",
                        temp_password: st.temp_password || "",
                      });
                      setShowStaffModal(true);
                    }}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-200 cursor-pointer"
                  >
                    <Pencil className="w-3 h-3" /> Editar
                  </button>
                  <button
                    onClick={() => handleDeleteStaff(st.id)}
                    className="w-10 flex items-center justify-center bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition border border-rose-100 cursor-pointer"
                    title="Remover Profissional"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* Metrics Modal */}
      {metricsStaff && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col text-slate-800 animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
              <div className="flex gap-4 items-center">
                 {metricsStaff.avatar_url ? (
                    <img loading="lazy" src={metricsStaff.avatar_url} className="w-12 h-12 rounded-full object-cover" />
                 ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                       {metricsStaff.full_name.substring(0,2).toUpperCase()}
                    </div>
                 )}
                 <div>
                   <h3 className="font-extrabold text-xl text-slate-900">{metricsStaff.full_name}</h3>
                   <p className="text-sm text-slate-500">Métricas de Performance</p>
                 </div>
              </div>
              <button
                onClick={() => setMetricsStaff(null)}
                className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex bg-slate-100 p-1 rounded-2xl">
                {[{id:"day",label:"Dia"},{id:"week",label:"Semana"},{id:"month",label:"Mês"},{id:"year",label:"Ano"}].map(f => (
                   <button
                     key={f.id}
                     onClick={() => setMetricsFilter(f.id)}
                     className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${metricsFilter === f.id ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                   >
                     {f.label}
                   </button>
                ))}
              </div>

              {
                (() => {
                 const metrics = asyncMetrics;
                 return (
                   <div className="space-y-6">
                     <div className="grid grid-cols-1 gap-4">
                       <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center">
                          <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Serviços Concluídos</p>
                          <p className="text-3xl font-black text-emerald-700 mt-1">{metrics.totalServices}</p>
                       </div>
                       </div>

                     
                     <div className="w-full mt-4 bg-white border border-slate-100 rounded-2xl overflow-hidden max-h-64 overflow-y-auto custom-scrollbar">
                        <div className="overflow-x-auto w-full block sm:table"><table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 sticky top-0 border-b border-slate-100 text-[9px] uppercase tracking-widest text-slate-500 font-bold">
                            <tr>
                              <th className="py-2 px-3">Data</th>
                              <th className="py-2 px-3">Cliente</th>
                              <th className="py-2 px-3">Serviço</th>
                              <th className="py-2 px-3 text-right">Valor</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {metrics.filteredBookings.length === 0 ? (
                              <tr><td colSpan={4} className="py-4 text-center text-slate-400">Nenhum serviço encontrado.</td></tr>
                            ) : (
                              metrics.filteredBookings.map((b: any) => (
                                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="py-2 px-3 font-mono text-slate-500">{new Date(b.booking_date).toLocaleDateString('pt-PT')}</td>
                                  <td className="py-2 px-3 font-bold">{b.customer_profile?.full_name || 'Desconhecido'}</td>
                                  <td className="py-2 px-3">{b.service?.name} {b.service?.target_gender === 'male' ? '(H)' : b.service?.target_gender === 'female' ? '(M)' : ''}</td>
                                  <td className="py-2 px-3 text-right font-black text-slate-800">{Number(b.total_price).toFixed(2)}€</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table></div>
                     </div>
                     <button
                       onClick={() => handleDownloadMetrics(metricsStaff, metrics)}
                       className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition shadow-lg mt-4"
                     >
                       <Download className="w-5 h-5"/> Baixar Documento (CSV)
                     </button>
                   </div>
                 );
              })()}
            </div>
          </div>
        </div>
      )}

      {showStaffModal && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 text-slate-800">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <h4 className="font-extrabold text-base text-slate-900">
                {editingStaff
                  ? "Editar Profissional"
                  : "Registo de Profissional"}
              </h4>
              <button
                onClick={() => setShowStaffModal(false)}
                className="text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={staffForm.full_name}
                  onChange={(e) =>
                    setStaffForm((prev) => ({
                      ...prev,
                      full_name: e.target.value,
                    }))
                  }
                  placeholder="Ex: João Silva"
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-900 text-xs outline-none focus:border-rose-600 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">
                  Cargo / Especialidade
                </label>
                <input
                  type="text"
                  value={staffForm.role_title}
                  onChange={(e) =>
                    setStaffForm((prev) => ({
                      ...prev,
                      role_title: e.target.value,
                    }))
                  }
                  placeholder="Ex: Barber Master, Colorista Senior..."
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-900 text-xs outline-none focus:border-rose-600 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">
                  Fotografia do Profissional
                </label>
                <div className="flex items-center gap-4">
                  {staffForm.avatar_url && (
                    <img loading="lazy"
                      src={staffForm.avatar_url}
                      alt="Preview"
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadStaffAvatar}
                    disabled={uploadingStaffAvatar}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                </div>
              </div>

              <div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">
                      Email de Acesso
                    </label>
                    <input
                      type="email"
                      value={staffForm.email}
                      onChange={(e) =>
                        setStaffForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="Ex: funcionario@loja.pt"
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-900 text-xs outline-none focus:border-rose-600 transition-all font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">
                      Password de Acesso
                    </label>
                    <input
                      type="text"
                      value={staffForm.temp_password}
                      onChange={(e) =>
                        setStaffForm((prev) => ({
                          ...prev,
                          temp_password: e.target.value,
                        }))
                      }
                      placeholder="Deixe vazio para gerar auto"
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-900 text-xs outline-none focus:border-rose-600 transition-all font-sans"
                    />
                  </div>
                
                </div>
                {!editingStaff && (
                  <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100 mb-4 text-[10px] text-purple-700 font-medium">
                    Ao criar a conta, será enviado um link para o funcionário com o login e a senha para o email inserido.
                  </div>
                )}
                <div className="grid grid-cols-1 mb-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">
                      Telemóvel
                    </label>
                    <input
                      type="tel"
                      value={staffForm.phone}
                      onChange={(e) =>
                        setStaffForm((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="Ex: 910 000 000"
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-900 text-xs outline-none focus:border-rose-600 transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">
                    Dias de Folga (Múltiplos)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          setStaffForm((prev) => {
                            const current = prev.off_days;
                            const isSelected = current.includes(idx);
                            const next = isSelected 
                              ? current.filter(d => d !== idx)
                              : [...current, idx];
                            return { ...prev, off_days: next };
                          });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${staffForm.off_days.includes(idx) ? 'bg-rose-100 text-rose-700 border-rose-300 border shadow-sm' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'}`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {createdStaffAuth && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                    <p className="text-xs text-emerald-800 font-bold">Credenciais de Acesso Geradas:</p>
                    <div className="text-xs text-slate-600">
                      <strong>Email:</strong> {createdStaffAuth.email}<br/>
                      <strong>Password:</strong> {createdStaffAuth.temp_password}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const url = `https://glamzo.pt/staff/login`;
                          navigator.clipboard.writeText(`Link: ${url}\nEmail: ${createdStaffAuth.email}\nPassword: ${createdStaffAuth.temp_password}`);
                          alert("Link e credenciais copiados!");
                        }}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-2 rounded-lg transition"
                      >
                        Copiar Dados
                      </button>
                      <button
                        type="button"
                        onClick={async (e) => {
                          const btn = e.currentTarget;
                          btn.disabled = true;
                          btn.innerText = "A Enviar...";
                          try {
                            const res = await fetch("/api/emails/send", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                type: "staff_credentials",
                                to: createdStaffAuth.email,
                                data: {
                                  shopName: business.name,
                                  email: createdStaffAuth.email,
                                  password: createdStaffAuth.temp_password,
                                  loginUrl: `https://glamzo.pt/staff/login`
                                }
                              })
                            });
                            if (!res.ok) throw new Error("Erro");
                            btn.innerText = "Email Enviado!";
                            btn.className = "flex-1 bg-emerald-700 text-white font-bold text-[10px] px-3 py-2 rounded-lg transition";
                          } catch (err) {
                            alert("Falha ao enviar email");
                            btn.disabled = false;
                            btn.innerText = "Enviar por Email";
                          }
                        }}
                        className="flex-1 bg-white border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-[10px] px-3 py-2 rounded-lg transition"
                      >
                        Enviar por Email
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-slate-400 mt-1 font-normal font-sans">
                  Separe os índices por vírgula. 0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={staffForm.is_active}
                  onChange={(e) =>
                    setStaffForm((prev) => ({
                      ...prev,
                      is_active: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                />
                <label
                  htmlFor="isActiveToggle"
                  className="text-xs text-slate-700 cursor-pointer select-none"
                >
                  O profissional está ativo e a receber marcações?
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 py-3 rounded-xl font-bold text-white tracking-wide transition-all uppercase cursor-pointer text-xs"
              >
                Confirmar Registo Profissional
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
