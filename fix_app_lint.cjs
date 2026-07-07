const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(/return this\.props\.children;/, 'return (this as any).props.children;');
fs.writeFileSync('src/App.tsx', appCode);

let accCode = fs.readFileSync('src/pages/Account.tsx', 'utf8');
accCode = accCode.replace(/setSupportMessages\(await submitSupportQuery\(user\.id, nameOfUser, user\.email \|\| "", supportInput\.trim\(\)\)\);/, 'setSupportMessages(await submitSupportQuery(user.id, nameOfUser, supportInput.trim()));');
fs.writeFileSync('src/pages/Account.tsx', accCode);

