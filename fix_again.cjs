const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const brokenRegex = /                          placeholder="GLAMZOPRO45"\n                        \/>\n                      <\/div>\n\n                <\/div>\n              \)\}/g;

const restoredSection = `                          placeholder="GLAMZOPRO45"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase font-black mb-1">Trial (Dias)</label>
                          <input
                            type="number"
                            required
                            value={couponDuration}
                            onChange={(e) => setCouponDuration(Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-900 text-xs font-mono outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase font-black mb-1">Uso Limite</label>
                          <input
                            type="number"
                            required
                            value={couponLimit}
                            onChange={(e) => setCouponLimit(Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-900 text-xs font-mono outline-none"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-purple-800 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-wider transition hover:from-purple-500 hover:to-purple-700 cursor-pointer"
                      >
                        Criar Cupão Admin
                      </button>
                    </form>
                    <div className="space-y-2 mt-4">
                      <span className="block text-[9px] font-mono text-slate-500 uppercase font-black pl-1">Cupões Ativos no Sistema</span>
                      <div className="space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-thin">
                        {couponsList.map((cp) => (
                          <div key={cp.code} className="p-2.5 bg-slate-50 rounded-xl border border-slate-910 flex items-center justify-between text-[11px] font-mono text-slate-600">
                            <div className="text-left">
                              <span className="text-slate-900 font-black">{cp.code}</span>
                              <span className="block text-[9px] text-slate-500">{cp.trial_days} dias experimental • Max: {cp.max_uses}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-purple-600 font-bold block">{cp.discount_value}€ desconto</span>
                              <span className="text-[9px] text-slate-400">{cp.used_count} usos</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}`;

content = content.replace(brokenRegex, restoredSection);
fs.writeFileSync('src/pages/Admin.tsx', content);
console.log('Fixed again');
