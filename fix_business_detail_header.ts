import fs from 'fs';

let bd = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');

// 1. We remove the old business hours rendering and the old Map link from the Informações box
const targetInformacoesOld = `<h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">Informações</h3>
                
                {businessHours && businessHours.length > 0 && (
                  <div className="pt-2 pb-4 mb-4 border-b border-slate-100 space-y-2 text-sm">
                    {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((day, idx) => {
                      const h = businessHours.find(bh => bh.day_of_week === idx);
                      if (!h) return null;
                      return (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="font-bold text-slate-700">{day}</span>
                          <span className={h.is_closed ? "text-rose-500 font-bold" : "text-slate-600 font-mono"}>
                            {h.is_closed ? 'Fechado' : \`\${h.start_time?.substring(0,5)} - \${h.end_time?.substring(0,5)}\`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}`;

bd = bd.replace(targetInformacoesOld, `<h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">Informações</h3>`);

const targetInfoMapOld = `<div className="flex items-start justify-between gap-3 text-sm">
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
                    className="shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                  >
                    Mapa
                  </a>
                </div>`;

bd = bd.replace(targetInfoMapOld, `<div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">{business.city}</span>
                    <span className="text-slate-500 text-xs">{business.address}</span>
                  </div>
                </div>`);

// 2. Inject the Map button and Hours below the city and district
const targetHeaderStr = `<p className="text-sm text-slate-500 mt-2 flex items-center justify-center sm:justify-start gap-1.5"><MapPin className="w-4 h-4" /> {business.city}, {business.district}</p>`;

const newHeaderAdditions = `<p className="text-sm text-slate-500 mt-2 flex items-center justify-center sm:justify-start gap-1.5"><MapPin className="w-4 h-4" /> {business.city}, {business.district}</p>
                  
                  {/* Botão Como Chegar */}
                  <div className="mt-4 flex justify-center sm:justify-start">
                    <a 
                      href={\`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(business.address + ', ' + business.city)}\`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 border border-purple-200 shadow-sm"
                    >
                      <MapPin className="w-4 h-4" /> Como Chegar
                    </a>
                  </div>

                  {/* Horários na Loja Pública */}
                  {businessHours && businessHours.length > 0 && (
                    <div className="mt-5 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <h3 className="font-bold text-sm text-slate-800">Horário de Funcionamento</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                        {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((day, idx) => {
                          const h = businessHours.find(bh => bh.day_of_week === idx);
                          if (!h) return null;
                          return (
                            <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-100/50 last:border-0">
                              <span className="font-bold text-slate-600">{day}</span>
                              <span className={h.is_closed ? "text-rose-500 font-bold" : "text-slate-500 font-mono"}>
                                {h.is_closed ? 'Fechado' : \`\${h.start_time?.substring(0,5)} - \${h.end_time?.substring(0,5)}\`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
`;

bd = bd.replace(targetHeaderStr, newHeaderAdditions);

fs.writeFileSync('src/pages/BusinessDetail.tsx', bd);

