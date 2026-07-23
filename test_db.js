const fs = require('fs');
let s = fs.readFileSync('server.ts', 'utf8');
const lines = s.split('\n');
lines.forEach((line, i) => {
    if (line.includes('const db = getSupabaseAdmin();') && lines[i+1] && lines[i+1].includes('const db = getSupabaseAdmin();')) {
        console.log("Found duplicate at line", i);
    }
});
