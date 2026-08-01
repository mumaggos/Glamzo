const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace("import { isSupabaseConfigured } from './lib/supabase';", "");
app = app.replace("isSupabaseConfigured", "(!!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY))");

fs.writeFileSync('src/App.tsx', app);
