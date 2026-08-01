import fs from 'fs';
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

if (!code.includes('PushNotificationManager')) {
    code = code.replace(
        "import { InstallAppButton } from './InstallAppButton';",
        "import { InstallAppButton } from './InstallAppButton';\nimport { PushNotificationManager } from './PushNotificationManager';"
    );
    
    code = code.replace(
        "<InstallAppButton />",
        "<PushNotificationManager />\n              <InstallAppButton />"
    );
    fs.writeFileSync('src/components/Navbar.tsx', code);
}
