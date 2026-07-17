const fs = require('fs');
let code = fs.readFileSync('src/types/index.ts', 'utf8');

if (!code.includes('admin_verified')) {
  code = code.replace("slug?: string;", "slug?: string;\n  admin_verified?: boolean;\n  manual_setup_requested?: boolean;");
  fs.writeFileSync('src/types/index.ts', code);
  console.log("types patched");
}
