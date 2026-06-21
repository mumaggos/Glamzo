import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Eye, EyeOff, KeyRound, Mail, Sparkles, Loader2, Compass } from 'lucide-react';
import GlamzoLogo from '../components/GlamzoLogo';

export default function Login() {
  const { signIn, signInWithGoogle, resetPassword, signOut, user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!authLoading && user && profile) {
      if (profile.role === 'admin') navigate('/admin', { replace: true });
      else if (profile.role === 'business') navigate('/dashboard', { replace: true });
      else navigate('/account', { replace: true });
    }
  }, [user, profile, authLoading, navigate]);

  const [email, setEmail] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('email') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Auth states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Reset password states
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
      const loginResult = await signIn(email, password);
      const activeUser = loginResult?.user;
      
      const params = new URLSearchParams(window.location.search);
      let redirect = params.get('redirect');

      if (!redirect && activeUser) {
        try {
          // Direct check on database to see their profile role instantly
          const { data: profData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', activeUser.id)
            .single();
          
          const role = profData?.role || 'customer';
          if (role === 'admin') {
            redirect = '/admin';
          } else if (role === 'business') {
            redirect = '/dashboard';
          } else {
            redirect = '/account';
          }
        } catch (dbErr) {
          console.warn('Error fetching role directly for redirect, defaulting safely:', dbErr);
          redirect = '/account';
        }
      }

      navigate(redirect || '/account', { replace: true });
    } catch (err: any) {
      console.error('Login Error:', err.message);
      if (err.message && err.message.toLowerCase().includes('email not confirmed')) {
        // Redirecionar para a página de verificação de conta
        setErrorMsg('Por favor, verifique a sua conta primeiro introduzindo o código de segurança.');
        setTimeout(() => {
          // If they were trying to go to dashboard, assume business signup maybe?
          // For safety, let's just send them to signup page with verify step.
          navigate(`/signup?email=${encodeURIComponent(email)}&step=verify`);
        }, 1500);
      } else {
        setErrorMsg(err.message || 'Falha ao autenticar. Verifique suas credenciais.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setErrorMsg(err.message || 'Erro ao realizar login pela conta Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMsg('Digite seu e-mail no campo acima antes de solicitar a recuperação.');
      return;
    }

    setIsResetting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await resetPassword(email);
      setSuccessMsg('Link de recuperação enviado com sucesso para seu e-mail!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao processar envio de recuperação.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div id="login-view" className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        
        {/* Brand Icon & Heading */}
        <div className="flex flex-col items-center">
          <GlamzoLogo size={64} showSquircle={true} glow={true} className="mb-4" />
          <h2 className="text-center text-3xl font-extrabold text-[#110724] tracking-tight font-display uppercase">
            Glamzo<span className="text-purple-600 font-black">.</span>
          </h2>
          <p className="mt-2 text-center text-xs text-slate-500 font-medium">
            Aceda à sua conta de cliente para gerir os seus favoritos e agendamentos
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-100 rounded-2xl shadow-sm sm:px-10">
          
          {/* Main Error Alert */}
          {errorMsg && (
            <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold leading-normal">
              <p>{errorMsg}</p>
            </div>
          )}

          {/* Success Alert */}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold leading-normal">
              {successMsg}
            </div>
          )}

          {/* Core Authentication Form */}
          <form className="space-y-5" onSubmit={handleEmailLogin}>
            
            {/* Email Field */}
            <div>
              <label htmlFor="email-address-input" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Endereço de E-mail
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email-address-input"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition-all text-slate-800"
                  placeholder="exemplo@glamzo.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password-fields" className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Palavra-passe
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer disabled:opacity-55"
                  disabled={isResetting}
                >
                  {isResetting ? 'A enviar...' : 'Esqueceu-se da senha?'}
                </button>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="password-fields"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition-all text-slate-800"
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

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-rose-500 hover:from-purple-700 hover:to-rose-600 transition-all disabled:opacity-50 gap-2 items-center cursor-pointer shadow-md shadow-purple-100"
                id="btn-submit-login"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>A iniciar sessão...</span>
                  </>
                ) : (
                  <span>Iniciar Sessão</span>
                )}
              </button>
            </div>
          </form>

          {/* Social Sign In Breakline */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-slate-600 font-medium">Ou continuar com</span>
              </div>
            </div>

            {/* Google Signup Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all hover:border-slate-350 cursor-pointer disabled:opacity-50"
                id="btn-google-login"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.123C18.29 1.855 15.54 1 12.24 1 6.033 1 12.24 10.285s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.985 0-.743-.075-1.309-.165-1.855h-10.628z"
                  />
                </svg>
                <span>Entrar com o Google</span>
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-600">
            Não tem uma conta?{' '}
            <Link to="/signup" className="font-bold text-rose-600 hover:text-rose-700">
              Registe-se gratuitamente
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
