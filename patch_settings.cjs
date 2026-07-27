const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/SettingsTab.tsx', 'utf8');

// Add rules state
content = content.replace(
  /const \[rules, setRules\] = useState\(\{[\s\S]*?\}\);/,
  `const [rules, setRules] = useState({
    min_notice: business?.min_booking_notice?.toString() || "60",
    cancellation_policy: business?.cancellation_policy?.includes(':') ? business.cancellation_policy.split(':')[0] : (business?.cancellation_policy || "flexible"),
    booking_end_margin: business?.cancellation_policy?.includes(':') ? business.cancellation_policy.split(':')[1] : (business?.booking_end_margin?.toString() || "0"),
    no_show_policy_enabled: business?.no_show_policy_enabled || false,
    no_show_fee_type: business?.no_show_fee_type || 'percentage',
    no_show_fee_value: business?.no_show_fee_value || 50,
    cancellation_window_hours: business?.cancellation_window_hours || 24
  });`
);

// Add to handleSaveRegras
content = content.replace(
  /const combinedPolicy = \`\$\{rules\.cancellation_policy\}:\$\{rules\.booking_end_margin\}\`;[\s\S]*?const \{ error \} = await supabase\.from\('businesses'\)/,
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

      if (error) { throw error; }`
);

// Add to JSX
const newFieldsJSX = `
                  <div className="pt-6 border-t border-slate-100 space-y-6">
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

// Insert after existing policy select
content = content.replace(
  /<\/select>\s*<\/div>\s*<\/div>\s*<div className="flex justify-end pt-6 border-t border-slate-100">/,
  `</select>\n                  </div>\n                  <div className="space-y-2">\n                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.bookingMargin')}</label>\n                    <select value={rules.booking_end_margin} onChange={e => setRules({...rules, booking_end_margin: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none">\n                      <option value="0">{t('settings.noMargin')}</option>\n                      <option value="15">{t('settings.min15Margin')}</option>\n                      <option value="30">{t('settings.min30Margin')}</option>\n                      <option value="60">{t('settings.min60Margin')}</option>\n                    </select>\n                  </div>\n                </div>\n${newFieldsJSX}\n                <div className="flex justify-end pt-6 border-t border-slate-100">`
);

fs.writeFileSync('src/pages/partner/tabs/SettingsTab.tsx', content);
console.log("SettingsTab updated");
