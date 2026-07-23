const fs = require('fs');

let explore = fs.readFileSync('src/pages/Explore.tsx', 'utf8');
explore = explore.replace(
  />\{sub\}<\/button>/g,
  ">{t('subcat_' + sub) || sub}</button>"
);
fs.writeFileSync('src/pages/Explore.tsx', explore);

let setupWizard = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');
setupWizard = setupWizard.replace(
  />\{sub\}<\/button>/g,
  ">{t('subcat_' + sub) || sub}</button>"
);
fs.writeFileSync('src/pages/partner/SetupWizard.tsx', setupWizard);

let servicesTab = fs.readFileSync('src/pages/partner/tabs/ServicesTab.tsx', 'utf8');
// Find where preDef is used
servicesTab = servicesTab.replace(
  />\s*\{preDef\}\s*<\/button>/g,
  ">{t('subcat_' + preDef) || preDef}</button>"
);
fs.writeFileSync('src/pages/partner/tabs/ServicesTab.tsx', servicesTab);

