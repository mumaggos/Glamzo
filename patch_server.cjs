const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

// Insert import
if (!serverCode.includes('import { setupCronJobs } from "./cronJobs";')) {
  serverCode = serverCode.replace('import { EmailService } from "./src/services/EmailService";', 'import { EmailService } from "./src/services/EmailService";\nimport { setupCronJobs } from "./cronJobs";');
}

// Start cron jobs
if (!serverCode.includes('setupCronJobs();')) {
  serverCode = serverCode.replace('const app = express();', 'const app = express();\n\n// Start background jobs\nsetupCronJobs();\n');
}

fs.writeFileSync('server.ts', serverCode);
console.log("server.ts patched!");
