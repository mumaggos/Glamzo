const fs = require('fs');
let code = fs.readFileSync('src/components/TimezoneSelect.tsx', 'utf8');
code = code.replace("Intl.supportedValuesOf('timeZone')", "(Intl as any).supportedValuesOf('timeZone')");
fs.writeFileSync('src/components/TimezoneSelect.tsx', code);
