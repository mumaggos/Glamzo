import re

with open('src/pages/partner/SetupWizard.tsx', 'r') as f:
    lines = f.read()

# Remove the original MapUpdater
pattern = re.compile(r'const MapUpdater = \(\{ coordinates.*?\};', re.DOTALL)
# Only replace the SECOND occurrence (or the first, but let's replace all except the one at the top)
# Wait, it's easier to remove ALL MapUpdaters and insert ONE.

lines = pattern.sub('', lines)

# Now insert it back after imports
map_updater_code = """
const MapUpdater = ({ coordinates }: { coordinates: { lat: number; lng: number } | null }) => {
  const map = useMap();
  useEffect(() => {
    if (coordinates) {
      map.setView([coordinates.lat, coordinates.lng], 15);
    }
  }, [map, coordinates]);
  return null;
};
"""

lines = lines.replace(
    'import { divIcon } from \'leaflet\';\nimport \'leaflet/dist/leaflet.css\';',
    f"import {{ divIcon }} from 'leaflet';\nimport 'leaflet/dist/leaflet.css';{map_updater_code}"
)

with open('src/pages/partner/SetupWizard.tsx', 'w') as f:
    f.write(lines)
