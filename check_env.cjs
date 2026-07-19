require('dotenv').config();
const envVars = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_CONNECT_WEBHOOK_SECRET",
  "VITE_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_PRO_PRICE_ID",
  "STRIPE_TERMINAL_PRODUCT_ID",
  "GEMINI_API_KEY",
  "RESEND_API_KEY",
  "EMAIL_FROM"
];

const results = [];
for (const v of envVars) {
  const val = process.env[v];
  if (val) {
    if (val.length > 8) {
      results.push(`${v}: OK (Set)`);
    } else {
      results.push(`${v}: OK (Set) - Short`);
    }
  } else {
    results.push(`${v}: MISSING`);
  }
}
console.log(results.join('\n'));
