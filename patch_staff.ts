import fs from 'fs';

let content = fs.readFileSync('src/pages/partner/tabs/StaffTab.tsx', 'utf-8');
content = content.replace('const handleDownloadMetrics = () => {', 'const handleDownloadMetrics = (staff: any, metrics: any) => {');
fs.writeFileSync('src/pages/partner/tabs/StaffTab.tsx', content);
