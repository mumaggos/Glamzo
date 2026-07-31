import re

with open('src/pages/Explore.tsx', 'r') as f:
    lines = f.read()

lines = lines.replace(
    'import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";',
    """import { APIProvider } from '@vis.gl/react-google-maps';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';"""
)

# And Map, Marker as well
lines = lines.replace(
    'import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";',
    """import { APIProvider } from '@vis.gl/react-google-maps';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';"""
)


map_helpers = """
const ExploreMapUpdater = ({ mapCenter, mapZoom }: { mapCenter: {lat: number, lng: number} | null, mapZoom: number }) => {
  const map = useMap();
  React.useEffect(() => {
    if (mapCenter) {
      map.setView([mapCenter.lat, mapCenter.lng], mapZoom);
    }
  }, [map, mapCenter, mapZoom]);
  return null;
};

const ExploreMapEvents = ({ setMapCenter, setMapZoom, setMapBounds }: any) => {
  useMapEvents({
    moveend(e) {
      const m = e.target;
      const center = m.getCenter();
      setMapCenter({ lat: center.lat, lng: center.lng });
      setMapZoom(m.getZoom());
      // we can't easily get bounds in the exact same format as Google, but let's ignore bounds strictly or pass something similar.
      const bounds = m.getBounds();
      setMapBounds({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      });
    }
  });
  return null;
};

const exploreUserIcon = divIcon({
  className: 'bg-transparent',
  html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const getBusinessIconExplore = (rating: number, isHighlighted: boolean) => {
  const r = rating > 0 ? rating.toFixed(1) : "5.0";
  const bgClass = isHighlighted ? 'bg-indigo-600' : 'bg-purple-600';
  const hoverClass = isHighlighted ? 'hover:bg-indigo-700' : 'hover:bg-purple-700';
  
  return divIcon({
    className: 'bg-transparent',
    html: `<div class="px-3 py-1.5 ${bgClass} text-white font-bold text-xs rounded-full shadow-md cursor-pointer ${hoverClass} transition-colors flex items-center justify-center gap-1 w-max">
               ${r} 
               <span class="text-[10px]">★</span>
            </div>`,
    iconSize: [50, 24],
    iconAnchor: [25, 12]
  });
};
"""

# Place it right after the imports.
lines = lines.replace(
    'import { Clock, Star, MapPin, Search, SlidersHorizontal, List, X, Navigation, Filter } from "lucide-react";',
    f'import {{ Clock, Star, MapPin, Search, SlidersHorizontal, List, X, Navigation, Filter }} from "lucide-react";\n{map_helpers}'
)

map_code = """             <MapContainer 
               center={mapCenter ? [mapCenter.lat, mapCenter.lng] : (userCoords ? [userCoords.latitude, userCoords.longitude] : [39.3999, -8.2245])} 
               zoom={mapZoom} 
               style={{ width: '100%', height: '100%', zIndex: 1 }}
               zoomControl={false}
             >
               <TileLayer
                 attribution='&copy; OpenStreetMap contributors'
                 url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
               />
               <ExploreMapUpdater mapCenter={mapCenter} mapZoom={mapZoom} />
               <ExploreMapEvents setMapCenter={setMapCenter} setMapZoom={setMapZoom} setMapBounds={setMapBounds} />
               
               {userCoords && <Marker position={[userCoords.latitude, userCoords.longitude]} icon={exploreUserIcon} />}
               
               {sortedBusinesses.slice(0, 50).map((b) => (
                 <Marker 
                   key={b.id} 
                   position={[b.latitude || b.lat, b.longitude || b.lng]}
                   icon={getBusinessIconExplore(b.rating || 0, hoveredShopId === b.id || clickedPinId === b.id)}
                   eventHandlers={{
                     click: () => {
                       setClickedPinId(b.id);
                       const cardEl = document.getElementById(`shop-card-${b.id}`);
                       if (cardEl) {
                         cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                       }
                     }
                   }}
                 />
               ))}
             </MapContainer>"""

pattern = re.compile(r'<Map.*?</Map>', re.DOTALL)
lines = pattern.sub(map_code, lines)

# Fix `mapCenter` type error if any because google.maps.LatLngLiteral was used, but react-leaflet uses something else.
lines = lines.replace('const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral | null>(null);', 'const [mapCenter, setMapCenter] = useState<{lat: number, lng: number} | null>(null);')

# Wait, check if `google.maps.LatLngBoundsLiteral` is also there.
lines = lines.replace('const [mapBounds, setMapBounds] = useState<google.maps.LatLngBoundsLiteral | null>(null);', 'const [mapBounds, setMapBounds] = useState<any | null>(null);')


with open('src/pages/Explore.tsx', 'w') as f:
    f.write(lines)
