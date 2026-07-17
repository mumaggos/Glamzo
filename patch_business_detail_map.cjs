const fs = require('fs');

let code = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf8');

const targetSection = `<div className="flex items-start justify-between gap-3 text-sm">
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 block">{business.city}</span>
                      <span className="text-slate-500 text-xs">{business.address}</span>
                    </div>
                  </div>
                  <a 
                    href={\`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(business.address + ', ' + business.city)}\`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-purple-200"
                  >
                    Mapa
                  </a>
                </div>`;

const replacementSection = `
                {(() => {
                  const hasCoords = business.latitude && business.longitude;
                  const fullAddress = \`\${business.address || ''} \${business.door_number || ''}, \${business.postal_code || ''} \${business.city || ''}\`.trim();
                  
                  const directionsUrl = hasCoords
                    ? \`https://www.google.com/maps/dir/?api=1&destination=\${business.latitude},\${business.longitude}\`
                    : \`https://www.google.com/maps/dir/?api=1&destination=\${encodeURIComponent(fullAddress)}\`;

                  const streetViewUrl = hasCoords
                    ? \`https://www.google.com/maps?layer=c&cbll=\${business.latitude},\${business.longitude}\`
                    : \`https://www.google.com/maps?layer=c&q=\${encodeURIComponent(fullAddress)}\`;

                  return (
                    <div className="flex flex-col gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3">
                          <MapPin className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-900 block">{business.city}</span>
                            <span className="text-slate-600 text-xs block mt-0.5">{fullAddress}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <a 
                          href={directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                          Como Chegar / Iniciar Trajeto
                        </a>
                        <a 
                          href={streetViewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-slate-200 shadow-sm"
                        >
                          Google Street View
                        </a>
                      </div>
                    </div>
                  );
                })()}
`;

code = code.replace(targetSection, replacementSection);
fs.writeFileSync('src/pages/BusinessDetail.tsx', code);
console.log("BusinessDetail.tsx map links patched!");
