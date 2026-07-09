import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CreditCard, ShieldCheck, Lock, AlertCircle, 
  ArrowLeft, CheckCircle2, BadgeEuro, Sparkles, RefreshCw, Building2
} from 'lucide-react';

export default function StripeSimulatedConnect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Input parameters
  const businessId = searchParams.get('businessId') || '';

  const handleConnect = () => {
    setLoading(true);
    setTimeout(() => {
      setSuccess(true);
      setTimeout(() => {
        const randomAcct = `acct_simulated_${Math.random().toString(36).substring(2, 7)}`;
        navigate(`/dashboard?status=connect_success&stripe_acct=${randomAcct}&biz_id=${businessId}`);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center font-sans p-6">
      <div className="w-full max-w-md bg-slate-950 rounded-2xl border border-slate-800 p-8 space-y-8 shadow-2xl relative overflow-hidden">
        
        {/* Background ambient accent */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl" />

        {/* Top Branding Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-950 text-indigo-400 rounded-lg border border-indigo-800/40">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-white font-extrabold text-xs tracking-widest uppercase block">Stripe Connect</span>
              <span className="text-[10px] text-slate-500 font-semibold font-mono">Simulador de Sandbox</span>
            </div>
          </div>
          <span className="text-[9px] bg-indigo-950 text-indigo-400 border border-indigo-900 px-2 py-0.5 rounded font-mono font-bold">Standard</span>
        </div>

        {success ? (
          <div className="text-center space-y-4 py-8">
            <div className="w-16 h-16 bg-indigo-950 text-indigo-400 flex items-center justify-center rounded-full mx-auto border border-indigo-800/40">
              <CheckCircle2 className="w-8 h-8 animate-bounce text-emerald-400" />
            </div>
            <h2 className="text-xl font-black text-white">Conexão Autorizada!</h2>
            <p className="text-xs text-slate-600">
              Integração registada com sucesso. Redirecionando para o painel Glamzo...
            </p>
            <div className="inline-flex items-center gap-1.5 text-[10px] text-indigo-400 bg-indigo-950/40 px-3 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-yellow-500" />
              <span>Sincronizando stripe_account_id...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white leading-tight">
                Vincule o seu salão ao Stripe Connect Standard
              </h1>
              <p className="text-xs text-slate-600 leading-relaxed">
                O Glamzo utiliza o Stripe para processar pagamentos de clientes e transferir fundos diretamente para a sua conta bancária a cada sexta-feira, com comissão fixa de apenas 5%.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-4 space-y-3.5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">Split Automatizado</h4>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    Fique com 95% do valor cobrado aos clientes em tempo real, sem papelada ou atrasos.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-slate-950 pt-3">
                <BadgeEuro className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">Faturamento Conforme Normas</h4>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    Todas as transações acompanham disputas automatizadas e faturamento legal europeu integrado.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3.5">
              <button
                onClick={handleConnect}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-tr from-[#6366F1] to-[#4F46E5] hover:opacity-95 text-xs font-bold uppercase tracking-wider text-white rounded-xl shadow-lg hover:shadow-indigo-500/20 active:scale-[0.99] transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gerando Credenciais do Estabelecimento...</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" />
                    <span>Conectar Conta Stripe Standard (Simulado)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/partner/dashboard')}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-600 cursor-pointer transition py-1"
              >
                Voltar sem conectar de momento
              </button>
            </div>

            <div className="pt-4 border-t border-slate-800/50 flex justify-center items-center gap-2 text-slate-600 text-[10px] font-mono">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>OAuth Standard Connect Protocol Secure</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
