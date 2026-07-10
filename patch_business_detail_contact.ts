import fs from 'fs';
let code = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');

const targetInfo = `<div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">{business.city}</span>
                    <span className="text-slate-500 text-xs">{business.address}</span>
                  </div>
                </div>`;

const newInfo = `<div className="flex items-start justify-between gap-3 text-sm">
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

code = code.replace(targetInfo, newInfo);

// Add the operating hours block before the CTA / Informações block. Actually, let's insert it after the "Informações" div starts.
const targetInformacoes = `<h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">Informações</h3>`;

const newInformacoes = `<h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">Informações</h3>
                
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

code = code.replace(targetInformacoes, newInformacoes);

fs.writeFileSync('src/pages/BusinessDetail.tsx', code);
