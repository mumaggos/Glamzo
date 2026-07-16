const fs = require('fs');
let code = fs.readFileSync('src/pages/Login.tsx', 'utf8');

const newEffect = `
  useEffect(() => {
    if (user && !loading && !authLoading) {
      if (profile?.role === 'business') {
        supabase.auth.signOut();
        setErrorMsg('Acesso negado. Por favor, inicie sessão através do Portal do Parceiro.');
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
      }
      navigate('/account', { replace: true });
    }
  }, [user, profile, authLoading, navigate]);
`;

code = code.replace(
  /const \[errorMsg, setErrorMsg\] = useState<string \| null>\(null\);/,
  `const [errorMsg, setErrorMsg] = useState<string | null>(null);\n\n${newEffect}`
);

fs.writeFileSync('src/pages/Login.tsx', code);
