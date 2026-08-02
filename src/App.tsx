import { lazyWithRetry } from './utils/lazyImport';
import { Compass } from 'lucide-react';
import { GlobalIntentHandler } from './components/GlobalIntentHandler';
import { ProfileCompletionGuard } from './components/ProfileCompletionGuard';
import React, { useEffect, Suspense, lazy } from 'react';
const SupabaseSetupHelper = lazyWithRetry(() => import('./components/SupabaseSetupHelper'));
import GlobalImpersonationBanner from './components/GlobalImpersonationBanner';
import { Toaster } from 'react-hot-toast';
const LanguageUpdater = lazyWithRetry(() => import('./components/LanguageUpdater'));
import { BrowserRouter, Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import { useLocalizedNavigate } from './hooks/useLocalizedNavigate';

const FinanceSettingsTab = lazyWithRetry(() => import('./pages/partner/tabs/FinanceSettingsTab'));
const PayoutsHistoryTab = lazyWithRetry(() => import('./pages/partner/tabs/PayoutsHistoryTab'));
const HardwareManagerTab = lazyWithRetry(() => import('./pages/partner/tabs/HardwareManagerTab'));
const Home = lazyWithRetry(() => import('./pages/Home'));
const Explore = lazyWithRetry(() => import('./pages/Explore'));
const BusinessDetail = lazyWithRetry(() => import('./pages/BusinessDetail'));
const Favorites = lazyWithRetry(() => import('./pages/Favorites'));
const Login = lazyWithRetry(() => import('./pages/Login'));
const Signup = lazyWithRetry(() => import('./pages/Signup'));
const Account = lazyWithRetry(() => import('./pages/Account'));
const UpdatePassword = lazyWithRetry(() => import('./pages/UpdatePassword'));
const Partner = lazyWithRetry(() => import('./pages/Partner'));
const PartnerLogin = lazyWithRetry(() => import('./pages/PartnerLogin'));
const PartnerSignup = lazyWithRetry(() => import('./pages/PartnerSignup'));
const SetupWizard = lazyWithRetry(() => import('./pages/partner/SetupWizard'));
const PaymentSuccess = lazyWithRetry(() => import('./pages/partner/PaymentSuccess'));
const PartnerLayout = lazyWithRetry(() => import('./components/partner/PartnerLayout'));
const OverviewTab = lazyWithRetry(() => import('./pages/partner/tabs/OverviewTab'));
const AgendaTab = lazyWithRetry(() => import('./pages/partner/tabs/AgendaTab'));
const ServicesTab = lazyWithRetry(() => import('./pages/partner/tabs/ServicesTab'));
const StaffTab = lazyWithRetry(() => import('./pages/partner/tabs/StaffTab'));
const ClientsTab = lazyWithRetry(() => import('./pages/partner/tabs/ClientsTab'));
const HoursTab = lazyWithRetry(() => import('./pages/partner/tabs/HoursTab'));
const PartnerReviewsTab = lazyWithRetry(() => import('./pages/partner/tabs/PartnerReviewsTab'));
const FinanceTab = lazyWithRetry(() => import('./pages/partner/tabs/FinanceTab'));
const StoreAssetsTab = lazyWithRetry(() => import('./pages/partner/tabs/StoreAssetsTab'));
const SettingsTab = lazyWithRetry(() => import('./pages/partner/tabs/SettingsTab'));
const SubscriptionTab = lazyWithRetry(() => import('./pages/partner/tabs/SubscriptionTab'));
const ReservationsTab = lazyWithRetry(() => import('./pages/partner/tabs/ReservationsTab'));
const MarketingTab = lazyWithRetry(() => import('./pages/partner/tabs/MarketingTab'));
const MessagesTab = lazyWithRetry(() => import('./pages/partner/tabs/MessagesTab'));
const TabletTab = lazyWithRetry(() => import('./pages/partner/tabs/TabletTab'));
const Admin = lazyWithRetry(() => import('./pages/Admin'));
const ChamadasCRM = lazyWithRetry(() => import('./pages/ChamadasCRM'));
const AdminLogin = lazyWithRetry(() => import('./pages/AdminLogin'));
const SuperAdminLogistics = lazyWithRetry(() => import('./pages/admin/SuperAdminLogistics'));
const StaffLogin = lazyWithRetry(() => import('./pages/staff/StaffLogin'));
const StaffDashboard = lazyWithRetry(() => import('./pages/staff/StaffDashboard'));
const Termos = lazyWithRetry(() => import('./pages/legal/Termos'));
const Privacidade = lazyWithRetry(() => import('./pages/legal/Privacidade'));
const Cookies = lazyWithRetry(() => import('./pages/legal/Cookies'));
const Cancelamentos = lazyWithRetry(() => import('./pages/legal/Cancelamentos'));
const Pagamentos = lazyWithRetry(() => import('./pages/legal/Pagamentos'));
const Seguranca = lazyWithRetry(() => import('./pages/legal/Seguranca'));
const FaqCliente = lazyWithRetry(() => import('./pages/info/FaqCliente'));
const FaqParceiro = lazyWithRetry(() => import('./pages/info/FaqParceiro'));
const Sobre = lazyWithRetry(() => import('./pages/info/Sobre'));
const Contactos = lazyWithRetry(() => import('./pages/info/Contactos'));
const GlamzoMessenger = lazyWithRetry(() => import('./components/GlamzoMessenger'));
const Footer = lazyWithRetry(() => import('./components/Footer'));
const CookieBanner = lazyWithRetry(() => import('./components/CookieBanner'));





// IMPORTAÇÕES DIRETAS




















































import ErrorBoundary from './components/ErrorBoundary';

// CORREÇÃO AQUI: O Guarda agora respeita o Redirecionamento da Loja!
function SessionGuard() {
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
}

function NotFoundScreen() {
  const location = useLocation();
  
  const appRoutes = (
    <>
      
                  <Route index element={<Home />} />
                  <Route path="explore" element={<Explore />} />
                  <Route path="favorites" element={<Favorites />} />
                  
                  <Route path="login" element={<Login />} />
                  <Route path="signup" element={<Signup />} />
                  <Route path="update-password" element={<UpdatePassword />} />
                  <Route path="account" element={<ProtectedRoute allowedRoles={['customer']}><Account /></ProtectedRoute>} />

                  <Route path="termos-e-condicoes" element={<Termos />} />
                  <Route path="politica-de-privacidade" element={<Privacidade />} />
                  <Route path="politica-de-cookies" element={<Cookies />} />
                  <Route path="politica-de-cancelamentos" element={<Cancelamentos />} />
                  <Route path="politica-de-pagamentos" element={<Pagamentos />} />
                  <Route path="seguranca-e-protecao-de-dados" element={<Seguranca />} />
                  
                  <Route path="faq-cliente" element={<FaqCliente />} />
                  <Route path="faq-parceiro" element={<FaqParceiro />} />
                  <Route path="sobre-nos" element={<Sobre />} />
                  <Route path="contactos" element={<Contactos />} />

                  <Route path="partner" element={<Partner />} />
                  <Route path="chamadas/:vendedorId" element={<ChamadasCRM />} />
                  <Route path="partner/login" element={<PartnerLogin />} />
                  <Route path="partner/signup" element={<PartnerSignup />} />
                  
                  <Route path="partner/setup" element={<ProtectedRoute allowedRoles={['business']}><SetupWizard /></ProtectedRoute>} />
                  <Route path="setup/payment-success" element={<ProtectedRoute allowedRoles={['business']}><PaymentSuccess /></ProtectedRoute>} />
                  <Route path="setup" element={<Navigate to="/partner/setup" replace />} />

                  <Route path="staff/login" element={<StaffLogin />} />
                  <Route path="staff/dashboard" element={<StaffDashboard />} />
                  
                  <Route path="dashboard" element={<Navigate to="/partner/dashboard" replace />} />
                  <Route path="partner/dashboard" element={<ProtectedRoute allowedRoles={['business', 'admin']}><PartnerLayout /></ProtectedRoute>}>
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
                    <Route path="financeiro/configuracoes" element={<FinanceSettingsTab />} />
                    <Route path="financeiro/repasses" element={<PayoutsHistoryTab />} />
                    <Route path="financeiro/hardware" element={<HardwareManagerTab />} />
                    <Route path="website" element={<StoreAssetsTab />} />
                    <Route path="mensagens" element={<MessagesTab />} />
                    <Route path="tablet" element={<TabletTab />} />
                    <Route path="configuracoes" element={<SettingsTab />} />
                    <Route path="subscricao" element={<SubscriptionTab />} />
                  </Route>

                  <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
                  <Route path="admin/login" element={<AdminLogin />} />
                  <Route path="admin/logistica" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminLogistics /></ProtectedRoute>} />

                  <Route path="business/:slug" element={<BusinessDetail />} />
                  <Route path="store/:slug" element={<BusinessDetail />} />
                  <Route path=":slug" element={<BusinessDetail />} />
                  
                  <Route path="*" element={<NotFoundScreen />} />

    </>
  );

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





function GlobalRoleEnforcer() {
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
}

export default function App() {
  const [loadMessenger, setLoadMessenger] = React.useState(false);

  React.useEffect(() => {
    if (!(!!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY))) return;
    const timer = setTimeout(() => setLoadMessenger(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  if (!isSupabaseConfigured) return <SupabaseSetupHelper />;

  return (
    <ErrorBoundary>
      <Toaster position="top-center" />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <GlobalImpersonationBanner />
          <SessionGuard />
          <GlobalRoleEnforcer />
          <GlobalIntentHandler />
          <ProfileCompletionGuard />
          <div id="glamzo-app-root" className="min-h-screen bg-[#fafbfc] text-slate-900 flex flex-col font-sans selection:bg-purple-200 selection:text-purple-900 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-purple-600 to-rose-450 z-50" />
            <Navbar />
            <main className="flex-1 w-full">
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]"><div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" /></div>}>
                <Routes>
                  <Route element={<LanguageUpdater />}>
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
                    <Route path="/chamadas/:vendedorId" element={<ChamadasCRM />} />
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
                      <Route path="financeiro/configuracoes" element={<FinanceSettingsTab />} />
                      <Route path="financeiro/repasses" element={<PayoutsHistoryTab />} />
                      <Route path="financeiro/hardware" element={<HardwareManagerTab />} />
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
                  </Route>
                  {['en', 'es', 'fr'].map(lang => (
                  <React.Fragment key={lang}>
                  <Route path={`/${lang}`} element={<LanguageUpdater />}>
                    <Route path="" element={<Home />} />
                    <Route path="explore" element={<Explore />} />
                    <Route path="favorites" element={<Favorites />} />
                    <Route path="login" element={<Login />} />
                    <Route path="signup" element={<Signup />} />
                    <Route path="update-password" element={<UpdatePassword />} />
                    <Route path="account" element={<ProtectedRoute allowedRoles={['customer']}><Account /></ProtectedRoute>} />
                    <Route path="termos-e-condicoes" element={<Termos />} />
                    <Route path="politica-de-privacidade" element={<Privacidade />} />
                    <Route path="politica-de-cookies" element={<Cookies />} />
                    <Route path="politica-de-cancelamentos" element={<Cancelamentos />} />
                    <Route path="politica-de-pagamentos" element={<Pagamentos />} />
                    <Route path="seguranca-e-protecao-de-dados" element={<Seguranca />} />
                    <Route path="faq-cliente" element={<FaqCliente />} />
                    <Route path="faq-parceiro" element={<FaqParceiro />} />
                    <Route path="sobre-nos" element={<Sobre />} />
                    <Route path="contactos" element={<Contactos />} />
                    <Route path="partner" element={<Partner />} />
                    <Route path="chamadas/:vendedorId" element={<ChamadasCRM />} />
                    <Route path="partner/login" element={<PartnerLogin />} />
                    <Route path="partner/signup" element={<PartnerSignup />} />
                    <Route path="partner/setup" element={<ProtectedRoute allowedRoles={['business']}><SetupWizard /></ProtectedRoute>} />
                    <Route path="setup/payment-success" element={<ProtectedRoute allowedRoles={['business']}><PaymentSuccess /></ProtectedRoute>} />
                    <Route path="setup" element={<Navigate to="/partner/setup" replace />} />
                    <Route path="staff/login" element={<StaffLogin />} />
                    <Route path="staff/dashboard" element={<StaffDashboard />} />
                    <Route path="dashboard" element={<Navigate to="/partner/dashboard" replace />} />
                    <Route path="partner/dashboard" element={<ProtectedRoute allowedRoles={['business', 'admin']}><PartnerLayout /></ProtectedRoute>}>
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
                      <Route path="financeiro/configuracoes" element={<FinanceSettingsTab />} />
                      <Route path="financeiro/repasses" element={<PayoutsHistoryTab />} />
                      <Route path="financeiro/hardware" element={<HardwareManagerTab />} />
                      <Route path="website" element={<StoreAssetsTab />} />
                      <Route path="mensagens" element={<MessagesTab />} />
                      <Route path="tablet" element={<TabletTab />} />
                      <Route path="configuracoes" element={<SettingsTab />} />
                      <Route path="subscricao" element={<SubscriptionTab />} />
                    </Route>
                    <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
                    <Route path="admin/login" element={<AdminLogin />} />
                    <Route path="admin/logistica" element={<ProtectedRoute allowedRoles={['admin']}><SuperAdminLogistics /></ProtectedRoute>} />
                    <Route path="business/:slug" element={<BusinessDetail />} />
                    <Route path="store/:slug" element={<BusinessDetail />} />
                    <Route path=":slug" element={<BusinessDetail />} />
                    <Route path="*" element={<NotFoundScreen />} />
                                    </Route>
                  </React.Fragment>
                  ))}
                </Routes>
              </Suspense>
            </main>
            <Suspense fallback={<div className="h-64 bg-slate-50"></div>}><Footer /></Suspense>
            <Suspense fallback={null}><CookieBanner /></Suspense>
            {loadMessenger && <Suspense fallback={null}><GlamzoMessenger /></Suspense>}
          </div>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
