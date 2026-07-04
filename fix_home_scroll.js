import fs from 'fs';
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const targetStr = "className=\"flex overflow-x-auto gap-3 sm:gap-4 no-scrollbar snap-x pb-4 pt-2 px-4 sm:px-6 lg:px-8 after:content-[''] after:w-4 sm:after:w-6 lg:after:w-8 after:shrink-0\"";
const newStr = "className=\"flex overflow-x-auto gap-3 sm:gap-4 no-scrollbar snap-x pb-4 pt-2 px-4 sm:px-6 lg:px-8 after:content-[''] after:w-16 after:shrink-0\"";
content = content.replace(targetStr, newStr);

// Let's also add 16 to the other horizontal lists
const targetStr2 = "className=\"flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x\"";
const newStr2 = "className=\"flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x px-4 sm:px-6 lg:px-8 after:content-[''] after:w-16 after:shrink-0\"";
content = content.replace(new RegExp(targetStr2, 'g'), newStr2);

fs.writeFileSync('src/pages/Home.tsx', content);
