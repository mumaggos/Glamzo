const fs = require('fs');
let content = fs.readFileSync('src/components/GlobalImpersonationBanner.tsx', 'utf8');

const newContent = `import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, ShieldAlert } from 'lucide-react';

export default function GlobalImpersonationBanner() {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const backup = localStorage.getItem('admin_impersonate_backup_session');
    if (backup) {
      setIsImpersonating(true);
    }
  }, []);

  const handleReturnToAdmin = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      const backupStr = localStorage.getItem('admin_impersonate_backup_session');
      
      if (backupStr) {
        const backupSession = JSON.parse(backupStr);
        
        // Directly set session, overwriting the current one
        await supabase.auth.setSession({
          access_token: backupSession.access_token,
          refresh_token: backupSession.refresh_token,
        }).catch(err => {
          console.error("Session restore error:", err);
        });
      }
      
    } catch (err: any) {
      console.error('Error during admin return:', err);
    } finally {
      localStorage.removeItem('admin_impersonate_backup_session');
      // Hard redirect to admin
      window.location.href = '/admin';
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
        className="px-3 py-1 bg-white text-rose-600 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1.5 cursor-pointer"
      >
        <LogOut className="w-3.5 h-3.5" />
        {loading ? 'A sair...' : 'Sair do Modo Deus e Voltar ao Admin'}
      </button>
    </div>
  );
}
`;

fs.writeFileSync('src/components/GlobalImpersonationBanner.tsx', newContent);
console.log("Updated GlobalImpersonationBanner.tsx one last time.");
