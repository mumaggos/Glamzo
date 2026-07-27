const fs = require('fs');
let content = fs.readFileSync('src/types/index.ts', 'utf8');

if (!content.includes('no_show_policy_enabled')) {
  content = content.replace(
    'cancellation_policy?: string | null;',
    'cancellation_policy?: string | null;\n  no_show_policy_enabled?: boolean | null;\n  no_show_fee_type?: string | null;\n  no_show_fee_value?: number | null;\n  cancellation_window_hours?: number | null;'
  );
  fs.writeFileSync('src/types/index.ts', content);
  console.log("Types updated");
} else {
  console.log("Types already have fields");
}
