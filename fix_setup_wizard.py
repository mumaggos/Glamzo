import re

with open('src/pages/partner/SetupWizard.tsx', 'r') as f:
    lines = f.read()

lines = lines.replace(
    "import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';",
    """import { APIProvider } from '@vis.gl/react-google-maps';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapUpdater = ({ coordinates }: { coordinates: { lat: number; lng: number } | null }) => {
  const map = useMap();
  useEffect(() => {
    if (coordinates) {
      map.setView([coordinates.lat, coordinates.lng], 15);
    }
  }, [map, coordinates]);
  return null;
};

const MapClick = ({ setCoordinates }: { setCoordinates: (c: {lat: number, lng: number}) => void }) => {
  useMapEvents({
    click(e) {
      setCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
};"""
)

marker_icon = """const setupMarkerIcon = divIcon({
  className: 'bg-transparent',
  html: `<div class="w-4 h-4 bg-purple-600 rounded-full border-2 border-white shadow-lg"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});"""

lines = lines.replace(
    'const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || "AIzaSyAFrWnn99CMO62Tn4QBanzYMItXnuZbhGg";',
    f'const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || "AIzaSyAFrWnn99CMO62Tn4QBanzYMItXnuZbhGg";\n{marker_icon}'
)

map_code = """                      <MapContainer 
                        center={coordinates ? [coordinates.lat, coordinates.lng] : [39.3999, -8.2245]}
                        zoom={coordinates ? 15 : 7}
                        style={{ width: '100%', height: '100%', zIndex: 1 }}
                        zoomControl={false}
                      >
                        <TileLayer
                          attribution='&copy; OpenStreetMap contributors'
                          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        />
                        <MapUpdater coordinates={coordinates} />
                        <MapClick setCoordinates={setCoordinates} />
                        <Marker 
                          position={coordinates ? [coordinates.lat, coordinates.lng] : [39.3999, -8.2245]}
                          draggable={true}
                          eventHandlers={{
                            dragend: (e) => {
                              const marker = e.target;
                              const position = marker.getLatLng();
                              setCoordinates({ lat: position.lat, lng: position.lng });
                            }
                          }}
                          icon={setupMarkerIcon}
                        />
                      </MapContainer>"""

# Using regex to replace the Map component block because it's safer and ignores slight spacing differences
pattern = re.compile(r'<Map mapId="DEMO_MAP_ID".*?</Map>', re.DOTALL)
lines = pattern.sub(map_code, lines)

with open('src/pages/partner/SetupWizard.tsx', 'w') as f:
    f.write(lines)
