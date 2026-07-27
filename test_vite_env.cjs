const { spawnSync } = require('child_process');
const out = spawnSync('npx', ['vite', 'build'], { env: { ...process.env, DEBUG: 'vite:config' } });
console.log(out.stdout.toString().substring(0, 1000));
console.log(out.stderr.toString().substring(0, 1000));
