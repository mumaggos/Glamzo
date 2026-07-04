import fs from 'fs';
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

content = content.replace('import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";', 'import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";');
content = content.replace('import "leaflet/dist/leaflet.css";\\nimport L from "leaflet";\\n', '');

const iconFix = `// Fix leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
`;
content = content.replace(iconFix, '');

const mapStart = content.indexOf('{/* Right: Map */}');
const mapEnd = content.indexOf('</div>\\n          </div>\\n        </div>\\n      )}\\n    </div>\\n  );\\n}');

const googleMap = `{/* Right: Map */}
            <div className="hidden md:block flex-1 relative bg-slate-100">
              {API_KEY ? (
                <APIProvider apiKey={API_KEY}>
                  <Map
                    defaultCenter={userCoords || { lat: 39.3999, lng: -8.2245 }}
                    defaultZoom={userCoords ? 12 : 7}
                    mapId="SEARCH_RESULTS_MAP"
                    disableDefaultUI
                    style={{width: '100%', height: '100%'}}
                  >
                    {userCoords && (
                      <AdvancedMarker position={userCoords}>
                         <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md animate-pulse"></div>
                      </AdvancedMarker>
                    )}
                    {searchResults.map(b => (
                      <AdvancedMarker key={b.id} position={{ lat: b.lat, lng: b.lng }}>
                        <a href={"/business/" + b.slug} className="relative cursor-pointer group flex flex-col items-center">
                          <div className="bg-slate-900 text-white px-2.5 py-1 rounded-full text-xs font-extrabold shadow-lg border-2 border-white flex items-center gap-1 hover:scale-110 transition-transform">
                            {b.rating.toFixed(1)} <Star className="w-3 h-3 fill-current text-amber-400" />
                          </div>
                          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-900 -mt-[1px]"></div>
                        </a>
                      </AdvancedMarker>
                    ))}
                  </Map>
                </APIProvider>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-medium bg-slate-50">
                  <MapIcon className="w-8 h-8 mr-2 text-slate-300" /> Mapa Indisponível
                </div>
              )}
            </div>
`;

if (mapStart !== -1 && mapEnd !== -1) {
  content = content.substring(0, mapStart) + googleMap + content.substring(mapEnd);
  fs.writeFileSync('src/pages/Home.tsx', content);
} else {
  console.log("Could not replace map block");
}
