import fs from 'fs';

// ErrorBoundary
let eb = fs.readFileSync('src/components/ErrorBoundary.tsx', 'utf-8');
eb = eb.replace(/this\.props\.fallback/g, '(this as any).props.fallback');
eb = eb.replace(/this\.props\.children/g, '(this as any).props.children');
fs.writeFileSync('src/components/ErrorBoundary.tsx', eb);

// GlamzoMessenger
let gm = fs.readFileSync('src/components/GlamzoMessenger.tsx', 'utf-8');
gm = gm.replace(
  /businessData\?\.profiles\?\.email;/g,
  '(businessData?.profiles as any)?.email;'
);
fs.writeFileSync('src/components/GlamzoMessenger.tsx', gm);
