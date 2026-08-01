const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
const imports = `import { PushNotificationManager } from './PushNotificationManager';
import { InstallAppButton } from './InstallAppButton';`;
code = code.replace("import { Search } from 'lucide-react';", `import { Search } from 'lucide-react';\n${imports}`);
fs.writeFileSync('src/components/Navbar.tsx', code);
