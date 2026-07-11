const fs = require('fs');

function removeRedir(file) {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Find the comment "// 2. Redirecionar Automaticamente" and remove it and its block
  const lines = content.split('\n');
  let newLines = [];
  let skipping = false;
  let braceCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('// 2. Redirecionar Automaticamente')) {
      skipping = true;
    }
    
    if (!skipping) {
      newLines.push(line);
    } else {
      if (line.includes('useEffect(() => {')) {
        braceCount++;
      } else if (line.includes('{')) {
        let matches = line.match(/\{/g);
        braceCount += (matches ? matches.length : 0);
      }
      
      if (line.includes('}')) {
        let matches = line.match(/\}/g);
        braceCount -= (matches ? matches.length : 0);
      }
      
      // If we see the dependency array ending and we are skipping, stop skipping
      if (line.includes('}, [') || line.includes('],')) {
         if (braceCount <= 0) {
            skipping = false; // Next line will be kept
         }
      }
    }
  }
  
  fs.writeFileSync(file, newLines.join('\n'));
}

removeRedir('src/pages/Login.tsx');
removeRedir('src/pages/Signup.tsx');
