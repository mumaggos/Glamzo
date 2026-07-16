const { createClient } = require('@supabase/supabase-js');
const url = 'https://fkpywjkatsxkgrmboald.supabase.co/';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcHl3amthdHN4a2dybWJvYWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjY1NzEsImV4cCI6MjA5NDgwMjU3MX0.6tkKlKXwoCPxeCI0yi-uRwYkN-nt41kAcJtr4uBuoMA';
const db = createClient(url, key);

async function check() {
  const { data: profs } = await db.from('profiles').select('id').limit(1);
  if (profs && profs.length > 0) {
    const res = await db.from('profiles').update({ glamzo_points: 0 }).eq('id', profs[0].id);
    console.log('Update res:', res.error?.message || 'Success');
  }
}
check();
