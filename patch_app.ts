import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetImport = `const HoursTab = lazy(() => import('./pages/partner/tabs/HoursTab'));`;
const replacementImport = `const HoursTab = lazy(() => import('./pages/partner/tabs/HoursTab'));
const PartnerReviewsTab = lazy(() => import('./pages/partner/tabs/PartnerReviewsTab'));`;
content = content.replace(targetImport, replacementImport);

const targetRoute = `<Route path="horarios" element={<HoursTab />} />`;
const replacementRoute = `<Route path="horarios" element={<HoursTab />} />
                    <Route path="avaliacoes" element={<PartnerReviewsTab />} />`;
content = content.replace(targetRoute, replacementRoute);

fs.writeFileSync('src/App.tsx', content);
