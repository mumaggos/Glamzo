const fs = require('fs');
const path = require('path');

function replaceUnsplash(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceUnsplash(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      content = content.replace(/['"]https:\/\/images\.unsplash\.com\/photo-[^'"]+['"]/g, "''");
      content = content.replace(/\|\| ''/g, "|| '/images/home/spa.webp'");
      // handle '||' combinations
      content = content.replace(/\|\| ''/g, "|| '/images/home/spa.webp'");
      content = content.replace(/\?auto=format[^'"]+['"]/g, "'");

      fs.writeFileSync(fullPath, content);
    }
  }
}

replaceUnsplash(path.join(__dirname, 'src'));
console.log('Done');
