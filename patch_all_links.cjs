const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('grep -rl "<Link" src/').toString().split('\n').filter(Boolean);

for (const file of files) {
  if (file === 'src/components/LocalizedLink.tsx') continue;
  
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('<Link')) {
    content = content.replace(/<Link\b/g, '<LocalizedLink');
    content = content.replace(/<\/Link>/g, '</LocalizedLink>');
    
    // Add import if not present
    if (!content.includes('LocalizedLink')) {
      const importMatches = [...content.matchAll(/import .* from .*/g)];
      if (importMatches.length > 0) {
        const lastImport = importMatches[importMatches.length - 1];
        const lastImportIndex = lastImport.index + lastImport[0].length;
        
        const depth = file.split('/').length - 2;
        let prefix = '';
        if (depth === 0) prefix = './components/';
        else if (depth === 1) prefix = '../components/';
        else if (depth === 2) prefix = '../../components/';
        else if (depth === 3) prefix = '../../../components/';
        
        content = content.slice(0, lastImportIndex) + `\nimport { LocalizedLink } from '${prefix}LocalizedLink';` + content.slice(lastImportIndex);
      }
    }
    
    fs.writeFileSync(file, content);
    console.log(`Patched ${file}`);
  }
}
