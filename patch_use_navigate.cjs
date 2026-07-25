const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('grep -rl "useNavigate" src/').toString().split('\n').filter(Boolean);

for (const file of files) {
  if (file === 'src/hooks/useLocalizedNavigate.ts') continue;
  
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('useNavigate') && !content.includes('useLocalizedNavigate')) {
    content = content.replace(/useNavigate/g, 'useLocalizedNavigate');
    
    // The previous replace might have replaced react-router-dom imports, let's fix that
    content = content.replace(/import \{.*useLocalizedNavigate.*\} from ['"]react-router-dom['"];/, (match) => {
      return match.replace('useLocalizedNavigate', ''); // We'll add our own
    });
    
    // Add import if not present
    if (!content.includes('../hooks/useLocalizedNavigate') && !content.includes('./hooks/useLocalizedNavigate')) {
      const importMatches = [...content.matchAll(/import .* from .*/g)];
      if (importMatches.length > 0) {
        const lastImport = importMatches[importMatches.length - 1];
        const lastImportIndex = lastImport.index + lastImport[0].length;
        
        const depth = file.split('/').length - 2;
        let prefix = '';
        if (depth === 0) prefix = './hooks/';
        else if (depth === 1) prefix = '../hooks/';
        else if (depth === 2) prefix = '../../hooks/';
        else if (depth === 3) prefix = '../../../hooks/';
        
        content = content.slice(0, lastImportIndex) + `\nimport { useLocalizedNavigate } from '${prefix}useLocalizedNavigate';` + content.slice(lastImportIndex);
      }
    }
    
    fs.writeFileSync(file, content);
    console.log(`Patched useNavigate in ${file}`);
  }
}
