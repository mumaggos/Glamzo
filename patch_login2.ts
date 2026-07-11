import fs from 'fs';
let content = fs.readFileSync('src/pages/Login.tsx', 'utf-8');

const targetEmailLogin = `    try {
      const data = await signIn(email, password);
      
      if (data?.user?.id) {
        // Obter perfil para verificar se é loja`;

const replacementEmailLogin = `    try {
      const data = await signIn(email, password);
      
      if (data?.user?.id) {
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

        // Obter perfil para verificar se é loja`;

content = content.replace(targetEmailLogin, replacementEmailLogin);

// And we need to make sure we don't have duplicated useEffect in Login.tsx
const targetUseEffect = `  // 2. Redirecionar Automaticamente Assim que o Login tem Sucesso
  useEffect(() => {
    if (!authLoading && user && profile) {
      // Verifica primeiro se há um URL guardado na sessão
      const savedRedirect = sessionStorage.getItem('post_login_redirect');
      const returnTo = localStorage.getItem('returnTo');
            
      if (returnTo) {
        localStorage.removeItem('returnTo');
        navigate(returnTo, { replace: true });
        return;
      }
      
      if (savedRedirect) {
        sessionStorage.removeItem('post_login_redirect');
        navigate(savedRedirect, { replace: true });
        return;
      }

      // Se não houver redirect guardado, manda para o dashboard por defeito consoante a role
      if (profile.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (profile.role === 'business') {
        navigate('/partner/dashboard', { replace: true });
      } else if (profile.role === 'staff') {
        navigate('/staff/dashboard', { replace: true });
      } else {
        navigate('/account', { replace: true });
      }
    }
  }, [user, profile, authLoading, navigate]);`;

content = content.replace(targetUseEffect, '');

fs.writeFileSync('src/pages/Login.tsx', content);
