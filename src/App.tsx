import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { isSupabaseConfigured } from './lib/supabase';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';

// Páginas Principais (Importação Direta para evitar erros)
import Home from './pages/Home';
import Explore from './pages/Explore';
import BusinessDetail from './pages/BusinessDetail';
import Favorites from './pages/Favorites';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Account from './pages/Account';

// Páginas do Parceiro (Importação Direta)
import Partner from './pages/Partner';
import PartnerLogin from './pages/PartnerLogin';
import PartnerSignup from './pages/PartnerSignup';
import SetupWizard from './pages/partner/SetupWizard';
import PartnerLayout from './components/partner/PartnerLayout';
import OverviewTab from './pages/partner/tabs/OverviewTab';
import AgendaTab from './pages/partner/tabs/AgendaTab';
import ServicesTab from './pages/partner/tabs/ServicesTab';
import StaffTab from './pages/partner/tabs/StaffTab';
import ClientsTab from './pages/partner/tabs/ClientsTab';
import HoursTab from './pages/partner/tabs/HoursTab';
import FinanceTab from './pages/partner/tabs/FinanceTab';
import StoreAssetsTab from './pages/partner/tabs/StoreAssetsTab';
import SettingsTab from './pages/partner/tabs/SettingsTab';

// Páginas de Admin & Staff (Importação Direta)
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import StaffLogin from './pages/staff/StaffLogin';
import StaffDashboard from './pages/staff/StaffDashboard';

// Restantes Páginas (Lazy Load para não pesar na App inicial)
const SupabaseSetupHelper = React.lazy(() => import('./components/SupabaseSetupHelper'));
const UpdatePassword = React.lazy(() => import('./pages/UpdatePassword'));
const PaymentSuccess = React.lazy(() => import('./pages/partner/PaymentSuccess'));
const StripeSimulatedCheckout = React.lazy(() => import('./pages/StripeSimulatedCheckout'));
const StripeSimulatedConnect = React.lazy(() => import('./pages/StripeSimulatedConnect'));
const SuperAdminLogistics = React.lazy(() => import('./pages/admin/SuperAdminLogistics'));

// Abas Secundárias do Parceiro
const ReservationsTab = React.lazy(() => import('./pages/partner/tabs/ReservationsTab').then(m => ({ default: m.ReservationsTab })));
const MarketingTab = React.lazy(() => import('./pages/partner/tabs/MarketingTab').then(m => ({ default: m.MarketingTab })));
const MessagesTab = React.lazy(() => import('./pages/partner/tabs/MessagesTab'));
const TabletTab = React.lazy(() => import('./pages/partner/tabs/TabletTab'));

// Páginas Legais e Info
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

class ErrorBoundary extends React.Component<any, any> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div className="p-10 text-red-600 font-bold">Ocorreu um erro no carregamento da página. Por favor, recarregue.</div>;
    return this.props.children;
  }
}

function SessionGuard() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user || !profile) return;
    const path = location.pathname;
    const isAuthPage = ['/login', '/partner/login', '/admin/login', '/partner/signup'].includes(path);
    
    if (isAuthPage) {
      if (profile.role === 'business') navigate('/partner/dashboard', { replace: true });
      if (profile.role === 'admin') navigate('/admin', { replace: true });
    }
  }, [location.pathname, user, profile, loading, navigate]);
  return null;
}

export default function App() {
  const [loadMessenger, setLoadMessenger] = React.useState(false);

  React.useEffect(() => {
    if (!isSupabaseConfigured) return;
    let timer: any = setTimeout(() => setLoadMessenger(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!isSupabaseConfigured) {
    return <Suspense fallback={<RouteLoader />}><SupabaseSetupHelper /></Suspense>;
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
                  {/* Rotas Públicas Principais */}
                  <Route path="/" element={<Home />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/favorites" element={<Favorites />} />
                  
                  {/* Autenticação */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/update-password" element={<UpdatePassword />} />
                  <Route path="/account" element={<ProtectedRoute allowedRoles={['customer', 'business', 'admin']}><Account /></ProtectedRoute>} />

                  {/* Rotas Legais e Info */}
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

                  {/* Parceiros Externo */}
                  <Route path="/partner" element={<Partner />} />
                  <Route path="/partner/login" element={<PartnerLogin />} />
                  <Route path="/partner/signup" element={<PartnerSignup />} />
                  
                  {/* Stripe & Setup */}
                  <Route path="/partner/setup" element={<ProtectedRoute allowedRoles={['business']}><SetupWizard /></ProtectedRoute>} />
                  <Route path="/setup/payment-success" element={<ProtectedRoute allowedRoles={['business']}><PaymentSuccess /></ProtectedRoute>} />
                  <Route path="/setup" element={<Navigate to="/partner/setup" replace />} />
                  <Route path="/stripe-simulated-checkout" element={<StripeSimulatedCheckout />} />
                  <Route path="/stripe-simulated-connect" element={<StripeSimulatedConnect />} />

                  {/* Staff */}
                  <Route path="/staff/login" element={<StaffLogin />} />
                  <Route path="/staff/dashboard" element={<StaffDashboard />} />

                  {/* Dashboard Parceiro */}
                  <Route path="/dashboard" element={<Navigate to="/partner/dashboard" replace />} />
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

                  {/* Admin */}
                  <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/logistica" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminLogistics /></ProtectedRoute>} />

                  {/* DETALHE DAS LOJAS - As rotas dinâmicas TÊM de ficar no final */}
                  <Route path="/business/:slug" element={<BusinessDetail />} />
                  <Route path="/store/:slug" element={<BusinessDetail />} />
                  <Route path="/:slug" element={<BusinessDetail />} />
                  
                  {/* Catch All / 404 */}
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
