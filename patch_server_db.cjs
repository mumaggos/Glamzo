const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `    const db = getSupabaseAdmin();
    const stripe = getStripe();`;

const replacement = `    const db = getSupabaseAuthClient(req);
    const stripe = getStripe();`;

if (content.includes(targetStr)) {
  fs.writeFileSync('server.ts', content.replace(targetStr, replacement));
  console.log("server.ts patched db.");
} else {
  console.log("Could not find target string in server.ts");
}
