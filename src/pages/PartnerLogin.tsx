import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, KeyRound, Mail, Sparkles, Loader2, Landmark } from 'lucide-react';

export default function PartnerLogin() {
  const { signIn, signOut, resetPassword, user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!authLoading && user && profile) {
      if (profile.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (profile.role === 'business') {
        import('../utils/partnerRouting').then(({ resolvePartnerRoute }) => {
          resolvePartnerRoute(user, profile.role, supabase).then(route => {
            navigate(route, { replace: true });
          });
        });
      } else {
        navigate('/account', { replace: true });
      }
    }
  }, [user, profile, authLoading, navigate]);

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

      let redirect = '/dashboard';
      if (role === 'customer') redirect = '/account';
      else if (role === 'admin') redirect = '/admin';

      setSuccessMsg('Sessão iniciada com sucesso! A redirecionar...');
      
      setTimeout(() => {
        navigate(redirect, { replace: true });
      }, 800);

    } catch (err: any) {
      console.error('Partner Login Error:', err);
      if (err.message && err.message.toLowerCase().includes('email not confirmed')) {
        setErrorMsg('Por favor, verificar a conta primeiro utilizando o código que enviámos por e-mail.');
        setTimeout(() => {
          navigate(`/partner/signup?email=${encodeURIComponent(email)}&step=verify`);
        }, 1500);
      } else {
        setErrorMsg(err.message || 'Falha ao autenticar. Confirme suas credenciais.');
      }
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
    <div id="partner-login-view" className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-purple-200 selection:text-purple-900 text-slate-800">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in text-center">
        <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-sm mb-4 text-white mx-auto">
          <Landmark className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-[#110724] tracking-tight font-display uppercase">
          Parceiros Glamzo<span className="text-purple-600 font-black">.</span>
        </h2>
        <p className="mt-2 text-xs text-slate-500 font-medium">
          Aceda ao seu terminal de gestão de reservas, agenda comercial, faturamento e visibilidade profissional.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-slate-100 py-8 px-6 rounded-2xl shadow-sm sm:px-10">
          
          {errorMsg && (
            <div className="mb-4 p-4 bg-rose-55 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold leading-normal">
              <p>{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold leading-normal">
              <p>{successMsg}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handlePartnerLogin}>
            
            <div>
              <label htmlFor="partner-email" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                E-mail Profissional
              </label>
              <div className="relative rounded-xl shadow-sm">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="partner-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 placeholder:text-slate-600"
                  placeholder="geral@oseusalao.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="partner-password" className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Palavra-passe
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 cursor-pointer disabled:opacity-55"
                  disabled={isResetting}
                >
                  Esqueceu-se da senha?
                </button>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  id="partner-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 placeholder:text-slate-600"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-600 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-rose-500 hover:from-purple-700 hover:to-rose-600 transition-all disabled:opacity-50 gap-2 items-center cursor-pointer shadow-md shadow-purple-100"
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
            <Link to="/partner/signup" className="font-bold text-purple-600 hover:text-purple-700">
              Registe o seu estabelecimento comercial
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
