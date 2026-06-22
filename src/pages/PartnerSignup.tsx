import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { 
  Building2, ArrowRight, ArrowLeft, Check, Sparkles, 
  Mail, Loader2, KeyRound, Eye, EyeOff, User 
} from 'lucide-react';

export default function PartnerSignup() {
  const { signUp, signOut, user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Multi-step form step (1: Account info, 2: Verification)
  const [step, setStep] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('step') === 'verify' ? 2 : 1;
  });

  // Form states - Step 1
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('email') || '';
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Auxiliary states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSignUpProcessActive, setIsSignUpProcessActive] = useState(false);

  // Verification
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMsg('Preencha todos os campos obrigatórios da sua conta.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('A palavra-passe deve conter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('As palavras-passe digitadas não coincidem.');
      return;
    }

    if (!acceptedTerms) {
      setErrorMsg('É obrigatório aceitar os Termos e a Política de Privacidade para prosseguir.');
      return;
    }

    setLoading(true);

    try {
      // Normal flow: Create authentication credential & profile with role 'business'
      // This will trigger Supabase to send the confirmation email
      await signUp(email, password, fullName, 'business');

      setStep(2);
      setSuccessMsg('Enviámos um código para o seu e-mail. Por favor, introduza-o abaixo para concluir o registo.');
    } catch (err: any) {
      console.error('Failed to trigger verification email or create profile', err);
      let userFriendlyMessage = err.message || 'Falha ao registar conta. Tente novamente mais tarde.';
      if (err.message?.includes('already registered')) {
        userFriendlyMessage = 'Este e-mail já está em uso. Por favor, use um e-mail diferente ou faça login.';
      }
      setErrorMsg(userFriendlyMessage);
      setIsSignUpProcessActive(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (enteredCode.length < 6 || enteredCode.length > 8) {
      setErrorMsg('Código de verificação inválido.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    setIsSignUpProcessActive(true);

    try {
      // 1. Verify the OTP code with Supabase
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email: email,
        token: enteredCode,
        type: 'signup'
      });

      if (verifyError || !verifyData.user || !verifyData.session) {
        throw new Error('O código inserido é inválido ou já expirou. Peça um novo código e tente novamente.');
      }
      
      const authUser = verifyData.user;
      
      // Ensure the profile role is set to business
      await supabase.from('profiles').update({ role: 'business' }).eq('id', authUser.id);
      await refreshProfile();

      setSuccessMsg('E-mail verificado com sucesso! Por favor continue para configurar o seu estabelecimento.');
      setTimeout(() => {
        navigate('/setup', { replace: true });
      }, 2000);
    } catch (err: any) {
      setIsSignUpProcessActive(false);
      console.error('Partner Registration error:', err);
      let userFriendlyMessage = err.message || 'Ocorreu um erro ao verificar a conta. Verifique os dados.';
      setErrorMsg(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="partner-signup-view" className="min-h-[calc(100vh-64px)] bg-slate-50 text-slate-800 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-purple-200 selection:text-purple-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl animate-fade-in text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-200 rounded-full text-xs font-semibold text-purple-700 mb-4 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-purple-600" />
          <span>Inscrição Glamzo Parceiros</span>
        </div>
        <h2 className="text-3xl font-extrabold text-[#110724] tracking-tight font-display uppercase">
          Criar Conta Profissional<span className="text-purple-600 font-black">.</span>
        </h2>
        <p className="mt-2 text-xs text-slate-500 font-medium max-w-sm mx-auto">
          Gira a sua agenda de reservas, faturação e visibilidade de forma simples a partir de uma plataforma de elite dedicada.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white border border-slate-100 py-8 px-6 rounded-2xl shadow-sm sm:px-10">
          
          {/* Progress Bar / Steps indicator */}
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>1</span>
              <span className={`text-xs font-semibold ${step === 1 ? 'text-slate-800 font-bold' : 'text-slate-600'}`}>Conta de Acesso</span>
            </div>
            <div className="w-12 h-[1px] bg-slate-100 flex-1 mx-3" />
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>2</span>
              <span className={`text-xs font-semibold ${step === 2 ? 'text-slate-800 font-bold' : 'text-slate-600'}`}>Verificar E-mail</span>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              <p>{errorMsg}</p>
              {(errorMsg.includes('já está registado') || errorMsg.includes('já está associado') || errorMsg.toLowerCase().includes('already')) && (
                <div className="mt-2.5 text-left">
                  <Link 
                    to={`/partner/login?email=${encodeURIComponent(email)}`} 
                    className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-extrabold hover:underline"
                  >
                    <span>Iniciar Sessão como Parceiro Comercial &rarr;</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold animate-pulse">
              <p>{successMsg}</p>
            </div>
          )}

          {/* Active Session Detection Bypass */}
          {user && !isSignUpProcessActive ? (
            <div className="space-y-6 text-center py-4 animate-fade-in">
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl">
                <p className="text-sm font-bold text-slate-900 mb-2">Sessão Ativa Detetada!</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Está atualmente ligado como <span className="font-semibold text-purple-600">{profile?.full_name || user.email}</span> ({profile?.role === 'customer' ? 'Conta de Cliente' : 'Conta de Parceiro'}).
                </p>
              </div>
              {profile?.role === 'customer' ? (
                <div className="space-y-3">
                  <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                    As contas de Cliente e de Parceiro/Loja são totalmente independentes de modo a garantir a separação de dashboards. Por favor, termine a sessão da sua conta de cliente para poder criar o registo comercial do seu salão.
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        await signOut();
                        window.location.reload();
                      } catch (e) {}
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-sm text-xs uppercase tracking-wider cursor-pointer"
                  >
                    <span>Terminar Sessão de Cliente</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-sm text-xs uppercase tracking-wider cursor-pointer"
                >
                  <span>Ir para o Painel do Salão</span>
                </button>
              )}
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Nome Completo do Responsável
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 placeholder:text-slate-600"
                    placeholder="ex. Profissional Responsável"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  E-mail Comercial de Acesso
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 placeholder:text-slate-600"
                    placeholder="geral@oseunegocio.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Palavra-passe
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full px-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 placeholder:text-slate-600"
                      placeholder="Mín. 6 letras"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-600 hover:text-slate-650"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 placeholder:text-slate-600"
                    placeholder="Repita a senha"
                  />
                </div>
              </div>

              {/* Checkbox Terms */}
              <div className="flex items-start gap-2 pt-2 pb-2">
                <input
                  type="checkbox"
                  id="terms-partner"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-purple-600 bg-white border-slate-300 rounded focus:ring-purple-500 cursor-pointer"
                />
                <label htmlFor="terms-partner" className="text-xs text-slate-600 leading-relaxed px-1 cursor-pointer">
                  Li e aceito os{' '}
                  <Link to="/termos-e-condicoes" target="_blank" className="font-semibold text-purple-600 hover:text-purple-700 underline">
                    Termos para Parceiros
                  </Link>{' '}
                  e a{' '}
                  <Link to="/politica-de-privacidade" target="_blank" className="font-semibold text-purple-600 hover:text-purple-700 underline">
                    Política de Privacidade e Tratamento GDPR
                  </Link>
                  .
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !acceptedTerms}
                className="w-full flex items-center justify-center gap-2 mt-2 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl font-bold font-sans text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>A processar...</span>
                  </>
                ) : (
                  <>
                    <span>Registar e Avançar</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : null}

          {/* Step 2: Verify OTP form */}
          {step === 2 && (
            <form className="space-y-4 animate-fade-in" onSubmit={handleRegister}>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full mb-4">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Verifique o seu e-mail</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Enviámos um código de 8 dígitos para o e-mail: <strong className="text-slate-800">{email}</strong>
                </p>
              </div>

              <div>
                <label htmlFor="verify-code" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 text-center">
                  Código de Verificação
                </label>
                <input
                  id="verify-code"
                  type="text"
                  required
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value)}
                  className="block w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-2xl font-mono tracking-[0.2em] sm:tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800"
                  placeholder="00000000"
                  maxLength={8}
                />
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Voltar</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading || enteredCode.length < 6}
                    className="w-2/3 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>A verificar...</span>
                      </>
                    ) : (
                      <>
                        <span>Criar Conta</span>
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={async () => {
                    setLoading(true);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    try {
                      const { error } = await supabase.auth.resend({
                        type: 'signup',
                        email: email,
                      });
                      if (error) throw error;
                      setSuccessMsg('Novo código enviado! Verifique o seu e-mail.');
                    } catch (err: any) {
                      console.error('Resend error:', err);
                      setErrorMsg('Falha ao reenviar código: ' + err.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="w-full py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
                >
                  Não recebeu? Reenviar novo código
                </button>
              </div>
            </form>
          )}

          <p className="mt-8 text-center text-xs text-slate-500">
            Deseja aceder a uma conta existente?{' '}
            <Link to="/partner/login" className="font-bold text-purple-600 hover:text-purple-700">
              Iniciar sessão profissional
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
