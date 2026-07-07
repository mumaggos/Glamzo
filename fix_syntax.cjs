const fs = require('fs');
let code = fs.readFileSync('src/pages/Account.tsx', 'utf8');

// I will just replace the specific broken part
code = code.replace(/\{bookings\.length > visibleBookings && \([\s\S]*?Ver Histórico Completo\n[\s\S]*?<\/button>\n[\s\S]*?<\/div>\n[\s\S]*?\)\}\n[\s\S]*?\)\}/, 
`{bookings.length > visibleBookings && (
                  <div className="mt-8 text-center">
                    <button onClick={() => setVisibleBookings(bookings.length)} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-xs">
                      Ver Histórico Completo
                    </button>
                  </div>
                )}
              )}`);

fs.writeFileSync('src/pages/Account.tsx', code);
