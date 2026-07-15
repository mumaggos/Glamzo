const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// 1. Sidebar items (lines 1242-1251 and 1327-1336)
content = content.replace(/{ id: 'users', label: 'Utilizadores & Créditos', icon: Users },/g, "{ id: 'users', label: 'Clientes Finais (CRM)', icon: Users },");
content = content.replace(/{ id: 'terminal', label: 'Painel de Configurações', icon: Settings },/g, "{ id: 'terminal', label: 'Gestão de Lojas & Modo Deus', icon: Settings },");
content = content.replace(/{ id: 'terminal', label: 'Glamzo Terminal', icon: Smartphone },/g, "{ id: 'terminal', label: 'Gestão de Lojas & Modo Deus', icon: Settings },");
content = content.replace(/.*{ id: 'cms', label: 'Gestão da Homepage', icon: Globe },\n/g, "");
content = content.replace(/.*{ id: 'pages', label: 'Páginas da Plataforma', icon: FileText },\n/g, "");
content = content.replace(/.*{ id: 'pages', label: 'Páginas do Site', icon: FileText }\n/g, "");

// 2. The title of the Users tab
content = content.replace(/<h3 className="text-xl font-extrabold tracking-tight text-slate-900">Utilizadores & Atribuição de Créditos<\/h3>/g, '<h3 className="text-xl font-extrabold tracking-tight text-slate-900">Clientes Finais (CRM)</h3>');

// 3. Query fix
content = content.replace(/supabase\.from\('profiles'\)\.select\('\*'\)\.order\('created_at', \{ ascending: false \}\)/g, "supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false })");

// Write back
fs.writeFileSync('src/pages/Admin.tsx', content);
console.log("Replaced sidebar, title, and query");
