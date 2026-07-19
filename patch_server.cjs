const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `switch (type) {`;
const replacement = `switch (type) {
      case "account_ready":
        await EmailService.sendAccountReadyEmail(to, data);
        break;`;

if (!code.includes('case "account_ready":')) {
  code = code.replace(target, replacement);
  fs.writeFileSync('server.ts', code);
  console.log("server.ts patched");
}
