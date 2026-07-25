const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('grep -rl "LocalizedLink" src/').toString().split('\n').filter(Boolean);

for (const file of files) {
  if (file === 'src/components/LocalizedLink.tsx') continue;
  
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('<LocalizedLink') && !content.includes('import { LocalizedLink')) {
    const depth = file.split('/').length - 2;
    let prefix = '';
    if (depth === 0) prefix = './components/';
    else if (depth === 1) prefix = '../components/';
    else if (depth === 2) prefix = '../../components/';
    else if (depth === 3) prefix = '../../../components/';
    
    // add it after the first import or at the top
    const importStatement = `import { LocalizedLink } from '${prefix}LocalizedLink';\n`;
    if (content.startsWith('import ')) {
      content = importStatement + content;
    } else {
      content = importStatement + content;
    }
    
    fs.writeFileSync(file, content);
    console.log(`Added LocalizedLink import to ${file}`);
  }
}
