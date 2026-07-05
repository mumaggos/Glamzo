import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { KeyRound, Check, Loader2 } from 'lucide-react';
import GlamzoLogo from '../components/GlamzoLogo';
import { useAuth } from '../hooks/useAuth';

export default function UpdatePassword() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    // Optional check if we have a hash fragment (Supabase auth flow)
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      // It's a valid recovery flow
    }
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password.length < 6) {
      setErrorMsg('A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('As palavras-passe não coincidem.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccessMsg('Palavra-passe atualizada com sucesso! A redirecionar...');
      
      // Determine redirection path based on role
      const redirectPath = profile?.role === 'business' ? '/partner/dashboard' : '/login';
      
      setTimeout(() => {
        navigate(redirectPath);
      }, 2000);
    } catch (err: any) {
      console.error('Update Password Error:', err);
      setErrorMsg(err.message || 'Erro ao atualizar a palavra-passe. Tente solicitar uma nova recuperação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        
        <div className="flex flex-col items-center">
          <GlamzoLogo size={64} showSquircle={true} glow={true} className="mb-4" />
          <h2 className="text-center text-3xl font-extrabold text-[#110724] tracking-tight font-display uppercase">
            Glamzo<span className="text-purple-600 font-black">.</span>
          </h2>
          <p className="mt-2 text-center text-sm font-semibold text-slate-500 uppercase tracking-widest">
            Recuperação de Acesso
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleUpdatePassword}>
            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-150 text-rose-700 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-150 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Nova Palavra-passe
              </label>
              <div className="relative rounded-xl shadow-sm">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-650 transition-all"
                  placeholder="Mínimo de 6 caracteres"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Confirmar Palavra-passe
              </label>
              <div className="relative rounded-xl shadow-sm">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-650 transition-all"
                  placeholder="Confirme a nova palavra-passe"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !!successMsg}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors uppercase tracking-wider disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Atualizar Palavra-passe'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
