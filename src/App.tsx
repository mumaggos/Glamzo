import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { isSupabaseConfigured } from './lib/supabase';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import Home from './pages/Home';

// --- RADAR DE ERROS ---
class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#fef2f2', color: '#991b1b', minHeight: '100vh' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>🚨 Encontrámos o Erro! 🚨</h2>
          <p>Copia o texto abaixo e envia-me para eu resolver agora mesmo:</p>
          <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #fecaca', marginTop: '10px', overflowX: 'auto', fontSize: '12px' }}>
            <p><strong>Erro:</strong> {this.state.error?.toString()}</p>
            <p style={{ marginTop: '10px' }}><strong>Detalhes:</strong> {this.state.errorInfo?.componentStack}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
// ----------------------

function SessionGuard() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user || !profile) return;

    if (profile.role === 'admin' || profile.role === 'business') {
      const path = location.pathname;
      if (path === '/update-password') return;

      const isAuthPage = path === '/login' || path === '/partner/login' || path === '/admin/login' || path === '/partner/signup';
      const permittedAdmin = profile.role === 'admin' && path.startsWith('/admin');
      const permittedBusiness = profile.role === 'business' && (
        path.startsWith('/dashboard') || 
        path.startsWith('/setup') || 
        path.startsWith('/stripe') || 
        path.startsWith('/onboarding') ||
        path.startsWith('/partner')
      );

      if (isAuthPage && profile.role === 'business') {
        navigate('/setup', { replace: true });
        return;
      }
      if (isAuthPage && profile.role === 'admin') {
        navigate('/admin', { replace: true });
        return;
      }

      if (!isAuthPage && !permittedAdmin && !permittedBusiness) {
        if (profile.role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (profile.role === 'business') {
          navigate('/setup', { replace: true });
        }
      }
    }
  }, [location.pathname, user, profile, loading, navigate]);

  return null;
}

