const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/StaffTab.tsx', 'utf8');

const targetStr = `      const { error } = await supabase.from("staff").delete().eq("id", id);`;
const replacement = `      const { error } = await supabase.from("staff").update({ is_active: false }).eq("id", id);`;

if (content.includes(targetStr)) {
  fs.writeFileSync('src/pages/partner/tabs/StaffTab.tsx', content.replace(targetStr, replacement));
  console.log("StaffTab delete patched.");
} else {
  console.log("Could not find target string in StaffTab.");
}
