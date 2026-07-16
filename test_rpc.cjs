const { createClient } = require('@supabase/supabase-js');
const url = 'https://fkpywjkatsxkgrmboald.supabase.co/';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcHl3amthdHN4a2dybWJvYWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjY1NzEsImV4cCI6MjA5NDgwMjU3MX0.6tkKlKXwoCPxeCI0yi-uRwYkN-nt41kAcJtr4uBuoMA';
const db = createClient(url, key);
db.rpc('complete_booking_and_reward', { booking_id_param: '123' }).then(r => console.log(r)).catch(e => console.log(e));
