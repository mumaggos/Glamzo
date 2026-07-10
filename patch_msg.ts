import fs from 'fs';
let code = fs.readFileSync('src/components/GlamzoMessenger.tsx', 'utf-8');

code = code.replace(
  'const { error } = await supabase.from(\'messages\').insert([newMsg]);',
  'const { error } = await supabase.from(\'messages\').insert([newMsg]);\n       console.log("Send message error:", error);'
);

fs.writeFileSync('src/components/GlamzoMessenger.tsx', code);
