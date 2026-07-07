import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, KeyRound, Mail, Loader2 } from 'lucide-react';
import GlamzoLogo from '../components/GlamzoLogo';

export default function Login() {
  const { signIn, signInWithGoogle, resetPassword, user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Guardar Intenção de Redirecionamento de forma Permanente
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectUrl = params.get('redirect');
    if (redirectUrl) {
      sessionStorage.setItem('post_login_redirect', redirectUrl);
    }
  }, [location.search]);

  // 2. Redirecionar Automaticamente Assim que o Login tem Sucesso
  useEffect(() => {
    if (!authLoading && user && profile) {
      // Verifica primeiro se há um URL guardado na sessão
      const savedRedirect = sessionStorage.getItem('post_login_redirect');
      
      if (savedRedirect) {
        sessionStorage.removeItem('post_login_redirect');
        navigate(savedRedirect, { replace: true });
        return;
      }

      // Se não houver redirect guardado, manda para o dashboard por defeito consoante a role
      if (profile.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (profile.role === 'business') {
        navigate('/dashboard', { replace: true });
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
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const data = await signIn(email, password);
      
      if (data?.user?.id) {
        // Obter perfil para verificar se é loja
        const { data: prof } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
        if (prof?.role === 'business') {
          await supabase.auth.signOut();
          setErrorMsg('Acesso negado. Por favor, inicie sessão através do Portal do Parceiro.');
          setLoading(false);
          return;
        }
      }
      // Não navegamos aqui manualmente. O useEffect ali de cima (Passo 2) apanha a mudança do `user` 
      // e envia o utilizador para a loja automaticamente (lendo do sessionStorage)!
    } catch (err: any) {
      console.error('Login Error:', err.message);
      if (err.message && err.message.toLowerCase().includes('email not confirmed')) {
        setErrorMsg('Por favor, verifique a sua conta primeiro introduzindo o código de segurança.');
        setTimeout(() => {
          navigate(`/signup?email=${encodeURIComponent(email)}&step=verify`);
        }, 1500);
      } else {
        setErrorMsg(err.message || 'Falha ao autenticar. Verifique as suas credenciais.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // O Supabase tem uma propriedade nativa para redirecionar após OAuth
      const savedRedirect = sessionStorage.getItem('post_login_redirect');
      const redirectTo = savedRedirect 
        ? `${window.location.origin}${savedRedirect}`
        : `${window.location.origin}/account`;
        
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo
        }
      });
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setErrorMsg(err.message || 'Erro ao realizar login pela conta Google.');
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMsg('Digite o seu e-mail no campo acima antes de solicitar a recuperação.');
      return;
    }
    setIsResetting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await resetPassword(email);
      setSuccessMsg('Link de recuperação enviado com sucesso para o seu e-mail!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao processar envio de recuperação.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div id="login-view" className="min-h-[calc(100vh-64px)] bg-[#F8F9FC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        <div className="flex flex-col items-center">
          <GlamzoLogo size={64} showSquircle={true} glow={true} className="mb-4" />
          <h2 className="text-center text-3xl font-black text-slate-900 tracking-tight">
            Login
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 font-medium">
            Aceda para continuar a sua marcação.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-200/60 rounded-3xl shadow-sm sm:px-10">
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold leading-normal text-center">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold leading-normal text-center">
              {successMsg}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleEmailLogin}>
            <div>
              <label htmlFor="email-address-input" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Endereço de E-mail
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email-address-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-50 focus:bg-white transition-all font-medium text-slate-900"
                  placeholder="exemplo@glamzo.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password-fields" className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Palavra-passe
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors"
                  disabled={isResetting}
                >
                  {isResetting ? 'A enviar...' : 'Recuperar senha'}
                </button>
              </div>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="password-fields"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-50 focus:bg-white transition-all font-medium text-slate-900"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-purple-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-black transition-all disabled:opacity-50 gap-2 items-center cursor-pointer shadow-lg mt-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />A iniciar sessão...</> : <span>Entrar na Conta</span>}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
              <div className="relative flex justify-center text-xs"><span className="px-3 bg-white text-slate-400 font-bold uppercase tracking-wider">Ou</span></div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.123C18.29 1.855 15.54 1 12.24 1 6.033 1 12.24 10.285s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.985 0-.743-.075-1.309-.165-1.855h-10.628z" />
                </svg>
                <span>Entrar com o Google</span>
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-xs font-bold text-slate-600">
            Ainda não tem conta?{' '}
            <Link to={`/signup${window.location.search}`} className="text-purple-600 hover:text-purple-700">
              Registe-se Grátis
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
