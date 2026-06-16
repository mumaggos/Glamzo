import fs from 'fs';
import path from 'path';

function fixFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/savingManualGlamzo Pay/g, "savingManualStripe");
  content = content.replace(/connectingGlamzo Pay/g, "connectingStripe");
  fs.writeFileSync(filePath, content);
  console.log('Fixed', filePath);
}

fixFile(path.join(process.cwd(), 'src/pages/Dashboard.tsx'));
