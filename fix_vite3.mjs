import fs from 'fs';
let code = fs.readFileSync('vite.config.ts', 'utf8');

code = code.replace(/urlPattern: \/\^https:\\\/\\\/maps\\\.googleapis\\\.com\\\/\\.\*\/i,/g, ""); // clear it out
code = code.replace(/urlPattern: \/\^https:\\\/\\\/maps\\\.gstatic\\\.com\\\/\\.\*\/i,/g, "");

// I'll just write a script that replaces the whole VitePWA block to be sure
