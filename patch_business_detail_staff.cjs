const fs = require('fs');
let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf8');

const targetStr = `const { data: staffData } = await supabase.from('staff').select('*').eq('business_id', data.id);`;
const replacement = `const { data: staffData } = await supabase.from('staff').select('*').eq('business_id', data.id).eq('is_active', true);`;

if (content.includes(targetStr)) {
  fs.writeFileSync('src/pages/BusinessDetail.tsx', content.replace(targetStr, replacement));
  console.log("BusinessDetail patched.");
} else {
  console.log("Could not find target string in BusinessDetail.");
}
