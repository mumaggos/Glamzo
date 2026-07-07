const fs = require('fs');
function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  // Add a filter for lat and lng to the maps
  code = code.replace(
    /\{(mapBusinesses|paginatedBusinesses)\.map\(\(b(: any)?\) => \(\s*<Marker/g,
    "{$1.filter((b$2) => b.lat != null && b.lng != null).map((b$2) => (\n                      <Marker"
  );
  fs.writeFileSync(file, code);
}

fixFile('src/pages/Home.tsx');
fixFile('src/pages/Explore.tsx');
