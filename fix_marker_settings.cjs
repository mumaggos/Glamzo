const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/SettingsTab.tsx', 'utf8');

code = code.replace(/AdvancedMarker/g, 'Marker');

const regex = /<Marker[\s\S]*?<\/Marker>/;
const replacement = `<Marker 
                              position={coordinates || { lat: 39.3999, lng: -8.2245 }}
                              draggable={true}
                              onDragEnd={(e) => {
                                if (e.latLng) {
                                  setCoordinates({ lat: typeof e.latLng.lat === "function" ? e.latLng.lat() : e.latLng.lat, lng: typeof e.latLng.lng === "function" ? e.latLng.lng() : e.latLng.lng });
                                }
                              }}
                            />`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/pages/partner/tabs/SettingsTab.tsx', code);
