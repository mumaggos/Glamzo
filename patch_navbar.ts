import fs from 'fs';
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf-8');
const start = content.indexOf('{/* 2. FLOATING BOTTOM NAVIGATION BAR');
if (start !== -1) {
  const end = content.lastIndexOf('</>');
  if (end !== -1) {
    const newContent = content.substring(0, start) + content.substring(end);
    fs.writeFileSync('src/components/Navbar.tsx', newContent);
    console.log("Floating bottom nav removed.");
  }
}
