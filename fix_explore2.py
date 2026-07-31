import re

with open('src/pages/Explore.tsx', 'r') as f:
    explore_content = f.read()

if 'ExploreMapUpdater' not in explore_content:
    helpers = """
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
    explore_content = helpers + "\n" + explore_content
    with open('src/pages/Explore.tsx', 'w') as f:
        f.write(explore_content)

