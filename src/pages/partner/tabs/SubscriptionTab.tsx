import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { Sparkles, Check, CheckCircle, AlertCircle, XCircle, FileText, Download, Building2, Banknote, Star } from "lucide-react";
import { Business } from "../../../types";

interface PartnerContextType {
  business: Business | null;
  staff: any[];
}

export default function SubscriptionTab() {
  const { business, staff } = useOutletContext<PartnerContextType>();
  const hasValidSubscription = business?.subscription_status === 'active' || (business?.subscription_status === 'trialing' && business?.trial_ends_at && new Date(business.trial_ends_at) > new Date());
  const isSuspended = business ? !hasValidSubscription : false;
  const hasUsedTrial = business?.subscription_status === 'canceled' || business?.subscription_status === 'expired' || business?.subscription_status === 'past_due' || (business?.trial_ends_at && new Date(business.trial_ends_at) < new Date());

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
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'week' | 'month' | 'year' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const loadFinanceData = async () => {
    if (!business) return;
    try {
      const [
        { data: pyData },
        { data: poData },
        { data: subData },
        { data: bkData }
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
        supabase.from("bookings").select("id, created_at, total_price, payment_method, booking_status, staff_id, original_service_price, discount_applied").eq("business_id", business.id).eq("booking_status", "completed")
      ]);

      const stripePayments = (pyData || []).filter(p => p.payment_status === 'paid');
      const stripePaymentBookingIds = new Set(stripePayments.map(p => p.booking_id));

      const localCompleted = (bkData || []).filter(b => (b.original_service_price ?? b.total_price) > 0 && b.payment_method === 'local' && !stripePaymentBookingIds.has(b.id)).map(b => ({
        id: `loc_${b.id}`,
        created_at: b.created_at,
        booking_id: b.id,
        staff_id: b.staff_id,
        payment_method: 'local',
        payment_status: 'paid',
        amount_total: (b.original_service_price ?? b.total_price),
        amount: (b.original_service_price ?? b.total_price),
        glamzo_fee: 0,
        business_amount: (b.original_service_price ?? b.total_price),
        description: `Serviço de Loja (Ref: ${b.id.substring(0,6)})`
      }));

      // Add staff_id to stripe payments if they map to a booking
      const bkMap = new Map((bkData || []).map(b => [b.id, b.staff_id]));
      stripePayments.forEach(p => {
        if (p.booking_id && bkMap.has(p.booking_id)) {
          p.staff_id = bkMap.get(p.booking_id);
        }
      });

      setLedgers([...stripePayments, ...localCompleted]);
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
  
  const getFilteredLedgers = () => {
    const now = new Date();
    return ledgers.filter(item => {
      if (ledgerFilter === 'all') return true;
      const itemDate = new Date(item.created_at);
      if (ledgerFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return itemDate >= weekAgo;
      }
      if (ledgerFilter === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return itemDate >= monthAgo;
      }
      if (ledgerFilter === 'year') {
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        return itemDate >= yearAgo;
      }
      if (ledgerFilter === 'custom') {
        const start = new Date(customStartDate);
        start.setHours(0,0,0,0);
        const end = new Date(customEndDate);
        end.setHours(23,59,59,999);
        return itemDate >= start && itemDate <= end;
      }
      return true;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const filteredLedgers = getFilteredLedgers();

  const handleDownloadCSV = () => {
    const headers = ["ID", "Data", "Descricao", "Metodo", "Status", "Valor Total", "Valor Retido", "Valor Liquido"];
    const rows = filteredLedgers.map(item => [
      item.id,
      new Date(item.created_at).toLocaleString('pt-PT'),
      item.description || (item.booking_id ? `Reserva ${item.booking_id}` : "Venda Directa"),
      item.payment_method === 'stripe' ? 'Online' : 'Local',
      item.payment_status,
      Number(item.amount_total || item.amount || 0).toFixed(2),
      Number(item.glamzo_fee || 0).toFixed(2),
      Number(item.business_amount || item.amount || 0).toFixed(2)
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `glamzo_transacoes_${ledgerFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalVolumeBruto = filteredLedgers.reduce(
    (sum, item) => sum + Number(item.amount_total || item.amount || 0),
    0
  );
  
  const totalComissoesRetidas = filteredLedgers.reduce((sum, item) => {
    if (item.payment_method !== "stripe") return sum;
    return sum + Math.max(0, Number(item.glamzo_fee || 0));
  }, 0);

  const totalReceivedVolume = filteredLedgers.reduce(
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
     alert(`${title}\n${msg}`);
  };

  const handleSubscribePro = async (planName: "PRO" | "TERMINAL" = "PRO") => {
    if (!business) return;
    try {
      setIsVerifyingSub(true);
      setVerifyingText("A preparar ligação com o Stripe...");
      const res = await fetch("/api/stripe/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business.id, planName: planName, skipTrial: hasUsedTrial }),
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
        if (res.status === 404) {
           // Ghost subscription detected
           window.location.reload();
           return;
        }
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
      const res = await fetch("/api/stripe/connect/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business.id }),
      });
      if (!res.ok) {
        const errData = await res.json();
        if (res.status === 404) {
           // Ghost account detected
           window.location.reload();
           return;
        }
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
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in text-slate-700 py-6">
      <div className="border-b border-slate-100 pb-5 text-left">
        <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
          Subscrição e Faturação
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Acompanhe a sua subscrição Glamzo Pro, consulte faturas reais e verifique o estado do seu Glamzo Pay Connect.
        </p>
      </div>

            {isSuspended && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-4 flex-wrap shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5"/>
            <div>
              <h4 className="text-sm font-bold text-rose-900">Loja Suspensa</h4>
              <p className="text-xs text-rose-700 mt-1">O seu período de utilização expirou ou a subscrição foi cancelada. A sua página pública não está visível.</p>
            </div>
          </div>
          <button 
            onClick={async () => { await supabase.auth.signOut(); window.location.href = '/partner/login'; }} 
            className="px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition shadow-sm whitespace-nowrap"
          >
            Terminar Sessão
          </button>
        </div>
      )}


      {globalError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold animate-fade-in">
          {globalError}
        </div>
      )}

      {/* 1. Subscrição Atual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* PLANO GLAMZO PRO */}
        <div className={`p-8 rounded-3xl border transition-all flex flex-col ${
            business?.selected_plan !== "app_tablet"
              ? "bg-white border-purple-500 shadow-md ring-2 ring-purple-500/20" 
              : "bg-white border-slate-200 hover:border-purple-300"
          }`}>
          <div className="flex justify-between items-start mb-2">
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Digital</span>
            {business?.selected_plan !== "app_tablet" && <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-3 py-1 rounded-full">Plano Atual</span>}
          </div>
          <h4 className="text-xl font-black text-slate-900 mt-2">Glamzo PRO</h4>
          <div className="mt-4 mb-6 flex flex-wrap items-center gap-3">
            <div>
              <span className="text-4xl font-black text-slate-900">19.90€</span>
              <span className="text-sm font-bold text-slate-500"> / mês</span>
            </div>
            {!hasUsedTrial ? (
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-md uppercase">14 Dias Grátis</span>
            ) : (
              <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-1 rounded-md uppercase">Cobrança Imediata</span>
            )}
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3 text-sm text-slate-600 font-medium"><CheckCircle className="w-5 h-5 text-emerald-500 shrink-0"/> Agenda e Reservas Ilimitadas</li>
            <li className="flex items-start gap-3 text-sm text-slate-600 font-medium"><CheckCircle className="w-5 h-5 text-emerald-500 shrink-0"/> Página Pública Premium no Explorar</li>
            <li className="flex items-start gap-3 text-sm text-slate-600 font-medium"><CheckCircle className="w-5 h-5 text-emerald-500 shrink-0"/> Equipa e Serviços Ilimitados</li>
            <li className="flex items-start gap-3 text-sm text-slate-600 font-medium"><CheckCircle className="w-5 h-5 text-emerald-500 shrink-0"/> Pagamentos Online Seguros (Stripe)</li>
          </ul>
          
                    {isSuspended ? (
            <button 
              onClick={() => handleSubscribePro("PRO")}
              disabled={isVerifyingSub}
              className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl text-xs hover:bg-purple-700 transition shadow-lg"
            >
              {isVerifyingSub ? "A carregar..." : "Reativar Plano PRO"}
            </button>
          ) : business?.selected_plan === "app_tablet" ? (
            <button 
              onClick={() => handleSubscribePro("PRO")}
              disabled={isVerifyingSub}
              className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl text-xs hover:bg-slate-800 transition shadow-lg"
            >
              Fazer Downgrade para Base
            </button>
          ) : (
            <button disabled className="w-full py-3.5 bg-slate-100 text-slate-500 font-bold rounded-xl cursor-not-allowed text-xs">
              O Seu Plano Atual
            </button>
          )}
        </div>
        
        {/* PLANO GLAMZO PRO TERMINAL */}
        <div className={`p-8 rounded-3xl border transition-all flex flex-col relative overflow-hidden group ${
            business?.selected_plan === "app_tablet"
              ? "bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500 shadow-2xl ring-2 ring-purple-500/30 text-white" 
              : "bg-slate-900 text-white border-purple-500 shadow-2xl"
          }`}>
          <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-rose-500 text-[10px] font-black uppercase px-4 py-1.5 rounded-bl-2xl shadow-lg">Recomendado</div>
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full group-hover:bg-purple-500/30 transition-all"></div>
          
          <div className="flex justify-between items-start mb-2 relative z-10">
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Star className="w-3 h-3"/> Hardware + Digital</span>
            {business?.selected_plan === "app_tablet" && <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-3 py-1 rounded-full">Plano Atual</span>}
          </div>
          <h4 className="text-xl font-black relative z-10 mt-2">Glamzo PRO Terminal</h4>
          <div className="mt-4 mb-6 relative z-10">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <span className="text-4xl font-black text-white">24.90€</span>
                <span className="text-sm font-bold text-slate-400"> / mês</span>
              </div>
              {!hasUsedTrial ? (
                <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase shadow-lg">14 Dias Grátis</span>
              ) : (
                <span className="bg-slate-700 text-slate-300 text-[10px] font-black px-2 py-1 rounded-md uppercase shadow-inner">Cobrança Imediata</span>
              )}
            </div>
            <div className="mt-2 inline-block bg-white/10 px-3 py-1 rounded-lg border border-white/10">
              <span className="text-xs font-bold text-purple-300">+ 9.90€ Caução Única (Equipamento)</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1 relative z-10">
            <li className="flex items-start gap-3 text-sm text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-purple-400 shrink-0"/> Tudo do Plano Glamzo PRO</li>
            <li className="flex items-start gap-3 text-sm text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-purple-400 shrink-0"/> <strong>Tablet Samsung/Lenovo Físico</strong> configurado para a receção</li>
            <li className="flex items-start gap-3 text-sm text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-purple-400 shrink-0"/> Alertas sonoros (Sininho) nas novas reservas</li>
            <li className="flex items-start gap-3 text-sm text-slate-300 font-medium"><CheckCircle className="w-5 h-5 text-purple-400 shrink-0"/> Relatórios Avançados CSV</li>
          </ul>

                    {isSuspended ? (
            <button 
              onClick={() => handleSubscribePro("TERMINAL")}
              disabled={isVerifyingSub}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-black rounded-xl transition-all shadow-lg shadow-purple-900/50 relative z-10 text-xs"
            >
              {isVerifyingSub ? "A carregar..." : "Reativar com Terminal"}
            </button>
          ) : business?.selected_plan !== "app_tablet" ? (
            <button 
              onClick={() => handleSubscribePro("TERMINAL")}
              disabled={isVerifyingSub}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-black rounded-xl transition-all shadow-lg shadow-purple-900/50 relative z-10 text-xs"
            >
              {isVerifyingSub ? "A carregar..." : "Solicitar Upgrade & Terminal"}
            </button>
          ) : (
            <button disabled className="w-full py-3.5 bg-white/10 text-purple-200 font-bold rounded-xl cursor-not-allowed text-xs border border-white/20 relative z-10">
              O Seu Plano Atual
            </button>
          )}
        </div>

      </div>

      {business?.stripe_subscription_id && (
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={handleOpenBillingPortal}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-50 transition shadow-sm flex items-center gap-2"
          >
            <FileText className="w-4 h-4" /> Gerir Faturação e Cartão
          </button>
          {!isSuspended && (
            <button
              onClick={handleCancelSubscription}
              disabled={cancelingSubscription}
              className="bg-white border border-rose-200 text-rose-600 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-rose-50 transition shadow-sm disabled:opacity-50"
            >
              {cancelingSubscription ? "A cancelar..." : "Cancelar Subscrição"}
            </button>
          )}
        </div>
      )}

      {/* 2. Conta Bancária / Stripe */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 mb-6">
        <h4 className="font-extrabold text-sm text-slate-900 mb-4 flex items-center gap-2">
          <Banknote className="w-4 h-4 text-emerald-500" />
          Glamzo Pay / Levantamentos
        </h4>
        
        {(!business?.stripe_account_id || (stripeStatus && (!stripeStatus.charges_enabled || stripeStatus.connected === false))) ? (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-6 h-6 text-emerald-600" />
            </div>
            {business?.stripe_account_id && stripeStatus && stripeStatus.connected !== false && !stripeStatus.charges_enabled ? (
              <>
                <h5 className="font-bold text-slate-900 mb-1">Concluir Configuração Glamzo Pay</h5>
                <p className="text-xs text-rose-500 mb-4 max-w-sm mx-auto font-medium">A sua conta foi criada, mas faltam detalhes importantes. Conclua o registo para ativar os pagamentos.</p>
              </>
            ) : (
              <>
                <h5 className="font-bold text-slate-900 mb-1">Receba Pagamentos Online</h5>
                <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                  Configure a sua conta Glamzo Pay (via Stripe) para aceitar pagamentos com Cartão, Apple Pay e MBWay através do sistema de reservas.
                </p>
              </>
            )}
            <button
              onClick={handleConnectStripe}
              className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 mx-auto"
            >
              {(business?.stripe_account_id && stripeStatus?.connected !== false) ? 'Concluir Registo' : 'Configurar Conta Bancária'}
            </button>
            <div className="mt-4 pt-4 border-t border-slate-100 max-w-xs mx-auto text-left">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ou insira ID Stripe Manual (Se já tiver conta)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={manualStripeId}
                  onChange={e => setManualStripeId(e.target.value)}
                  placeholder="acct_1..." 
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:border-emerald-500"
                />
                <button 
                  onClick={handleSaveManualStripe}
                  disabled={savingManualStripe || !manualStripeId}
                  className="bg-slate-800 text-white px-3 rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-slate-900"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <h5 className="font-bold text-xs text-slate-900 mb-4">Conta Glamzo Pay</h5>
              
              {stripeStatus && (
                <div className="mb-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Receber Pagamentos</span>
                    {stripeStatus.charges_enabled ? (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Ativo</span>
                    ) : (
                      <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Restrito</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Levantamentos</span>
                    {stripeStatus.payouts_enabled ? (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Ativo</span>
                    ) : (
                      <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Restrito</span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                {stripeStatus?.details_submitted === false ? (
                  <button
                    onClick={handleConnectStripe}
                    className="flex-1 bg-amber-500 text-white font-bold py-2 rounded-xl text-xs hover:bg-amber-600 transition flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4"/> Concluir Registo
                  </button>
                ) : (
                  <button
                    onClick={handleConnectStripe}
                    className="flex-1 bg-slate-900 text-white font-bold py-2 rounded-xl text-xs hover:bg-slate-800 transition"
                  >
                    Painel Stripe / Glamzo Pay
                  </button>
                )}
              </div>
            </div>

            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
              <h5 className="font-bold text-xs text-emerald-900 mb-1 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500"/> Transferências Automáticas</h5>
              <p className="text-[11px] text-emerald-700/80 leading-relaxed mb-3">
                Os seus fundos disponíveis são processados de forma automática e gratuita <b>todas as Segundas-feiras</b> para a sua conta bancária.
              </p>
              
              <div className="bg-white p-3 rounded-xl border border-emerald-100 flex flex-wrap items-center justify-between gap-2 shadow-sm">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Disponível para Levantamento</p>
                  <p className="text-lg font-black text-emerald-600 font-mono">
                    {stripeStatus?.available_balance ? (stripeStatus.available_balance / 100).toFixed(2) : "0.00"}€
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 text-right">Pendente</p>
                  <p className="text-sm font-bold text-slate-600 font-mono text-right">
                    {stripeStatus?.pending_balance ? (stripeStatus.pending_balance / 100).toFixed(2) : "0.00"}€
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

          </div>
  );
}
