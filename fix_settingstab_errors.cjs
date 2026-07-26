const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/SettingsTab.tsx', 'utf8');

// 1. Fix imports
if(!content.includes('APIProvider')) {
    content = content.replace(
        'import { useTranslation } from "react-i18next";',
        'import { useTranslation } from "react-i18next";\nimport { APIProvider } from "@vis.gl/react-google-maps";\nimport { AddressAutocomplete } from "../../../components/AddressAutocomplete";'
    );
}

// 2. Fix API_KEY
if(!content.includes('const API_KEY =')) {
    content = content.replace(
        'export default function SettingsTab() {',
        'const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || "";\nexport default function SettingsTab() {'
    );
}

// 3. Remove export default at the bottom
content = content.replace(/export default SettingsTab;(\n|)$/g, '');

fs.writeFileSync('src/pages/partner/tabs/SettingsTab.tsx', content);
