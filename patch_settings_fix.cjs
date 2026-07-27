const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/SettingsTab.tsx', 'utf8');

// Fix handleSaveRegras
content = content.replace(
  /const combinedPolicy = \`\$\{rules\.cancellation_policy\}:\$\{rules\.booking_end_margin\}\`;[\s\S]*?showMessage\('success', t\('settings\.succRulesUpdated'\)\);/,
  `const combinedPolicy = \`\${rules.cancellation_policy}:\${rules.booking_end_margin}\`;
      const { error } = await supabase.from('businesses').update({
        min_booking_notice: parseInt(rules.min_notice),
        cancellation_policy: combinedPolicy,
        booking_end_margin: parseInt(rules.booking_end_margin),
        no_show_policy_enabled: rules.no_show_policy_enabled,
        no_show_fee_type: rules.no_show_fee_type,
        no_show_fee_value: Number(rules.no_show_fee_value),
        cancellation_window_hours: Number(rules.cancellation_window_hours)
      }).eq('id', business.id);

      if (error) { throw error; }
      showMessage('success', t('settings.succRulesUpdated'));`
);

// Inject UI part
const newFieldsJSX = `
                  <div className="pt-6 border-t border-slate-100 space-y-6 mt-6">
                    <h5 className="font-bold text-slate-900 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-rose-500" /> Proteção contra No-Show</h5>
                    <p className="text-sm text-slate-500">Configure penalizações automáticas para clientes que não comparecem ou cancelam tarde demais.</p>
                    
                    <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50 cursor-pointer hover:border-purple-300 transition-all">
                      <div className="relative">
                        <input type="checkbox" className="sr-only peer" checked={rules.no_show_policy_enabled} onChange={e => setRules({...rules, no_show_policy_enabled: e.target.checked})} />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </div>
                      <span className="font-bold text-slate-700 text-sm">Ativar Proteção contra No-Show</span>
                    </label>

                    {rules.no_show_policy_enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border border-purple-100 bg-purple-50/30 rounded-2xl animate-fade-in">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo de Taxa</label>
                          <select value={rules.no_show_fee_type} onChange={e => setRules({...rules, no_show_fee_type: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none">
                            <option value="percentage">Percentagem do Serviço (%)</option>
                            <option value="fixed">Valor Fixo (€)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Valor da Taxa</label>
                          <input type="number" value={rules.no_show_fee_value} onChange={e => setRules({...rules, no_show_fee_value: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cancelamento Grátis (Horas antes)</label>
                          <input type="number" value={rules.cancellation_window_hours} onChange={e => setRules({...rules, cancellation_window_hours: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" />
                        </div>
                      </div>
                    )}
                  </div>
`;

if (!content.includes('Proteção contra No-Show')) {
  content = content.replace(
    /<p className="text-\[10px\] text-slate-400 mt-1">\{t\('settings\.bookingLimitDesc'\)\}<\/p>\s*<\/div>\s*<\/div>\s*<div className="pt-4 flex justify-end">/,
    `<p className="text-[10px] text-slate-400 mt-1">{t('settings.bookingLimitDesc')}</p>
                  </div>
                </div>
${newFieldsJSX}
                <div className="pt-4 flex justify-end">`
  );
}

// Add ShieldAlert to lucide-react import
if (!content.includes('ShieldAlert')) {
  content = content.replace(
    'import { Save, Check, Link, MapPin, X, ImageIcon, UploadCloud, Shield, Building, Map, KeyRound, Smartphone, Star, Clock } from "lucide-react";',
    'import { Save, Check, Link, MapPin, X, ImageIcon, UploadCloud, Shield, Building, Map, KeyRound, Smartphone, Star, Clock, ShieldAlert } from "lucide-react";'
  );
}

fs.writeFileSync('src/pages/partner/tabs/SettingsTab.tsx', content);
console.log("SettingsTab fixed");
