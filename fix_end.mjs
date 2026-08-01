import fs from 'fs';
let code = fs.readFileSync('src/emails/GlamzoTemplates.tsx', 'utf8');
code = code.replace(/<\/Html>\n  \);\n\};\n\};/g, '</Html>\n  );\n};');
code = code.replace(/<\/Html>\n  \);\n\};\n\};/g, '</Html>\n  );\n};'); // run twice just in case
code = code.replace(/<\/Html>\n  \);\n\};/g, '</Html>\n  );\n};');
fs.writeFileSync('src/emails/GlamzoTemplates.tsx', code);
