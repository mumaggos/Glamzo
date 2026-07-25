const fs = require('fs');
const file = 'src/pages/partner/tabs/SettingsTab.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('timezone: business?.timezone')) {
  content = content.replace(
    'currency: business?.currency || "EUR"',
    'currency: business?.currency || "EUR",\n    timezone: business?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Lisbon"'
  );
}

const uiInjection = `
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fuso Horário / Timezone</label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl p-3 text-sm font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    >
                      {Intl.supportedValuesOf('timeZone').map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>
`;

if (!content.includes('Fuso Horário / Timezone')) {
  content = content.replace(
    /<div className="space-y-2 md:col-span-2">\s*<label className="text-xs font-bold text-slate-500 uppercase tracking-wider">\{t\('settings\.email'\)\}<\/label>/,
    uiInjection + "\n                  $&"
  );
}

fs.writeFileSync(file, content);
console.log("SettingsTab updated");
