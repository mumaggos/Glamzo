import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GlobalImpersonationBanner() {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if backup session exists
    const backup = localStorage.getItem('admin_impersonate_backup_session');
    if (backup) {
      setIsImpersonating(true);
    }
  }, []);

  const handleReturnToAdmin = async () => {
    setLoading(true);
    try {
      const backupStr = localStorage.getItem('admin_impersonate_backup_session');
      if (!backupStr) return;
      
      const backupSession = JSON.parse(backupStr);
      
      // Sign out of current user
      await supabase.auth.signOut();
      
      // Restore admin session
      const { error } = await supabase.auth.setSession({
        access_token: backupSession.access_token,
        refresh_token: backupSession.refresh_token,
      });
      
      if (error) throw error;
      
      localStorage.removeItem('admin_impersonate_backup_session');
      toast.success('Sessão Admin restaurada!');
      window.location.href = '/admin';
    } catch (err: any) {
      toast.error('Erro ao restaurar sessão: ' + err.message);
      setLoading(false);
    }
  };

  if (!isImpersonating) return null;

  return (
    <div className="bg-rose-600 text-white px-4 py-2 flex items-center justify-between text-xs font-bold sticky top-0 z-[999999]">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 animate-pulse" />
        <span>MODO DEUS ATIVO: Está a ver a plataforma como Lojista.</span>
      </div>
      <button 
        onClick={handleReturnToAdmin}
        disabled={loading}
        className="px-3 py-1 bg-white text-rose-600 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1.5"
      >
        <LogOut className="w-3.5 h-3.5" />
        {loading ? 'A restaurar...' : 'Sair do Modo Deus e Voltar ao Admin'}
      </button>
    </div>
  );
}
