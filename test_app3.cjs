const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const functionStart = content.indexOf('export default function App() {');
const beforeApp = content.substring(0, functionStart);

const fixedApp = `export default function App() {
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
                  <Route path="/:lang" element={<LanguageUpdater />}>
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
                </Routes>
              </Suspense>
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
`;

fs.writeFileSync('src/App.tsx', beforeApp + fixedApp);
console.log('Duplicated the block directly instead of variable to guarantee it works!');
