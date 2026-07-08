const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/StaffTab.tsx', 'utf8');

const regex = /<div className="grid grid-cols-2 gap-4 mb-4">([\s\S]*?)<\/div>\n\s*<div className="grid grid-cols-1 mb-4">/m;
const replacement = `<div className="grid grid-cols-2 gap-4 mb-2">
$1
                </div>
                {!editingStaff && (
                  <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100 mb-4 text-[10px] text-purple-700 font-medium">
                    Ao criar a conta, será enviado um link para o funcionário com o login e a senha para o email inserido.
                  </div>
                )}
                <div className="grid grid-cols-1 mb-4">`;
content = content.replace(regex, replacement);
fs.writeFileSync('src/pages/partner/tabs/StaffTab.tsx', content);
