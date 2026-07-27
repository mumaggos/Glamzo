const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace("import SupabaseSetupHelper from './components/SupabaseSetupHelper';", "const SupabaseSetupHelper = lazy(() => import('./components/SupabaseSetupHelper'));");
content = content.replace("import LanguageUpdater from './components/LanguageUpdater';", "const LanguageUpdater = lazy(() => import('./components/LanguageUpdater'));");

fs.writeFileSync('src/App.tsx', content);
