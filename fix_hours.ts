import fs from 'fs';

let bd = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');

// First, let's remove the map and hours from the Header.
const headerBlock = `<p className="text-sm text-slate-500 mt-2 flex items-center justify-center sm:justify-start gap-1.5"><MapPin className="w-4 h-4" /> {business.city}, {business.district}</p>
                  
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

bd = bd.replace(headerBlock, '<p className="text-sm text-slate-500 mt-2 flex items-center justify-center sm:justify-start gap-1.5"><MapPin className="w-4 h-4" /> {business.city}, {business.district}</p>');

fs.writeFileSync('src/pages/BusinessDetail.tsx', bd);

