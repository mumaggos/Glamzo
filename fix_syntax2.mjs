import fs from 'fs';
let code = fs.readFileSync('src/emails/GlamzoTemplates.tsx', 'utf8');

// Instead of regex match, let's just use simple replaces
code = code.replace(/export const VerificationCodeEmail = \([^)]+\) => \(/, "export const VerificationCodeEmail = ({ userName, code }: any) => {\n  const lang = 'pt';\n  return (");
code = code.replace(/export const VerificationEmail = \([^)]+\) => \(/, "export const VerificationEmail = ({ userName, confirmationLink }: any) => {\n  const lang = 'pt';\n  return (");
code = code.replace(/export const PasswordResetEmail = \([^)]+\) => \(/, "export const PasswordResetEmail = ({ userName, resetLink }: any) => {\n  const lang = 'pt';\n  return (");

fs.writeFileSync('src/emails/GlamzoTemplates.tsx', code);
