const fs = require('fs');
let content = fs.readFileSync('src/types/index.ts', 'utf8');

// The lines were:
//  booking_end_margin?: number | null;
//  welcome_kit_sent?: boolean;
//  subscription_status?: string;
content = content.replace("  booking_end_margin?: number | null;\n  welcome_kit_sent?: boolean;\n  subscription_status?: string;", "  booking_end_margin?: number | null;\n  subscription_status?: string;");

fs.writeFileSync('src/types/index.ts', content);
console.log("Fixed types duplicate");
