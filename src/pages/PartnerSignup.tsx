import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, Building2, ArrowRight, Loader2, CheckCircle, Eye, EyeOff, ShieldCheck, Check } from 'lucide-react';

export default function PartnerSignup() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isOtpSent, setIsOtpSent] = useState(false);
  const [enteredCode, setEnteredCode] = useState('');

  // Protect route
  useEffect(() => {
    if (user) {
      navigate('/partner/setup', { replace: true });
    }
  }, [user, navigate]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role: 'business' }
        }
      });
      if (error) throw error;
      
      setIsOtpSent(true);
      setSuccessMsg('Código enviado! Verifique a sua caixa de entrada.');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao enviar código.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredCode.length < 6) {
      setErrorMsg('Código inválido.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: enteredCode,
        type: 'signup'
      });
      if (verifyError || !verifyData.user || !verifyData.session) throw new Error('Código inválido ou expirado.');

      await supabase.from('profiles').update({ role: 'business' }).eq('id', verifyData.user.id);
      await refreshProfile();
      
      navigate('/partner/setup', { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao verificar código.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-[0.03]" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
            <Building2 className="w-8 h-8 text-white transform rotate-6" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Criar Conta Parceiro
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Digitalize o seu salão em minutos
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100 animate-fade-in flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-red-600">!</span>
              </div>
              <p>{errorMsg}</p>
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium border border-emerald-100 animate-fade-in flex items-start gap-3">
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{successMsg}</p>
            </div>
          )}

          {!isOtpSent ? (
            <form className="space-y-5 animate-fade-in" onSubmit={handleSendCode}>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  E-mail Profissional
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 placeholder:text-slate-400"
                    placeholder="geral@seusalao.pt"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Senha
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full px-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 placeholder:text-slate-400"
                      placeholder="Mín. 6 letras"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
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
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 placeholder:text-slate-400"
                    placeholder="Repita a senha"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2 pb-2">
                <input
                  type="checkbox"
                  id="terms-partner"
                  required
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
                  </Link>.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !acceptedTerms}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl font-bold font-sans text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>A enviar código...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar Código de Verificação</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form className="space-y-5 animate-fade-in" onSubmit={handleVerifyOtp}>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Verifique o seu e-mail</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Enviámos um código para <strong className="text-slate-800">{email}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 text-center">
                  Código OTP
                </label>
                <input
                  type="text"
                  required
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value)}
                  className="block w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-3xl font-mono tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading || enteredCode.length < 6}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white rounded-xl font-bold font-sans text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>A verificar...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmar Registo</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-xs text-slate-500">
            Deseja aceder a uma conta existente?{' '}
            <Link to="/partner/login" className="font-bold text-slate-900 hover:text-purple-600">
              Iniciar sessão
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
