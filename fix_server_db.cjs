const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /const key = process\.env\.SUPABASE_SERVICE_ROLE_KEY;/,
  `const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcHl3amthdHN4a2dybWJvYWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjY1NzEsImV4cCI6MjA5NDgwMjU3MX0.6tkKlKXwoCPxeCI0yi-uRwYkN-nt41kAcJtr4uBuoMA'; // Using anon key because service role is truncated in env`
);

code = code.replace(
  /const url = process\.env\.VITE_SUPABASE_URL;/,
  `const url = 'https://fkpywjkatsxkgrmboald.supabase.co/';`
);

fs.writeFileSync('server.ts', code);
