const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/SettingsTab.tsx', 'utf8');

// 1. Add currency to formData initialization
content = content.replace(
  'email: business?.email || "",',
  'email: business?.email || "",\n    currency: business?.currency || "EUR",'
);

// 2. Add currency to formData useEffect
content = content.replace(
  'email: business.email || "",',
  'email: business.email || "",\n        currency: business.currency || "EUR",'
);

// 3. Add UI field
const uiInject = `
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.currencyLabel', 'Moeda (Currency)')}</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full bg-white border border-slate-200 outline-none rounded-xl p-3 text-sm font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    >
                      <option value="EUR">EUR - Euro (€)</option>
                      <option value="GBP">GBP - Libra (£)</option>
                      <option value="USD">USD - Dólar ($)</option>
                      <option value="BRL">BRL - Real (R$)</option>
                    </select>
                  </div>
`;

content = content.replace(
  '                  <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">E-mail de Contacto</label><input type="email"',
  uiInject + '\n                  <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">E-mail de Contacto</label><input type="email"'
);

fs.writeFileSync('src/pages/partner/tabs/SettingsTab.tsx', content);

