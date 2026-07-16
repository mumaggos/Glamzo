const fs = require('fs');
let code = fs.readFileSync('src/components/StoreManagementTab.tsx', 'utf8');

// Replace welcome kit button with checkbox
code = code.replace(
  /<button\s+onClick=\{\(\) => handleUpdateStore\(salon\.id, \{ welcome_kit_sent: !salon\.welcome_kit_sent \}\)\}[\s\S]*?<CheckCircle2 className="w-4 h-4" \/>\s*<\/button>/m,
  `<div className="flex items-center justify-center">
                      <input 
                        type="checkbox"
                        checked={!!salon.welcome_kit_sent}
                        onChange={(e) => handleUpdateStore(salon.id, { welcome_kit_sent: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        title="Kit de Boas Vindas Enviado"
                      />
                    </div>`
);

// Replace terminal button with checkbox
code = code.replace(
  /<button\s+onClick=\{\(\) => handleUpdateStore\(salon\.id, \{ terminal_sent: !salon\.terminal_sent \}\)\}[\s\S]*?<Monitor className="w-4 h-4" \/>\s*<\/button>/m,
  `<div className="flex items-center justify-center">
                        <input 
                          type="checkbox"
                          checked={!!salon.terminal_sent}
                          onChange={(e) => handleUpdateStore(salon.id, { terminal_sent: e.target.checked })}
                          className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          title="Terminal Enviado"
                        />
                      </div>`
);

fs.writeFileSync('src/components/StoreManagementTab.tsx', code);
