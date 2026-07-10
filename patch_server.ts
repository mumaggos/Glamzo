import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf-8');

if (!code.includes('case "chat_message":')) {
  code = code.replace(
    'switch (type) {',
    `switch (type) {
      case "chat_message":
        await EmailService.sendChatMessageEmail(to, data);
        break;`
  );
  fs.writeFileSync('server.ts', code);
}
