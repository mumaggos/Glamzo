const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  /booking_status: 'completed',\n\s*business_completed: true,\n\s*client_completed: true/g,
  `booking_status: 'completed'`
);
code = code.replace(
  /\{ booking_status: 'completed', business_completed: true, client_completed: true \}/g,
  `{ booking_status: 'completed' }`
);
fs.writeFileSync('server.ts', code);
