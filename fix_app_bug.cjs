const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace("if (!isSupabaseConfigured)", "const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);\n  if (!isSupabaseConfigured)");

fs.writeFileSync('src/App.tsx', app);
