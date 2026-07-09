const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf8');
text = text.replace('\\nexport default function App() {', '\nexport default function App() {');
text = text.replace(/function GlobalRoleEnforcer\(\) \{[\s\S]*?function GlobalRoleEnforcer\(\) \{/, 'function GlobalRoleEnforcer() {'); // remove duplicated if any
fs.writeFileSync('src/App.tsx', text);
