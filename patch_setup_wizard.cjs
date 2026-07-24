const fs = require('fs');

let content = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

// 1. Add currency state
content = content.replace("const [city, setCity] = useState('');", "const [city, setCity] = useState('');\n  const [currency, setCurrency] = useState('EUR');");

// 2. Set currency in fetchBusiness
content = content.replace("setCity(currentBiz.city || draft?.city || '');", "setCity(currentBiz.city || draft?.city || '');\n        setCurrency(currentBiz.currency || draft?.currency || (navigator.language.includes('US') ? 'USD' : navigator.language.includes('GB') ? 'GBP' : 'EUR'));");

// 3. Include currency in updateData in handleNext (Step 1)
content = content.replace("name, phone, email, address, door_number: doorNumber || null, city, district: district || city, postal_code: postalCode, slug, setup_step: 2,", "name, phone, email, address, door_number: doorNumber || null, city, district: district || city, postal_code: postalCode, currency, slug, setup_step: 2,");

// 4. Add currency UI element in the Form
const uiInject = `
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('setupWizard.currencyLabel', 'Moeda (Currency) *')}</label>
                <select value={currency} onChange={e => setCurrency(e.target.value)} className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium">
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="GBP">GBP - Libra (£)</option>
                  <option value="USD">USD - Dólar ($)</option>
                  <option value="BRL">BRL - Real (R$)</option>
                </select>
`;
content = content.replace("                <label className=\"block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5\">{t('setupWizard.district')}</label>", uiInject + "\n                <label className=\"block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5\">{t('setupWizard.district')}</label>");

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', content);

