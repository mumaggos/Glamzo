const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/PartnerReviewsTab.tsx', 'utf8');

if (!content.includes('import toast')) {
    content = content.replace("import React,", "import React,\nimport toast from 'react-hot-toast';\n");
    // fallback if no import React,
    if (!content.includes('react-hot-toast')) {
        content = "import toast from 'react-hot-toast';\n" + content;
    }
}

content = content.replace(/alert\('Erro ao enviar resposta: ' \+ e\.message\);/g, "toast.error('Erro ao enviar resposta: ' + e.message);");

fs.writeFileSync('src/pages/partner/tabs/PartnerReviewsTab.tsx', content);
console.log("Toast patched.");
