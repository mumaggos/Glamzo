import { LocalizedLink } from '../components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import {  Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, User, Mail, Loader2 } from 'lucide-react';
import GlamzoLogo from '../components/GlamzoLogo';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';

export default function Signup() {
  const { t } = useTranslation();
  const { signUp, user, profile, loading: authLoading } = useAuth();
  const navigate = useLocalizedNavigate();
  const location = useLocation();

  // 1. Guardar Intenção de Redirecionamento na Memória (Essencial para não perder o cliente)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const redirectUrl = params.get('redirect');
    if (redirectUrl) {
      sessionStorage.setItem('post_login_redirect', redirectUrl);
    }
  }, [location.search]);


  // Signup fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('email') || '';
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer'); 
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Status indicators
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Verification step state
  const [step, setStep] = useState<'form' | 'verify'>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('step') === 'verify' ? 'verify' : 'form';
  });
  const [enteredCode, setEnteredCode] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 'form') {
      if (!fullName || !email || !password || !confirmPassword) {
        setErrorMsg(t('auth.signup.errFillAll'));
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
        setErrorMsg(t('auth.signup.errAcceptTerms'));
        return;
      }

      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      try {
        const authResult = await signUp(email, password, fullName, role);
        const requiresEmailConfirmation = !authResult?.session;
        
        if (requiresEmailConfirmation) {
           setStep('verify');
           setSuccessMsg(t('auth.signup.codeSent'));
        } else {
           setSuccessMsg('Conta criada com sucesso!');
           // O useEffect acima apanha a sessão e redireciona.
        }
      } catch (err: any) {
        console.error('Registration Error:', err);
        let userFriendlyMessage = err.message || 'Falha ao registar conta. Tente um e-mail diferente.';
        if (err.message?.includes('already registered') || err.message?.includes('already exists') || err.message?.toLowerCase().includes('already')) {
           userFriendlyMessage = 'Este e-mail já está associado a uma conta. Por favor, inicie sessão.';
        }
        setErrorMsg(userFriendlyMessage);
      } finally {
        setLoading(false);
      }
    } else {
      if (enteredCode.length !== 8 && enteredCode.length !== 6) {
        setErrorMsg('O código de verificação deve ter 6 ou 8 dígitos.');
        return;
      }

      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token: enteredCode,
          type: 'signup'
        });
        
        if (error || !data.session) throw new Error('Código inválido ou expirado.');
        setSuccessMsg('Conta validada com sucesso! A redirecionar...');
      } catch (err: any) {
        console.error('Verify error:', err);
        setErrorMsg('Falha ao verificar conta: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: email });
      if (error) throw error;
      setSuccessMsg(t('auth.signup.newCodeSent'));
    } catch (err: any) {
      setErrorMsg('Falha ao reenviar código: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const savedRedirect = sessionStorage.getItem('post_login_redirect');
      const returnTo = localStorage.getItem('returnTo');
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}${window.location.pathname}` }
      });
    } catch (err: any) {
      console.error('Google Sign Up Error:', err);
      setErrorMsg(err.message || 'Erro ao realizar registo com conta Google.');
      setLoading(false);
    }
  };

  return (
    <div id="signup-view" className="min-h-[calc(100vh-64px)] bg-[#F8F9FC] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        <div className="flex flex-col items-center">
          <GlamzoLogo size={64} showSquircle={true} glow={true} className="mb-4" />
          <h2 className="text-center text-3xl font-black text-slate-900 tracking-tight">
            Criar Conta
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 font-medium">
            Junte-se à maior rede de beleza local.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-200/60 rounded-3xl shadow-sm sm:px-10">
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold leading-normal text-center">
              <p>{errorMsg}</p>
              {(errorMsg.toLowerCase().includes('associado') || errorMsg.toLowerCase().includes('inicie sessão')) && (
                <div className="mt-2">
                  <LocalizedLink 
                    to={`/login${window.location.search ? window.location.search + '&' : '?'}email=${encodeURIComponent(email)}`} 
                    className="inline-flex items-center gap-1 text-rose-700 hover:text-rose-800 font-black hover:underline"
                  >
                    <span>{t('auth.signup.goToLogin')} &rarr;</span>
                  </LocalizedLink>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold leading-normal text-center">
              <p>{successMsg}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleRegister}>
              <fieldset disabled={step === 'verify'} className="space-y-4 disabled:opacity-60 transition-opacity">
                
                <div>
                  <label htmlFor="register-full-name" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    {t('auth.signup.fullNameLabel')}
                  </label>
                  <div className="relative rounded-xl">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="register-full-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-50 focus:bg-white transition-all font-medium text-slate-900"
                      placeholder={t('auth.signup.fullNamePlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="register-email" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    {t('auth.signup.emailLabel')}
                  </label>
                  <div className="relative rounded-xl">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="register-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-50 focus:bg-white transition-all font-medium text-slate-900"
                      placeholder={t('auth.signup.emailPlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="register-password" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Palavra-passe (mínimo 6 caracteres)
                  </label>
                  <div className="relative rounded-xl">
                    <input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-50 focus:bg-white transition-all font-medium text-slate-900"
                      placeholder={t('auth.signup.passwordPlaceholder')}
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

                <div>
                  <label htmlFor="confirm-register-password" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    {t('auth.signup.confirmPasswordLabel')}
                  </label>
                  <input
                    id="confirm-register-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-50 focus:bg-white transition-all font-medium text-slate-900"
                    placeholder={t('auth.signup.confirmPasswordPlaceholder')}
                  />
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-purple-600 bg-white border-slate-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed font-medium">
                    {t('auth.signup.terms1')}{' '}
                    <LocalizedLink to="/termos-e-condicoes" target="_blank" className="font-bold text-purple-600 hover:text-purple-700">{t('auth.signup.terms2')}</LocalizedLink>
                    {' '}{t('auth.signup.terms3')}{' '}
                    <LocalizedLink to="/politica-de-privacidade" target="_blank" className="font-bold text-purple-600 hover:text-purple-700">{t('auth.signup.terms4')}</LocalizedLink>.
                  </label>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-black transition-all disabled:opacity-50 gap-2 items-center cursor-pointer shadow-lg"
                  >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>{t('auth.signup.processing')}</span></> : <span>{t('auth.signup.next')}</span>}
                  </button>
                </div>
              </fieldset>
              
              {step === 'verify' && (
                <div className="mt-6 p-6 bg-white border border-rose-200 rounded-3xl shadow-sm animate-fade-in text-center">
                  <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mx-auto mb-4">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-slate-900 text-base mb-1">{t('auth.signup.verifyTitle')}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-6">
                    {t('auth.signup.verifyDesc1')} <strong>{email}</strong>. {t('auth.signup.verifyDesc2')}
                  </p>
                  
                  <div className="space-y-4">
                    <input
                      id="verify-code"
                      type="text"
                      required
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value)}
                      className="block w-full px-4 py-4 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl text-center text-2xl font-mono tracking-[0.4em] focus:outline-none focus:border-purple-500 transition-all text-slate-900"
                      placeholder={t('auth.signup.codePlaceholder')}
                      maxLength={8}
                    />
                    <button
                      type="submit"
                      disabled={loading || (enteredCode.length !== 8 && enteredCode.length !== 6)}
                      className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all disabled:opacity-50 gap-2 items-center cursor-pointer shadow-md"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{t('auth.signup.verifyBtn')}</span>}
                    </button>
                    <div className="flex flex-col gap-2 mt-2">
                      <button type="button" disabled={loading} onClick={handleResendOtp} className="w-full py-2 text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors">{t('auth.signup.resendCode')}</button>
                      <button type="button" onClick={() => { setStep('form'); setEnteredCode(''); }} className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">{t('auth.signup.correctData')}</button>
                    </div>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                <div className="relative flex justify-center text-xs"><span className="px-3 bg-white text-slate-400 font-bold uppercase tracking-wider">{t('auth.signup.orRegisterWith')}</span></div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  <span>{t('auth.signup.googleRegister')}</span>
                </button>
              </div>
            </div>

          <p className="mt-6 text-center text-xs font-bold text-slate-600">
            Deseja entrar numa conta existente?{' '}
            <LocalizedLink to={`/login${window.location.search}`} className="text-purple-600 hover:text-purple-700">
              Iniciar Sessão
            </LocalizedLink>
          </p>

        </div>
      </div>
    </div>
  );
}
