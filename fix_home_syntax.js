import fs from 'fs';
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');
content = content.replace('after:content-[\\"\\"]', "after:content-['']");
content = content.replace('after:content-[\\"\\"]', "after:content-['']");
content = content.replace('after:content-[\"\"]', "after:content-['']");
fs.writeFileSync('src/pages/Home.tsx', content);
