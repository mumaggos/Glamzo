const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// The logic starts at "export default function Home() {"
// and ends after handleGetLocation closing brace
// Also we need to remove the "return (" that I added in fix_home_return.cjs

code = code.replace(/return \(\n    <div className="min-h-\[100vh\][\s\S]*?<section className="relative pt-24 pb-20/, '<section className="relative pt-24 pb-20');

const functionStart = code.indexOf('export default function Home() {');
const functionEnd = code.indexOf('};', code.indexOf('const handleGetLocation')) + 2;

const logic = code.substring(functionStart, functionEnd);
code = code.substring(0, functionStart) + code.substring(functionEnd);

const returnStart = code.indexOf('return (');
code = code.substring(0, returnStart) + logic + '\n\n' + code.substring(returnStart);

fs.writeFileSync('src/pages/Home.tsx', code);
