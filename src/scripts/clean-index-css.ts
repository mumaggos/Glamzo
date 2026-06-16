import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/index.css');
let content = fs.readFileSync(filePath, 'utf8');

// Find the start of the #partner-terminal-layout overrides and remove everything related
const regex = /\/\* ==================================================== \*\/\s*\/\*   HIGH-FASHION LIGHT LUXURY THEME FOR THE PARTNER   \*\/\s*\/\*   \(UNIFIED PALETTE: AIRBNB & APPLE LIGHT ELEGANCE\)  \*\/\s*\/\* ==================================================== \*\/[\s\S]*$/;
content = content.replace(regex, '');

fs.writeFileSync(filePath, content.trim() + '\n');
console.log('Removed partner-terminal-layout overrides from index.css');
