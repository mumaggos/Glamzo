const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('GlobalImpersonationBanner')) {
  content = content.replace("import SupabaseSetupHelper from './components/SupabaseSetupHelper';", "import SupabaseSetupHelper from './components/SupabaseSetupHelper';\nimport GlobalImpersonationBanner from './components/GlobalImpersonationBanner';");
  
  content = content.replace("<AuthProvider>", "<AuthProvider>\n          <GlobalImpersonationBanner />");
  
  fs.writeFileSync('src/App.tsx', content);
  console.log("Added GlobalImpersonationBanner to App.tsx");
}
