import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetGuard = `    if (isAuthPage) {
      // 1º Verificar se há memória de redirecionamento para a Loja!
      const savedRedirect = sessionStorage.getItem('post_login_redirect');
      if (savedRedirect) {
        sessionStorage.removeItem('post_login_redirect');
        navigate(savedRedirect, { replace: true });
        return; // Pára a execução para não ser expulso para a Home!
      }
      
      // 2º Se não houver, segue o comportamento normal
      if (profile.role === 'business') navigate('/partner/dashboard', { replace: true });
      else if (profile.role === 'admin') navigate('/admin', { replace: true });
      else navigate('/account', { replace: true });
    }`;

const replacementGuard = `    if (isAuthPage) {
      // 1º Verificar se há memória de redirecionamento para a Loja!
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
        return; // Pára a execução para não ser expulso para a Home!
      }
      
      // 2º Se não houver, segue o comportamento normal
      if (profile.role === 'business') navigate('/partner/dashboard', { replace: true });
      else if (profile.role === 'admin') navigate('/admin', { replace: true });
      else if (profile.role === 'staff') navigate('/staff/dashboard', { replace: true });
      else navigate('/', { replace: true });
    }`;

content = content.replace(targetGuard, replacementGuard);
fs.writeFileSync('src/App.tsx', content);
