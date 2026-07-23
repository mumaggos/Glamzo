import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, User, Mail, Loader2 } from 'lucide-react';
import GlamzoLogo from '../components/GlamzoLogo';
import { useTranslation } from "react-i18next";

export default function Signup() {
    const { t } = useTranslation();
  const { signUp, user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
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
        setErrorMsg('É obrigatório aceitar os Termos e a Política de Privacidade.');
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
           setSuccessMsg('Enviámos um código para o seu e-mail. Por favor, introduza-o abaixo para concluir o registo.');
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
      setSuccessMsg('Novo código enviado! Verifique o seu e-mail.');
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
            
                                  {t('txt_criar_conta') || 'Criar Conta'}
                                </h2>
          <p className="mt-2 text-center text-sm text-slate-500 font-medium">
            
                                  {t('txt_junte_se_maior_rede_de_beleza') || 'Junte-se à maior rede de beleza local.'}
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
                  <Link 
                    to={`/login${window.location.search ? window.location.search + '&' : '?'}email=${encodeURIComponent(email)}`} 
                    className="inline-flex items-center gap-1 text-rose-700 hover:text-rose-800 font-black hover:underline"
                  >
                    <span>{t('txt_ir_para_login_rarr') || 'Ir para Login &rarr;'}</span>
                  </Link>
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
                    
                                                      {t('txt_nome_completo') || 'Nome Completo'}
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
                      placeholder={t('txt_o_seu_primeiro_e_ltimo_nome') || 'O seu primeiro e último nome'}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="register-email" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    
                                                      {t('txt_e_mail_139') || 'E-mail'}
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
                      placeholder={t('txt_exemplo_glamzo_com') || 'exemplo@glamzo.com'}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="register-password" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    
                                                      {t('txt_palavra_passe_m_nimo_6_caracte') || 'Palavra-passe (mínimo 6 caracteres)'}
                                                    </label>
                  <div className="relative rounded-xl">
                    <input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-50 focus:bg-white transition-all font-medium text-slate-900"
                      placeholder={t('txt_crie_uma_senha_forte') || 'Crie uma senha forte'}
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
                    
                                                      {t('txt_confirmar_palavra_passe') || 'Confirmar Palavra-passe'}
                                                    </label>
                  <input
                    id="confirm-register-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-50 focus:bg-white transition-all font-medium text-slate-900"
                    placeholder={t('txt_introduza_novamente_a_palavra') || 'Introduza novamente a palavra-passe'}
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
                    
                                                      {t('txt_li_e_aceito_os') || 'Li e aceito os'}{' '}
                    <Link to="/termos-e-condicoes" target="_blank" className="font-bold text-purple-600 hover:text-purple-700">{t('txt_termos_e_condi_es') || 'Termos e Condições'}</Link>
                    {' '}{t('txt_e_a') || 'e a'}{' '}
                    <Link to="/politica-de-privacidade" target="_blank" className="font-bold text-purple-600 hover:text-purple-700">{t('txt_pol_tica_de_privacidade') || 'Política de Privacidade'}</Link>.
                  </label>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-black transition-all disabled:opacity-50 gap-2 items-center cursor-pointer shadow-lg"
                  >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>{t('txt_a_processar') || 'A processar...'}</span></> : <span>{t('txt_avan_ar') || 'Avançar'}</span>}
                  </button>
                </div>
              </fieldset>
              
              {step === 'verify' && (
                <div className="mt-6 p-6 bg-white border border-rose-200 rounded-3xl shadow-sm animate-fade-in text-center">
                  <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mx-auto mb-4">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-slate-900 text-base mb-1">{t('txt_verifique_o_seu_e_mail') || 'Verifique o seu e-mail'}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-6">
                    
                                                      {t('txt_envi_mos_um_c_digo_para') || 'Enviámos um código para'} <strong>{email}</strong>{t('txt_verifique_tamb_m_o_spam') || '. Verifique também o Spam.'}
                                                    </p>
                  
                  <div className="space-y-4">
                    <input
                      id="verify-code"
                      type="text"
                      required
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value)}
                      className="block w-full px-4 py-4 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl text-center text-2xl font-mono tracking-[0.4em] focus:outline-none focus:border-purple-500 transition-all text-slate-900"
                      placeholder="000000"
                      maxLength={8}
                    />
                    <button
                      type="submit"
                      disabled={loading || (enteredCode.length !== 8 && enteredCode.length !== 6)}
                      className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all disabled:opacity-50 gap-2 items-center cursor-pointer shadow-md"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{t('txt_verificar_e_entrar') || 'Verificar e Entrar'}</span>}
                    </button>
                    <div className="flex flex-col gap-2 mt-2">
                      <button type="button" disabled={loading} onClick={handleResendOtp} className="w-full py-2 text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors">{t('txt_reenviar_novo_c_digo') || 'Reenviar novo código'}</button>
                      <button type="button" onClick={() => { setStep('form'); setEnteredCode(''); }} className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">{t('txt_corrigir_dados') || 'Corrigir dados'}</button>
                    </div>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                <div className="relative flex justify-center text-xs"><span className="px-3 bg-white text-slate-400 font-bold uppercase tracking-wider">{t('txt_ou_registar_com') || 'Ou registar com'}</span></div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.123C18.29 1.855 15.54 1 12.24 1 6.033 1 12.24 10.285s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.985 0-.743-.075-1.309-.165-1.855h-10.628z" /></svg>
                  <span>{t('txt_inscrever_se_com_google') || 'Inscrever-se com Google'}</span>
                </button>
              </div>
            </div>

          <p className="mt-6 text-center text-xs font-bold text-slate-600">
            
                                  {t('txt_deseja_entrar_numa_conta_exist') || 'Deseja entrar numa conta existente?'}{' '}
            <Link to={`/login${window.location.search}`} className="text-purple-600 hover:text-purple-700">
              
                                        {t('txt_iniciar_sess_o') || 'Iniciar Sessão'}
                                      </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
