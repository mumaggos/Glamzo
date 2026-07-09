const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf8');

const enforcer = `
function GlobalRoleEnforcer() {
  const { user, profile, signOut, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (loading || !user || !profile) return;

    const path = location.pathname;
    
    const isPartnerRoute = path.startsWith('/partner') || path.startsWith('/setup');
    const isStaffRoute = path.startsWith('/staff');
    const isAdminRoute = path.startsWith('/admin');
    const isAuthRoute = ['/login', '/signup', '/partner/login', '/partner/signup', '/admin/login', '/staff/login'].includes(path);
    const isExempt = path.includes('stripe');
    
    const isPublicCustomerRoute = !isPartnerRoute && !isStaffRoute && !isAdminRoute && !isAuthRoute && !isExempt;

    const enforceSeparation = async () => {
       if (profile.role === 'business' || profile.role === 'staff' || profile.role === 'admin') {
          // Se uma loja/staff/admin vai para o site publico (home, explore, etc), fazer logout
          if (isPublicCustomerRoute) {
             console.log("Forcing logout: Staff/Business accessing public customer route", path);
             await signOut();
          }
       } else if (profile.role === 'customer') {
          // Se um cliente vai para a área de lojas/staff, fazer logout para permitir login de loja
          if ((isPartnerRoute && path !== '/partner') || isStaffRoute || isAdminRoute) {
             console.log("Forcing logout: Customer accessing business/staff route", path);
             await signOut();
          }
       }
    };

    enforceSeparation();
  }, [location.pathname, user, profile, loading, signOut]);

  return null;
}
`;

// Insert the enforcer before `export default function App`
text = text.replace('export default function App() {', enforcer + '\\nexport default function App() {');

// Add to the tree if not there
if (!text.includes('<GlobalRoleEnforcer />')) {
   text = text.replace('<SessionGuard />', '<SessionGuard />\\n          <GlobalRoleEnforcer />');
}

fs.writeFileSync('src/App.tsx', text.replace(/\\\\n/g, '\\n'));
