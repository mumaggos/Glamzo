const { createClient } = require('@supabase/supabase-js');
const url = 'https://fkpywjkatsxkgrmboald.supabase.co/';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcHl3amthdHN4a2dybWJvYWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjY1NzEsImV4cCI6MjA5NDgwMjU3MX0.6tkKlKXwoCPxeCI0yi-uRwYkN-nt41kAcJtr4uBuoMA';
const db = createClient(url, key);

async function test() {
  // try to update an arbitrary user's points
  const { data, error } = await db.from('profiles').select('id, glamzo_points').limit(1);
  if (data && data.length > 0) {
    console.log("Found profile", data[0]);
    const updateRes = await db.from('profiles').update({ glamzo_points: data[0].glamzo_points + 1 }).eq('id', data[0].id);
    console.log("Update Error:", updateRes.error?.message || "Success");
  }
}
test();
