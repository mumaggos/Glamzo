const fs = require('fs');
let code = fs.readFileSync('src/components/TimezoneSelect.tsx', 'utf8');
code = code.replace(
  "const timezones = useMemo(() => (Intl as any).supportedValuesOf('timeZone'), []);",
  "const timezones = useMemo(() => { try { return (Intl as any).supportedValuesOf('timeZone'); } catch(e) { return ['Europe/Lisbon', 'America/Sao_Paulo', 'Europe/London', 'America/New_York']; } }, []);"
);
fs.writeFileSync('src/components/TimezoneSelect.tsx', code);
