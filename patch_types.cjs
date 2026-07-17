const fs = require('fs');

// Patch server.ts
let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace(
  'activeAccount.capabilities?.transfers === "inactive" || activeAccount.capabilities?.transfers === "disabled"',
  'activeAccount.capabilities?.transfers === "inactive" || (activeAccount.capabilities?.transfers as any) === "disabled"'
);
fs.writeFileSync('server.ts', serverCode);

// Patch src/types/index.ts
let typesCode = fs.readFileSync('src/types/index.ts', 'utf8');
const targetType = `  total_price: number;`;
const replacementType = `  total_price: number;
  original_service_price?: number;`;
typesCode = typesCode.replace(targetType, replacementType);
fs.writeFileSync('src/types/index.ts', typesCode);

console.log("Types patched!");
