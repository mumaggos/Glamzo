import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { Package, Truck, CheckCircle2, Store, Search, AlertCircle, MapPin } from "lucide-react";
import { Business } from "../../types";
import { useTranslation } from "react-i18next";

export default function SuperAdminLogistics() {
    const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Hardcode admin email check
  const SUPER_ADMIN_EMAIL = "glamzo.suporte@gmail.com";

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.email !== SUPER_ADMIN_EMAIL) {
        navigate("/");
        return;
      }
      loadEligibleBusinesses();
    }
  }, [user, authLoading, navigate]);

  const loadEligibleBusinesses = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Regra: Período de Trial (14 dias) expirou E o primeiro pagamento (subscription_status = 'active')
      // Para simular, vamos buscar lojas com setup_completed = true e welcome_kit_sent = false
      // Numa app real com Stripe, filtraríamos por subscription_status = 'active'
      
      const { data, error: fetchErr } = await supabase
        .from("businesses")
        .select("*")
        .eq("setup_completed", true)
        .eq("welcome_kit_sent", false)
        .order("created_at", { ascending: false });

      if (fetchErr) throw fetchErr;
      
      // Filtrar lojas que (simuladamente) passaram o trial e têm subscrição ativa
      // Como não temos dados reais de Stripe ainda, vamos mostrar todas as setup_completed
      // e assumimos que o status ativo = passou trial.
      // Modifique isso para real_logic se desejar:
      const eligible = (data || []).filter(b => 
        (b.subscription_status === 'active' || b.status === 'active') && !b.welcome_kit_sent
      );

      setBusinesses(eligible);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar lojas elegíveis.");
    } finally {
      setLoading(false);
    }
  };

  const markAsSent = async (id: string) => {
    if (!window.confirm("Confirmar que o kit foi embalado e enviado para esta morada?")) return;
    
    try {
      setProcessingId(id);
      const { error: updateErr } = await supabase
        .from("businesses")
        .update({ welcome_kit_sent: true })
        .eq("id", id);
        
      if (updateErr) throw updateErr;
      
      // Remover da lista
      setBusinesses(prev => prev.filter(b => b.id !== id));
      
    } catch (err: any) {
      alert("Erro ao atualizar: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = businesses.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (b.city && b.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (authLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">{t('txt_a_verificar_acessos') || 'A verificar acessos...'}</div>;

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold tracking-tight">{t('txt_log_stica') || 'Logística |'} <span className="font-light">{t('txt_kits_de_boas_vindas') || 'Kits de Boas-vindas'}</span></h1>
          </div>
          <div className="text-sm font-medium bg-slate-800 px-3 py-1 rounded-full border border-slate-700 text-slate-300">
            
                                  {t('txt_acesso_restrito') || 'Acesso Restrito'}
                                </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-slate-400" />
                
                                              {t('txt_lojas_eleg_veis_para_envio') || 'Lojas Elegíveis para Envio'}
                                            </h2>
              <p className="text-sm text-slate-500 mt-1">{t('txt_lojas_com_trial_finalizado_e_p') || 'Lojas com trial finalizado e primeiro pagamento confirmado.'}</p>
            </div>
            
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder={t('txt_pesquisar_loja_ou_cidade') || 'Pesquisar loja ou cidade...'} 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-64"
              />
            </div>
          </div>

          {error && (
            <div className="m-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="text-sm font-semibold">{error}</div>
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <Truck className="w-8 h-8 animate-pulse mx-auto mb-3" />
              <p>{t('txt_a_carregar_envios_pendentes') || 'A carregar envios pendentes...'}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t('txt_nenhum_envio_pendente') || 'Nenhum envio pendente'}</h3>
              <p className="text-slate-500 mt-1">{t('txt_todas_as_lojas_eleg_veis_j_rec') || 'Todas as lojas elegíveis já receberam o seu Kit de Boas-vindas.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('txt_loja_145') || 'Loja'}</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('txt_detalhes_de_envio_morada_compl') || 'Detalhes de Envio (Morada Completa)'}</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{t('txt_a_o') || 'Ação'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(biz => (
                    <tr key={biz.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{biz.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{biz.category}</div>
                        <div className="text-xs text-slate-400 mt-1 font-mono">{biz.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-sm text-slate-800 font-medium">{biz.address}</div>
                            <div className="text-sm text-slate-600">
                              {biz.postal_code} {biz.city}
                            </div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">{biz.district}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => markAsSent(biz.id)}
                          disabled={processingId === biz.id}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
                        >
                          {processingId === biz.id ? (
                            "A gravar..."
                          ) : (
                            <>
                              <Truck className="w-4 h-4" />
                              
                                                                            {t('txt_marcar_enviado') || 'Marcar Enviado'}
                                                                          </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