const SupabaseSetupHelper = React.lazy(() => import('./components/SupabaseSetupHelper'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Account = React.lazy(() => import('./pages/Account'));

const PartnerLayout = React.lazy(() => import('./components/partner/PartnerLayout'));
const OverviewTab = React.lazy(() => import('./pages/partner/tabs/OverviewTab'));
const AgendaTab = React.lazy(() => import('./pages/partner/tabs/AgendaTab'));
const ServicesTab = React.lazy(() => import('./pages/partner/tabs/ServicesTab'));
const StaffTab = React.lazy(() => import('./pages/partner/tabs/StaffTab'));
const ClientsTab = React.lazy(() => import('./pages/partner/tabs/ClientsTab'));
const HoursTab = React.lazy(() => import('./pages/partner/tabs/HoursTab'));
const FinanceTab = React.lazy(() => import('./pages/partner/tabs/FinanceTab'));
const ReservationsTab = React.lazy(() => import('./pages/partner/tabs/ReservationsTab').then(m => ({ default: m.ReservationsTab })));
const MarketingTab = React.lazy(() => import('./pages/partner/tabs/MarketingTab').then(m => ({ default: m.MarketingTab })));
const StoreAssetsTab = React.lazy(() => import('./pages/partner/tabs/StoreAssetsTab'));
const MessagesTab = React.lazy(() => import('./pages/partner/tabs/MessagesTab'));
const SettingsTab = React.lazy(() => import('./pages/partner/tabs/SettingsTab'));
const TabletTab = React.lazy(() => import('./pages/partner/tabs/TabletTab'));
const Admin = React.lazy(() => import('./pages/Admin'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const Explore = React.lazy(() => import('./pages/Explore'));
const BusinessDetail = React.lazy(() => import('./pages/BusinessDetail'));
const Partner = React.lazy(() => import('./pages/Partner'));
const PartnerLogin = React.lazy(() => import('./pages/PartnerLogin'));
const PartnerSignup = React.lazy(() => import('./pages/PartnerSignup'));
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const SuperAdminLogistics = React.lazy(() => import('./pages/admin/SuperAdminLogistics'));
const StaffLogin = React.lazy(() => import('./pages/staff/StaffLogin'));
const StaffDashboard = React.lazy(() => import('./pages/staff/StaffDashboard'));
const UpdatePassword = React.lazy(() => import('./pages/UpdatePassword'));
const SetupWizard = React.lazy(() => import('./pages/partner/SetupWizard'));
const PaymentSuccess = React.lazy(() => import('./pages/partner/PaymentSuccess'));
const StripeSimulatedCheckout = React.lazy(() => import('./pages/StripeSimulatedCheckout'));
const StripeSimulatedConnect = React.lazy(() => import('./pages/StripeSimulatedConnect'));
const Favorites = React.lazy(() => import('./pages/Favorites'));
const Termos = React.lazy(() => import('./pages/legal/Termos'));
const Privacidade = React.lazy(() => import('./pages/legal/Privacidade'));
const Cookies = React.lazy(() => import('./pages/legal/Cookies'));
const Cancelamentos = React.lazy(() => import('./pages/legal/Cancelamentos'));
const Pagamentos = React.lazy(() => import('./pages/legal/Pagamentos'));
const Seguranca = React.lazy(() => import('./pages/legal/Seguranca'));
const FaqCliente = React.lazy(() => import('./pages/info/FaqCliente'));
const FaqParceiro = React.lazy(() => import('./pages/info/FaqParceiro'));
const Sobre = React.lazy(() => import('./pages/info/Sobre'));
const Contactos = React.lazy(() => import('./pages/info/Contactos'));
const GlamzoMessenger = React.lazy(() => import('./components/GlamzoMessenger'));

function RouteLoader() {
  return (
    <div className="flex-1 w-full min-h-[45vh] flex items-center justify-center p-6 text-slate-600 select-none">
      <div className="flex flex-col items-center gap-2.5">
        <div className="w-5 h-5 border-2 border-purple-500/25 border-t-purple-500 rounded-full animate-spin" />
        <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400 font-mono">Glamzo</span>
      </div>
    </div>
  );
}

export default function App() {
  const [loadMessenger, setLoadMessenger] = React.useState(false);

  React.useEffect(() => {
    if (!isSupabaseConfigured) return;

    let timer: any;
    const triggerDeferred = () => {
      setLoadMessenger(true);
      cleanup();
    };

    timer = setTimeout(triggerDeferred, 1200);
    const events = ['mousedown', 'touchstart', 'mousemove', 'keydown', 'scroll'];
    const cleanup = () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, triggerDeferred));
    };

    events.forEach(e => window.addEventListener(e, triggerDeferred, { passive: true }));
    return cleanup;
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <Suspense fallback={<RouteLoader />}>
        <SupabaseSetupHelper />
      </Suspense>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <SessionGuard />
          <div id="glamzo-app-root" className="min-h-screen bg-[#fafbfc] text-slate-900 flex flex-col font-sans selection:bg-purple-200 selection:text-purple-900 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-purple-600 to-rose-450 z-50" />
            
            <Navbar />
            
            <main className="flex-1 w-full">
              <Suspense fallback={<RouteLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/update-password" element={<UpdatePassword />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/business/:slug" element={<BusinessDetail />} />
                  <Route path="/store/:slug" element={<BusinessDetail />} />
                  <Route path="/partner" element={<Partner />} />
                  <Route path="/partner/login" element={<PartnerLogin />} />
                  <Route path="/partner/signup" element={<PartnerSignup />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  
                  <Route path="/staff/login" element={<StaffLogin />} />
                  <Route path="/staff/dashboard" element={<StaffDashboard />} />
                  
                  <Route path="/partner/setup" element={<ProtectedRoute allowedRoles={['business']}><SetupWizard /></ProtectedRoute>} />
                  <Route path="/setup/payment-success" element={<ProtectedRoute allowedRoles={['business']}><PaymentSuccess /></ProtectedRoute>} />
                  
                  <Route path="/setup" element={<Navigate to="/partner/setup" replace />} />
                  <Route path="/dashboard" element={<Navigate to="/partner/dashboard" replace />} />
                  <Route path="/stripe-simulated-checkout" element={<StripeSimulatedCheckout />} />
                  <Route path="/stripe-simulated-connect" element={<StripeSimulatedConnect />} />
                  <Route path="/favorites" element={<Favorites />} />
                  
                  <Route path="/termos-e-condicoes" element={<Termos />} />
                  <Route path="/politica-de-privacidade" element={<Privacidade />} />
                  <Route path="/politica-de-cookies" element={<Cookies />} />
                  <Route path="/politica-de-cancelamentos" element={<Cancelamentos />} />
                  <Route path="/politica-de-pagamentos" element={<Pagamentos />} />
                  <Route path="/seguranca-e-protecao-de-dados" element={<Seguranca />} />
                  <Route path="/faq-cliente" element={<FaqCliente />} />
                  <Route path="/faq-parceiro" element={<FaqParceiro />} />
                  <Route path="/sobre-nos" element={<Sobre />} />
                  <Route path="/contactos" element={<Contactos />} />

                  <Route path="/account" element={<ProtectedRoute allowedRoles={['customer', 'business', 'admin']}><Account /></ProtectedRoute>} />

                  <Route path="/partner/dashboard" element={<ProtectedRoute allowedRoles={['business', 'admin']}><PartnerLayout /></ProtectedRoute>}>
                    <Route index element={<Navigate to="agenda" replace />} />
                    <Route path="overview" element={<OverviewTab />} />
                    <Route path="agenda" element={<AgendaTab />} />
                    <Route path="reservas" element={<ReservationsTab />} />
                    <Route path="clientes" element={<ClientsTab />} />
                    <Route path="equipa" element={<StaffTab />} />
                    <Route path="servicos" element={<ServicesTab />} />
                    <Route path="horarios" element={<HoursTab />} />
                    <Route path="campanhas" element={<MarketingTab />} />
                    <Route path="financeiro" element={<FinanceTab />} />
                    <Route path="website" element={<StoreAssetsTab />} />
                    <Route path="mensagens" element={<MessagesTab />} />
                    <Route path="tablet" element={<TabletTab />} />
                    <Route path="configuracoes" element={<SettingsTab />} />
                  </Route>

                  <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
                  <Route path="/admin/logistica" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminLogistics /></ProtectedRoute>} />

                  <Route path="/:slug" element={<BusinessDetail />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>
            
            <Footer />
            <CookieBanner />

            {loadMessenger && (
              <Suspense fallback={null}>
                <GlamzoMessenger />
              </Suspense>
            )}
          </div>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
