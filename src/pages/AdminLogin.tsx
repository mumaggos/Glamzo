import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Eye, EyeOff, KeyRound, Mail, Loader2, Compass } from 'lucide-react';

export default function AdminLogin() {
  const { signIn, signOut, signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Preencha as credenciais administrativas.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Direct hard credential validation first
      const inputEmail = email.trim().toLowerCase();
      const isAuthorizedEmail = inputEmail === 'admin@gmail.com' || inputEmail === 'glamzo.suporte@gmail.com';
      if (!isAuthorizedEmail || password.trim() !== '191191') {
        throw new Error('As credenciais fornecidas não são autorizadas para o Painel Administrativo.');
      }

      // 1. Authenticate with Supabase
      let loginResult;
      try {
        loginResult = await signIn(email.trim(), password.trim());
      } catch (signInErr: any) {
        // If sign in fails and it's our hardcoded admin account, automatically try to register it
        console.log('Admin account sign in failed. Attempting auto-registration backup...', signInErr);
        try {
          await signUp(email.trim(), password.trim(), 'Administrador Geral', 'admin');
          // Retry sign in after successful auto-registration
          loginResult = await signIn(email.trim(), password.trim());
        } catch (signUpErr) {
          console.error('Auto-registration of admin account failed:', signUpErr);
          // If signUp also fails (e.g. email exists but wrong password, or something else), throw original error
          throw signInErr;
        }
      }

      const activeUser = loginResult?.user;

      if (!activeUser) {
        throw new Error('Falha na autenticação administrativa do sistema.');
      }

      setSuccessMsg('Sessão administrativa ativada com sucesso! Redirecionando...');
      
      setTimeout(() => {
        navigate('/admin', { replace: true });
      }, 1500);

    } catch (err: any) {
      console.error('Admin Login Error:', err);
      try { await signOut(); } catch (se) {}
      setErrorMsg(err.message || 'Credenciais de administrador inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="admin-login-view" className="min-h-[calc(100vh-64px)] bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center animate-fade-in">
        <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-950 mb-4 mx-auto text-white">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Glamzo Admin Console
        </h2>
        <p className="mt-2 text-xs text-slate-400">
          Acesso restrito para administração global da plataforma e monitorização das lojas parceiras.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 rounded-3xl shadow-2xl sm:px-10">
          
          {errorMsg && (
            <div className="mb-4 p-4 bg-rose-950/45 border border-[1px] border-rose-900 text-rose-400 rounded-xl text-xs font-semibold">
              <p>{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-4 bg-purple-950/45 border border-purple-900 text-purple-400 rounded-xl text-xs font-semibold">
              <p>{successMsg}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleAdminLogin}>
            
            <div>
              <label htmlFor="admin-email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                E-mail Admin
              </label>
              <div className="relative rounded-xl shadow-sm">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all placeholder:text-slate-600"
                  placeholder="admin@glamzo.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-pass" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Código de Acesso
              </label>
              <div className="relative rounded-xl shadow-sm">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  id="admin-pass"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all placeholder:text-slate-600"
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
                className="w-full flex justify-center py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-950/50 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 gap-2 items-center cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>A iniciar sessão admin...</span>
                  </>
                ) : (
                  <span>Iniciar Painel Admin</span>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
