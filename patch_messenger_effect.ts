import fs from 'fs';
let code = fs.readFileSync('src/components/GlamzoMessenger.tsx', 'utf-8');

code = code.replace(
  /supabase\.from\('messages'\)[\s\S]*?\}\);/g,
  `// messages table doesn't exist, skip fetch`
);
code = code.replace(
  /const channel = supabase\.channel\('messenger_channel'\)[\s\S]*?\.subscribe\(\);/g,
  `// skip channel`
);

fs.writeFileSync('src/components/GlamzoMessenger.tsx', code);
