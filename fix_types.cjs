const fs = require('fs');
let content = fs.readFileSync('src/types/index.ts', 'utf8');

if (!content.includes('setup_status?:')) {
  content = content.replace(/qr_scans_count\?: number;/g, "qr_scans_count?: number;\n  setup_status?: 'pending' | 'completed' | 'self_setup';\n  welcome_kit_sent?: boolean;\n  terminal_sent?: boolean;");
  fs.writeFileSync('src/types/index.ts', content);
  console.log("Added new columns to types");
}
