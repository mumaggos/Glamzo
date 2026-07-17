const fs = require('fs');
let content = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

const targetStr = `          const checkoutRes = await fetch("/api/create-checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({`;

const replacement = `          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData?.session?.access_token;
          const checkoutRes = await fetch("/api/create-checkout-session", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              ...(token ? { "Authorization": \`Bearer \${token}\` } : {})
            },
            body: JSON.stringify({`;

if (content.includes(targetStr)) {
  fs.writeFileSync('src/components/BookingModal.tsx', content.replace(targetStr, replacement));
  console.log("BookingModal.tsx patched.");
} else {
  console.log("Could not find target string in BookingModal.tsx");
}
