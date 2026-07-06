import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { isSupabaseConfigured } from './lib/supabase';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';

// Páginas Importadas Diretamente (Resolve erros de Chunk/Import)
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Account from './pages/Account';
import AgendaTab from './pages/partner/tabs/AgendaTab';
import PartnerLayout from './components/partner/PartnerLayout';
import OverviewTab from './pages/partner/tabs/OverviewTab';
import ServicesTab from './pages/partner/tabs/ServicesTab';
import StaffTab from './pages/partner/tabs/StaffTab';
import ClientsTab from './pages/partner/tabs/ClientsTab';
import HoursTab from './pages/partner/tabs/HoursTab';
import FinanceTab from './pages/partner/tabs/FinanceTab';
import StoreAssetsTab from './pages/partner/tabs/StoreAssetsTab';
import SettingsTab from './pages/partner/tabs/SettingsTab';
import Admin from './pages/Admin';
import Explore from './pages/Explore';
import BusinessDetail from './pages/BusinessDetail';
import Partner from './pages/Partner';
import PartnerLogin from './pages/PartnerLogin';
import PartnerSignup from './pages/PartnerSignup';
import AdminLogin from './pages/AdminLogin';
import StaffLogin from './pages/staff/StaffLogin';
import StaffDashboard from './pages/staff/StaffDashboard';
import UpdatePassword from './pages/UpdatePassword';
import SetupWizard from './pages/partner/SetupWizard';
import PaymentSuccess from './pages/partner/PaymentSuccess';

// Páginas de Lazy Load (Menos críticas)
const ReservationsTab = React.lazy(() => import('./pages/partner/tabs/ReservationsTab').then(m => ({ default: m.ReservationsTab })));
const MarketingTab = React.lazy(() => import('./pages/partner/tabs/MarketingTab').then(m => ({ default: m.MarketingTab })));
const MessagesTab = React.lazy(() => import('./pages/partner/tabs/MessagesTab'));
const TabletTab = React.lazy(() => import('./pages/partner/tabs/TabletTab'));
const SupabaseSetupHelper = React.lazy(() => import('./components/SupabaseSetupHelper'));

// Error Boundary para evitar ecrã branco
class ErrorBoundary extends React.Component<any, any> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div className="p-10 text-red-600">Erro crítico no interface. Reinicia o deploy.</div>;
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
  if (!isSupabaseConfigured) return <Suspense fallback={<div>Carregando...</div>}><SupabaseSetupHelper /></Suspense>;

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <SessionGuard />
          <div className="min-h-screen bg-[#fafbfc] flex flex-col">
            <Navbar />
            <main className="flex-1 w-full">
              <Suspense fallback={<div className="p-10 text-center">A carregar...</div>}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/partner" element={<Partner />} />
                  <Route path="/partner/login" element={<PartnerLogin />} />
                  <Route path="/partner/signup" element={<PartnerSignup />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/staff/login" element={<StaffLogin />} />
                  <Route path="/staff/dashboard" element={<StaffDashboard />} />
                  <Route path="/update-password" element={<UpdatePassword />} />
                  
                  <Route path="/partner/setup" element={<ProtectedRoute allowedRoles={['business']}><SetupWizard /></ProtectedRoute>} />
                  
                  <Route path="/partner/dashboard" element={<ProtectedRoute allowedRoles={['business', 'admin']}><PartnerLayout /></ProtectedRoute>}>
                    <Route index element={<Navigate to="agenda" replace />} />
                    <Route path="agenda" element={<AgendaTab />} />
                    <Route path="overview" element={<OverviewTab />} />
                    <Route path="servicos" element={<ServicesTab />} />
                    <Route path="equipa" element={<StaffTab />} />
                    <Route path="clientes" element={<ClientsTab />} />
                    <Route path="horarios" element={<HoursTab />} />
                    <Route path="financeiro" element={<FinanceTab />} />
                    <Route path="website" element={<StoreAssetsTab />} />
                    <Route path="configuracoes" element={<SettingsTab />} />
                    <Route path="reservas" element={<ReservationsTab />} />
                    <Route path="campanhas" element={<MarketingTab />} />
                    <Route path="mensagens" element={<MessagesTab />} />
                    <Route path="tablet" element={<TabletTab />} />
                  </Route>
                  
                  <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
                  <Route path="/account" element={<ProtectedRoute allowedRoles={['customer', 'business', 'admin']}><Account /></ProtectedRoute>} />
                  
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <CookieBanner />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
