import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { isSupabaseConfigured } from './lib/supabase';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';

// IMPORTAÇÕES DIRETAS
import Home from './pages/Home';
import Explore from './pages/Explore';
import BusinessDetail from './pages/BusinessDetail';
import Favorites from './pages/Favorites';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Account from './pages/Account';
import UpdatePassword from './pages/UpdatePassword';

import Partner from './pages/Partner';
import PartnerLogin from './pages/PartnerLogin';
import PartnerSignup from './pages/PartnerSignup';
import SetupWizard from './pages/partner/SetupWizard';
import PaymentSuccess from './pages/partner/PaymentSuccess';

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
import { ReservationsTab } from './pages/partner/tabs/ReservationsTab';
import { MarketingTab } from './pages/partner/tabs/MarketingTab';
import MessagesTab from './pages/partner/tabs/MessagesTab';
import TabletTab from './pages/partner/tabs/TabletTab';

import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import SuperAdminLogistics from './pages/admin/SuperAdminLogistics';
import StaffLogin from './pages/staff/StaffLogin';
import StaffDashboard from './pages/staff/StaffDashboard';

import StripeSimulatedCheckout from './pages/StripeSimulatedCheckout';
import StripeSimulatedConnect from './pages/StripeSimulatedConnect';
import SupabaseSetupHelper from './components/SupabaseSetupHelper';
import GlamzoMessenger from './components/GlamzoMessenger';

import Termos from './pages/legal/Termos';
import Privacidade from './pages/legal/Privacidade';
import Cookies from './pages/legal/Cookies';
import Cancelamentos from './pages/legal/Cancelamentos';
import Pagamentos from './pages/legal/Pagamentos';
import Seguranca from './pages/legal/Seguranca';
import FaqCliente from './pages/info/FaqCliente';
import FaqParceiro from './pages/info/FaqParceiro';
import Sobre from './pages/info/Sobre';
import Contactos from './pages/info/Contactos';

// ErrorBoundary was causing type issues with React 19 types, using a simple fallback for now.
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// CORREÇÃO AQUI: O Guarda agora respeita o Redirecionamento da Loja!
function SessionGuard() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user || !profile) return;
    const path = location.pathname;
    const isAuthPage = ['/login', '/partner/login', '/admin/login', '/partner/signup', '/signup'].includes(path);
    
    if (isAuthPage) {
      // 1º Verificar se há memória de redirecionamento para a Loja!
      const savedRedirect = sessionStorage.getItem('post_login_redirect');
      if (savedRedirect) {
        sessionStorage.removeItem('post_login_redirect');
        navigate(savedRedirect, { replace: true });
        return; // Pára a execução para não ser expulso para a Home!
      }

      // 2º Se não houver, segue o comportamento normal
      if (profile.role === 'business') navigate('/partner/dashboard', { replace: true });
      else if (profile.role === 'admin') navigate('/admin', { replace: true });
      else navigate('/account', { replace: true });
    }
  }, [location.pathname, user, profile, loading, navigate]);
  return null;
}

function NotFoundScreen() {
  const location = useLocation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-black text-slate-800 tracking-tight">404</h1>
      <p className="text-slate-500 mt-2 font-medium">A página que procuras não existe ou o link está quebrado.</p>
      <div className="mt-6 bg-slate-100 border border-slate-200 p-3 rounded-xl">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Caminho Consultado:</p>
        <code className="text-sm font-bold text-rose-500">{location.pathname}</code>
      </div>
    </div>
  );
}

export default function App() {
  const [loadMessenger, setLoadMessenger] = React.useState(false);

  React.useEffect(() => {
    if (!isSupabaseConfigured) return;
    const timer = setTimeout(() => setLoadMessenger(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!isSupabaseConfigured) return <SupabaseSetupHelper />;

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
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/favorites" element={<Favorites />} />
                  
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/update-password" element={<UpdatePassword />} />
                  <Route path="/account" element={<ProtectedRoute allowedRoles={['customer', 'business', 'admin']}><Account /></ProtectedRoute>} />

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

                  <Route path="/partner" element={<Partner />} />
                  <Route path="/partner/login" element={<PartnerLogin />} />
                  <Route path="/partner/signup" element={<PartnerSignup />} />
                  
                  <Route path="/partner/setup" element={<ProtectedRoute allowedRoles={['business']}><SetupWizard /></ProtectedRoute>} />
                  <Route path="/setup/payment-success" element={<ProtectedRoute allowedRoles={['business']}><PaymentSuccess /></ProtectedRoute>} />
                  <Route path="/setup" element={<Navigate to="/partner/setup" replace />} />
                  <Route path="/stripe-simulated-checkout" element={<StripeSimulatedCheckout />} />
                  <Route path="/stripe-simulated-connect" element={<StripeSimulatedConnect />} />

                  <Route path="/staff/login" element={<StaffLogin />} />
                  <Route path="/staff/dashboard" element={<StaffDashboard />} />

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

                  <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/logistica" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminLogistics /></ProtectedRoute>} />

                  <Route path="/business/:slug" element={<BusinessDetail />} />
                  <Route path="/store/:slug" element={<BusinessDetail />} />
                  <Route path="/:slug" element={<BusinessDetail />} />
                  
                  <Route path="*" element={<NotFoundScreen />} />
                </Routes>
            </main>
            <Footer />
            <CookieBanner />
            {loadMessenger && <GlamzoMessenger />}
          </div>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
