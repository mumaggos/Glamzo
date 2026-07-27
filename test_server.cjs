const { spawn } = require('child_process');
const server = spawn('node', ['dist/server.cjs']);
server.stdout.on('data', d => console.log('OUT: ' + d));
server.stderr.on('data', d => console.error('ERR: ' + d));
server.on('close', code => console.log('EXIT: ' + code));
setTimeout(() => server.kill(), 3000);
