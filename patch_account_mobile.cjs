const fs = require('fs');
let code = fs.readFileSync('src/pages/Account.tsx', 'utf8');

const tab = `
        <button onClick={() => setActiveTab('mensagens')} className="flex flex-col items-center p-2">
          <MessageSquare className={\`w-6 h-6 \${activeTab === 'mensagens' ? 'text-purple-600' : 'text-slate-400'}\`} />
          <span className={\`text-[10px] font-bold mt-1 \${activeTab === 'mensagens' ? 'text-purple-600' : 'text-slate-500'}\`}>Chat</span>
        </button>
`;
code = code.replace(
  /<button onClick=\{\(\) => setActiveTab\('favoritos'\)\} className="flex flex-col items-center p-2">/,
  tab + '        <button onClick={() => setActiveTab(\'favoritos\')} className="flex flex-col items-center p-2">'
);

fs.writeFileSync('src/pages/Account.tsx', code);
