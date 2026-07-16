const fs = require('fs');
let content = fs.readFileSync('src/components/GlobalImpersonationBanner.tsx', 'utf8');

const oldStr = `  const handleReturnToAdmin = async () => {
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
  };`;

const newStr = `  const handleReturnToAdmin = async () => {
    setLoading(true);
    try {
      const backupStr = localStorage.getItem('admin_impersonate_backup_session');
      
      // Clear from local storage immediately to prevent getting stuck
      localStorage.removeItem('admin_impersonate_backup_session');
      
      if (!backupStr) {
        window.location.href = '/admin';
        return;
      }
      
      const backupSession = JSON.parse(backupStr);
      
      // Sign out of current user
      await supabase.auth.signOut();
      
      // Try to restore admin session
      const { error } = await supabase.auth.setSession({
        access_token: backupSession.access_token,
        refresh_token: backupSession.refresh_token,
      });
      
      if (error) {
        console.error('Session restore error:', error);
        toast.error('Sessão expirada. Por favor, faça login novamente como admin.');
      } else {
        toast.success('Sessão Admin restaurada!');
      }
      
      window.location.href = '/admin';
    } catch (err: any) {
      console.error('Fallback error during admin return:', err);
      localStorage.removeItem('admin_impersonate_backup_session');
      toast.error('Erro ao restaurar. A redirecionar para login...');
      window.location.href = '/admin';
    }
  };`;

content = content.replace(oldStr, newStr);
fs.writeFileSync('src/components/GlobalImpersonationBanner.tsx', content);
console.log("Replaced handleReturnToAdmin in GlobalImpersonationBanner");
