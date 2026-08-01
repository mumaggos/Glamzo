import fs from 'fs';
let code = fs.readFileSync('src/emails/GlamzoTemplates.tsx', 'utf8');

code = code.replace(/thanksForRegistering: "\{t\("thanksForRegistering", lang\)\}"/g, 'thanksForRegistering: "Obrigado por te registares na Glamzo. Para garantirmos a segurança da tua conta e poderes continuar com o registo, introduz o seguinte código de verificação:"');
code = code.replace(/validCode: "\{t\("validCode", lang\)\}"/g, 'validCode: "Este código é válido apenas para o processo de registo atual."');
code = code.replace(/confirmEmailBody: "\{t\("confirmEmailBody", lang\)\}"/g, 'confirmEmailBody: "Obrigado por te registares na Glamzo. Para garantirmos a segurança da tua conta e desbloquear todas as funcionalidades, precisamos que confirmes o teu endereço de email."');

fs.writeFileSync('src/emails/GlamzoTemplates.tsx', code);
