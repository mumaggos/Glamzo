import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, KeyRound, Mail, Sparkles, Loader2, Landmark } from 'lucide-react';

export default function PartnerLogin() {
  const { signIn, signOut, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('email') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handlePartnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Preencha os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Authenticate with Supabase Auth
      const loginResult = await signIn(email, password);
      const activeUser = loginResult?.user;

      if (!activeUser) {
        throw new Error('As credenciais do parceiro fornecidas estão incorretas.');
      }

      // 2. Double check profile role to enforce correct login page segregation
      const { data: profData, error: profErr } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', activeUser.id)
        .single();

      if (profErr) {
        throw new Error('Falha ao validar privilégios do perfil.');
      }

      const role = profData?.role || 'customer';

      if (role === 'customer') {
        setErrorMsg('Esta conta pertence a um Cliente Final. Por favor aceda ao login do portal de clientes (/login).');
        await signOut();
        return;
      }

      // Route based on role
      const redirect = role === 'admin' ? '/admin' : '/dashboard';
      setSuccessMsg('Sessão iniciada como parceiro comercial com sucesso!');
      
      setTimeout(() => {
        navigate(redirect, { replace: true });
      }, 1500);

    } catch (err: any) {
      console.error('Partner Login Error:', err);
      // Clean up session in case of partial logins
      try { await signOut(); } catch (se) {}
      setErrorMsg(err.message || 'Falha ao autenticar. Confirme suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMsg('Por favor, informe o seu e-mail no formulário para solicitar recuperação.');
      return;
    }

    setIsResetting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await resetPassword(email);
      setSuccessMsg('E-mail de recuperação enviado com sucesso.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao processar envio de recuperação de senha.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div id="partner-login-view" className="min-h-[calc(100vh-64px)] bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-rose-500/20 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in text-center">
        <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-950 mb-4 text-white mx-auto">
          <Landmark className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Portal do Parceiro Glamzo
        </h2>
        <p className="mt-2 text-xs text-slate-400">
          Inicie a sua sessão operacional para aceder à gestão de calendário, faturação, especialistas e marketing.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 rounded-3xl shadow-2xl sm:px-10">
          
          {errorMsg && (
            <div className="mb-4 p-4 bg-rose-950/40 border border-rose-900/55 text-rose-400 rounded-xl text-xs font-semibold">
              <p>{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-4 bg-emerald-950/45 border border-emerald-900 text-emerald-400 rounded-xl text-xs font-semibold">
              <p>{successMsg}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handlePartnerLogin}>
            
            <div>
              <label htmlFor="partner-email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                E-mail Profissional
              </label>
              <div className="relative rounded-xl shadow-sm">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="partner-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition-all placeholder:text-slate-600"
                  placeholder="geral@oseuprojeto.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="partner-password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Palavra-passe
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-semibold text-rose-450 hover:underline text-rose-400 cursor-pointer disabled:opacity-55"
                  disabled={isResetting}
                >
                  Esqueceu-se da senha?
                </button>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  id="partner-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-350"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md shadow-rose-950 text-sm font-bold uppercase transition-all disabled:opacity-50 gap-2 items-center cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>A aceder ao painel...</span>
                  </>
                ) : (
                  <span>Aceder ao Painel</span>
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-xs text-slate-500">
            Ainda não é parceiro comercial?{' '}
            <Link to="/partner/signup" className="font-bold text-rose-400 hover:underline">
              Registe o seu estabelecimento
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
