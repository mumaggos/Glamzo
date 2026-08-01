import fs from 'fs';
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

if (!code.includes('InstallAppButton')) {
    code = code.replace(
        "import { Menu, X, Check, User } from 'lucide-react';",
        "import { Menu, X, Check, User } from 'lucide-react';\nimport { InstallAppButton } from './InstallAppButton';"
    );
    
    code = code.replace(
        "{/* Auth section */}\n            <div className=\"flex items-center gap-4\">",
        "{/* Auth section */}\n            <div className=\"flex items-center gap-4\">\n              <InstallAppButton />"
    );
    fs.writeFileSync('src/components/Navbar.tsx', code);
}
