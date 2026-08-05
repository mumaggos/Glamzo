import FinanceNav from '../../../components/partner/FinanceNav';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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

  const totalReceivedVolumeOnline = filteredLedgers
    .filter((item) => item.payment_method === "stripe")
    .reduce(
      (sum, item) =>
        sum +
        Number(item.business_amount || item.amount_total || item.amount || 0),
      0
    );

  const totalReceivedVolumeOnlineLifetime = ledgers
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
    totalReceivedVolumeOnlineLifetime - totalPayoutTransferred
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
        body: JSON.stringify({ businessId: business.id, planName: planName, skipTrial: hasUsedTrial })
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
        false ? "PRO Terminal" : "Glamzo PRO"
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
        body: JSON.stringify({ businessId: business.id })
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
        body: JSON.stringify({ businessId: business.id })
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
        body: JSON.stringify({ businessId: business.id })
      });
      
      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error("Invalid JSON response from server");
      }

      if (!res.ok) {
        if (res.status === 404) {
           window.location.reload();
           return;
        }
        throw new Error(data.error || "Failed to create account link");
      }
      
      if (data && data.url) {
        window.location.href = data.url;
        return;
      }
      
      throw new Error("No URL returned from server");
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
        status: "pending"
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
      <FinanceNav />
      <div className="border-b border-slate-100 pb-5 text-left">
        <h3 className="text-xl font-extrabold tracking-tight text-slate-900">{t('partner.subTitle')}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{t('partner.subDesc')}</p>
      </div>

            {isSuspended && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-4 flex-wrap shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5"/>
            <div>
              <h4 className="text-sm font-bold text-rose-900">{t('partner.storeSuspended')}</h4>
              <p className="text-xs text-rose-700 mt-1">{t('partner.storeSuspendedDesc')}</p>
            </div>
          </div>
          <button 
            onClick={async () => { await supabase.auth.signOut(); window.location.href = '/partner/login'; }} 
            className="px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition shadow-sm whitespace-nowrap"
          >
            {t('partner.logout')}
          </button>
        </div>
      )}


      {globalError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold animate-fade-in">
          {globalError}
        </div>
      )}

      {/* 1. Subscrição Atual */}
      <div className="max-w-md mx-auto mb-6">
        
        {/* PLANO GLAMZO PRO */}
        <div className={`p-8 rounded-3xl border transition-all flex flex-col ${
            (!isSuspended)
              ? "bg-white border-purple-500 shadow-md ring-2 ring-purple-500/20" 
              : "bg-white border-slate-200 hover:border-purple-300"
          }`}>
          <div className="flex justify-between items-start mb-2">
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{t('partner.digital')}</span>
            {!isSuspended && <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-3 py-1 rounded-full">{t('partner.currentPlan')}</span>}
          </div>
          <h4 className="text-xl font-black text-slate-900 mt-2">Glamzo PRO</h4>
          <div className="mt-4 mb-6 flex flex-wrap items-center gap-3">
            <div>
              <span className="text-4xl font-black text-slate-900">19.90€</span>
              <span className="text-sm font-bold text-slate-500"> {t('partner.month')}</span>
            </div>
            {!hasUsedTrial ? (
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-md uppercase">{t('partner.free14Days')}</span>
            ) : (
              <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-1 rounded-md uppercase">{t('partner.immediateCharge')}</span>
            )}
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3 text-sm text-slate-600 font-medium"><CheckCircle className="w-5 h-5 text-emerald-500 shrink-0"/> {t('partner.feat1')}</li>
            <li className="flex items-start gap-3 text-sm text-slate-600 font-medium"><CheckCircle className="w-5 h-5 text-emerald-500 shrink-0"/> {t('partner.feat2')}</li>
            <li className="flex items-start gap-3 text-sm text-slate-600 font-medium"><CheckCircle className="w-5 h-5 text-emerald-500 shrink-0"/> {t('partner.feat3')}</li>
            <li className="flex items-start gap-3 text-sm text-slate-600 font-medium"><CheckCircle className="w-5 h-5 text-emerald-500 shrink-0"/> {t('partner.feat4')}</li>
          </ul>
          
                    {isSuspended ? (
            <button 
              onClick={() => handleSubscribePro("PRO")}
              disabled={isVerifyingSub}
              className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl text-xs hover:bg-purple-700 transition shadow-lg"
            >
              {isVerifyingSub ? t('partner.loading') : t('partner.reactivatePro')}
            </button>
          ) : (false) ? (
            <button 
              onClick={() => handleSubscribePro("PRO")}
              disabled={isVerifyingSub}
              className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl text-xs hover:bg-slate-800 transition shadow-lg"
            >
              {t('partner.downgradeBase')}
            </button>
          ) : (
            <button disabled className="w-full py-3.5 bg-slate-100 text-slate-500 font-bold rounded-xl cursor-not-allowed text-xs">
              {t('partner.yourCurrentPlan')}
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
            <FileText className="w-4 h-4" /> {t('partner.manageBilling')}
          </button>
          {!isSuspended && (
            <button
              onClick={handleCancelSubscription}
              disabled={cancelingSubscription}
              className="bg-white border border-rose-200 text-rose-600 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-rose-50 transition shadow-sm disabled:opacity-50"
            >
              {cancelingSubscription ? t('partner.canceling') : t('partner.cancelSub')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
