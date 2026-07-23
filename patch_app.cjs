const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

if (!app.includes('DevOverrideProvider')) {
    app = "import { DevOverrideProvider } from './contexts/DevOverrideContext';\nimport DevOverridePanel from './components/DevOverridePanel';\n" + app;
    app = app.replace(
        '<AuthProvider>',
        '<DevOverrideProvider>\n          <AuthProvider>'
    );
    app = app.replace(
        '</AuthProvider>',
        '</AuthProvider>\n          <DevOverridePanel />\n        </DevOverrideProvider>'
    );
    fs.writeFileSync('src/App.tsx', app);
}
