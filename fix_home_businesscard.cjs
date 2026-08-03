const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Remove BusinessCard component definition from Home.tsx
const start = code.indexOf('// Cartão Minimalista de Elite');
const end = code.indexOf('export default function Home() {');
if (start !== -1 && end !== -1) {
  code = code.substring(0, start) + "\nimport { BusinessCard } from '../components/BusinessCard';\n" + code.substring(end);
}

fs.writeFileSync('src/pages/Home.tsx', code);
