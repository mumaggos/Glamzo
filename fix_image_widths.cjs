const fs = require('fs');
let code = fs.readFileSync('src/components/Image.tsx', 'utf8');

code = code.replace(
  'const WIDTHS = [320, 640, 768, 1024, 1280, 1600, 1920];',
  'const WIDTHS = [160, 320, 480, 640, 768, 1024, 1280, 1600, 1920];'
);

fs.writeFileSync('src/components/Image.tsx', code);
