import fs from 'fs';

function removeRedir(file: string) {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Find the comment "// 2. Redirecionar Automaticamente" and remove it and its block
  const lines = content.split('\n');
  let newLines: string[] = [];
  let skipping = false;
  let braceCount = 0;
  let started = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('// 2. Redirecionar Automaticamente')) {
      skipping = true;
    }
    
    if (!skipping) {
      newLines.push(line);
    } else {
      if (line.includes('{')) {
        let matches = line.match(/\{/g);
        braceCount += (matches ? matches.length : 0);
        started = true;
      }
      
      if (line.includes('}')) {
        let matches = line.match(/\}/g);
        braceCount -= (matches ? matches.length : 0);
      }
      
      if (started && braceCount <= 0 && (line.includes('}, [') || line.includes('});'))) {
         skipping = false;
      }
    }
  }
  
  fs.writeFileSync(file, newLines.join('\n'));
}

removeRedir('src/pages/Login.tsx');
removeRedir('src/pages/Signup.tsx');
