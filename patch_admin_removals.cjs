const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// Remove Gerador de Cupões
const couponBlockStart = content.indexOf('<div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">');
if (couponBlockStart !== -1) {
    const couponHeader = content.indexOf('<span>Gerador de Cupões Comerciais</span>');
    if (couponHeader !== -1 && couponHeader - couponBlockStart < 500) {
        // Find the closing </div> of this block
        let depth = 0;
        let couponBlockEnd = -1;
        for (let i = couponBlockStart; i < content.length; i++) {
            if (content.substr(i, 4) === '<div') depth++;
            else if (content.substr(i, 5) === '</div') depth--;
            
            if (depth === 0) {
                couponBlockEnd = i + 6;
                break;
            }
        }
        if (couponBlockEnd !== -1) {
             content = content.substring(0, couponBlockStart) + content.substring(couponBlockEnd);
             console.log("Removed Gerador de Cupões Comerciais block.");
        }
    }
}

// Remove Homologação e Parâmetros
const paramBlockStart = content.indexOf('<div className="lg:col-span-5 space-y-6">');
if (paramBlockStart !== -1) {
    const paramHeader = content.indexOf('<span>Homologação e Parâmetros</span>');
    if (paramHeader !== -1 && paramHeader - paramBlockStart < 500) {
         let depth = 0;
         let paramBlockEnd = -1;
         for (let i = paramBlockStart; i < content.length; i++) {
             if (content.substr(i, 4) === '<div') depth++;
             else if (content.substr(i, 5) === '</div') depth--;
             
             if (depth === 0) {
                 paramBlockEnd = i + 6;
                 break;
             }
         }
         if (paramBlockEnd !== -1) {
              content = content.substring(0, paramBlockStart) + content.substring(paramBlockEnd);
              console.log("Removed Homologação e Parâmetros block.");
         }
    }
}

fs.writeFileSync('src/pages/Admin.tsx', content);
