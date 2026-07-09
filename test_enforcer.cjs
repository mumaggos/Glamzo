const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf8');

const importSpot = text.indexOf('import { AuthProvider');
if (!text.includes('GlobalRoleEnforcer')) {
  let enforcer = `
function GlobalRoleEnforcer() {
  const { user, profile, signOut, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (loading || !user || !profile) return;

    const isPartnerRoute = location.pathname.startsWith('/partner') || location.pathname.startsWith('/setup');
    const isStaffRoute = location.pathname.startsWith('/staff');
    const isAdminRoute = location.pathname.startsWith('/admin');
    const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup';
    // Allow stripe and partner landing
    const isExempt = location.pathname.includes('stripe') || location.pathname === '/partner';
    const isPublicCustomerRoute = !isPartnerRoute && !isStaffRoute && !isAdminRoute && !isAuthRoute && !isExempt;

    const enforceSeparation = async () => {
       if (profile.role === 'business' || profile.role === 'staff' || profile.role === 'admin') {
          if (isPublicCustomerRoute) {
             console.log("Forcing logout: Staff/Business accessing customer route", location.pathname);
             await signOut();
          }
       } else {
          // customer
          if ((isPartnerRoute && location.pathname !== '/partner' && !location.pathname.includes('/partner/login') && !location.pathname.includes('/partner/signup')) || isStaffRoute || isAdminRoute) {
             console.log("Forcing logout: Customer accessing staff/business route", location.pathname);
             await signOut();
          }
       }
    };

    enforceSeparation();
  }, [location.pathname, user, profile, loading, signOut]);

  return null;
}
`;
  text = text.replace('export default function App() {', enforcer + '\nexport default function App() {');
  
  const routerSpot = text.indexOf('<BrowserRouter>');
  const routerEnd = text.indexOf('</BrowserRouter>', routerSpot);
  
  if (routerSpot !== -1) {
     text = text.replace('<ScrollToTop />', '<ScrollToTop />\n          <GlobalRoleEnforcer />');
  }
  
  fs.writeFileSync('src/App.tsx', text);
}
