const fs = require('fs');
let content = fs.readFileSync('src/components/partner/PartnerLayout.tsx', 'utf8');

const targetStr = `        supabase.from("staff").select("*").eq("business_id", bData.id).order("full_name"),`;
const replacement = `        supabase.from("staff").select("*").eq("business_id", bData.id).eq("is_active", true).order("full_name"),`;

if (content.includes(targetStr)) {
  fs.writeFileSync('src/components/partner/PartnerLayout.tsx', content.replace(targetStr, replacement));
  console.log("PartnerLayout patched.");
} else {
  console.log("Could not find target string in PartnerLayout.");
}
