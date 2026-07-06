import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { Sparkles, Check, CheckCircle2, AlertCircle, XCircle, FileText, Download, Building2, Banknote, ShieldCheck } from "lucide-react";
import { Business } from "../../../types";

interface PartnerContextType {
  business: Business | null;
}

export default function FinanceTab() {
  const { business } = useOutletContext<PartnerContextType>();
  const [ledgers, setLedgers] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [stripeStatus, setStripeStatus] = useState<any>(null);
  const [isVerifyingSub, setIsVerifyingSub] = useState(false);
  const [verifyingText, setVerifyingText] = useState("");
  const [cancelingSubscription, setCancelingSubscription] = useState(false);
  const [manualStripeId, setManualStripeId] = useState("");
  const [savingManualStripe, setSavingManualStripe] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(100);
  const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const loadFinanceData = async () => {
    if (!business) return;
    try {
      const [
        { data: pyData },
        { data: poData },
        { data: subData },
      ] = await Promise.all([
        supabase.from("payments").select("*").eq("business_id", business.id),
        supabase
          .from("payouts")
          .select("*")
          .eq("business_id", business.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("subscriptions")
          .select("*")
          .eq("business_id", business.id)
          .order("created_at", { ascending: false }),
      ]);
      setLedgers(pyData || []);
      setPayouts(poData || []);
      setSubscriptions(subData || []);

      if (business.stripe_account_id) {
        try {
          const sRes = await fetch(
            `/api/stripe/account-status?businessId=${business.id}`
          );
          if (sRes.ok) {
            const sPayload = await sRes.json();
            setStripeStatus(sPayload);
          }
        } catch (sErr) {
          console.warn("Failed to fetch fresh Glamzo Pay account status:", sErr);
        }
      }
    } catch (err) {
      console.error("Error loading finance data:", err);
    }
  };

  useEffect(() => {
    loadFinanceData();
  }, [business]);

  // Derived calculations
  const totalVolumeBruto = ledgers.reduce(
    (sum, item) => sum + Number(item.amount_total || item.amount || 0),
    0
  );
  
  const totalComissoesRetidas = ledgers.reduce((sum, item) => {
    if (item.payment_method !== "stripe") return sum;
    return sum + Math.max(0, Number(item.glamzo_fee || 0));
  }, 0);

  const totalReceivedVolume = ledgers.reduce(
    (sum, item) =>
      sum +
      Number(item.business_amount || item.amount_total || item.amount || 0),
    0
  );

  const totalReceivedVolumeOnline = ledgers
    .filter((item) => item.payment_method === "stripe")
    .reduce(
      (sum, item) =>
        sum +
        Number(item.business_amount || item.amount_total || item.amount || 0),
      0
    );

  const totalPayoutTransferred = payouts
    .filter((p) => p.status === "paid")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const availableBalanceToWithdraw = Math.max(
    0,
    totalReceivedVolumeOnline - totalPayoutTransferred
  );

  const notifyTerminal = (title: string, msg: string) => {
     // A simple alert for now since setGlobalError might not be enough
     alert(`${title}\n${msg}`);
  };

  const handleSubscribePro = async (planName: "PRO" | "TERMINAL" = "PRO") => {
    if (!business) return;
    try {
      setIsVerifyingSub(true);
      setVerifyingText("A preparar ligação com o Stripe...");
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business.id, planType: planName }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No URL returned from checkout session creation");
      }
    } catch (err: any) {
      console.error(err);
      notifyTerminal(
        "❌ Erro Técnico",
        err.message || "Falha na ligação ao servidor."
      );
    } finally {
      setIsVerifyingSub(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!business) return;
    const confirmCancel = window.confirm(
      `Tem a certeza absoluta de que deseja cancelar o seu plano ${
        business?.selected_plan === "app_tablet" ? "PRO Terminal" : "Glamzo PRO"
      }?\r\n\r\nAo desativar o plano, o seu estabelecimento será imediatamente removido (ocultado) no Marketplace público e o seu painel de controlo será bloqueado até que associe um novo cartão.`
    );
    if (!confirmCancel) return;
    try {
      setCancelingSubscription(true);
      notifyTerminal(
        "⚠️ A Desativar Plano",
        "A comunicar com o servidor de pagamentos Stripe..."
      );
      const res = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business.id }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to cancel subscription");
      }
      notifyTerminal(
        "✔️ Assinatura Cancelada",
        "A sua subscrição Glamzo foi cancelada. O marketplace foi desligado."
      );
      window.location.reload();
    } catch (err: any) {
      console.error("Failed to cancel subscription:", err);
      notifyTerminal("❌ Falha", err.message || "Tente novamente mais tarde.");
    } finally {
      setCancelingSubscription(false);
    }
  };

  const handleOpenBillingPortal = async () => {
    if (!business) return;
    try {
      const res = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business.id }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create portal session");
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error("Portal Error", err);
      notifyTerminal("❌ Falha", err.message || "Tente novamente.");
    }
  };

  const handleConnectStripe = async () => {
    if (!business) return;
    try {
      const res = await fetch("/api/stripe/create-account-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business.id }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create account link");
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error(err);
      notifyTerminal("❌ Erro Técnico", "Falha na ligação à gateway Stripe.");
    }
  };

  const handleSaveManualStripe = async () => {
    if (!business || !manualStripeId) return;
    try {
      setSavingManualStripe(true);
      const { error } = await supabase
        .from("businesses")
        .update({ stripe_account_id: manualStripeId.trim() })
        .eq("id", business.id);
      if (error) throw error;
      notifyTerminal(
        "✔️ Conta Vinculada",
        "Merchant Account ID associada. Atualize a página para refletir as alterações."
      );
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      notifyTerminal("❌ Erro", "Falha ao guardar o Merchant ID na base de dados.");
    } finally {
      setSavingManualStripe(false);
    }
  };

  const handleSubmitPayoutRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    if (payoutAmount > availableBalanceToWithdraw) {
      alert("Valor excede o saldo online disponível.");
      return;
    }
    try {
      const { error } = await supabase.from("payouts").insert({
        business_id: business.id,
        amount: payoutAmount,
        status: "pending",
      });
      if (error) throw error;
      setPayoutSuccess(`Pedido de levantamento de ${payoutAmount.toFixed(2)}€ submetido com sucesso.`);
      setPayoutAmount(0);
      await loadFinanceData();
    } catch (err: any) {
      console.error("Payout error", err);
      alert("Ocorreu um erro ao pedir o levantamento.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in text-slate-700">
      <div className="border-b border-slate-100 pb-5 text-left">
        <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
          Subscrição e Faturação
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Acompanhe a sua subscrição Glamzo Pro, consulte faturas reais e verifique o estado do seu Glamzo Pay Connect.
        </p>
      </div>

      {globalError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold animate-fade-in">
          {globalError}
        </div>
      )}

      {/* 1. Subscrição Atual */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 mb-6">
        <h4 className="font-extrabold text-sm text-slate-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          O Seu Plano Glamzo
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-5 rounded-2xl border transition-all ${
            business?.selected_plan !== "app_tablet"
              ? "bg-white border-purple-500 shadow-md ring-2 ring-purple-500/20" 
              : "bg-white border-slate-200"
          }`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase block font-mono">Plano Base</span>
              {business?.selected_plan !== "app_tablet" && <span className="bg-purple-100 text-purple-700 text-[9px] font-bold px-2 py-0.5 rounded-full">Plano Atual</span>}
            </div>
            <div className="flex items-baseline mb-3">
              <span className="text-2xl font-display font-medium text-slate-900">19.90€</span>
              <span className="text-xs text-slate-500 ml-1 font-medium">/mês</span>
            </div>
            <ul className="space-y-1.5 text-left text-xs text-slate-600 font-medium mb-4">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-slate-400" /> Agenda e Marcações Ilimitadas</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-slate-400" /> Página pública com SEO</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-slate-400" /> Equipa e Serviços Ilimitados</li>
            </ul>
            {business?.selected_plan === "app_tablet" && (
              <button 
                onClick={() => handleSubscribePro("PRO")}
                className="w-full bg-slate-900 text-white font-bold py-2 rounded-xl text-xs hover:bg-slate-800 transition"
                disabled={isVerifyingSub}
              >
                Ativar Plano Base
              </button>
            )}
          </div>

          <div className={`p-5 rounded-2xl border transition-all ${
            business?.selected_plan === "app_tablet"
              ? "bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500 shadow-xl ring-2 ring-purple-500/30 text-white" 
              : "bg-white border-slate-200"
          }`}>
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[10px] font-black tracking-widest uppercase block font-mono ${business?.selected_plan === "app_tablet" ? "text-purple-300" : "text-slate-500"}`}>Pro Terminal</span>
              {business?.selected_plan === "app_tablet" && <span className="bg-purple-500/20 text-purple-200 border border-purple-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full">Plano Atual</span>}
            </div>
            <div className="flex items-baseline mb-3">
              <span className="text-2xl font-display font-medium">39.90€</span>
              <span className={`text-xs ml-1 font-medium ${business?.selected_plan === "app_tablet" ? "text-slate-300" : "text-slate-500"}`}>/mês</span>
            </div>
            <ul className={`space-y-1.5 text-left text-xs font-medium mb-4 ${business?.selected_plan === "app_tablet" ? "text-slate-300" : "text-slate-600"}`}>
              <li className="flex items-center gap-2"><Check className={`w-3.5 h-3.5 ${business?.selected_plan === "app_tablet" ? "text-purple-400" : "text-slate-400"}`} /> Tudo do Plano Base</li>
              <li className="flex items-center gap-2"><Check className={`w-3.5 h-3.5 ${business?.selected_plan === "app_tablet" ? "text-purple-400" : "text-slate-400"}`} /> App Tablet Recepção/Desk</li>
              <li className="flex items-center gap-2"><Check className={`w-3.5 h-3.5 ${business?.selected_plan === "app_tablet" ? "text-purple-400" : "text-slate-400"}`} /> Relatórios Avançados CSV</li>
            </ul>
            {business?.selected_plan !== "app_tablet" && (
              <button 
                onClick={() => handleSubscribePro("TERMINAL")}
                className="w-full bg-purple-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-purple-700 transition shadow-lg shadow-purple-600/20"
                disabled={isVerifyingSub}
              >
                {isVerifyingSub ? "A carregar..." : "Fazer Upgrade para Terminal"}
              </button>
            )}
          </div>
        </div>

        {business?.stripe_subscription_id && (
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleOpenBillingPortal}
              className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition shadow-sm flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5" /> Portal de Faturação
            </button>
            <button
              onClick={handleCancelSubscription}
              disabled={cancelingSubscription}
              className="bg-white border border-rose-200 text-rose-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-50 transition shadow-sm disabled:opacity-50"
            >
              {cancelingSubscription ? "A cancelar..." : "Cancelar Subscrição"}
            </button>
          </div>
        )}
      </div>

      {/* 2. Conta Bancária / Stripe */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 mb-6">
        <h4 className="font-extrabold text-sm text-slate-900 mb-4 flex items-center gap-2">
          <Banknote className="w-4 h-4 text-emerald-500" />
          Glamzo Pay / Levantamentos
        </h4>
        
        {!business?.stripe_account_id ? (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h5 className="font-bold text-slate-900 mb-1">Receba Pagamentos Online</h5>
            <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
              Configure a sua conta Glamzo Pay (via Stripe) para aceitar pagamentos com Cartão, Apple Pay e MBWay através do sistema de reservas.
            </p>
            <button
              onClick={handleConnectStripe}
              className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 mx-auto"
            >
              Configurar Conta Bancária
            </button>
            <div className="mt-4 pt-4 border-t border-slate-100 max-w-xs mx-auto text-left">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ou insira ID Stripe Manual (Se já tiver conta)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={manualStripeId}
                  onChange={e => setManualStripeId(e.target.value)}
                  placeholder="acct_1..." 
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                />
                <button 
                  onClick={handleSaveManualStripe}
                  disabled={savingManualStripe || !manualStripeId}
                  className="bg-slate-800 text-white px-3 rounded-lg text-xs font-bold disabled:opacity-50"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Status da Conta
                </span>
                {stripeStatus?.charges_enabled ? (
                  <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ativa
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Restrita
                  </span>
                )}
              </div>
              
              <div className="mb-4">
                <p className="text-2xl font-black text-slate-900">{availableBalanceToWithdraw.toFixed(2)}€</p>
                <p className="text-[10px] text-slate-500 font-mono mt-1">Saldo Disponível para Levantamento</p>
              </div>

              {!stripeStatus?.charges_enabled && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl mb-4 text-[10px] text-amber-800 font-medium">
                  A sua conta necessita de fornecer mais dados legais para desbloquear levantamentos.
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleConnectStripe}
                  className="flex-1 bg-slate-900 text-white font-bold py-2 rounded-xl text-xs hover:bg-slate-800 transition"
                >
                  Painel Glamzo Pay
                </button>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200">
               <h5 className="font-bold text-xs text-slate-900 mb-3">Solicitar Levantamento</h5>
               {payoutSuccess && (
                 <div className="bg-emerald-50 text-emerald-700 p-2 rounded-lg text-xs font-bold mb-3 border border-emerald-100">
                   {payoutSuccess}
                 </div>
               )}
               <form onSubmit={handleSubmitPayoutRequest} className="space-y-3">
                 <div>
                   <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Montante (€)</label>
                   <input 
                     type="number" 
                     min="10" 
                     max={availableBalanceToWithdraw} 
                     step="0.01" 
                     required
                     value={payoutAmount}
                     onChange={e => setPayoutAmount(Number(e.target.value))}
                     className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                   />
                 </div>
                 <button
                   type="submit"
                   disabled={availableBalanceToWithdraw < 10}
                   className="w-full bg-emerald-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-emerald-700 transition disabled:opacity-50 disabled:bg-slate-300"
                 >
                   Confirmar Levantamento
                 </button>
                 <p className="text-[9px] text-slate-400 text-center">
                   O processamento demora cerca de 2-3 dias úteis. Min. 10€.
                 </p>
               </form>
            </div>
          </div>
        )}
      </div>

      {/* 3. Histórico de Transações */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" />
            Livro Razão / Histórico de Transações
          </h4>
          <button
            className="bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            Exportar para CSV
          </button>
        </div>

        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
           <div className="bg-white p-4 rounded-xl border border-slate-200">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Volume Bruto</span>
             <span className="text-lg font-black text-slate-900 mt-1 block">{totalVolumeBruto.toFixed(2)}€</span>
           </div>
           <div className="bg-white p-4 rounded-xl border border-slate-200">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Lucro Líquido</span>
             <span className="text-lg font-black text-emerald-600 mt-1 block">{totalReceivedVolume.toFixed(2)}€</span>
           </div>
           <div className="bg-white p-4 rounded-xl border border-slate-200">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Comissões</span>
             <span className="text-lg font-black text-rose-500 mt-1 block">{totalComissoesRetidas.toFixed(2)}€</span>
           </div>
           <div className="bg-white p-4 rounded-xl border border-slate-200">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Online</span>
             <span className="text-lg font-black text-purple-600 mt-1 block">{totalReceivedVolumeOnline.toFixed(2)}€</span>
           </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              <tr>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Método</th>
                <th className="py-3 px-4 text-right">Valor</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledgers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">Nenhuma transação registada.</td>
                </tr>
              ) : (
                ledgers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {new Date(item.created_at).toLocaleDateString("pt-PT")}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {item.description || "Serviço Prestado"}
                    </td>
                    <td className="py-3 px-4">
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                         item.payment_method === 'stripe' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                       }`}>
                         {item.payment_method === 'stripe' ? 'ONLINE' : 'LOCAL'}
                       </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 font-mono">
                      {Number(item.amount || item.amount_total || 0).toFixed(2)}€
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        onClick={() => setSelectedInvoice(item)}
                        className="text-[10px] font-bold text-purple-600 hover:text-purple-800"
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-6 border-b border-slate-100 text-center relative">
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-3 text-purple-600">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-lg text-slate-900">Fatura Simplificada</h4>
              <p className="text-[10px] text-slate-400 font-mono mt-1">ID: {selectedInvoice.id.substring(0, 8).toUpperCase()}</p>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-bold">Data</span>
                <span className="font-mono text-slate-900">{new Date(selectedInvoice.created_at).toLocaleString("pt-PT")}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-bold">Método</span>
                <span className="font-bold uppercase text-slate-900">{selectedInvoice.payment_method}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-bold">Valor Bruto</span>
                <span className="font-mono font-black text-slate-900">{Number(selectedInvoice.amount || selectedInvoice.amount_total || 0).toFixed(2)}€</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-rose-500 font-bold">Comissão Plataforma</span>
                <span className="font-mono font-black text-rose-500">-{Number(selectedInvoice.glamzo_fee || 0).toFixed(2)}€</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-900 font-black">Valor Líquido Recebido</span>
                <span className="font-mono font-black text-emerald-600 text-lg">
                  {Number(selectedInvoice.business_amount || selectedInvoice.amount || 0).toFixed(2)}€
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
