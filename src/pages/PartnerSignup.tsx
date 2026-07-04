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

  // Unified single-screen state
  const [codeSent, setCodeSent] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('step') === 'verify';
  });

  // Form states
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

  // Verification code
  const [enteredCode, setEnteredCode] = useState('');

  const handleSendCode = async (e: React.MouseEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMsg('Preencha todos os campos obrigatórios da sua conta para podermos gerar o código.');
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

      setCodeSent(true);
      setSuccessMsg('Código enviado! Por favor, introduza o código recebido abaixo. Verifique também a pasta de Spam.');
    } catch (err: any) {
      console.error('Failed to trigger verification email or create profile', err);
      let userFriendlyMessage = err.message || 'Falha ao registar conta. Tente novamente mais tarde.';
      if (err.message?.includes('already registered') || err.message?.toLowerCase().includes('already')) {
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
      console.log('[PartnerOTP] código confirmado com sucesso. Atualizado profile para business.');
      
      const p = await refreshProfile();
      console.log('[PartnerAuth] profile role=business carregado para user:', authUser.id);

      const { resolvePartnerRoute } = await import('../utils/partnerRouting');
      const route = await resolvePartnerRoute(authUser, 'business', supabase);
      console.log('[PartnerRoute] redirect =>', route);

      setSuccessMsg('E-mail verificado com sucesso! Por favor continue para configurar o seu estabelecimento.');
      setTimeout(() => {
        navigate(route, { replace: true });
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
          
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-5">
            <h3 className="text-lg font-bold text-slate-800">Dados da Empresa</h3>
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
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-4">
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
                      disabled={codeSent}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 placeholder:text-slate-600 disabled:opacity-60"
                      placeholder="ex. Profissional Responsável"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    E-mail Comercial de Acesso
                  </label>
                  <div className="flex gap-2">
                    <div className="relative rounded-xl shadow-sm flex-1">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        required
                        disabled={codeSent}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 placeholder:text-slate-600 disabled:opacity-60"
                        placeholder="geral@oseunegocio.com"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={loading || codeSent || !acceptedTerms}
                      className="flex items-center justify-center gap-1.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl font-bold font-sans text-[11px] uppercase tracking-wider transition-all shadow-sm cursor-pointer whitespace-nowrap"
                    >
                      {loading && !codeSent ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : codeSent ? (
                        'Código Enviado ✓'
                      ) : (
                        'Enviar Código'
                      )}
                    </button>
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
                        disabled={codeSent}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full px-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 placeholder:text-slate-600 disabled:opacity-60"
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
                      disabled={codeSent}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 placeholder:text-slate-600 disabled:opacity-60"
                      placeholder="Repita a senha"
                    />
                  </div>
                </div>

                {/* Checkbox Terms */}
                <div className="flex items-start gap-2 pt-2 pb-2">
                  <input
                    type="checkbox"
                    id="terms-partner"
                    disabled={codeSent}
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-purple-600 bg-white border-slate-300 rounded focus:ring-purple-500 cursor-pointer disabled:opacity-50"
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
              </div>

              {codeSent && (
                <div className="mt-6 p-5 bg-purple-50/50 border border-purple-100 rounded-2xl animate-fade-in space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0 mt-0.5">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Verifique a sua pasta de Spam/Lixo!</h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        Por vezes, o e-mail de verificação com o código de 6 dígitos pode ir parar à pasta de Spam, Lixo Comercial ou Promoções. Por favor verifique cuidadosamente.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="verify-code" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 text-center">
                      Insira o Código de Verificação
                    </label>
                    <input
                      id="verify-code"
                      type="text"
                      required
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value)}
                      className="block w-full px-4 py-4 bg-white border border-slate-200 rounded-xl text-center text-2xl font-mono tracking-[0.2em] sm:tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800"
                      placeholder="000000"
                      maxLength={8}
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading || enteredCode.length < 6}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>A verificar...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirmar Código e Registar</span>
                          <Check className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    
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
                          setSuccessMsg('Novo código enviado! Verifique o seu e-mail e SPAM.');
                        } catch (err: any) {
                          console.error('Resend error:', err);
                          setErrorMsg('Falha ao reenviar código: ' + err.message);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="w-full py-2 text-[11px] font-bold text-slate-500 hover:text-slate-800 uppercase tracking-wider"
                    >
                      Não recebeu? Reenviar código
                    </button>
                    
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setCodeSent(false)}
                      className="w-full py-1 text-[11px] font-medium text-slate-400 hover:text-slate-650"
                    >
                      Alterar dados de acesso
                    </button>
                  </div>
                </div>
              )}
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