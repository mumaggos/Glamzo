const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// 1. Add import for ClientXRayModal
content = content.replace("import { supabase } from '../lib/supabase';", "import { supabase } from '../lib/supabase';\nimport ClientXRayModal from '../components/ClientXRayModal';");

// 2. Add state selectedClient in Admin component
content = content.replace("const [activeTab, setActiveTab] = useState<'users' |", "const [selectedClient, setSelectedClient] = useState<UserProfile | null>(null);\n  const [activeTab, setActiveTab] = useState<'users' |");

// 3. Make row clickable and add pointer
content = content.replace(/<tr key=\{p\.id\} className="hover:bg-slate-50\/20 transition-colors">/g, "<tr key={p.id} className=\"hover:bg-slate-50/20 transition-colors cursor-pointer\" onClick={() => setSelectedClient(p as any)}>");

// 4. Stop propagation on action buttons so clicking them doesn't open the modal
content = content.replace(/<td className="py-4 px-4 text-center">/g, "<td className=\"py-4 px-4 text-center\" onClick={(e) => e.stopPropagation()}>");
content = content.replace(/<td className="py-4 px-6 text-right">/g, "<td className=\"py-4 px-6 text-right\" onClick={(e) => e.stopPropagation()}>");

// 5. Add ClientXRayModal at the end of the return statement before closing div
content = content.replace(/<\/div>\n    <\/div>\n  \);\n\}\n$/, "      <ClientXRayModal isOpen={!!selectedClient} onClose={() => setSelectedClient(null)} client={selectedClient} onUpdate={() => {\n        syncAdminDatasets();\n      }} />\n    </div>\n  );\n}");

fs.writeFileSync('src/pages/Admin.tsx', content);
console.log("X-Ray modal injected into Admin");
