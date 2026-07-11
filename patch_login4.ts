import fs from 'fs';
let content = fs.readFileSync('src/pages/Login.tsx', 'utf-8');

const targetOrder = `      if (data?.user?.id) {
        const returnTo = localStorage.getItem('returnTo');
        if (returnTo) {
          localStorage.removeItem('returnTo');
          navigate(returnTo, { replace: true });
          return;
        }
        
        const savedRedirect = sessionStorage.getItem('post_login_redirect');
        if (savedRedirect) {
          sessionStorage.removeItem('post_login_redirect');
          navigate(savedRedirect, { replace: true });
          return;
        }

        // Obter perfil para verificar se é loja
        const { data: prof } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
        if (prof?.role === 'business') {
          await supabase.auth.signOut();
          setErrorMsg('Acesso negado. Por favor, inicie sessão através do Portal do Parceiro.');
          setLoading(false);
          return;
        }`;

const replacementOrder = `      if (data?.user?.id) {
        // Obter perfil para verificar se é loja
        const { data: prof } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
        if (prof?.role === 'business') {
          await supabase.auth.signOut();
          setErrorMsg('Acesso negado. Por favor, inicie sessão através do Portal do Parceiro.');
          setLoading(false);
          return;
        }

        const returnTo = localStorage.getItem('returnTo');
        if (returnTo) {
          localStorage.removeItem('returnTo');
          navigate(returnTo, { replace: true });
          return;
        }
        
        const savedRedirect = sessionStorage.getItem('post_login_redirect');
        if (savedRedirect) {
          sessionStorage.removeItem('post_login_redirect');
          navigate(savedRedirect, { replace: true });
          return;
        }`;

content = content.replace(targetOrder, replacementOrder);
fs.writeFileSync('src/pages/Login.tsx', content);
