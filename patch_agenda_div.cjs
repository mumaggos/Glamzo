const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/AgendaTab.tsx', 'utf8');

code = code.replace(
  /\s*\}\}\n\s*\/>\n\s*\)\}\n\s*\{\/\* Manual Booking/g,
  `
          }}
        />
        </div>
      )}

      {/* Manual Booking`
);

fs.writeFileSync('src/pages/partner/tabs/AgendaTab.tsx', code);
