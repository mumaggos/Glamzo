const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/StaffTab.tsx', 'utf8');

const newUI = `
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">
                      Email de Acesso
                    </label>
                    <input
                      type="email"
                      value={staffForm.email}
                      onChange={(e) =>
                        setStaffForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="Ex: funcionario@loja.pt"
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-900 text-xs outline-none focus:border-rose-600 transition-all font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">
                      Telemóvel
                    </label>
                    <input
                      type="tel"
                      value={staffForm.phone}
                      onChange={(e) =>
                        setStaffForm((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="Ex: 910 000 000"
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-900 text-xs outline-none focus:border-rose-600 transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">
                    Dias de Folga (Múltiplos)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          setStaffForm((prev) => {
                            const current = prev.off_days;
                            const isSelected = current.includes(idx);
                            const next = isSelected 
                              ? current.filter(d => d !== idx)
                              : [...current, idx];
                            return { ...prev, off_days: next };
                          });
                        }}
                        className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-all \${staffForm.off_days.includes(idx) ? 'bg-rose-100 text-rose-700 border-rose-300 border shadow-sm' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'}\`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {createdStaffAuth && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                    <p className="text-xs text-emerald-800 font-bold">Credenciais de Acesso Geradas:</p>
                    <div className="text-xs text-slate-600">
                      <strong>Email:</strong> {createdStaffAuth.email}<br/>
                      <strong>Password:</strong> {createdStaffAuth.temp_password}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const url = \`\${window.location.origin}/staff/login\`;
                        navigator.clipboard.writeText(\`Link: \${url}\\nEmail: \${createdStaffAuth.email}\\nPassword: \${createdStaffAuth.temp_password}\`);
                        alert("Link e credenciais copiados!");
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-2 rounded-lg transition"
                    >
                      Copiar Link e Dados de Acesso
                    </button>
                  </div>
                )}
`;

code = code.replace(
  /<label className="block text-\[10px\] font-mono uppercase text-slate-500 mb-1\.5">\s*Folgas Fixas Semanais\s*<\/label>\s*<input\s*type="text"\s*value=\{staffForm\.off_days\}\s*onChange=\{\(e\) =>\s*setStaffForm\(\(prev\) => \(\{\s*\.\.\.prev,\s*off_days: e\.target\.value,\s*\}\)\)\s*\}\s*placeholder="Ex: 0,1 \(0=Dom, 1=Seg\.\.\.\)"\s*className="w-full bg-white border border-slate-200 p-2\.5 rounded-xl text-slate-900 text-xs outline-none focus:border-rose-600 transition-all font-sans"\s*\/>/g,
  newUI
);

fs.writeFileSync('src/pages/partner/tabs/StaffTab.tsx', code);
