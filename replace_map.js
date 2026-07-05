import fs from 'fs';
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// Replace imports
content = content.replace('import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";', 'import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";\nimport "leaflet/dist/leaflet.css";\nimport L from "leaflet";');

// Leaflet default icon fix
const iconFix = `
// Fix leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
`;

content = content.replace('const API_KEY =', iconFix + '\nconst API_KEY =');

// Map rendering replacement
const mapStartIdx = content.indexOf('{/* Right: Map */}');
const mapEndIdx = content.indexOf('</div>\n          </div>\n        </div>\n      )}\n    </div>\n  );\n}');

if (mapStartIdx !== -1 && mapEndIdx !== -1) {
  const newMap = `{/* Right: Map */}
            <div className="hidden md:block flex-1 relative bg-slate-100 z-0">
              <MapContainer 
                center={userCoords ? [userCoords.lat, userCoords.lng] : [39.3999, -8.2245]} 
                zoom={userCoords ? 12 : 7} 
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                
                {userCoords && (
                  <Marker position={[userCoords.lat, userCoords.lng]} icon={L.divIcon({
                    className: 'custom-user-marker',
                    html: \`<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md animate-pulse"></div>\`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                  })}>
                  </Marker>
                )}
                
                {searchResults.map(b => (
                  <Marker 
                    key={b.id} 
                    position={[b.lat, b.lng]}
                    icon={L.divIcon({
                      className: 'custom-business-marker',
                      html: \`<div class="bg-slate-900 text-white px-2.5 py-1 rounded-full text-xs font-extrabold shadow-lg border-2 border-white flex items-center justify-center hover:scale-110 transition-transform whitespace-nowrap">\${b.rating.toFixed(1)} <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star ml-1 text-amber-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>\`,
                      iconSize: [40, 24],
                      iconAnchor: [20, 12]
                    })}
                  >
                    <Popup className="rounded-xl overflow-hidden p-0 border-0 shadow-xl">
                      <div className="flex flex-col w-[240px]">
                         <img src={b.cover_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600"} className="w-full h-24 object-cover" />
                         <div className="p-3">
                           <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{b.name}</h4>
                           <p className="text-xs text-slate-500 mt-1 line-clamp-1">{b.category}</p>
                           <a href={"/business/" + b.slug} className="block w-full mt-3 text-center bg-slate-900 text-white text-xs font-bold py-2 rounded-lg">Ver Detalhes</a>
                         </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
`;
  content = content.slice(0, mapStartIdx) + newMap + content.slice(mapEndIdx);
}

fs.writeFileSync('src/pages/Home.tsx', content);

