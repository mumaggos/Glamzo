import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { 
  Building2, ArrowRight, ArrowLeft, Check, Sparkles, 
  Mail, Loader2, KeyRound, Star, Calendar, ShieldCheck
} from 'lucide-react';

export default function PartnerSignup() {
  const { signOut, user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Onboarding frictionless step tracking
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  
  // States for UX feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSendOTP = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setErrorMsg('Por favor, introduza um e-mail válido.');
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      // Step 1: Request OTP sign in/up
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: window.location.origin + '/partner/setup'
        }
      });

      if (error) throw error;

      setStep(2);
      setSuccessMsg('Código enviado! Verifique o seu e-mail (e a pasta de Spam).');
    } catch (err: any) {
      console.error('OTP Send Error:', err);
      setErrorMsg(err.message || 'Ocorreu um erro ao enviar o código de acesso.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredCode || enteredCode.length < 6) {
      setErrorMsg('O código de verificação deve ter pelo menos 6 dígitos.');
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      // Step 2: Verify OTP code
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: enteredCode.trim(),
        type: 'email'
      });

      if (error || !data.user) {
        throw error || new Error('O código inserido é inválido ou já expirou.');
      }

      const authUser = data.user;

      // Ensure local role is stored to prevent state mismatches during routing
      localStorage.setItem(`local_role_${authUser.id}`, 'business');

      // Sync user profile role in DB
      const { data: profileCheck } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!profileCheck) {
        await supabase.from('profiles').insert({
          id: authUser.id,
          email: email.trim().toLowerCase(),
          role: 'business',
          full_name: email.split('@')[0],
          created_at: new Date().toISOString()
        });
      } else {
        await supabase.from('profiles').update({ role: 'business' }).eq('id', authUser.id);
      }

      await refreshProfile();
      setSuccessMsg('Autenticação confirmada! A redirecionar...');
      
      setTimeout(() => {
        navigate('/partner/setup', { replace: true });
      }, 1000);
    } catch (err: any) {
      console.error('OTP Verification Error:', err);
      setErrorMsg(err.message || 'Ocorreu um erro ao confirmar a sua autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="partner-signup-view" className="min-h-[calc(100vh-64px)] flex font-sans selection:bg-purple-200 selection:text-purple-900 bg-slate-50">
      {/* Left Column: Visual/Promo Split Screen */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#120a21] via-[#1a0e30] to-[#241344] text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_45%)]" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs font-semibold text-purple-300 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>Glamzo Pro</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mt-6 leading-tight max-w-md font-display uppercase">
            Aumente a Faturação do Seu Salão<span className="text-purple-400 font-black">.</span>
          </h1>
          <p className="text-sm text-slate-300 mt-4 leading-relaxed max-w-sm">
            Adira à maior rede de salões e estéticas de elite. Gira a sua agenda, atraia novos clientes e processe pagamentos com zero fricção.
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-300 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Agenda Inteligente Sem Esforço</h4>
              <p className="text-xs text-slate-300 mt-0.5">Automatize as suas marcações e elimine as faltas com SMS e e-mails automáticos.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-300 shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Visibilidade de Elite</h4>
              <p className="text-xs text-slate-300 mt-0.5">Destaque-se nos motores de busca e receba avaliações verificadas de clientes reais.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-300 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Segurança nos Pagamentos</h4>
              <p className="text-xs text-slate-300 mt-0.5">Receba depósitos seguros e garanta as suas receitas com taxas de reserva ou no-show.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400 border-t border-slate-800/60 pt-6 flex justify-between items-center">
          <span>&copy; {new Date().getFullYear()} Glamzo Technologies</span>
          <span>Suporte Técnico 24/7</span>
        </div>
      </div>

      {/* Right Column: Dynamic Form UI */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-white">
        <div className="mx-auto w-full max-w-md space-y-8 animate-fade-in">
          
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-[#110724] tracking-tight font-display uppercase">
              Acesso de Parceiro<span className="text-purple-600 font-black">.</span>
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Introduza o seu e-mail comercial. Enviaremos um código seguro de acesso imediato sem necessidade de passwords complexas.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-150 text-rose-700 rounded-xl text-xs font-semibold">
              <p>{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-150 text-emerald-700 rounded-xl text-xs font-semibold">
              <p>{successMsg}</p>
            </div>
          )}

          {user ? (
            <div className="space-y-6 text-center py-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-sm font-bold text-slate-900">Sessão Ativa Detetada!</p>
              <p className="text-xs text-slate-600">
                Está atualmente ligado como <span className="font-semibold text-purple-600">{profile?.full_name || user.email}</span>.
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate('/partner/setup')}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm text-xs uppercase tracking-wider cursor-pointer"
                >
                  <span>Continuar Configuração</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => {
                    await signOut();
                    window.location.reload();
                  }}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Utilizar Outra Conta (Sair)
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {step === 1 ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                      E-mail Comercial
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-650 transition-all text-slate-800 placeholder:text-slate-400"
                        placeholder="geral@oseunegocio.com"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>A enviar código...</span>
                      </>
                    ) : (
                      <>
                        <span>Receber Código de Acesso</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-[11px] text-slate-400 text-center leading-relaxed">
                    Ao continuar, concorda com os nossos{' '}
                    <Link to="/termos-e-condicoes" target="_blank" className="font-semibold text-purple-600 hover:underline">
                      Termos de Serviço
                    </Link>{' '}
                    e{' '}
                    <Link to="/politica-de-privacidade" target="_blank" className="font-semibold text-purple-600 hover:underline">
                      Política de Privacidade
                    </Link>
                    .
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-5">
                  <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100 text-xs text-purple-800 leading-relaxed flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      Enviámos um código de acesso seguro para o e-mail <span className="font-bold text-purple-900">{email}</span>. Verifique também a pasta de <strong>Spam / Lixo Comercial</strong>.
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 text-center">
                      Código de 6 Dígitos
                    </label>
                    <input
                      type="text"
                      required
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value)}
                      className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl font-mono tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-650 transition-all text-slate-800"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading || enteredCode.length < 6}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>A verificar código...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirmar e Aceder</span>
                          <Check className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="flex justify-between items-center text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setStep(1);
                          setEnteredCode('');
                        }}
                        className="inline-flex items-center gap-1 font-bold text-slate-500 hover:text-slate-800"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Alterar E-mail</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSendOTP}
                        className="font-bold text-purple-600 hover:text-purple-700 hover:underline"
                      >
                        Reenviar Código
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          <p className="text-center text-xs text-slate-500 border-t border-slate-100 pt-6">
            Deseja aceder como cliente?{' '}
            <Link to="/login" className="font-bold text-purple-600 hover:text-purple-700">
              Ir para Login Geral
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
