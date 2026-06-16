import fs from 'fs';
import path from 'path';

function fixFile(filePath: string) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch(e) {
    return;
  }
  
  content = content.replace(/Buscando espaços reais no Supabase/gi, "A procurar o teu lugar ideal");
  content = content.replace(/a procurar no supabase/gi, "A procurar o teu lugar ideal");

  fs.writeFileSync(filePath, content);
  console.log('Fixed', filePath);
}

fixFile(path.join(process.cwd(), 'src/pages/Explore.tsx'));
fixFile(path.join(process.cwd(), 'src/pages/Home.tsx'));
