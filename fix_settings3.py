import re
with open('src/pages/partner/tabs/SettingsTab.tsx', 'r') as f:
    c = f.read()
# Replace the duplicated imports of Map, Marker, useMap from @vis.gl
c = c.replace('import { APIProvider, Map, Marker, useMap } from "@vis.gl/react-google-maps";', 'import { APIProvider } from "@vis.gl/react-google-maps";')
with open('src/pages/partner/tabs/SettingsTab.tsx', 'w') as f:
    f.write(c)
