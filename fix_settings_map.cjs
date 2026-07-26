const fs = require('fs');

let settingsTab = fs.readFileSync('src/pages/partner/tabs/SettingsTab.tsx', 'utf8');

// 1. Imports
settingsTab = settingsTab.replace(
    'import { APIProvider } from "@vis.gl/react-google-maps";',
    'import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";'
);
if (!settingsTab.includes('MapPin')) {
    settingsTab = settingsTab.replace(
        'import { Settings, Image as ImageIcon, Building2, Clock, Check, Upload, Save, ShieldAlert, Shield, KeyRound } from "lucide-react";',
        'import { Settings, Image as ImageIcon, Building2, Clock, Check, Upload, Save, ShieldAlert, Shield, KeyRound, MapPin } from "lucide-react";'
    );
}

// 2. MapUpdater
const mapUpdater = `
const MapUpdater = ({ coordinates }: { coordinates: { lat: number; lng: number } | null }) => {
  const map = useMap();
  React.useEffect(() => {
    if (map && coordinates) {
      map.panTo(coordinates);
    }
  }, [map, coordinates]);
  return null;
};
`;
if (!settingsTab.includes('MapUpdater')) {
    settingsTab = settingsTab.replace(
        'export default function SettingsTab() {',
        mapUpdater + '\nexport default function SettingsTab() {'
    );
}
if (!settingsTab.includes('import React')) {
    settingsTab = "import React, { useState, useEffect } from 'react';\n" + settingsTab.replace(/import { useState, useEffect.*} from 'react';\n?/, '');
}

fs.writeFileSync('src/pages/partner/tabs/SettingsTab.tsx', settingsTab);
