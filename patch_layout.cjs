const fs = require('fs');
let content = fs.readFileSync('src/components/partner/PartnerLayout.tsx', 'utf8');

const targetStr = `          return supabase.from("bookings")
            .select(\`*, service:services(name, price, duration_minutes), staff:staff(full_name), customer_profile:profiles(full_name, avatar_url, email, phone)\`)
            .eq("business_id", bData.id)
            
            
            .order("booking_date", { ascending: false })`;

const replacement = `          return supabase.from("bookings")
            .select(\`*, service:services(name, price, duration_minutes), staff:staff(full_name), customer_profile:profiles(full_name, avatar_url, email, phone)\`)
            .eq("business_id", bData.id)
            .neq('booking_status', 'cancelled')
            .neq('booking_status', 'pending')
            .order("booking_date", { ascending: false })`;

if (content.includes(targetStr)) {
  fs.writeFileSync('src/components/partner/PartnerLayout.tsx', content.replace(targetStr, replacement));
  console.log("PartnerLayout.tsx patched.");
} else {
  console.log("Could not find target string in PartnerLayout.tsx");
}
