import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regexGuard = /function SessionGuard\(\) \{[\s\S]*?return null;\n\}/;

const replacementGuard = `function SessionGuard() {
  const { user, profile, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user || !profile) return;

    const path = location.pathname;
    const isAuthPage = ['/login', '/partner/login', '/admin/login', '/partner/signup', '/signup'].includes(path);
    
    // Loja (Business): Impedir acesso ao /login se já estiver logado
    if (profile.role === 'business') {
      if (path === '/login') {
        navigate('/partner/dashboard', { replace: true });
        return;
      }
    }

    if (isAuthPage) {
      // 1º Verificar se há memória de redirecionamento para a Loja!
      const returnTo = localStorage.getItem('returnTo');
      if (returnTo) {
        localStorage.removeItem('returnTo');
        navigate(returnTo, { replace: true });
        return; // Pára a execução para não ser expulso para a Home!
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
    }
  }, [location.pathname, user, profile, loading, navigate, signOut]);

  return null;
}`;

content = content.replace(regexGuard, replacementGuard);
fs.writeFileSync('src/App.tsx', content);
