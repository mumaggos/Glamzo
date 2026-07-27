const fs = require('fs');
let content = fs.readFileSync('vite.config.ts', 'utf8');

// We will remove the whole custom plugin
const pluginStart = "{        name: 'vite-plugin-async-css-and-inline',";
const pluginEnd = "      }";

// Since we just want to remove the plugin object from the plugins array
content = content.replace(/\{\s*name:\s*'vite-plugin-async-css-and-inline'[\s\S]*?\}\s*\,/m, '');

fs.writeFileSync('vite.config.ts', content);
