const fs = require('fs');
let code = fs.readFileSync('src/components/ClientXRayModal.tsx', 'utf8');

const couponsSection = `
            {/* Coupons Section */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col mt-6">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
                <h3 className="text-sm font-extrabold text-slate-900">Cupões do Cliente</h3>
              </div>
              <div className="p-0 flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-slate-500 text-sm font-medium">A carregar cupões...</div>
                ) : coupons.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm font-medium">Nenhum cupão encontrado.</div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0">
                      <tr>
                        <th className="py-3 px-4">Código</th>
                        <th className="py-3 px-4">Valor</th>
                        <th className="py-3 px-4">Validade</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {coupons.map((c) => {
                        const isActive = !c.used && new Date(c.expires_at) > new Date();
                        return (
                          <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.code}</td>
                            <td className="py-3 px-4 font-bold text-purple-600">{c.value}€</td>
                            <td className="py-3 px-4 text-slate-500">{new Date(c.expires_at).toLocaleDateString()}</td>
                            <td className="py-3 px-4 text-right">
                              <span className={\`inline-block px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight \${
                                c.used ? 'bg-slate-100 text-slate-500' : 
                                (!isActive ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700')
                              }\`}>
                                {c.used ? 'Usado' : (!isActive ? 'Expirado' : 'Ativo')}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
`;

code = code.replace("            </div>\n          </div>\n          \n        </div>\n      </div>\n    </div>\n  );\n}", "            </div>\n" + couponsSection + "          </div>\n          \n        </div>\n      </div>\n    </div>\n  );\n}");

fs.writeFileSync('src/components/ClientXRayModal.tsx', code);
