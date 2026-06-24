import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { isSupabaseConfigured } from './lib/supabase';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import SupabaseSetupHelper from './components/SupabaseSetupHelper';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
// Lazy loading all pages and heavy widgets for optimal dynamic chunking and instant public page load speeds
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Account = React.lazy(() => import('./pages/Account'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Admin = React.lazy(() => import('./pages/Admin'));
const Explore = React.lazy(() => import('./pages/Explore'));
const BusinessDetail = React.lazy(() => import('./pages/BusinessDetail'));
const Partner = React.lazy(() => import('./pages/Partner'));
const PartnerLogin = React.lazy(() => import('./pages/PartnerLogin'));
const PartnerSignup = React.lazy(() => import('./pages/PartnerSignup'));
const SetupWizard = React.lazy(() => import('./pages/partner/SetupWizard'));
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
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

  // 1. If Supabase keys are not set yet, present the SQL and variable Setup Assistant
  if (!isSupabaseConfigured) {
    return <SupabaseSetupHelper />;
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <div id="glamzo-app-root" className="min-h-screen bg-[#fafbfc] text-slate-900 flex flex-col font-sans selection:bg-purple-200 selection:text-purple-900 relative overflow-hidden">
          {/* Elite subtle static top bar cue */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-purple-600 to-rose-450 z-50" />
          
          {/* Main Global Navbar */}
          <Navbar />
          
          <main className="flex-1 w-full">
            <Suspense fallback={<RouteLoader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/business/:slug" element={<BusinessDetail />} />
                <Route path="/store/:slug" element={<BusinessDetail />} />
                <Route path="/partner" element={<Partner />} />
                <Route path="/partner/login" element={<PartnerLogin />} />
                <Route path="/partner/signup" element={<PartnerSignup />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/stripe-simulated-checkout" element={<StripeSimulatedCheckout />} />
                <Route path="/stripe-simulated-connect" element={<StripeSimulatedConnect />} />
                <Route path="/favorites" element={<Favorites />} />
                
                {/* Information & Legal Routes */}
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

                {/* /setup: Dedicated clean flow for new business accounts */}
                <Route
                  path="/setup"
                  element={
                    <ProtectedRoute allowedRoles={['business', 'admin']}>
                      <SetupWizard />
                    </ProtectedRoute>
                  }
                />

                {/* /account: Customer profile page - Restricted to customers & admins */}
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'business', 'admin']}>
                      <Account />
                    </ProtectedRoute>
                  }
                />

                {/* /dashboard: Salon dashboard - Restricted to businesses & admins */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['business', 'admin']}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* /admin: Administrative control panel - Restricted to admins */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Admin />
                    </ProtectedRoute>
                  }
                />

                {/* Direct Premium Link Wildcard Route (glamzo.pt/nome-loja) */}
                <Route path="/:slug" element={<BusinessDetail />} />

                {/* Standard fallback redirecting search engines and direct typo accesses to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
          
          <Footer />
          <CookieBanner />

          {/* Floating Live Realtime Messenger Overlay is loaded under user idle states */}
          {loadMessenger && (
            <Suspense fallback={null}>
              <GlamzoMessenger />
            </Suspense>
          )}
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
