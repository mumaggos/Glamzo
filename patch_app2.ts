import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('GlobalIntentHandler')) {
  // Add import
  const importStatement = `import { GlobalIntentHandler } from './components/GlobalIntentHandler';\n`;
  content = importStatement + content;
  
  // Add component inside AuthProvider
  content = content.replace(
    /<GlobalRoleEnforcer \/>/,
    `<GlobalRoleEnforcer />\n          <GlobalIntentHandler />`
  );
  
  fs.writeFileSync('src/App.tsx', content);
}
