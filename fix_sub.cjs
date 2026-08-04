const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/SubscriptionTab.tsx', 'utf8');

// Replace the grid grid-cols-1 md:grid-cols-2 with just one grid column
// Or rather, remove the PLANO GLAMZO PRO TERMINAL div entirely.

const startIndex = code.indexOf('{/* PLANO GLAMZO PRO TERMINAL */}');
const endIndex = code.indexOf('</div>', code.indexOf('</button>', code.indexOf('O Seu Plano Atual', startIndex))) + 6;

if (startIndex !== -1 && endIndex !== -1) {
    code = code.substring(0, startIndex) + code.substring(endIndex);
    
    // Also remove grid-cols-1 md:grid-cols-2
    code = code.replace('<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">', '<div className="max-w-md mx-auto mb-6">');
    
    // Fix logic for Glamzo Pro to not check pro_terminal
    code = code.replace(/business\?\.selected_plan !== "app_tablet" && business\?\.selected_plan !== "pro_terminal" && !business\?\.tablet_requested/g, 'true');
    code = code.replace(/business\?\.selected_plan === "app_tablet" \|\| business\?\.selected_plan === "pro_terminal" \|\| business\?\.tablet_requested/g, 'false');
    
    fs.writeFileSync('src/pages/partner/tabs/SubscriptionTab.tsx', code);
    console.log("Fixed subscription tab");
} else {
    console.log("Could not find blocks");
}
