with open('src/pages/Explore.tsx', 'r') as f:
    explore_content = f.read()

# Just replace the duplicated lines (with exact spacing)
explore_content = explore_content.replace(
"""import { APIProvider } from '@vis.gl/react-google-maps';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';""", 
"import { APIProvider } from '@vis.gl/react-google-maps';"
)

with open('src/pages/Explore.tsx', 'w') as f:
    f.write(explore_content)
