const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /const \{ error \} = await getSupabaseAdmin\(\)\.from\('businesses'\)\.update\(updates\)\.eq\('id', storeId\);\s+if \(error\) throw error;\s+res\.json\(\{ success: true \}\);\s+\} catch \(err\) \{\s+console\.error\(err\);\s+res\.status\(500\)\.json\(\{ error: err\.message \}\);\s+\}\}\);/;

code = code.replace(regex, "");

fs.writeFileSync('server.ts', code);
