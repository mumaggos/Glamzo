import re

with open('src/pages/partner/tabs/SettingsTab.tsx', 'r') as f:
    lines = f.read()

# Replace the Map element
map_code = """                          <MapContainer 
                            center={coordinates ? [coordinates.lat, coordinates.lng] : [39.3999, -8.2245]}
                            zoom={coordinates ? 16 : 7}
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

pattern = re.compile(r'<Map\s+defaultCenter.*?</Map>', re.DOTALL)
lines = pattern.sub(map_code, lines)

# Remove the old MapUpdater from the file completely
pattern2 = re.compile(r'const MapUpdater = \(\{ coordinates.*?\};', re.DOTALL)
lines = pattern2.sub('', lines)

with open('src/pages/partner/tabs/SettingsTab.tsx', 'w') as f:
    f.write(lines)
