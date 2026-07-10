import fs from 'fs';

const files = [
  'src/pages/partner/tabs/ClientsTab.tsx',
  'src/pages/partner/tabs/StaffTab.tsx',
  'src/pages/partner/tabs/ReservationsTab.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf-8');
  code = code.replace(/<table /g, '<div className="overflow-x-auto w-full block sm:table"><table ');
  code = code.replace(/<\/table>/g, '</table></div>');
  fs.writeFileSync(file, code);
}
