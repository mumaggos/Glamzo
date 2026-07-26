const fs = require('fs');

let settingsTab = fs.readFileSync('src/pages/partner/tabs/SettingsTab.tsx', 'utf8');

const mapUI = `                  <div className="space-y-2 md:col-span-2 pt-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('setupWizard.exactLocation', 'Localização Exata')}</label>
                    <p className="text-xs text-slate-500 mb-2.5">{t('setupWizard.mapHint', 'Arraste o pino para a localização exata da sua porta.')}</p>
                    <div className="h-64 rounded-xl overflow-hidden border border-slate-200 relative bg-slate-100 shadow-inner">
                      {API_KEY ? (
                        <>
                          <Map
                            defaultCenter={coordinates || { lat: 39.3999, lng: -8.2245 }}
                            defaultZoom={coordinates ? 16 : 7}
                            mapId="SETTINGS_WIZARD_MAP_LOCATION"
                            onClick={(e) => {
                              if (e.detail.latLng) {
                                setCoordinates({ lat: e.detail.latLng.lat, lng: e.detail.latLng.lng });
                              }
                            }}
                            disableDefaultUI
                            style={{ width: '100%', height: '100%' }}
                          >
                            <MapUpdater coordinates={coordinates} />
                            <AdvancedMarker 
                              position={coordinates || { lat: 39.3999, lng: -8.2245 }}
                              draggable
                              onDragEnd={(e) => {
                                if (e.latLng) {
                                  setCoordinates({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                                }
                              }}
                            >
                              <div className="relative flex flex-col items-center">
                                <div className="bg-purple-600 text-white p-2 rounded-full shadow-xl border-2 border-white">
                                  <MapPin className="w-5 h-5 fill-current" />
                                </div>
                              </div>
                            </AdvancedMarker>
                          </Map>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                          <MapPin className="w-8 h-8 text-slate-400 mb-2 animate-pulse" />
                          <span className="text-sm font-bold text-slate-700">{t('setupWizard.mapPreview', 'Mapa')}</span>
                        </div>
                      )}
                    </div>
                  </div>
`;

if (!settingsTab.includes('SETTINGS_WIZARD_MAP_LOCATION')) {
    const target = '                  <div className="space-y-2 md:col-span-2">\n                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t(\'settings.currencyLabel\'';
    settingsTab = settingsTab.replace(
        target,
        mapUI + target
    );
    fs.writeFileSync('src/pages/partner/tabs/SettingsTab.tsx', settingsTab);
    console.log("Added Map UI to SettingsTab");
} else {
    console.log("Map UI already in SettingsTab");
}
