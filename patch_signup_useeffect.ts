import fs from 'fs';
let content = fs.readFileSync('src/pages/Signup.tsx', 'utf-8');

const targetUseEffect = `  // 2. Redirecionar Automaticamente Assim que o Registo/Verificação tem Sucesso
  useEffect(() => {
    if (!authLoading && user && profile) {
      const savedRedirect = sessionStorage.getItem('post_login_redirect');
            
      if (savedRedirect) {
        sessionStorage.removeItem('post_login_redirect');
        navigate(savedRedirect, { replace: true });
        return;
      }
      
      if (profile.role === 'admin') navigate('/admin', { replace: true });
      else if (profile.role === 'business') navigate('/partner/dashboard', { replace: true });
      else navigate('/account', { replace: true });
    }
  }, [user, profile, authLoading, navigate]);`;

content = content.replace(targetUseEffect, '');
fs.writeFileSync('src/pages/Signup.tsx', content);
