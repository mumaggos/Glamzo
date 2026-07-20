const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

content = content.replace(
  /const draftStr = localStorage\.getItem\('setup_wizard_draft'\);\n\s*let draft: any = null;\n\s*try \{ draft = draftStr \? JSON\.parse\(draftStr\) : null; \} catch \(e\) \{\}/,
  `const draft: any = null;`
);

content = content.replace(
  /localStorage\.setItem\('setup_wizard_draft', JSON\.stringify\(draft\)\);/,
  `// localStorage removed`
);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', content);
