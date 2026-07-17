const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `    const url = 'https://fkpywjkatsxkgrmboald.supabase.co/';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcHl3amthdHN4a2dybWJvYWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjY1NzEsImV4cCI6MjA5NDgwMjU3MX0.6tkKlKXwoCPxeCI0yi-uRwYkN-nt41kAcJtr4uBuoMA'; // Using anon key because service role is truncated in env`;

const replacement = `    const url = process.env.VITE_SUPABASE_URL || 'https://fkpywjkatsxkgrmboald.supabase.co/';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcHl3amthdHN4a2dybWJvYWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjY1NzEsImV4cCI6MjA5NDgwMjU3MX0.6tkKlKXwoCPxeCI0yi-uRwYkN-nt41kAcJtr4uBuoMA';`;

if (content.includes(targetStr)) {
  fs.writeFileSync('server.ts', content.replace(targetStr, replacement));
  console.log("server.ts patched.");
} else {
  console.log("Could not find target string in server.ts");
}
