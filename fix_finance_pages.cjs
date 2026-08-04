const fs = require('fs');
const files = [
  'src/pages/partner/tabs/FinanceTab.tsx',
  'src/pages/partner/tabs/FinanceSettingsTab.tsx',
  'src/pages/partner/tabs/PayoutsHistoryTab.tsx',
  'src/pages/partner/tabs/HardwareManagerTab.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  
  if (!code.includes('FinanceNav')) {
    // Inject import
    const importStatement = `import FinanceNav from '../../../components/partner/FinanceNav';\n`;
    code = code.replace(/import React/, importStatement + 'import React');
    
    // Inject component
    if (file.includes('FinanceTab.tsx')) {
       // We previously injected the raw HTML tabs. We will replace that with <FinanceNav />
       code = code.replace(/<div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-200 pb-4">[\s\S]*?<\/div>/, '<FinanceNav />');
    } else if (file.includes('FinanceSettingsTab.tsx')) {
       code = code.replace('<div className="max-w-5xl mx-auto p-4 md:p-8">', '<div className="max-w-5xl mx-auto p-4 md:p-8">\n      <FinanceNav />');
    } else if (file.includes('PayoutsHistoryTab.tsx')) {
       code = code.replace('return (', 'return (\n    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in text-slate-700 py-6 min-w-0">\n      <FinanceNav />\n      <div>');
       code = code.replace(/}$/, '      </div>\n    </div>\n  );\n}'); // This is tricky, let's just prepend to the root element.
       
       let code2 = fs.readFileSync(file, 'utf8');
       code2 = code2.replace(/import React/, importStatement + 'import React');
       code2 = code2.replace('return (\n    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in text-slate-700 py-6 min-w-0">\n      <FinanceNav />\n      <div>', 'return ('); // Undo mistake
       code = code2.replace('<div className="space-y-6 max-w-5xl mx-auto">', '<div className="space-y-6 max-w-5xl mx-auto p-4 md:p-8">\n      <FinanceNav />');
    } else if (file.includes('HardwareManagerTab.tsx')) {
       code = code.replace('<div className="space-y-6">', '<div className="space-y-6 max-w-5xl mx-auto p-4 md:p-8">\n      <FinanceNav />');
    }
  }
  fs.writeFileSync(file, code);
});
