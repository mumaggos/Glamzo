const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

// 1. Fix draft loading
content = content.replace(
  'const draft: any = null;',
  `let draft: any = null;
        try {
          const stored = localStorage.getItem('setupWizardDraft');
          if (stored) draft = JSON.parse(stored);
        } catch(e){}`
);

// 2. Fix draft writing
content = content.replace(
  'const draft = { step, name, phone, email, address, doorNumber, city, district, postalCode, category, logoUrl, businessHours, setupByGlamzo };\n    // localStorage removed',
  `const draft = { step, name, phone, email, address, doorNumber, city, district, postalCode, country, category, logoUrl, businessHours, setupByGlamzo };
    localStorage.setItem('setupWizardDraft', JSON.stringify(draft));`
);

// 3. Add country state
if (!content.includes('const [country, setCountry]')) {
  content = content.replace(
    "const [address, setAddress] = useState('');",
    "const [address, setAddress] = useState('');\n  const [country, setCountry] = useState('Portugal');"
  );
}

if (!content.includes('setCountry(currentBiz.country')) {
  content = content.replace(
    "setAddress(currentBiz.address || draft?.address || '');",
    "setAddress(currentBiz.address || draft?.address || '');\n        setCountry(currentBiz.country || draft?.country || 'Portugal');"
  );
}

// 4. Import AddressAutocomplete and APIProvider wrapping
if (!content.includes('AddressAutocomplete')) {
  content = content.replace(
    "import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';",
    "import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';\nimport { AddressAutocomplete } from '../../components/AddressAutocomplete';"
  );
}

// Ensure the whole view is wrapped in APIProvider since AddressAutocomplete needs it
// Wait, currently APIProvider is only rendering inside {step === 1 && ...} in the map column.
// If we move APIProvider up to the top level of the return, it will be easier.
