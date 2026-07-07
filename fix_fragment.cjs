const fs = require('fs');
let code = fs.readFileSync('src/pages/Account.tsx', 'utf8');

code = code.replace(/<div className="space-y-4">\n\s*\{bookings\.slice\(0, visibleBookings\)\.map\(bk => \{/, 
`<>
                <div className="space-y-4">
                  {bookings.slice(0, visibleBookings).map(bk => {`);

code = code.replace(/Ver Histórico Completo\n\s*<\/button>\n\s*<\/div>\n\s*\)\}\n\s*\)\}/, 
`Ver Histórico Completo
                    </button>
                  </div>
                )}
              </>)}`);

fs.writeFileSync('src/pages/Account.tsx', code);
