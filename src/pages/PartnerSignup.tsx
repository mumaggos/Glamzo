import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, ArrowRight, Loader2, Eye, EyeOff, User, Mail, ShieldCheck } from 'lucide-react';

export default function PartnerSignup() {
  const { signUp, signOut, user, profile } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already logged in as business, redirect to setup or dashboard
  if (user && profile?.role === 'business' && !successMsg) {
    return <Navigate to="/setup" replace />;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

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
      // 1. Create authentication credential & profile with role 'business'
      const authResult = await signUp(email, password, fullName, 'business');
      const authUser = authResult?.user;

      if (!authUser) {
        throw new Error('Falha ao registar credenciais. Verifique os dados digitados.');
      }

      setSuccessMsg('Conta criada com sucesso! Por favor, verifique o seu email para confirmar a conta e poder aceder ao Setup da sua Loja.');
      setFullName('');
      setPassword('');
      setConfirmPassword('');
      setAcceptedTerms(false);
      
      // Usually after signup with email confirmation, Supabase won't create a session yet.
      // If it does create a session (auto-confirm enabled), the redirect logic above will trigger or they can just click a button.
      setTimeout(() => {
         // Optionally redirect to login or setup
         if (authUser.email_confirmed_at || authResult.session) {
             navigate('/setup', { replace: true });
         }
      }, 3000);

    } catch (err: any) {
      console.error('Partner Registration error:', err);
      let userFriendlyMessage = err.message || 'Ocorreu um erro ao criar a conta de parceiro. Verifique os dados.';
      if (err.message?.includes('already registered') || err.message?.includes('already exists') || err.message?.toLowerCase().includes('already')) {
        userFriendlyMessage = 'Este e-mail já está registado na Glamzo. Por favor, utilize outro e-mail ou faça login com a sua conta existente.';
      }
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
          Crie a sua conta de acesso para iniciar a configuração da sua loja na Glamzo.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white border border-slate-100 py-8 px-6 rounded-2xl shadow-sm sm:px-10">
          
          {errorMsg && (
            <div className="mb-5 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              <p>{errorMsg}</p>
              {(errorMsg.includes('já está registado') || errorMsg.includes('already')) && (
                <div className="mt-2.5 text-left">
                  <Link to={`/partner/login?email=${encodeURIComponent(email)}`} className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-extrabold hover:underline">
                    <span>Iniciar Sessão como Parceiro Comercial &rarr;</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex flex-col items-center text-center gap-3 animate-fade-in">
              <ShieldCheck className="w-10 h-10 text-emerald-500" />
              <p>{successMsg}</p>
              <button onClick={() => navigate('/partner/login')} className="mt-2 bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 transition-colors">
                Ir para o Login
              </button>
            </div>
          )}

          {user && profile?.role === 'customer' && !successMsg && (
             <div className="space-y-4 text-center py-4 animate-fade-in">
               <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                 <p className="text-sm font-bold text-amber-900 mb-2">Sessão de Cliente Detetada</p>
                 <p className="text-xs text-amber-700 leading-relaxed">
                   Está ligado como cliente. Por favor termine a sessão antes de criar uma conta de loja.
                 </p>
               </div>
               <button
                 onClick={async () => {
                   await signOut();
                   window.location.reload();
                 }}
                 className="w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider"
               >
                 Terminar Sessão de Cliente
               </button>
             </div>
          )}

          {!successMsg && (!user || profile?.role !== 'customer') && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Nome do Responsável</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><User className="w-4 h-4" /></span>
                  <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all" placeholder="Nome Completo" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">E-mail Comercial (Login)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Mail className="w-4 h-4" /></span>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all" placeholder="geral@loja.pt" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Palavra-passe</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all" placeholder="Mín. 6 caracteres" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Confirmar Palavra-passe</label>
                  <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all" placeholder="Repita a senha" />
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input type="checkbox" id="terms" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="mt-1 w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500" />
                <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed">
                  Li e aceito os <Link to="/termos-e-condicoes" target="_blank" className="font-semibold text-purple-600 hover:underline">Termos para Parceiros</Link> e a <Link to="/politica-de-privacidade" target="_blank" className="font-semibold text-purple-600 hover:underline">Política de Privacidade</Link>.
                </label>
              </div>

              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 mt-2 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Conta'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-xs text-slate-500">
            Já tem conta de loja? <Link to="/partner/login" className="font-bold text-purple-600 hover:text-purple-700">Iniciar Sessão</Link>
          </p>

        </div>
      </div>
    </div>
  );
}

