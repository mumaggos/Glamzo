const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('find src -name "*.tsx" -o -name "*.ts"').toString().split('\n').filter(Boolean);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(/, ,/g, ',');
  newContent = newContent.replace(/,(\s*),/g, ',$1');
  newContent = newContent.replace(/\{(\s*),/g, '{$1');
  newContent = newContent.replace(/,(\s*)\}/g, '$1}');
  if (newContent !== content) {
    fs.writeFileSync(file, newContent);
    console.log(`Fixed comma in ${file}`);
  }
}
