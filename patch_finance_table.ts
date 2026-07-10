import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf-8');

code = code.replace(
  /<table className="w-full text-left text-xs min-w-max">/g,
  '<div className="overflow-x-auto w-full block sm:table"><table className="w-full text-left text-xs min-w-max">'
);

code = code.replace(
  /<table className="w-full text-left text-xs">/g,
  '<div className="overflow-x-auto w-full block sm:table"><table className="w-full text-left text-xs">'
);

// We need to also close the div. It's right after </table>.
code = code.replace(
  /<\/table>/g,
  '</table></div>'
);

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
