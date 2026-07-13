import * as fs from 'fs';
let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf8');

const target = `{staff.map((member) => (
                      <div key={member.id} className="flex flex-col items-center min-w-[72px] snap-start">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.full_name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md ring-1 ring-slate-100"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-md ring-1 ring-slate-100 text-slate-500 font-black text-xl">
                            {(member.full_name || 'E').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs font-bold text-slate-700 mt-2 text-center w-full truncate px-1">
                          {(member.full_name || 'Equipa').split(' ')[0]} {/* Mostra apenas o primeiro nome para ficar limpo */}
                        </span>
                      </div>
                    ))}`;

const replacement = `{staff.map((member, idx) => {
                      if (!member) return null;
                      const nameStr = String(member.full_name || 'Equipa');
                      const firstChar = nameStr.charAt(0).toUpperCase();
                      const firstName = nameStr.split(' ')[0];
                      return (
                        <div key={member.id || idx} className="flex flex-col items-center min-w-[72px] snap-start">
                          {member.avatar_url ? (
                            <img
                              src={member.avatar_url}
                              alt={nameStr}
                              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md ring-1 ring-slate-100"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-md ring-1 ring-slate-100 text-slate-500 font-black text-xl">
                              {firstChar}
                            </div>
                          )}
                          <span className="text-xs font-bold text-slate-700 mt-2 text-center w-full truncate px-1">
                            {firstName}
                          </span>
                        </div>
                      );
                    })}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/pages/BusinessDetail.tsx', content);
console.log("Patched team safe rendering");
