const fs = require('fs');
const file = 'src/pages/partner/SetupWizard.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('const [timezone, setTimezone]')) {
  content = content.replace("const [postalCode, setPostalCode] = useState('');", "const [postalCode, setPostalCode] = useState('');\n  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Lisbon');");
}

if (!content.includes('timezone,')) {
  content = content.replace("latitude: lat, longitude: lng,", "latitude: lat, longitude: lng, timezone,");
}

const uiInjection = `
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Fuso Horário / Timezone</label>
                <select 
                  value={timezone} 
                  onChange={e => setTimezone(e.target.value)} 
                  className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium text-slate-800"
                >
                  {Intl.supportedValuesOf('timeZone').map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">Este será o fuso horário usado no calendário do salão.</p>
              </div>
`;

if (!content.includes('Fuso Horário / Timezone')) {
    content = content.replace("<div>\n                <label className=\"block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5\">{t('setupWizard.storeCategory')}</label>", uiInjection + "\n              <div>\n                <label className=\"block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5\">{t('setupWizard.storeCategory')}</label>");
}

fs.writeFileSync(file, content);
console.log("SetupWizard updated");
