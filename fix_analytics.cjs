const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const regex = /\{\/\* Aggregate Platform Billing line diagram \*\/\}[\s\S]*?\{\/\* ==================================================== \*\/\s*\{\/\* SECTION 3: PAYOUTS/;
const newBlock = `{/* Aggregate Platform Billing line diagram */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 flex flex-col justify-between">
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Gráfico Volumétrico Transacional Mensal</h4>
                      <div className="h-64 flex items-center justify-center">
                        {getDynamicChartData().length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <RLineChart data={getDynamicChartData()}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                              <YAxis stroke="#64748b" fontSize={11} unit="€" />
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} labelStyle={{ color: '#fff' }} />
                              <Line type="monotone" dataKey="total" stroke="#9333ea" name="Volume" strokeWidth={2.5} />
                            </RLineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-center p-6 border border-dashed border-slate-200 rounded-2xl w-full h-full flex flex-col items-center justify-center bg-slate-50/20">
                            <BarChart className="w-8 h-8 text-slate-500 mb-2" />
                            <p className="text-slate-900 font-bold text-xs">Sem dados disponíveis</p>
                            <p className="text-[10px] text-slate-500 mt-1">Os dados serão apresentados após atividade real.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* ==================================================== */}
              {/* SECTION 3: PAYOUTS`;

content = content.replace(regex, newBlock);
fs.writeFileSync('src/pages/Admin.tsx', content);
console.log("Fixed analytics closure via script");
