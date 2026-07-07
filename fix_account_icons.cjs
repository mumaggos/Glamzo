const fs = require('fs');
let code = fs.readFileSync('src/pages/Account.tsx', 'utf8');

code = code.replace(/setSupportMessages\(await submitSupportQuery\(user\.id, nameOfUser, MapPin, Calendar, supportInput\.trim\(\)\)\);/, 
'setSupportMessages(await submitSupportQuery(user.id, nameOfUser, user.email || "", supportInput.trim()));');

// Fix duplicates in line 9
code = code.replace(/import \{ User, MapPin, Calendar, Mail, Calendar, Upload/, 'import { User, MapPin, Calendar, Mail, Upload');

fs.writeFileSync('src/pages/Account.tsx', code);
