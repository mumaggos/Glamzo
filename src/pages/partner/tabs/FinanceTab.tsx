import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { Sparkles, Check, CheckCircle, AlertCircle, XCircle, FileText, Download, Building2, Banknote, Star } from "lucide-react";
import { Business } from "../../../types";

interface PartnerContextType {
  business: Business | null;
  staff: any[];
}

export default function FinanceTab() {
  const { business, staff } = useOutletContext<PartnerContextType>();
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
        supabase.from("bookings").select("id, created_at, total_price, payment_method, booking_status, staff_id").eq("business_id", business.id).eq("booking_status", "completed")
      ]);

      const stripePayments = (pyData || []).filter(p => p.payment_status === 'paid');
      const stripePaymentBookingIds = new Set(stripePayments.map(p => p.booking_id));

      const localCompleted = (bkData || []).filter(b => b.total_price > 0 && b.payment_method === 'local' && !stripePaymentBookingIds.has(b.id)).map(b => ({
        id: `loc_${b.id}`,
        created_at: b.created_at,
        booking_id: b.id,
        staff_id: b.staff_id,
        payment_method: 'local',
        payment_status: 'paid',
        amount_total: b.total_price,
        amount: b.total_price,
        glamzo_fee: 0,
        business_amount: b.total_price,
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
        body: JSON.stringify({ businessId: business.id, planName: planName }),
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
      const res = await fetch("/api/stripe/connect/onboard", {
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
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in text-slate-700 py-6">
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
          <div className="mt-4 mb-6">
            <span className="text-4xl font-black text-slate-900">19.90€</span>
            <span className="text-sm font-bold text-slate-500"> / mês</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3 text-sm text-slate-600 font-medium"><CheckCircle className="w-5 h-5 text-emerald-500 shrink-0"/> Agenda e Reservas Ilimitadas</li>
            <li className="flex items-start gap-3 text-sm text-slate-600 font-medium"><CheckCircle className="w-5 h-5 text-emerald-500 shrink-0"/> Página Pública Premium no Explorar</li>
            <li className="flex items-start gap-3 text-sm text-slate-600 font-medium"><CheckCircle className="w-5 h-5 text-emerald-500 shrink-0"/> Equipa e Serviços Ilimitados</li>
            <li className="flex items-start gap-3 text-sm text-slate-600 font-medium"><CheckCircle className="w-5 h-5 text-emerald-500 shrink-0"/> Pagamentos Online Seguros (Stripe)</li>
          </ul>
          
          {business?.selected_plan === "app_tablet" ? (
            <button 
              onClick={() => handleSubscribePro("PRO")}
              className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl text-xs hover:bg-slate-800 transition shadow-lg"
              disabled={isVerifyingSub}
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
            <span className="text-4xl font-black text-white">24.90€</span>
            <span className="text-sm font-bold text-slate-400"> / mês</span>
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

          {business?.selected_plan !== "app_tablet" ? (
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
          <button
            onClick={handleCancelSubscription}
            disabled={cancelingSubscription}
            className="bg-white border border-rose-200 text-rose-600 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-rose-50 transition shadow-sm disabled:opacity-50"
          >
            {cancelingSubscription ? "A cancelar..." : "Cancelar Subscrição"}
          </button>
        </div>
      )}

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
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Receber Pagamentos</span>
                    {stripeStatus.charges_enabled ? (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Ativo</span>
                    ) : (
                      <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Restrito</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
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
              
              <div className="bg-white p-3 rounded-xl border border-emerald-100 flex items-center justify-between shadow-sm">
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

      {/* 3. Histórico de Transações */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" />
            Livro Razão / Histórico de Transações
          </h4>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            {ledgerFilter === 'custom' && (
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-sm">
                <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="text-xs font-bold text-slate-700 bg-transparent outline-none p-1" />
                <span className="text-slate-300">-</span>
                <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="text-xs font-bold text-slate-700 bg-transparent outline-none p-1" />
              </div>
            )}
            <select value={ledgerFilter} onChange={e => setLedgerFilter(e.target.value as any)} className="bg-white border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs focus:outline-none focus:border-purple-500 shadow-sm">
              <option value="all">Sempre</option>
              <option value="week">Últimos 7 dias</option>
              <option value="month">Últimos 30 dias</option>
              <option value="year">Último ano</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>
          <button
            onClick={handleDownloadCSV}
            className="bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>

        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Volume Bruto</span>
             <span className="text-lg font-black text-slate-900 mt-1 block font-mono">{totalVolumeBruto.toFixed(2)}€</span>
           </div>
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Lucro Líquido</span>
             <span className="text-lg font-black text-emerald-600 mt-1 block font-mono">{totalReceivedVolume.toFixed(2)}€</span>
           </div>
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Comissões</span>
             <span className="text-lg font-black text-rose-500 mt-1 block font-mono">{totalComissoesRetidas.toFixed(2)}€</span>
           </div>
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Online</span>
             <span className="text-lg font-black text-purple-600 mt-1 block font-mono">{totalReceivedVolumeOnline.toFixed(2)}€</span>
           </div>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h5 className="font-bold text-xs text-slate-900 mb-3 uppercase tracking-widest">Faturação por Profissional</h5>
            <div className="space-y-3">
              {staff?.map(s => {
                const staffRevenue = filteredLedgers.filter(l => l.staff_id === s.id).reduce((sum, item) => sum + Number(item.amount_total || item.amount || 0), 0);
                if (staffRevenue === 0) return null;
                const percentage = totalVolumeBruto > 0 ? (staffRevenue / totalVolumeBruto) * 100 : 0;
                return (
                  <div key={s.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800">{s.full_name}</span>
                        <span className="text-xs font-black text-purple-600">{staffRevenue.toFixed(2)}€</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!staff || staff.length === 0 || filteredLedgers.filter(l => l.staff_id).length === 0) && (
                <p className="text-xs text-slate-500 text-center py-2">Sem dados de profissionais no período.</p>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-center items-center text-center">
            <Star className="w-8 h-8 text-amber-400 mb-2" />
            <h5 className="font-bold text-xs text-slate-900 uppercase tracking-widest mb-1">Total de Transações</h5>
            <span className="text-3xl font-black text-slate-900 font-mono">{filteredLedgers.length}</span>
            <p className="text-[10px] text-slate-400 mt-2">Transações no período selecionado</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto custom-scrollbar shadow-sm">
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
              {filteredLedgers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">Nenhuma transação registada.</td>
                </tr>
              ) : (
                filteredLedgers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {new Date(item.created_at).toLocaleDateString("pt-PT")}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.description || "Serviço Prestado"}
                    </td>
                    <td className="py-3 px-4">
                       <span className={`text-[9px] font-bold px-2 py-1 rounded-md tracking-wider uppercase ${
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
                        className="text-[10px] font-bold text-purple-600 hover:text-purple-800 transition-colors"
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
