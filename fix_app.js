import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/function SessionGuard\(\) \{[\s\S]*?return null;\n\}/, 
`function SessionGuard() {
  const { user, profile, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useLocalizedNavigate();

  useEffect(() => {
    if (loading || !user || !profile) return;
    let path = location.pathname;
    const pathParts = path.split('/');
    if (pathParts[1] && ['pt', 'en', 'es', 'fr'].includes(pathParts[1])) {
      path = '/' + pathParts.slice(2).join('/');
    }
    if (path === '//' || path === '') path = '/';
    
    const isAuthPage = ['/login', '/partner/login', '/admin/login', '/partner/signup', '/signup'].includes(path);
    
    // Loja (Business): Impedir acesso ao /login se já estiver logado
    if (profile.role === 'business') {
      if (path === '/login') {
        navigate('/partner/dashboard', { replace: true });
        return;
      }
    }

    if (isAuthPage) {
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
      
      if (profile.role === 'business') navigate('/partner/dashboard', { replace: true });
      else if (profile.role === 'admin') navigate('/admin', { replace: true });
      else if (profile.role === 'staff') navigate('/staff/dashboard', { replace: true });
      else navigate('/', { replace: true });
    }
  }, [location.pathname, user, profile, loading, navigate, signOut]);

  return null;
}`);

code = code.replace(/function GlobalRoleEnforcer\(\) \{[\s\S]*?return null;\n\}/, 
`function GlobalRoleEnforcer() {
  const { user, profile, signOut, loading } = useAuth();
  const location = useLocation();
  const navigate = useLocalizedNavigate();

  useEffect(() => {
    if (loading || !user || !profile) return;
    let path = location.pathname;
    const pathParts = path.split('/');
    if (pathParts[1] && ['pt', 'en', 'es', 'fr'].includes(pathParts[1])) {
      path = '/' + pathParts.slice(2).join('/');
    }
    if (path === '//' || path === '') path = '/';
    
    const isPartnerRoute = path.startsWith('/partner') || path.startsWith('/setup') || path.startsWith('/dashboard');
    const isStaffRoute = path.startsWith('/staff');
    const isAdminRoute = path.startsWith('/admin');
    const isAuthRoute = ['/login', '/signup', '/partner/login', '/partner/signup', '/admin/login', '/staff/login'].includes(path);
    const isExempt = path.includes('stripe');
    
    const isPublicCustomerRoute = !isPartnerRoute && !isStaffRoute && !isAdminRoute && !isAuthRoute && !isExempt;

    const enforceSeparation = async () => {
       if (profile.role === 'business') {
          if (isPublicCustomerRoute || isStaffRoute || isAdminRoute) {
             navigate('/partner/dashboard', { replace: true });
          }
       } else if (profile.role === 'staff') {
          if (isPublicCustomerRoute || isPartnerRoute || isAdminRoute) {
             navigate('/staff/dashboard', { replace: true });
          }
       } else if (profile.role === 'admin') {
          if (isPublicCustomerRoute || isPartnerRoute || isStaffRoute) {
             navigate('/admin', { replace: true });
          }
       } else if (profile.role === 'customer') {
          if ((isPartnerRoute && path !== '/partner') || isStaffRoute || isAdminRoute) {
             await signOut();
          }
       }
    };
    enforceSeparation();
  }, [location.pathname, user, profile, loading, signOut, navigate]);

  return null;
}`);

fs.writeFileSync('src/App.tsx', code);
