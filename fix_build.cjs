const fs = require('fs');

// 1. Fix Home.tsx duplicate loading attributes
let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');
home = home.replace(/<img loading="lazy" ([\s\S]*?) loading="lazy"/g, '<img $1 loading="lazy"');
home = home.replace(/<img loading="lazy" ([\s\S]*?) loading=\{[\s\S]*?\}/g, '<img $1 loading="lazy"');
home = home.replace(/<img loading="lazy" ([\s\S]*?) loading='lazy'/g, '<img $1 loading="lazy"');
fs.writeFileSync('src/pages/Home.tsx', home);

// 2. Fix Explore.tsx duplicate loading attributes
let explore = fs.readFileSync('src/pages/Explore.tsx', 'utf8');
explore = explore.replace(/<img loading="lazy"([\s\S]*?)loading="lazy"/g, '<img loading="lazy"$1');
fs.writeFileSync('src/pages/Explore.tsx', explore);

// 3. Fix ClientsTab syntax error
let clients = fs.readFileSync('src/pages/partner/tabs/ClientsTab.tsx', 'utf8');
// look at the end of ClientsTab.tsx
clients = clients.replace('});\nexport default ClientsTab;', '});\n\nexport default ClientsTab;');
// wait, the error is Expected ")" but found "}". That means the return statement or something inside React.memo() lacks a closing paren. Let's see the end of ClientsTab
