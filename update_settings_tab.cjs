const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/SettingsTab.tsx', 'utf8');

// 1. Add imports
if (!content.includes('AddressAutocomplete')) {
    content = content.replace(
        "import { useTranslation } from 'react-i18next';",
        "import { useTranslation } from 'react-i18next';\nimport { APIProvider } from '@vis.gl/react-google-maps';\nimport { AddressAutocomplete } from '../../../components/AddressAutocomplete';"
    );
}

// Ensure API_KEY is defined
if (!content.includes('API_KEY =')) {
    content = content.replace(
        "const SettingsTab = ({ business, loadLayoutData }: { business: any, loadLayoutData: () => void }) => {",
        `const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || "";
const SettingsTab = ({ business, loadLayoutData }: { business: any, loadLayoutData: () => void }) => {`
    );
}

// 2. Add Country and coords state to formData and component
if (!content.includes('country:')) {
    content = content.replace(
        "city: business?.city || \"\",",
        "city: business?.city || \"\",\n    country: business?.country || \"Portugal\","
    );
}

if (!content.includes('const [coordinates')) {
    content = content.replace(
        "const [formData, setFormData] = useState({",
        `const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(business?.latitude ? {lat: business.latitude, lng: business.longitude} : null);
  const [formData, setFormData] = useState({`
    );
}

// 3. Add handlePlaceSelect
const handlePlaceSelect = `
  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    let newFormData = { ...formData };
    if (place.name || place.formatted_address) {
      newFormData.address = place.name || place.formatted_address || '';
    }
    if (place.geometry?.location) {
      setCoordinates({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
    }
    if (place.address_components) {
      for (const component of place.address_components) {
        const types = component.types;
        if (types.includes('postal_code')) newFormData.postal_code = component.long_name;
        if (types.includes('locality') || types.includes('postal_town')) newFormData.city = component.long_name;
        if (types.includes('country')) newFormData.country = component.long_name;
      }
    }
    setFormData(newFormData);
  };
`;
if (!content.includes('handlePlaceSelect')) {
    content = content.replace(
        "const handleSaveDados = async",
        handlePlaceSelect + "\n  const handleSaveDados = async"
    );
}

// 4. Update save payload to include latitude and longitude
content = content.replace(
    "const payloadToSave = { ...formData };",
    "const payloadToSave = { ...formData, latitude: coordinates?.lat || business.latitude, longitude: coordinates?.lng || business.longitude };"
);

// 5. Replace Address Input with Autocomplete
const addressInputFind = `<div className="space-y-2 md:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.fullAddress')}</label><input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>`;
const addressInputReplace = `<div className="space-y-2 md:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.fullAddress')}</label>
<AddressAutocomplete 
  value={formData.address} 
  onChange={v => setFormData({...formData, address: v})} 
  onPlaceSelect={handlePlaceSelect} 
  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" 
/></div>`;
content = content.replace(addressInputFind, addressInputReplace);

// 6. Add Country field to layout
const countryHtml = `<div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">País</label><input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>`;
if (!content.includes('País</label>')) {
    content = content.replace(
        `<div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.postalCode')}</label>`,
        countryHtml + `\n                  <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.postalCode')}</label>`
    );
}

// 7. Wrap return in APIProvider
content = content.replace(
    'return (\n    <div className="animate-fade-in w-full max-w-5xl mx-auto space-y-8 text-slate-700 py-6 pb-20">',
    `return (
    <APIProvider apiKey={API_KEY || ''} language={localStorage.getItem('i18nextLng') || 'pt'}>
    <div className="animate-fade-in w-full max-w-5xl mx-auto space-y-8 text-slate-700 py-6 pb-20">`
);

content = content.replace(
    `    </div>\n  );\n};\n\nexport default SettingsTab;`,
    `    </div>\n    </APIProvider>\n  );\n};\n\nexport default SettingsTab;`
);

fs.writeFileSync('src/pages/partner/tabs/SettingsTab.tsx', content);
console.log("SettingsTab updated");
