const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/SettingsTab.tsx', 'utf8');

const uiInject = `
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.currencyLabel', 'Moeda (Currency)')}</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl p-3 text-sm font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    >
                      <option value="EUR">EUR - Euro (€)</option>
                      <option value="GBP">GBP - Libra (£)</option>
                      <option value="USD">USD - Dólar ($)</option>
                      <option value="BRL">BRL - Real (R$)</option>
                    </select>
                  </div>
`;

content = content.replace(
  '                  <div className="space-y-2 md:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>',
  uiInject + '\n                  <div className="space-y-2 md:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>'
);

fs.writeFileSync('src/pages/partner/tabs/SettingsTab.tsx', content);
