const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `function getSupabaseAdmin(): any {`;

const replacement = `function getSupabaseAuthClient(req: any): any {
  const url = process.env.VITE_SUPABASE_URL || 'https://fkpywjkatsxkgrmboald.supabase.co/';
  const key = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcHl3amthdHN4a2dybWJvYWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjY1NzEsImV4cCI6MjA5NDgwMjU3MX0.6tkKlKXwoCPxeCI0yi-uRwYkN-nt41kAcJtr4uBuoMA';
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    return createClient(url, key, {
      global: {
        headers: { Authorization: \`Bearer \${token}\` },
      },
    });
  }
  return getSupabaseAdmin();
}

function getSupabaseAdmin(): any {`;

if (content.includes(targetStr)) {
  fs.writeFileSync('server.ts', content.replace(targetStr, replacement));
  console.log("server.ts patched with getSupabaseAuthClient.");
} else {
  console.log("Could not find target string in server.ts");
}
