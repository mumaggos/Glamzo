const fs = require('fs');
const path = require('path');
const dbSchema = JSON.parse(fs.readFileSync('db_schema.json', 'utf8'));

const filesToScan = [];
function scanDir(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      if (!['node_modules', '.git', 'dist'].includes(file)) scanDir(full);
    } else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
      filesToScan.push(full);
    }
  }
}
scanDir('./src');
filesToScan.push('server.ts');

const missingCols = new Set();
const missingTables = new Set();
const missingRpcs = new Set();

const tablePattern = /\.from\(['"]([^'"]+)['"]\)/g;
const rpcPattern = /\.rpc\(['"]([^'"]+)['"]/g;

for (const file of filesToScan) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = tablePattern.exec(content)) !== null) {
    const tableName = match[1];
    if (!dbSchema.tables[tableName]) {
      missingTables.add(tableName);
    }
  }
  while ((match = rpcPattern.exec(content)) !== null) {
    const rpcName = match[1];
    if (!dbSchema.rpcs.includes(rpcName)) {
      missingRpcs.add(rpcName);
    }
  }
}

console.log("Missing Tables:", Array.from(missingTables));
console.log("Missing RPCs:", Array.from(missingRpcs));
