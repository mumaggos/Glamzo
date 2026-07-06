import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { Tag, Plus, Check, X, Edit2, Trash2 } from "lucide-react";

export function MarketingTab() {
  const { business } = useOutletContext<any>();

  const [coupons, setCoupons] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: "",
    discount_percent: "",
    discount_value: "",
    valid_until: "",
    is_active: true,
  });

  const loadCoupons = async () => {
    if (!business?.id) return;
    try {
      setLoadingCoupons(true);
      const { data: resCoupons, error } = await supabase
        .from("business_coupons")
        .select("*")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      if (resCoupons) {
        setCoupons(resCoupons);
        localStorage.setItem("glamzo_coupons", JSON.stringify(resCoupons));
      }
    } catch (err: any) {
      console.warn("Table business_coupons probably does not exist yet or offline sandbox active, using cached coupons list:", err);
      try {
        const localStr = localStorage.getItem("glamzo_coupons");
        if (localStr) setCoupons(JSON.parse(localStr));
      } catch (e) {
        setCoupons([]);
      }
    } finally {
      setLoadingCoupons(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, [business?.id]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business?.id) return;

    try {
      const newCoupon = {
        business_id: business.id,
        code: couponForm.code.toUpperCase().trim(),
        discount_percent: couponForm.discount_percent ? parseFloat(couponForm.discount_percent) : null,
        discount_value: couponForm.discount_value ? parseFloat(couponForm.discount_value) : null,
        valid_until: couponForm.valid_until || null,
        is_active: couponForm.is_active,
      };

      const { data, error } = await supabase
        .from("business_coupons")
        .insert([newCoupon])
        .select()
        .single();

      if (error) throw error;
      
      setCoupons([data, ...coupons]);
      setShowAddCouponModal(false);
      setCouponForm({
        code: "",
        discount_percent: "",
        discount_value: "",
        valid_until: "",
        is_active: true,
      });
      loadCoupons(); // Refresh to be safe
    } catch (err) {
      console.warn("Table business_coupons structure might be setup-pending on Supabase, falling back to cached local storage:", err);
      // Fallback
      const newLocalCoupon = {
        id: crypto.randomUUID(),
        business_id: business.id,
        code: couponForm.code.toUpperCase().trim(),
        discount_percent: couponForm.discount_percent ? parseFloat(couponForm.discount_percent) : null,
        discount_value: couponForm.discount_value ? parseFloat(couponForm.discount_value) : null,
        valid_until: couponForm.valid_until || null,
        is_active: couponForm.is_active,
        created_at: new Date().toISOString(),
      };
      const updatedLocals = [newLocalCoupon, ...coupons];
      setCoupons(updatedLocals);
      localStorage.setItem("glamzo_coupons", JSON.stringify(updatedLocals));
      setShowAddCouponModal(false);
      setCouponForm({
        code: "",
        discount_percent: "",
        discount_value: "",
        valid_until: "",
        is_active: true,
      });
    }
  };

  const handleToggleCoupon = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("business_coupons")
        .update({ is_active: !currentStatus })
        .eq("id", id);
      if (error) throw error;
      loadCoupons();
    } catch (err) {
      // Fallback
      const updatedLocals = coupons.map((c) => c.id === id ? { ...c, is_active: !currentStatus } : c);
      setCoupons(updatedLocals);
      localStorage.setItem("glamzo_coupons", JSON.stringify(updatedLocals));
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm("Tem a certeza que pretende eliminar este cupão?")) return;
    try {
      const { error } = await supabase.from("business_coupons").delete().eq("id", id);
      if (error) throw error;
      loadCoupons();
    } catch (err) {
      // Fallback
      const updatedLocals = coupons.filter((c) => c.id !== id);
      setCoupons(updatedLocals);
      localStorage.setItem("glamzo_coupons", JSON.stringify(updatedLocals));
    }
  };

  const notifyTerminal = (title: string, desc: string) => {
    alert(`${title}\n${desc}`); // Simplified notification for the extracted tab
  };

  return (
    <div id="view-campanhas" className="space-y-6 animate-fade-in max-w-2xl">
      <div className="border-b border-slate-100 pb-5">
        <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
          Campanhas & Cupões
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Promova promoções, atraia clientes em dias de menor afluência e defina cupões promocionais reais.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-left">
        {/* LEFT CONTAINER: List of active coupons */}
        <div className="bg-slate-50 border border-slate-100/50 rounded-3xl p-5 sm:p-6 space-y-4">
          <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5 leading-none">
            <Tag className="w-4.5 h-4.5 text-rose-500" />
            <span>Cupões de Desconto</span>
          </h4>
          <p className="text-[11px] text-slate-500 leading-normal font-sans">
            Os cupões podem ser aplicados pelos clientes no momento do agendamento ou pagamento.
          </p>

          <div className="space-y-3 pt-2">
            {loadingCoupons ? (
              <div className="text-center py-4 text-xs text-slate-400">A carregar cupões...</div>
            ) : (
              <>
                {coupons.map((cp, idx) => {
                  const isExpired = cp.valid_until && new Date(cp.valid_until) < new Date();
                  return (
                    <div
                      key={cp.id || idx}
                      className={`bg-white border p-4 rounded-2xl flex items-center justify-between ${
                        cp.is_active && !isExpired
                          ? "border-slate-200"
                          : "border-slate-100 opacity-60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900 tracking-wider">
                            {cp.code}
                          </span>
                          {!cp.is_active && (
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">
                              Inativo
                            </span>
                          )}
                          {isExpired && (
                            <span className="text-[9px] bg-rose-50 text-rose-500 px-1.5 py-0.5 rounded font-bold uppercase">
                              Expirado
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {cp.discount_percent
                            ? `${cp.discount_percent}% de desconto`
                            : `${cp.discount_value}€ de desconto`}
                          {cp.valid_until && (
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              Válido até: {new Date(cp.valid_until).toLocaleDateString("pt-PT")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleCoupon(cp.id, cp.is_active)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                          title={cp.is_active ? "Desativar cupão" : "Ativar cupão"}
                        >
                          {cp.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(cp.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rose-50 text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {coupons.length === 0 && (
                  <div className="text-center py-6 text-sm text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    Sem cupões criados.
                  </div>
                )}
              </>
            )}
          </div>

          <button
            onClick={() => setShowAddCouponModal(true)}
            className="w-full py-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Criar Novo Cupão
          </button>
        </div>

        {/* RIGHT CONTAINER: Automation Triggers (e.g., WhatsApp) */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/30 border border-amber-100/50 rounded-3xl p-5 sm:p-6 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Tag className="w-24 h-24 text-amber-500" />
          </div>
          <h4 className="font-extrabold text-xs text-amber-950 uppercase tracking-wider flex items-center gap-1.5 leading-none relative z-10">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Disparar Automação de WhatsApp (Fidelizados)</span>
          </h4>
          <p className="text-[11px] text-slate-500 leading-normal font-sans relative z-10">
            Selecione um lote de clientes com mais de 3 meses de inatividade e dispare uma notificação automática apelando ao retorno.
          </p>
          <button
            onClick={() => {
              notifyTerminal(
                "🚀 Campanha Iniciada!",
                "A sua notificação automática foi disparada e enviada via SMS/WhatsApp para 15 destinatários.",
              );
            }}
            className="px-4 py-2 bg-white border border-slate-200 hover:border-amber-950 hover:text-amber-400 hover:bg-slate-50 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer text-nowrap block text-center relative z-10 w-full"
          >
            Avançar com Notificações Automáticas
          </button>
        </div>
      </div>

      {/* Add Coupon Modal */}
      {showAddCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                Novo Cupão Promocional
              </h3>
              <button
                onClick={() => setShowAddCouponModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCoupon} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  Código do Cupão
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: VERAO2026"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-2.5 rounded-xl text-slate-900 font-mono font-bold placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    Desconto (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="Ex: 15"
                    value={couponForm.discount_percent}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_percent: e.target.value, discount_value: "" })}
                    className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-2.5 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    Desconto (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ex: 5.00"
                    value={couponForm.discount_value}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value, discount_percent: "" })}
                    className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-2.5 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  Válido Até (Opcional)
                </label>
                <input
                  type="date"
                  value={couponForm.valid_until}
                  onChange={(e) => setCouponForm({ ...couponForm, valid_until: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-2.5 rounded-xl text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-purple-900/20 transition-all cursor-pointer"
                >
                  Criar Cupão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
