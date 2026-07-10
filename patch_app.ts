import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace static import with lazy import for GlamzoMessenger
content = content.replace("import GlamzoMessenger from './components/GlamzoMessenger';", "const GlamzoMessenger = lazy(() => import('./components/GlamzoMessenger'));");

// Wrap it in Suspense
content = content.replace(
  "{loadMessenger && <GlamzoMessenger />}",
  "{loadMessenger && <Suspense fallback={null}><GlamzoMessenger /></Suspense>}"
);

fs.writeFileSync('src/App.tsx', content);
