import { Compass } from 'lucide-react';
import { GlobalIntentHandler } from './components/GlobalIntentHandler';
import { ProfileCompletionGuard } from './components/ProfileCompletionGuard';

import React, { useEffect, Suspense, lazy } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Explore = lazy(() => import('./pages/Explore'));
const BusinessDetail = lazy(() => import('./pages/BusinessDetail'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Account = lazy(() => import('./pages/Account'));
const UpdatePassword = lazy(() => import('./pages/UpdatePassword'));
const Partner = lazy(() => import('./pages/Partner'));
const PartnerLogin = lazy(() => import('./pages/PartnerLogin'));
const PartnerSignup = lazy(() => import('./pages/PartnerSignup'));
const SetupWizard = lazy(() => import('./pages/partner/SetupWizard'));
const PaymentSuccess = lazy(() => import('./pages/partner/PaymentSuccess'));
const PartnerLayout = lazy(() => import('./components/partner/PartnerLayout'));
const OverviewTab = lazy(() => import('./pages/partner/tabs/OverviewTab'));
const AgendaTab = lazy(() => import('./pages/partner/tabs/AgendaTab'));
const ServicesTab = lazy(() => import('./pages/partner/tabs/ServicesTab'));
const StaffTab = lazy(() => import('./pages/partner/tabs/StaffTab'));
const ClientsTab = lazy(() => import('./pages/partner/tabs/ClientsTab'));
const HoursTab = lazy(() => import('./pages/partner/tabs/HoursTab'));
const PartnerReviewsTab = lazy(() => import('./pages/partner/tabs/PartnerReviewsTab'));
const FinanceTab = lazy(() => import('./pages/partner/tabs/FinanceTab'));
const StoreAssetsTab = lazy(() => import('./pages/partner/tabs/StoreAssetsTab'));
const SettingsTab = lazy(() => import('./pages/partner/tabs/SettingsTab'));
const SubscriptionTab = lazy(() => import('./pages/partner/tabs/SubscriptionTab'));
const ReservationsTab = lazy(() => import('./pages/partner/tabs/ReservationsTab'));
const MarketingTab = lazy(() => import('./pages/partner/tabs/MarketingTab'));
const MessagesTab = lazy(() => import('./pages/partner/tabs/MessagesTab'));
const TabletTab = lazy(() => import('./pages/partner/tabs/TabletTab'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const SuperAdminLogistics = lazy(() => import('./pages/admin/SuperAdminLogistics'));
const StaffLogin = lazy(() => import('./pages/staff/StaffLogin'));
const StaffDashboard = lazy(() => import('./pages/staff/StaffDashboard'));
const Termos = lazy(() => import('./pages/legal/Termos'));
const Privacidade = lazy(() => import('./pages/legal/Privacidade'));
const Cookies = lazy(() => import('./pages/legal/Cookies'));
const Cancelamentos = lazy(() => import('./pages/legal/Cancelamentos'));
const Pagamentos = lazy(() => import('./pages/legal/Pagamentos'));
const Seguranca = lazy(() => import('./pages/legal/Seguranca'));
const FaqCliente = lazy(() => import('./pages/info/FaqCliente'));
const FaqParceiro = lazy(() => import('./pages/info/FaqParceiro'));
const Sobre = lazy(() => import('./pages/info/Sobre'));
const Contactos = lazy(() => import('./pages/info/Contactos'));
import SupabaseSetupHelper from './components/SupabaseSetupHelper';
const GlamzoMessenger = lazy(() => import('./components/GlamzoMessenger'));

import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { isSupabaseConfigured } from './lib/supabase';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';

// IMPORTAÇÕES DIRETAS




















































// ErrorBoundary was causing type issues with React 19 types, using a simple fallback for now.
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// CORREÇÃO AQUI: O Guarda agora respeita o Redirecionamento da Loja!
function SessionGuard() {
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


function ClientFAB() {
  const location = useLocation();
  const { user, profile } = useAuth();
  
  // Do not show on auth pages, partner dashboard, or explore page itself
  const isExcluded = location.pathname.startsWith('/login') || 
                     location.pathname.startsWith('/register') || 
                     location.pathname.startsWith('/partner') || 
                     location.pathname === '/explore' ||
                     location.pathname === '/';
                     
  // Show if unauthenticated or if authenticated as client
  const isClientOrGuest = !user || profile?.role === 'client';
                     
  if (isExcluded || !isClientOrGuest) return null;

  return (
    <Link 
      to="/explore" 
      className="fixed bottom-6 right-6 z-50 bg-purple-600 text-white p-4 rounded-full shadow-2xl hover:bg-purple-700 hover:scale-105 transition-all flex items-center justify-center group"
      title="Explorar Lojas"
    >
      <Compass className="w-6 h-6 group-hover:rotate-45 transition-transform duration-300" />
    </Link>
  );
}

function GlobalRoleEnforcer() {
  const { user, profile, signOut, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user || !profile) return;

    const path = location.pathname;
    
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
      <Toaster position="top-center" />
      <BrowserRouter>
        <ScrollToTop />
          
        <AuthProvider>
          <SessionGuard />
          <GlobalRoleEnforcer />
          <GlobalIntentHandler />
          <ProfileCompletionGuard />
          <div id="glamzo-app-root" className="min-h-screen bg-[#fafbfc] text-slate-900 flex flex-col font-sans selection:bg-purple-200 selection:text-purple-900 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-purple-600 to-rose-450 z-50" />
            <Navbar />
            <ClientFAB />
            <main className="flex-1 w-full">
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]"><div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" /></div>}><Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/favorites" element={<Favorites />} />
                  
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/update-password" element={<UpdatePassword />} />
                  <Route path="/account" element={<ProtectedRoute allowedRoles={['customer']}><Account /></ProtectedRoute>} />

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
                    <Route path="avaliacoes" element={<PartnerReviewsTab />} />
                    <Route path="campanhas" element={<MarketingTab />} />
                    <Route path="financeiro" element={<FinanceTab />} />
                    <Route path="website" element={<StoreAssetsTab />} />
                    <Route path="mensagens" element={<MessagesTab />} />
                    <Route path="tablet" element={<TabletTab />} />
                    <Route path="configuracoes" element={<SettingsTab />} />
                    <Route path="subscricao" element={<SubscriptionTab />} />
                  </Route>

                  <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/logistica" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminLogistics /></ProtectedRoute>} />

                  <Route path="/business/:slug" element={<BusinessDetail />} />
                  <Route path="/store/:slug" element={<BusinessDetail />} />
                  <Route path="/:slug" element={<BusinessDetail />} />
                  
                  <Route path="*" element={<NotFoundScreen />} />
                </Routes></Suspense>
            </main>
            <Footer />
            <CookieBanner />
            {loadMessenger && <Suspense fallback={null}><GlamzoMessenger /></Suspense>}
          </div>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
