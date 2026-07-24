import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useOutletContext } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { Sparkles, Check, CheckCircle, AlertCircle, XCircle, FileText, Download, Building2, Banknote, Star } from "lucide-react";
import { Business } from "../../../types";

interface PartnerContextType {
  business: Business | null;
  staff: any[];
}


const StaffFinanceCard: React.FC<{ staffMember: any, staffLedgers: any[], setSelectedInvoice: any }> = ({ staffMember, staffLedgers, setSelectedInvoice }) => {
    const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const staffRevenue = staffLedgers.reduce((sum, item) => sum + Number(item.amount_total || item.amount || 0), 0);
  
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h5 className="font-black text-lg text-slate-900">{staffMember.full_name}</h5>
        <div className="flex gap-4">
           <div className="text-center">
              <p className="text-[10px] font-black uppercase text-slate-400">{t('txt_servi_os') || 'Serviços'}</p>
              <p className="text-xl font-black text-slate-700">{staffLedgers.length}</p>
           </div>
           <div className="text-center">
              <p className="text-[10px] font-black uppercase text-purple-600">{t('txt_fatura_o') || 'Faturação'}</p>
              <p className="text-xl font-black text-purple-700">{staffRevenue.toFixed(2)}€</p>
           </div>
        </div>
      </div>
      
      <div className="mt-4 border-t border-slate-100 pt-3 flex justify-center">
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors">
          {isExpanded ? 'Ocultar Serviços' : 'Expandir/Ver Serviços'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 border-t border-slate-100 pt-4 w-full overflow-x-auto custom-scrollbar pb-2 min-w-0">
          <div className="overflow-x-auto w-full block sm:table"><table className="w-full text-left text-xs min-w-max">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              <tr>
                <th className="py-2 px-3">{t('txt_data_201') || 'Data'}</th>
                <th className="py-2 px-3">{t('txt_cliente_202') || 'Cliente'}</th>
                <th className="py-2 px-3">{t('txt_servi_o_37') || 'Serviço'}</th>
                <th className="py-2 px-3">{t('txt_m_todo') || 'Método'}</th>
                <th className="py-2 px-3 text-right">{t('txt_valor_203') || 'Valor'}</th>
                <th className="py-2 px-3 text-center">{t('details') || 'Detalhes'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {staffLedgers.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-3 font-mono text-slate-500">{new Date(item.created_at).toLocaleDateString('pt-PT')}</td>
                  <td className="py-2 px-3 font-bold">{item.booking?.profiles?.full_name || 'Desconhecido'}</td>
                  <td className="py-2 px-3">{item.booking?.service?.name}</td>
                  <td className="py-2 px-3">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${item.payment_method === "stripe" ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {item.payment_method === "stripe" ? "Online" : "Loja"}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-black text-slate-700">{Number(item.amount_total || item.amount || 0).toFixed(2)}€</td>
                  <td className="py-2 px-3 text-center">
                    <button onClick={() => setSelectedInvoice({ ...item, booking: item.booking })} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-[10px] transition">{t('txt_recibo_204') || 'Recibo'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
    </div>
  );
}

export default function FinanceTab() {
    const { t } = useTranslation();
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
  const [ledgerFilter, setLedgerFilter] = useState<'today' | 'week' | 'month' | 'custom'>('week');
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const loadFinanceData = async () => {
    if (!business || !business.id) {
       console.error("ERRO: ID da loja está nulo ou indefinido no FinanceTab");
       return;
    }
    
    try {
      const now = new Date();
      let startDate = new Date();
      startDate.setHours(0,0,0,0);
      let endDate = new Date(now);
      
      if (ledgerFilter === 'week') {
         startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (ledgerFilter === 'month') {
         startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      } else if (ledgerFilter === 'custom') {
         startDate = new Date(customStartDate);
         endDate = new Date(customEndDate);
         endDate.setHours(23,59,59,999);
      }
      
      
      const formatDateStr = (d: Date) => {
         const yyyy = d.getFullYear();
         const mm = String(d.getMonth() + 1).padStart(2, '0');
         const dd = String(d.getDate()).padStart(2, '0');
         return `${yyyy}-${mm}-${dd}`;
      }

      const startStr = startDate.toISOString();
      const endStr = endDate.toISOString();

            const [
        { data: pyData, error: pyError },
        { data: poData },
        { data: subData },
        { data: bkData, error: bkError }
      ] = await Promise.all([
        supabase.from("payments").select("*, booking:bookings(id, created_at, booking_date, total_price, payment_method, booking_status, staff_id, customer_id, profiles!bookings_customer_id_fkey(id, full_name, email), service:services(id, name, price), staff:staff(id, full_name), original_service_price, discount_applied)").eq("business_id", business.id),
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
        supabase.from("bookings").select("*, profiles!bookings_customer_id_fkey(id, full_name, email), service:services(id, name, price), staff(id, full_name)").eq("business_id", business.id)
      ]);

      console.log("ID DA LOJA ATUAL:", business.id);
      


      const stripePayments = (pyData || []).filter(p => p.payment_status === 'paid');
      const stripePaymentBookingIds = new Set(stripePayments.map(p => p.booking_id));

      const localCompleted = (bkData || []).filter(b => {
        const isLocal = b.payment_method === 'local' || !b.payment_method;
        const fallbackPrice = Number((b.original_service_price ?? b.total_price) || 0);
        return fallbackPrice >= 0 && isLocal && (b.booking_status === 'completed') && !stripePaymentBookingIds.has(b.id);
      }).map(b => {
        const fallbackPrice = Number((b.original_service_price ?? b.total_price) || 0);
        return {
          id: `loc_${b.id}`,
          created_at: b.booking_date ? b.booking_date + "T12:00:00Z" : b.created_at,
          booking_id: b.id,
          staff_id: b.staff_id,
          payment_method: 'local',
          payment_status: 'paid',
          amount_total: fallbackPrice,
          amount: fallbackPrice,
          glamzo_fee: 0,
          business_amount: fallbackPrice,
          description: `Serviço de Loja (Ref: ${b.id.substring(0,6)})`,
          booking: b
        };
      });

      // Add staff_id to stripe payments if they map to a booking
      const fullBkMap = new Map((bkData || []).map(b => [b.id, b]));
      stripePayments.forEach(p => {
        let b = p.booking;
        if (!b && p.booking_id && fullBkMap.has(p.booking_id)) {
            b = fullBkMap.get(p.booking_id);
            p.booking = b;
        }
        
        if (b) {
           p.staff_id = b.staff_id;
           // ensure customer profile is there if not loaded by join
           if (!b.customer_profile && fullBkMap.has(p.booking_id)) {
              p.booking = fullBkMap.get(p.booking_id);
              b = p.booking;
           }
           p.created_at = b.booking_date ? b.booking_date + "T12:00:00Z" : p.created_at;
           
           // Override the amount_total to reflect the true value (ignoring discounts)
           const actualValue = Number((b.original_service_price ?? b.total_price) || 0);
           p.amount_total = actualValue;
           p.amount = actualValue;
           p.business_amount = actualValue;
        }
      });

      const validStripePayments = stripePayments.filter(p => p.booking && p.booking.booking_status === 'completed');
      setLedgers([...validStripePayments, ...localCompleted]);
      setPayouts(poData || []);
      setSubscriptions(subData || [] || []);

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
    
    const getLocalDateStr = (d: Date) => {
      return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
    };
    const todayStr = getLocalDateStr(now);

    return ledgers.filter(item => {
      const itemDate = new Date(item.created_at);
      const itemDateStr = getLocalDateStr(itemDate);
      
      if (ledgerFilter === 'today') {
        return itemDateStr === todayStr;
      }
      
      // For week/month/year we want to include anything up to the end of today
      const endOfToday = new Date(now);
      endOfToday.setHours(23, 59, 59, 999);

      if (ledgerFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        weekAgo.setHours(0, 0, 0, 0);
        return itemDate >= weekAgo && itemDate <= endOfToday;
      }
      if (ledgerFilter === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        monthAgo.setHours(0, 0, 0, 0);
        return itemDate >= monthAgo && itemDate <= endOfToday;
      }
      if (ledgerFilter === 'year') {
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        yearAgo.setHours(0, 0, 0, 0);
        return itemDate >= yearAgo && itemDate <= endOfToday;
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
        (business?.selected_plan === "app_tablet" || business?.selected_plan === "pro_terminal" || business?.tablet_requested) ? "PRO Terminal" : "Glamzo PRO"
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
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in text-slate-700 py-6 min-w-0">
      <div className="border-b border-slate-100 pb-5 text-left">
        <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
          
                            {t('txt_fatura_o_e_livro_de_raz_es') || 'Faturação e Livro de Razões'}
                          </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          
                            {t('txt_acompanhe_as_suas_m_tricas_de') || 'Acompanhe as suas métricas de faturação e consulte o livro de razões detalhado.'}
                          </p>
      </div>

      {globalError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold animate-fade-in">
          {globalError}
        </div>
      )}

      {/* 3. Histórico de Transações */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" />
            
                                  {t('txt_fatura_o_e_livro_de_raz_es') || 'Faturação e Livro de Razões'}
                                </h4>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setLedgerFilter('today')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${ledgerFilter === 'today' ? 'bg-purple-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>{t('txt_hoje_205') || 'Hoje'}</button>
              <button onClick={() => setLedgerFilter('week')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${ledgerFilter === 'week' ? 'bg-purple-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>{t('txt_semana_206') || 'Semana'}</button>
              <button onClick={() => setLedgerFilter('month')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${ledgerFilter === 'month' ? 'bg-purple-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>{t('txt_m_s') || 'Mês'}</button>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-sm" onClick={() => setLedgerFilter('custom')}>
                <input type="date" value={customStartDate} onChange={e => { setCustomStartDate(e.target.value); setLedgerFilter('custom'); }} className="text-xs font-bold text-slate-700 bg-transparent outline-none p-1" />
                <span className="text-slate-300">-</span>
                <input type="date" value={customEndDate} onChange={e => { setCustomEndDate(e.target.value); setLedgerFilter('custom'); }} className="text-xs font-bold text-slate-700 bg-transparent outline-none p-1" />
              </div>
            </div>
          </div>
          <button
            onClick={handleDownloadCSV}
            className="bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            
                                  {t('txt_exportar_csv') || 'Exportar CSV'}
                                </button>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{t('txt_volume_bruto') || 'Volume Bruto'}</span>
             <span className="text-lg font-black text-slate-900 mt-1 block font-mono">{totalVolumeBruto.toFixed(2)}€</span>
           </div>
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{t('txt_lucro_l_quido') || 'Lucro Líquido'}</span>
             <span className="text-lg font-black text-emerald-600 mt-1 block font-mono">{totalReceivedVolume.toFixed(2)}€</span>
           </div>
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{t('txt_comiss_es') || 'Comissões'}</span>
             <span className="text-lg font-black text-rose-500 mt-1 block font-mono">{totalComissoesRetidas.toFixed(2)}€</span>
           </div>
           <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{t('txt_online_207') || 'Online'}</span>
             <span className="text-lg font-black text-purple-600 mt-1 block font-mono">{totalReceivedVolumeOnline.toFixed(2)}€</span>
           </div>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h5 className="font-bold text-xs text-slate-900 mb-3 uppercase tracking-widest">{t('txt_fatura_o_por_profissional') || 'Faturação por Profissional'}</h5>
            <div className="space-y-3">
              {staff?.map(s => {
                const staffRevenue = filteredLedgers.filter(l => l.staff_id === s.id).reduce((sum, item) => sum + Number(item.amount_total || item.amount || 0), 0);
                if (staffRevenue === 0) return null;
                const percentage = totalVolumeBruto > 0 ? (staffRevenue / totalVolumeBruto) * 100 : 0;
                return (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-2">
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
                <p className="text-xs text-slate-500 text-center py-2">{t('txt_sem_dados_de_profissionais_no') || 'Sem dados de profissionais no período.'}</p>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-center items-center text-center">
            <Star className="w-8 h-8 text-amber-400 mb-2" />
            <h5 className="font-bold text-xs text-slate-900 uppercase tracking-widest mb-1">{t('txt_total_de_transa_es') || 'Total de Transações'}</h5>
            <span className="text-3xl font-black text-slate-900 font-mono">{filteredLedgers.length}</span>
            <p className="text-[10px] text-slate-400 mt-2">{t('txt_transa_es_no_per_odo_seleciona') || 'Transações no período selecionado'}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 w-full overflow-x-auto custom-scrollbar shadow-sm pb-2 min-w-0">
          <div className="overflow-x-auto w-full block sm:table"><table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              <tr>
                <th className="py-3 px-4">{t('txt_data_208') || 'Data'}</th>
                <th className="py-3 px-4">{t('txt_descri_o') || 'Descrição'}</th>
                <th className="py-3 px-4">{t('txt_m_todo') || 'Método'}</th>
                <th className="py-3 px-4 text-right">{t('txt_valor_209') || 'Valor'}</th>
                <th className="py-3 px-4 text-center">{t('txt_a_es') || 'Ações'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLedgers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">{t('txt_nenhuma_transa_o_registada') || 'Nenhuma transação registada.'}</td>
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
                        
                                                        {t('txt_ver_detalhes') || 'Ver Detalhes'}
                                                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table></div>
        </div>
      </div>

      {/* 4. Métricas por Profissional Detalhadas */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6">
        <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-slate-600" />
          
                            {t('txt_fatura_o_detalhada_por_profiss') || 'Faturação Detalhada por Profissional'}
                          </h4>
        <div className="space-y-6">
          {staff?.map(s => {
            const staffLedgers = filteredLedgers.filter(l => l.staff_id === s.id);
            if (staffLedgers.length === 0) return null;
            const staffRevenue = staffLedgers.reduce((sum, item) => sum + Number(item.amount_total || item.amount || 0), 0);
            
            return (
              
<StaffFinanceCard key={s.id} staffMember={s} staffLedgers={staffLedgers} setSelectedInvoice={setSelectedInvoice} />
          );
        })
}
          {(!staff || staff.length === 0 || filteredLedgers.filter(l => l.staff_id).length === 0) && (
            <p className="text-xs text-slate-500 text-center py-4">{t('txt_sem_dados_de_profissionais_no') || 'Sem dados de profissionais no período.'}</p>
          )}
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
              <h4 className="font-extrabold text-lg text-slate-900">{t('txt_fatura_simplificada') || 'Fatura Simplificada'}</h4>
              <p className="text-[10px] text-slate-400 font-mono mt-1">{t('txt_id') || 'ID:'} {selectedInvoice.id.substring(0, 8).toUpperCase()}</p>
            </div>
            <div className="p-6 space-y-4 text-sm">
              {selectedInvoice.booking && (
                <>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-bold">{t('txt_cliente_210') || 'Cliente'}</span>
                    <span className="font-bold text-slate-900">{selectedInvoice.booking?.profiles?.full_name || 'Desconhecido'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-bold">{t('txt_servi_o_38') || 'Serviço'}</span>
                    <span className="font-bold text-slate-900 text-right">{selectedInvoice.booking.service?.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-bold">{t('txt_profissional_211') || 'Profissional'}</span>
                    <span className="font-bold text-slate-900 text-right">{selectedInvoice.booking?.staff?.full_name || 'Funcionário Desconhecido'}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-bold">{t('txt_data_212') || 'Data'}</span>
                <span className="font-mono text-slate-900">{new Date(selectedInvoice.created_at).toLocaleString("pt-PT")}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-bold">{t('txt_m_todo') || 'Método'}</span>
                <span className="font-bold uppercase text-slate-900">{selectedInvoice.payment_method}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-bold">{t('txt_valor_bruto') || 'Valor Bruto'}</span>
                <span className="font-mono font-black text-slate-900">{Number(selectedInvoice.amount || selectedInvoice.amount_total || 0).toFixed(2)}€</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-rose-500 font-bold">{t('txt_comiss_o_plataforma') || 'Comissão Plataforma'}</span>
                <span className="font-mono font-black text-rose-500">-{Number(selectedInvoice.glamzo_fee || 0).toFixed(2)}€</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-900 font-black">{t('txt_valor_l_quido_recebido') || 'Valor Líquido Recebido'}</span>
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
