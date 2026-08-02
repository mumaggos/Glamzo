const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(
  '  const mapBusinesses = useMemo(() => {\n     return businesses;\n   }, [businesses]);',
  '  const mapBusinesses = useMemo(() => {\n     return businesses.filter((b: any) => b.lat && b.lng).slice(0, 100);\n   }, [businesses]);'
);

fs.writeFileSync('src/pages/Home.tsx', code);
