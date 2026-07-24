import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useOutletContext } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { Clock, CheckCircle2, Copy } from "lucide-react";
import { Business, BusinessHours } from "../../../types";

interface PartnerContextType {
  business: Business | null;
}

export default function HoursTab() {
    const { t } = useTranslation();
  const { business } = useOutletContext<PartnerContextType>();
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

  
  const [localHours, setLocalHours] = useState<Record<number, { open_time: string, close_time: string, is_closed: boolean, id?: string }>>({});
  const [isSaving, setIsSaving] = useState(false);

  const loadHours = async () => {
    if (!business) return;
    try {
      const { data, error } = await supabase
        .from("business_hours")
        .select("*")
        .eq("business_id", business.id);

      if (error) throw error;
      
      const loaded: Record<number, any> = {};
      (data || []).forEach(h => {
        loaded[h.weekday] = {
          id: h.id,
          open_time: h.open_time,
          close_time: h.close_time,
          is_closed: h.is_closed
        };
      });
      setLocalHours(loaded);
    } catch (err) {
      console.error("Error loading hours", err);
    }
  };

  useEffect(() => {
    loadHours();
  }, [business]);

  const handleLocalChange = (dayIndex: number, field: string, value: any) => {
    setLocalHours(prev => {
      const current = prev[dayIndex] || { open_time: "09:00", close_time: "19:00", is_closed: false };
      return { ...prev, [dayIndex]: { ...current, [field]: value } };
    });
  };

  const handleCopyHoursToAll = (sourceWeekday: number) => {
    const sourceDay = localHours[sourceWeekday] || { open_time: "09:00", close_time: "19:00", is_closed: false };
    setLocalHours(prev => {
      const next = { ...prev };
      for (let i = 0; i < 7; i++) {
        if (i !== sourceWeekday) {
          next[i] = {
            ...next[i],
            open_time: sourceDay.open_time,
            close_time: sourceDay.close_time,
            is_closed: sourceDay.is_closed
          };
        }
      }
      return next;
    });
    setGlobalSuccess("Horário copiado para todos os dias. Não se esqueça de guardar!");
    setTimeout(() => setGlobalSuccess(null), 3000);
  };

  const saveAllHours = async () => {
    if (!business) return;
    setIsSaving(true);
    setGlobalError(null);
    setGlobalSuccess(null);

    try {
      const promises = [0, 1, 2, 3, 4, 5, 6].map(dayIndex => {
        const h = localHours[dayIndex] || { open_time: "09:00", close_time: "19:00", is_closed: false };
        if (h.id) {
          return supabase.from("business_hours").update({
            open_time: h.open_time,
            close_time: h.close_time,
            is_closed: h.is_closed
          }).eq("id", h.id);
        } else {
          return supabase.from("business_hours").insert({
            business_id: business.id,
            weekday: dayIndex,
            open_time: h.open_time,
            close_time: h.close_time,
            is_closed: h.is_closed
          });
        }
      });
      await Promise.all(promises);
      setGlobalSuccess("Horários de funcionamento guardados com sucesso!");
      await loadHours();
    } catch (err) {
      console.error("Error saving hours:", err);
      setGlobalError("Erro ao guardar horários.");
    } finally {
      setIsSaving(false);
    }
  };

  const timeList = Array.from({ length: 34 }, (_, i) => {
    const h = Math.floor(6 + i / 2);
    const m = i % 2 === 0 ? "00" : "30";
    return `${String(h).padStart(2, "0")}:${m}`;
  });


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
            
                                  {t('txt_hor_rios_de_funcionamento') || 'Horários de Funcionamento'}
                                </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            
                                  {t('txt_defina_em_que_hor_rios_a_sua_l') || 'Defina em que horários a sua loja aceita marcações online.'}
                                </p>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
          {[
            { id: 1, label: t('day_monday') || 'Segunda-feira' },
            { id: 2, label: t('day_tuesday') || 'Terça-feira' },
            { id: 3, label: t('day_wednesday') || 'Quarta-feira' },
            { id: 4, label: t('day_thursday') || 'Quinta-feira' },
            { id: 5, label: t('day_friday') || 'Sexta-feira' },
            { id: 6, label: t('day_saturday') || 'Sábado' },
            { id: 0, label: t('day_sunday') || 'Domingo' },
          ].map((day) => {
            const currentDay = localHours[day.id];
            const isClosed = currentDay ? currentDay.is_closed : false;
            const openTime = currentDay?.open_time ? currentDay.open_time.substring(0, 5) : "09:00";
            const closeTime = currentDay?.close_time ? currentDay.close_time.substring(0, 5) : "19:00";

            return (
              <div
                key={day.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-5 gap-4 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-4 w-48 shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                      isClosed
                        ? "bg-slate-100 border-slate-200 text-slate-400"
                        : "bg-purple-50 border-purple-100 text-purple-600"
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">
                    {day.label}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={openTime}
                    disabled={isClosed}
                    onChange={(e) =>
                      handleLocalChange(day.id, "open_time", e.target.value)
                    }
                    className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg p-2.5 focus:border-purple-500 focus:outline-none disabled:opacity-50 appearance-none cursor-pointer"
                  >
                    {timeList.map((t) => (
                      <option key={`open-${t}`} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <span className="text-slate-400 font-bold">-</span>
                  <select
                    value={closeTime}
                    disabled={isClosed}
                    onChange={(e) =>
                      handleLocalChange(day.id, "close_time", e.target.value)
                    }
                    className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg p-2.5 focus:border-purple-500 focus:outline-none disabled:opacity-50 appearance-none cursor-pointer"
                  >
                    {timeList.map((t) => (
                      <option key={`close-${t}`} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>

                  <label className="flex items-center gap-2 ml-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isClosed}
                      onChange={(e) =>
                        handleLocalChange(day.id, "is_closed", e.target.checked)
                      }
                      className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-600 select-none">
                      
                                                      {t('txt_fechado_214') || 'Fechado'}
                                                    </span>
                  </label>
                </div>

                <div className="w-full md:w-auto flex justify-end">
                  <button
                    onClick={() => handleCopyHoursToAll(day.id)}
                    className="text-slate-400 hover:text-purple-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer p-2 hover:bg-purple-50 rounded-lg"
                  >
                    <Copy className="w-3 h-3" />  {t('txt_copiar_para_todos') || 'Copiar para todos'}
                                              </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="flex justify-end pt-4 pb-10">
        <button
          onClick={saveAllHours}
          disabled={isSaving}
          className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2"
        >
          {isSaving ? <span className="animate-pulse">{t('txt_a_guardar') || 'A Guardar...'}</span> : <CheckCircle2 className="w-5 h-5" />}
          {!isSaving && "Guardar Alterações"}
        </button>
      </div>
    </div>
  );
}
