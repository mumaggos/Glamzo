const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// The file got completely corrupted in the routing section.
// Let's strip it from `<Routes>` down to `</Routes>...ment={<Privacidade />} />` and put a clean block.

const routesStart = content.indexOf('<Routes>');
const routesEnd = content.lastIndexOf('</Routes>') + '</Routes>'.length;

const goodRoutes = `
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
`;

// Also need to remove the `const appRoutes = (...)` that got put at the top of the return
const appRoutesStart = content.indexOf('const appRoutes = (');
let returnStart = content.indexOf('return (', appRoutesStart);

if (appRoutesStart > -1 && appRoutesStart < returnStart) {
    // Delete the const appRoutes completely
    content = content.substring(0, appRoutesStart) + content.substring(returnStart);
}

// Re-calculate the return start
returnStart = content.lastIndexOf('return (');
const insertAppRoutes = `
  const appRoutes = (
    <>
      ${goodRoutes}
    </>
  );

  return (
`;
content = content.replace('return (', insertAppRoutes);

const newRoutesBlock = `
<Routes>
  <Route element={<LanguageUpdater />}>
    {appRoutes}
  </Route>
  <Route path="/:lang" element={<LanguageUpdater />}>
    {appRoutes}
  </Route>
</Routes>
`;

const routesStartFinal = content.indexOf('<Routes>');
const routesEndFinal = content.lastIndexOf('</Routes>') + '</Routes>'.length;
content = content.substring(0, routesStartFinal) + newRoutesBlock.trim() + content.substring(routesEndFinal);

// Remove duplicate `return (` if any
content = content.replace('return (\n\n  return (', 'return (');

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed App.tsx correctly with clean routes');
