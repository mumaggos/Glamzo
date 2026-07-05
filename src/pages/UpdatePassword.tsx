import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { KeyRound, CheckCircle, Loader2 } from 'lucide-react';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have an active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setErrorMsg('Sessão inválida ou expirada. Por favor, solicite uma nova recuperação de senha.');
      }
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;

      setSuccessMsg('Senha atualizada com sucesso!');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao atualizar a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 text-purple-600">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Nova Senha</h1>
          <p className="text-slate-500 text-sm mt-2 text-center">
            Insira a sua nova senha abaixo para recuperar o acesso à sua conta.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 text-rose-600 text-sm font-semibold rounded-2xl border border-rose-100">
            {errorMsg}
          </div>
        )}

        {successMsg ? (
          <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col items-center text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
            <h3 className="font-bold text-slate-900 text-lg mb-1">Senha Atualizada!</h3>
            <p className="text-sm text-emerald-700">{successMsg}</p>
            <p className="text-xs text-slate-500 mt-4">A redirecionar...</p>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Nova Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>A atualizar...</span>
                </>
              ) : (
                <span>Atualizar Senha</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
