import * as fs from 'fs';
let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf8');

const target = `              {/* Sobre */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm">
                <h2 className="text-lg font-black text-slate-900 mb-3">Sobre o Espaço</h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{business.description || 'Um espaço dedicado a elevar a sua beleza e bem-estar.'}</p>
              </div>`;

const replacement = `              {/* Sobre */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm">
                <h2 className="text-lg font-black text-slate-900 mb-3">Sobre o Espaço</h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{business.description || 'Um espaço dedicado a elevar a sua beleza e bem-estar.'}</p>
              </div>

              {/* Secção A Nossa Equipa */}
              {staff && staff.length > 0 && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm animate-fade-in">
                  <h3 className="text-lg font-black text-slate-900 mb-4 px-1">A Nossa Equipa</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 px-1 scrollbar-hide snap-x">
                    {staff.map((member) => (
                      <div key={member.id} className="flex flex-col items-center min-w-[72px] snap-start">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md ring-1 ring-slate-100"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-md ring-1 ring-slate-100 text-slate-500 font-black text-xl">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs font-bold text-slate-700 mt-2 text-center w-full truncate px-1">
                          {member.name.split(' ')[0]} {/* Mostra apenas o primeiro nome para ficar limpo */}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/pages/BusinessDetail.tsx', content);
console.log("Patched team section");
