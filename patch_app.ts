import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('ProfileCompletionGuard')) {
  // Add import
  const importStatement = `import { ProfileCompletionGuard } from './components/ProfileCompletionGuard';\n`;
  content = importStatement + content;
  
  // Add component inside AuthProvider
  content = content.replace(
    /<GlobalRoleEnforcer \/>/,
    `<GlobalRoleEnforcer />\n          <ProfileCompletionGuard />`
  );
  
  fs.writeFileSync('src/App.tsx', content);
}
