import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CreditCard, ShieldCheck, Lock, AlertCircle, 
  ArrowLeft, CheckCircle2, ShoppingBag, BadgeEuro, Sparkles, RefreshCw
} from 'lucide-react';
import { financeService } from '../utils/financeService';

export default function StripeSimulatedCheckout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selector state
  const [paymentType, setPaymentType] = useState<'card' | 'mbway'>('card');

  // Form states
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCVC, setCardCVC] = useState('123');
  const [cardName, setCardName] = useState('Cliente Glamzo Premium');
  const [mbWayPhone, setMbWayPhone] = useState('912 345 678');

  // Input parameters
  const type = searchParams.get('type') || 'booking_payment';
  const amount = Number(searchParams.get('amount') || 0);
  const bookingId = searchParams.get('bookingId');
  const businessId = searchParams.get('businessId') || '';
  const planName = searchParams.get('planName') || '';
  const creditAmount = Number(searchParams.get('creditAmount') || 0);
  const packageLabel = searchParams.get('packageLabel') || '';
  const customerEmail = searchParams.get('customerEmail') || '';
  const businessName = searchParams.get('businessName') || 'Glamzo Partner';
  const serviceName = searchParams.get('serviceName') || 'Serviço de Estética';
  const couponUsed = searchParams.get('couponUsed') || '';
  
  const rawSuccessUrl = searchParams.get('successUrl');
  const rawCancelUrl = searchParams.get('cancelUrl');

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Trigger the server-side simulated webhook to update database statuses safely
      const response = await fetch('/api/webhooks/stripe-simulated', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          bookingId,
          businessId,
          planName,
          creditAmount,
          couponUsed
        })
      });

      if (!response.ok) {
        throw new Error('Ocorreu um erro ao comunicar com a Gateway Stripe.');
      }

      // 2. Update local services, balances, subscriptions, and points
      if (type === 'booking_payment') {
        // Find customer ID to grant them loyalty points
        // In local storage sessions, get user id or default client user
        const localAuth = localStorage.getItem('glamzo_registered_user');
        const loginSess = localStorage.getItem('glamzo_auth_session');
        let customerId = 'current';
        if (loginSess) {
          try { customerId = JSON.parse(loginSess).user.id; } catch(_) {}
        } else if (localAuth) {
          try { customerId = JSON.parse(localAuth).id; } catch(_) {}
        }
        
        // Reward client 100 points per agenda booking
        financeService.addCustomerPoints(customerId, 100);

        // Adjust Partner balance (Loja receives booking base value MENOS Glamzo commission)
        // Check if business has subscription to assign rate
        const sub = financeService.getBusinessSubscription(businessId);
        const isPro = sub.plan_name === 'PRO';
        
        // Assume base price is the price paid (or slightly higher if coupon is applied)
        // Standard split logic:
        const calculated = financeService.calculateSplit(amount, 0, isPro);
        financeService.adjustPartnerBalance(businessId, calculated.businessAmount);
      } 
      
      else if (type === 'subscription_payment' && businessId) {
        // Upgrade business subscription in local storage immediately
        financeService.activateProSubscription(businessId, couponUsed);
      } 
      
      else if (type === 'credits_payment' && businessId && creditAmount) {
        // Grant credits package to partner in local storage immediately
        financeService.addCreditsToBusiness(businessId, creditAmount);
      }

      // Success animation trigger
      setSuccess(true);
      setTimeout(() => {
        // Redirect back to application with success state
        if (rawSuccessUrl) {
          window.location.href = rawSuccessUrl;
        } else {
          // If no redirect exists, route page based on role/activity
          if (type === 'booking_payment') {
            navigate('/account?status=success');
          } else {
            navigate('/dashboard?status=success_pro');
          }
        }
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha no processamento do pagamento.');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (rawCancelUrl) {
      window.location.href = rawCancelUrl;
    } else {
      navigate(-1);
    }
  };

  const fillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/29');
    setCardCVC('332');
    setCardName('Ana Carolina Silva');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col md:flex-row font-sans">
      
      {/* LEFT COLUMN: Order Summary (Stripe style) */}
      <div className="flex-1 bg-slate-950 p-6 md:p-12 lg:p-16 flex flex-col justify-between border-r border-slate-800">
        <div>
          {/* Logo Stripe Secure checkout header */}
          <div className="flex items-center gap-2 mb-10 text-slate-400">
            <BadgeEuro className="w-6 h-6 text-rose-500 animate-pulse" />
            <span className="text-white font-extrabold text-sm tracking-widest uppercase">Glamzo Pay</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-900/50 px-2 py-0.5 rounded font-mono">Modo Seguro</span>
          </div>

          <button
            onClick={handleCancel}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-all cursor-pointer mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao site Glamzo</span>
          </button>

          {/* Dynamic Summary description */}
          <div className="space-y-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-black tracking-widest block">Resumo do Pedido</span>
            
            {type === 'booking_payment' && (
              <div className="space-y-3">
                <span className="text-slate-400 text-sm block">Agendamento de Serviço de Beleza</span>
                <h1 className="text-3xl font-extrabold text-white leading-tight">
                  {serviceName}
                </h1>
                <p className="text-xs text-slate-400 font-medium">Estúdio: <span className="text-white font-bold">{businessName}</span></p>
                {customerEmail && <p className="text-xs text-slate-500 font-mono italic">Contacto: {customerEmail}</p>}
                
                <div className="pt-4 border-t border-slate-900 text-xs text-slate-400 space-y-2">
                  <div className="flex justify-between">
                    <span>Preço de Catálogo</span>
                    <span className="text-white">{(amount - 1.50).toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Taxa Administrativa Stripe</span>
                    <span>1.50€</span>
                  </div>
                </div>
              </div>
            )}

            {type === 'subscription_payment' && (
              <div className="space-y-2">
                <span className="text-rose-400 font-mono tracking-wider text-[11px] font-bold">Subscrição Profissional</span>
                <h1 className="text-3xl font-black text-white">Glamzo {planName}</h1>
                <span className="text-xs text-slate-400">Acesso ilimitado à plataforma, agenda física e comissões reduzidas de 5%</span>
              </div>
            )}

            {type === 'credits_payment' && (
              <div className="space-y-2">
                <span className="text-indigo-400 font-mono tracking-wider text-[11px] font-bold">Créditos de Marketing</span>
                <h1 className="text-3xl font-black text-white">+{creditAmount} Créditos</h1>
                <p className="text-xs text-slate-400">Pacote promocional: <span className="text-indigo-200 font-bold">{packageLabel}</span></p>
              </div>
            )}
          </div>
        </div>

        {/* Amount to pay display */}
        <div className="mt-8 pt-6 border-t border-slate-800 space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-400">Total a pagar</span>
            <span className="text-4xl font-black text-white tracking-tight">{amount.toFixed(2)}€</span>
          </div>

          <p className="text-[10px] text-slate-500 flex items-center gap-1.5 leading-normal bg-slate-900/40 p-3 rounded-xl border border-slate-800/40">
            <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Este pagamento está encriptado e processado em total conformidade com as normas bancárias da UE.</span>
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Card Checkout Form */}
      <div className="flex-1 bg-slate-900 p-6 md:p-12 lg:p-16 flex flex-col justify-center max-w-xl mx-auto md:max-w-none w-full">
        {success ? (
          <div className="text-center space-y-4 max-w-sm mx-auto py-12">
            <div className="w-20 h-20 bg-emerald-950 text-emerald-400 flex items-center justify-center rounded-full mx-auto border border-emerald-800">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h2 className="text-2xl font-black text-white">Pagamento Confirmado!</h2>
            <p className="text-xs text-slate-400">
              {paymentType === 'mbway' 
                ? 'A transação via MB WAY foi autorizada pelo seu telemóvel com sucesso.' 
                : 'A transação via cartão de crédito foi validada e registada com sucesso na rede Stripe.'}
            </p>
            <div className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono bg-emerald-950/40 px-3 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-yellow-400" />
              <span>Sincronizando agendamento...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePay} className="space-y-6 max-w-md mx-auto w-full">
            {/* Payment Selector Header */}
            <div className="space-y-3">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-rose-500 animate-pulse" />
                  <span>Método de Pagamento Seguro</span>
                </h2>
                <p className="text-xs text-slate-400">Escolha como gostaria de efetuar este pagamento.</p>
              </div>

              {/* High-Fidelity Selector Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setPaymentType('card')}
                  className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
                    paymentType === 'card' 
                      ? 'bg-gradient-to-tr from-[#8B5CF6] to-[#6366F1] text-white font-black shadow shadow-indigo-950' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Cartão de Crédito</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType('mbway')}
                  className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
                    paymentType === 'mbway' 
                      ? 'bg-gradient-to-tr from-[#42dca3] to-[#10b981] text-slate-950 font-black shadow shadow-emerald-950' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-4 h-4 bg-slate-900 border border-white/20 text-[#42dca3] font-mono flex items-center justify-center shrink-0 rounded text-[9px] font-extrabold leading-none">MB</span>
                  <span>MB WAY</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/20 text-rose-400 border border-rose-900/50 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {paymentType === 'card' ? (
              <div className="space-y-4">
                {/* Card inputs grid */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-wiest">Card number</label>
                    <span className="text-[9px] font-mono text-[#8B5CF6] font-bold">Stripe Sandbox (Real)</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-950 text-white rounded-xl border border-slate-800 focus:border-rose-500 px-4 py-3 text-sm focus:outline-none transition-all font-mono"
                      placeholder="4242 4242 4242 4242"
                    />
                    <div className="absolute right-3.5 top-3 text-slate-500 text-xs flex items-center gap-1.5 font-bold">
                      <span>CRÉDITO</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-wiest">Expires</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-slate-950 text-white rounded-xl border border-slate-800 focus:border-rose-500 px-4 py-3 text-sm focus:outline-none transition-all font-mono"
                      placeholder="MM / YY"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-wiest">CVC Code</label>
                    <input
                      type="password"
                      required
                      value={cardCVC}
                      onChange={(e) => setCardCVC(e.target.value)}
                      className="w-full bg-slate-950 text-white rounded-xl border border-slate-800 focus:border-rose-500 px-4 py-3 text-sm focus:outline-none transition-all font-mono"
                      placeholder="•••"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-wiest">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full bg-slate-950 text-white rounded-xl border border-slate-800 focus:border-rose-500 px-4 py-3 text-sm focus:outline-none transition-all font-sans font-bold"
                    placeholder="Nome escrito no cartão"
                  />
                </div>

                {/* Quick-fill Button for testing */}
                <button
                  type="button"
                  onClick={fillTestCard}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700/80 text-white rounded-xl font-mono text-[10px] uppercase tracking-wider font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-rose-500 animate-spin" />
                  <span>Autocompletar Cartão de Teste (Sandbox)</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* MB WAY layout */}
                <div className="p-4 bg-emerald-950/20 border border-emerald-900/35 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-slate-950 border border-emerald-500/30 text-[#42dca3] font-mono flex items-center justify-center shrink-0 rounded text-xs font-extrabold leading-none">MB</span>
                    <div>
                      <h4 className="text-xs font-bold text-[#42dca3]">Pagamento Via MB WAY</h4>
                      <p className="text-[10px] text-slate-400">Insira o seu número de telemóvel registado.</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed font-sans mt-1">
                    Irá receber uma notificação de confirmação no seu telemóvel. Terá 5 minutos para aceitar a operação na aplicação oficial do seu banco ou MB WAY.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-black tracking-wiest">Telemóvel Nacional (Portugal)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-slate-400 font-bold font-mono text-xs">+351</span>
                    <input
                      type="tel"
                      required
                      value={mbWayPhone}
                      onChange={(e) => setMbWayPhone(e.target.value)}
                      className="w-full bg-slate-950 text-white rounded-xl border border-slate-800 focus:border-emerald-500 pl-16 pr-4 py-3 text-sm focus:outline-none transition-all font-mono font-bold tracking-widest"
                      placeholder="9xx xxx xxx"
                    />
                  </div>
                </div>

                {/* Quick-fill for MB WAY */}
                <button
                  type="button"
                  onClick={() => setMbWayPhone('912 345 678')}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700/80 text-white rounded-xl font-mono text-[10px] uppercase tracking-wider font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  <span>Autocompletar Telemóvel de Simulação</span>
                </button>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4.5 text-sm font-black uppercase tracking-wider rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xl ${
                loading 
                  ? 'opacity-70 bg-slate-800' 
                  : paymentType === 'mbway'
                    ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-slate-950 shadow-emerald-950/20'
                    : 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-rose-950/20'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>
                    {paymentType === 'mbway' 
                      ? 'A aguardar aceitação na App MB WAY...' 
                      : 'A Processar Pagamento Bancário...'}
                  </span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {paymentType === 'mbway' 
                      ? `Confirmar MB WAY ${amount.toFixed(2)}€` 
                      : `Pagar Agora ${amount.toFixed(2)}€`}
                  </span>
                </>
              )}
            </button>

            {/* Back button */}
            <button
              type="button"
              onClick={handleCancel}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-400 cursor-pointer transition py-2"
            >
              Cancelar e Voltar para a área de cliente
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
