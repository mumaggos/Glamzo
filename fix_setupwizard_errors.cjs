const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

// 1. Remove extra export at bottom
content = content.replace(/export default SetupWizard;(\n|)$/g, '');

// 2. Add country state
if(!content.includes('const [country, setCountry]')) {
    content = content.replace(
        "const [address, setAddress] = useState('');",
        "const [address, setAddress] = useState('');\n  const [country, setCountry] = useState('Portugal');"
    );
}
if(!content.includes('setCountry(currentBiz.country')) {
    content = content.replace(
        "setAddress(currentBiz.address || draft?.address || '');",
        "setAddress(currentBiz.address || draft?.address || '');\n        setCountry(currentBiz.country || draft?.country || 'Portugal');"
    );
}

// 3. Add import AddressAutocomplete
if(!content.includes('AddressAutocomplete')) {
    content = content.replace(
        "import { useMap } from '@vis.gl/react-google-maps';",
        "import { useMap } from '@vis.gl/react-google-maps';\nimport { AddressAutocomplete } from '../../components/AddressAutocomplete';"
    );
}
// Try replacing APIProvider import if the first one failed
if(!content.includes('AddressAutocomplete')) {
    content = content.replace(
        "import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';",
        "import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';\nimport { AddressAutocomplete } from '../../components/AddressAutocomplete';"
    );
}

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', content);
