const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const target = `const { data: businesses, error } = await supabase.from('businesses').select(\`
          *,
          services (
            id, name, price, duration_minutes, is_active
          )
        \`);`;

const replacement = `const { data: businesses, error } = await supabase.from('businesses').select(\`
          *,
          services (
            id, name, price, duration_minutes, is_active
          )
        \`).eq('status', 'active');`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/Home.tsx', code);
