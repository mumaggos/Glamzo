import fs from 'fs';
let code = fs.readFileSync('src/emails/GlamzoTemplates.tsx', 'utf8');

// The simplest is to convert VerificationCodeEmail, VerificationEmail, PasswordResetEmail to use "=> { return ("
code = code.replace(/export const VerificationCodeEmail = \(\{([^\}]+)\}: \{([^\}]+)\} \) => \(/g, 'export const VerificationCodeEmail = ({\$1}: {\$2}) => { \n  const lang = "pt";\n  return (');
code = code.replace(/export const VerificationEmail = \(\{([^\}]+)\}: \{([^\}]+)\} \) => \(/g, 'export const VerificationEmail = ({\$1}: {\$2}) => { \n  const lang = "pt";\n  return (');
code = code.replace(/export const PasswordResetEmail = \(\{([^\}]+)\}: \{([^\}]+)\} \) => \(/g, 'export const PasswordResetEmail = ({\$1}: {\$2}) => { \n  const lang = "pt";\n  return (');

fs.writeFileSync('src/emails/GlamzoTemplates.tsx', code);
