import fs from 'fs';

let bd = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');

const oldInfoBlock = `<div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-5">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">Informações</h3>
                
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">{business.city}</span>
                    <span className="text-slate-500 text-xs">{business.address}</span>
                  </div>
                </div>`;

const newInfoBlock = `<div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-5">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">Informações</h3>
                
                {businessHours && businessHours.length > 0 && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <h4 className="font-bold text-sm text-slate-800">Horário de Funcionamento</h4>
                    </div>
                    <div className="space-y-2 text-xs">
                      {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((day, idx) => {
                        const h = businessHours.find(bh => bh.weekday === idx);
                        if (!h) return null;
                        return (
                          <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-100/50 last:border-0">
                            <span className="font-bold text-slate-600">{day}</span>
                            <span className={h.is_closed ? "text-rose-500 font-bold" : "text-slate-500 font-mono"}>
                              {h.is_closed ? 'Fechado' : \`\${h.open_time?.substring(0,5)} - \${h.close_time?.substring(0,5)}\`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between gap-3 text-sm">
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

bd = bd.replace(oldInfoBlock, newInfoBlock);

fs.writeFileSync('src/pages/BusinessDetail.tsx', bd);

