const fs = require('fs');
let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Add useMap to imports
if (!home.includes('useMap')) {
    home = home.replace(
        'import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";',
        'import { APIProvider, Map, Marker, useMap } from "@vis.gl/react-google-maps";'
    );
}

// Add MapUpdater component
const mapUpdater = `
const MapUpdater = ({ coordinates }: { coordinates: { lat: number; lng: number } | null }) => {
  const map = useMap();
  useEffect(() => {
    if (map && coordinates) {
      map.panTo(coordinates);
    }
  }, [map, coordinates]);
  return null;
};
`;

if (!home.includes('MapUpdater')) {
    home = home.replace(
        'const API_KEY = (import.meta as any).env.VITE_GOOGLE_MAPS_PLATFORM_KEY || "";',
        'const API_KEY = (import.meta as any).env.VITE_GOOGLE_MAPS_PLATFORM_KEY || "";\n' + mapUpdater
    );
}

// Change center back to defaultCenter to make it uncontrolled
home = home.replace(
    'center={userCoords ? { lat: userCoords.lat, lng: userCoords.lng } : { lat: 38.7223, lng: -9.1393 }}',
    'defaultCenter={userCoords ? { lat: userCoords.lat, lng: userCoords.lng } : { lat: 38.7223, lng: -9.1393 }}'
);
home = home.replace(
    'zoom={userCoords ? 13 : 8}',
    'defaultZoom={userCoords ? 13 : 8}'
);

// Insert MapUpdater inside APIProvider
if (!home.includes('<MapUpdater coordinates={userCoords} />')) {
    home = home.replace(
        '<Map',
        '<MapUpdater coordinates={userCoords} />\n                <Map'
    );
}

fs.writeFileSync('src/pages/Home.tsx', home);
console.log("Updated Home.tsx for map panning");
