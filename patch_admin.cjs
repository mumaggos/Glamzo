const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// Add Import
code = code.replace("import ClientXRayModal from '../components/ClientXRayModal';", "import ClientXRayModal from '../components/ClientXRayModal';\nimport AllCouponsTab from '../components/AllCouponsTab';\nimport { Gift } from 'lucide-react';");

// Add Tab
const tabString = `                { id: 'club', label: 'Gestão de Cupões', icon: Gift },`;
code = code.replace("{ id: 'sales_teams', label: 'Equipas de Vendas', icon: Briefcase },", "{ id: 'sales_teams', label: 'Equipas de Vendas', icon: Briefcase },\n" + tabString);

// Add Tab Component Render
const tabRender = `
              {activeTab === 'club' && (
                <AllCouponsTab />
              )}
`;

code = code.replace("{/* ==================================================== */}\n              {/* SECTION 5: GLAMZO TERMINAL LOGISTICS                 */}", tabRender + "\n              {/* ==================================================== */}\n              {/* SECTION 5: GLAMZO TERMINAL LOGISTICS                 */}");

fs.writeFileSync('src/pages/Admin.tsx', code);
