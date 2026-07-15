const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// 1. Add import
if (!content.includes('StoreManagementTab')) {
  content = content.replace("import ClientXRayModal from '../components/ClientXRayModal';", "import ClientXRayModal from '../components/ClientXRayModal';\nimport StoreManagementTab from '../components/StoreManagementTab';");
}

// 2. Replace terminal tab content
const startTag = "{activeTab === 'terminal' && (";
const endStr = "                  </div>\n                </div>\n              )}";

const startIndex = content.indexOf(startTag);
if (startIndex !== -1) {
  // Let's find the closing for activeTab === 'terminal'.
  // Looking for the next "{activeTab === '"
  const nextTabIdx = content.indexOf("{activeTab === 'analytics'", startIndex);
  if (nextTabIdx !== -1) {
    const replacement = `{activeTab === 'terminal' && (\n                <StoreManagementTab salons={salons} onUpdate={syncAdminDatasets} adminId={user?.id || ''} />\n              )}\n\n              `;
    content = content.slice(0, startIndex) + replacement + content.slice(nextTabIdx);
    fs.writeFileSync('src/pages/Admin.tsx', content);
    console.log("Successfully replaced terminal tab with StoreManagementTab");
  } else {
    console.log("Could not find analytics tab");
  }
} else {
  console.log("Could not find terminal tab");
}
