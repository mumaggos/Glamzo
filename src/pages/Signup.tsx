import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { Eye, EyeOff, User, Mail, Sparkles, Loader2, Store, UserPlus } from 'lucide-react';
import GlamzoLogo from '../components/GlamzoLogo';

export default function Signup() {
  const { signUp, signInWithGoogle, user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!authLoading && user && profile) {
      if (profile.role === 'admin') navigate('/admin', { replace: true });
      else if (profile.role === 'business') navigate('/dashboard', { replace: true });
      else navigate('/account', { replace: true });
    }
  }, [user, profile, authLoading, navigate]);

  // Signup fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer'); // default 'customer'
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Status indicators
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMsg('Preencha todos os campos obrigatórios.');
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
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Call authentication signup
      await signUp(email, password, fullName, role);
      
      // Dispatch validation email
      try {
        await fetch('/api/emails/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'verification',
            to: email,
            data: { 
              userName: fullName, 
              confirmationLink: `${window.location.origin}/login` 
            }
          })
        });
      } catch (e) {
        console.error('Failed to trigger verification email', e);
      }
      
      setSuccessMsg('Conta criada com sucesso! Verifique a sua caixa de entrada para confirmar o e-mail.');
      
      setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        if (redirect) {
          navigate(redirect);
        } else {
          if (role === 'admin') navigate('/admin', { replace: true });
          else if (role === 'business') navigate('/dashboard', { replace: true });
          else navigate('/account', { replace: true });
        }
      }, 2000);
    } catch (err: any) {
      console.error('Registration Error:', err);
      let userFriendlyMessage = err.message || 'Falha ao registar conta. Tente um e-mail diferente.';
      if (err.message?.includes('already registered') || err.message?.includes('already exists') || err.message?.toLowerCase().includes('already')) {
        userFriendlyMessage = 'Este endereço de e-mail já está associado a uma conta Glamzo. Por favor, utilize um e-mail diferente ou inicie sessão.';
      }
      setErrorMsg(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google Sign Up Error:', err);
      setErrorMsg(err.message || 'Erro ao realizar registo com conta Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="signup-view" className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        <div className="flex flex-col items-center">
          <GlamzoLogo size={64} showSquircle={true} glow={true} className="mb-4" />
          <h2 className="text-center text-3xl font-extrabold text-[#110724] tracking-tight font-display uppercase">
            Criar sua Conta<span className="text-purple-600 font-extrabold">.</span>
          </h2>
          <p className="mt-2 text-center text-xs text-slate-500 max-w font-medium">
            Crie a sua conta de cliente e junte-se à maior rede de beleza local
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-100 rounded-2xl shadow-sm sm:px-10">
          
          {errorMsg && (
            <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold leading-normal">
              <p>{errorMsg}</p>
              {(errorMsg.includes('já está associado') || errorMsg.includes('já está registado') || errorMsg.toLowerCase().includes('already')) && (
                <div className="mt-2 text-left">
                  <Link 
                    to={`/login?email=${encodeURIComponent(email)}`} 
                    className="inline-flex items-center gap-1 text-xs text-rose-700 hover:text-rose-800 font-extrabold hover:underline"
                  >
                    <span>Iniciar Sessão com este E-mail &rarr;</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold leading-normal animate-pulse">
              <p>{successMsg}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleRegister}>
            
            {/* Name input */}
            <div>
              <label htmlFor="register-full-name" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Nome Completo
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="register-full-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition-all text-slate-800"
                  placeholder="O seu primeiro e último nome"
                />
              </div>
            </div>

            {/* Email input */}
            <div>
              <label htmlFor="register-email" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Endereço de E-mail
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition-all text-slate-800"
                  placeholder="exemplo@dominio.com"
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label htmlFor="register-password" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Palavra-passe (mínimo 6 caracteres)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition-all text-slate-800"
                  placeholder="Crie uma senha forte"
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

            {/* Confirm password */}
            <div>
              <label htmlFor="confirm-register-password" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Confirmar Palavra-passe
              </label>
              <input
                id="confirm-register-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition-all text-slate-800"
                placeholder="Introduza novamente a palavra-passe"
              />
            </div>

            {/* Checkbox Terms */}
            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-purple-600 bg-white border-slate-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed px-1">
                Li e aceito os{' '}
                <Link to="/termos-e-condicoes" target="_blank" className="font-semibold text-purple-600 hover:text-purple-700 underline">
                  Termos e Condições
                </Link>{' '}
                e a{' '}
                <Link to="/politica-de-privacidade" target="_blank" className="font-semibold text-purple-600 hover:text-purple-700 underline">
                  Política de Privacidade
                </Link>
                .
              </label>
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-rose-500 hover:from-purple-700 hover:to-rose-600 transition-all disabled:opacity-50 gap-2 items-center cursor-pointer shadow-md shadow-purple-100"
                id="btn-submit-signup"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>A registar e a iniciar...</span>
                  </>
                ) : (
                  <span>Registar e Iniciar</span>
                )}
              </button>
            </div>
          </form>

          {/* Social Break-line */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
               </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-slate-600 font-medium">Ou registar com</span>
              </div>
            </div>

            {/* Google OAuth signup */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all hover:border-slate-350 cursor-pointer disabled:opacity-50"
                id="btn-google-signup"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.123C18.29 1.855 15.54 1 12.24 1 6.033 1 12.24S1 17.207 1 23.48c0-.743-.075-1.309-.165-1.855h-10.628z"
                  />
                </svg>
                <span>Inscrever-se com Google</span>
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-600">
            Deseja entrar em uma de suas contas?{' '}
            <Link to="/login" className="font-bold text-rose-600 hover:text-rose-700">
              Iniciar sessão
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
