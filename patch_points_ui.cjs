const fs = require('fs');
let code = fs.readFileSync('src/components/GlamzoClubModal.tsx', 'utf8');

const updatedUI = `
                  {pointsHistory.map(ph => (
                    <div key={ph.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{ph.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-slate-500">{new Date(ph.created_at).toLocaleDateString()}</p>
                          {ph.expires_at && ph.points > 0 && (
                            <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">Expira a {new Date(ph.expires_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <span className={\`font-black \${ph.points > 0 ? 'text-emerald-600' : 'text-rose-600'}\`}>
                        {ph.points > 0 ? '+' : ''}{ph.points} pts
                      </span>
                    </div>
                  ))}
`;

code = code.replace(/\{pointsHistory\.map\(ph => \([\s\S]*?\}\)\)/, updatedUI.trim());
fs.writeFileSync('src/components/GlamzoClubModal.tsx', code);
