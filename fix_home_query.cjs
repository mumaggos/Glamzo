const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const target = `const { data: businesses, error } = await supabase.from('businesses').select(\`
          *,
          business_services (
            id, name, price, duration, category, discount_price, price_promotion, is_active
          )
        \`);`;

const replacement = `const { data: businesses, error } = await supabase.from('businesses').select(\`
          *,
          services (
            id, name, price, duration_minutes, is_active
          )
        \`);`;

code = code.replace(target, replacement);

code = code.replace(/b\.business_services/g, "b.services");

fs.writeFileSync('src/pages/Home.tsx', code);
