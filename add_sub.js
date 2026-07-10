const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
if (!code.includes('import("./pages/partner/tabs/SubscriptionTab")')) {
  code = code.replace(
    "const SettingsTab = lazy(() => import('./pages/partner/tabs/SettingsTab'));",
    "const SettingsTab = lazy(() => import('./pages/partner/tabs/SettingsTab'));\nconst SubscriptionTab = lazy(() => import('./pages/partner/tabs/SubscriptionTab'));"
  );
  code = code.replace(
    "<Route path=\"configuracoes\" element={<SettingsTab />} />",
    "<Route path=\"configuracoes\" element={<SettingsTab />} />\n                    <Route path=\"subscricao\" element={<SubscriptionTab />} />"
  );
  fs.writeFileSync('src/App.tsx', code);
  console.log("Subscription tab route added.");
} else {
  console.log("Already added");
}
