const fs = require('fs');
let content = fs.readFileSync('src/pages/ChamadasCRM.tsx', 'utf8');

content = content.replace(
  /if \(updates\.estado_chamada === 'nao_atendeu' && updates\.sms_enviado === undefined\) \{/g,
  `if (updates.estado_chamada === 'nao_atendeu') {`
);

fs.writeFileSync('src/pages/ChamadasCRM.tsx', content);
