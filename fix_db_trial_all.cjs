require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const url = process.env.VITE_SUPABASE_URL || 'https://fkpywjkatsxkgrmboald.supabase.co/';
let envKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (envKey && envKey.length < 50) envKey = undefined;
const key = envKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcHl3amthdHN4a2dybWJvYWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjY1NzEsImV4cCI6MjA5NDgwMjU3MX0.6tkKlKXwoCPxeCI0yi-uRwYkN-nt41kAcJtr4uBuoMA';

const supabase = createClient(url, key);
async function fix() {
  const { data, error } = await supabase.from('businesses').update({ trial_started_at: null, trial_used: false }).neq('id', '00000000-0000-0000-0000-000000000000');
  console.log("Fixed All:", error || "Success");
}
fix();
