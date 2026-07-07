const fs = require('fs');
let code = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

code = code.replace(
  /const matchName = b\.name\.toLowerCase\(\)\.includes\(q\);/g,
  'const matchName = (b.name || "").toLowerCase().includes(q);'
);

code = code.replace(
  /const matchCat = b\.category\.toLowerCase\(\)\.includes\(q\);/g,
  'const matchCat = (b.category || "").toLowerCase().includes(q);'
);

code = code.replace(
  /const matchServices = services\.some\(s => s\.business_id === b\.id && s\.name\.toLowerCase\(\)\.includes\(q\)\);/g,
  'const matchServices = services.some(s => s.business_id === b.id && (s.name || "").toLowerCase().includes(q));'
);

code = code.replace(
  /if \(!\(b\.description \|\| ""\)\.toLowerCase\(\)\.includes\(subLower\) && !b\.category\.toLowerCase\(\)\.includes\(subLower\)\)/g,
  'if (!(b.description || "").toLowerCase().includes(subLower) && !(b.category || "").toLowerCase().includes(subLower))'
);

code = code.replace(
  /const isDomicil = b\.category === "Ao domicílio" \|\| \(b\.description \|\| ""\)\.toLowerCase\(\)\.includes\("domicílio"\);/g,
  'const isDomicil = b.category === "Ao domicílio" || (b.description || "").toLowerCase().includes("domicílio");'
);

fs.writeFileSync('src/pages/Explore.tsx', code);
