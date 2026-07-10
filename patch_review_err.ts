import fs from 'fs';
let code = fs.readFileSync('src/utils/reviewsHelper.ts', 'utf-8');

code = code.replace(
  'console.error(\'Error submitting review:\', error);',
  'console.error(\'Error submitting review:\', error);\n      alert("Error submitting review: " + error.message);'
);

fs.writeFileSync('src/utils/reviewsHelper.ts', code);
