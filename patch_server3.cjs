const fs = require('fs');
let lines = fs.readFileSync('server.ts', 'utf8').split('\n');
// Keep everything except the bad lines. 2334 to 2344 are indices 2333 to 2343.
lines.splice(2333, 11);
fs.writeFileSync('server.ts', lines.join('\n'));
