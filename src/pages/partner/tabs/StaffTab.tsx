import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { Users, Plus, Pencil, Trash2, X, AlertCircle } from "lucide-react";
import { Business, Staff } from "../../../types";

import { optimizeImageBeforeUpload } from "../../../utils/imageOptimizer";

interface PartnerContextType {
  business: Business | null;
  staff: Staff[];
  loadLayoutData: () => Promise<void>;
}

export default function StaffTab() {
  const { business, staff, loadLayoutData } = useOutletContext<PartnerContextType>();

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffForm, setStaffForm] = useState({
    full_name: "",
    role_title: "",
    avatar_url: "",
    is_active: true,
    off_days: "",
  });

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
        off_days: staffForm.off_days || null,
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
        let { error } = await supabase.from("staff").insert(payload);

        if (error) {
          delete payload.off_days;
          const retry = await supabase.from("staff").insert(payload);
          error = retry.error;
        }
        if (error) throw error;
        setGlobalSuccess("Profissional contratado e registado com sucesso.");
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
            setStaffForm({
              full_name: "",
              role_title: "",
              avatar_url: "",
              is_active: true,
              off_days: "",
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
                      <img
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
                    onClick={() => {
                      setEditingStaff(st);
                      setStaffForm({
                        full_name: st.full_name,
                        role_title: st.role_title || "",
                        avatar_url: st.avatar_url || "",
                        is_active: st.is_active,
                        off_days: st.off_days || "",
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
                    <img
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
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">
                  Folgas Fixas Semanais
                </label>
                <input
                  type="text"
                  value={staffForm.off_days}
                  onChange={(e) =>
                    setStaffForm((prev) => ({
                      ...prev,
                      off_days: e.target.value,
                    }))
                  }
                  placeholder="Ex: 0,1 (0=Dom, 1=Seg...)"
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-900 text-xs outline-none focus:border-rose-600 transition-all font-sans"
                />
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
