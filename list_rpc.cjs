const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://fkpywjkatsxkgrmboald.supabase.co/', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcHl3amthdHN4a2dybWJvYWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjY1NzEsImV4cCI6MjA5NDgwMjU3MX0.6tkKlKXwoCPxeCI0yi-uRwYkN-nt41kAcJtr4uBuoMA');

async function run() {
  const { data, error } = await supabase.rpc('get_dashboard_stats', {});
  console.log(error); // Just to test if we can hit it
}
run();
