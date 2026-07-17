const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = `const pointsToAdd = booking.payment_method === 'stripe' ? 50 : 25;`;
const replacement1 = `const pointsToAdd = booking.payment_method === 'stripe' ? 50 : 0;`;
code = code.replace(new RegExp(target1.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\$&'), 'g'), replacement1);

const target2 = `const newPoints = (profile?.glamzo_points || 0) + pointsToAdd;
      await supabaseAdmin.from('profiles').update({ glamzo_points: newPoints }).eq('id', booking.customer_id);`;
const replacement2 = `if (pointsToAdd > 0) {
        const newPoints = (profile?.glamzo_points || 0) + pointsToAdd;
        await supabaseAdmin.from('profiles').update({ glamzo_points: newPoints }).eq('id', booking.customer_id);
      }`;
// There are multiple instances of this block in server.ts
code = code.replace(/const newPoints = \(profile\?\.glamzo_points \|\| 0\) \+ pointsToAdd;\s*await (db|supabaseAdmin)\.from\('profiles'\)\.update\(\{ glamzo_points: newPoints \}\)\.eq\('id', booking\.customer_id\);/g, `if (pointsToAdd > 0) {
        const newPoints = (profile?.glamzo_points || 0) + pointsToAdd;
        await $1.from('profiles').update({ glamzo_points: newPoints }).eq('id', booking.customer_id);
      }`);

fs.writeFileSync('server.ts', code);
