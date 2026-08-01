import fs from 'fs';
let code = fs.readFileSync('src/emails/GlamzoTemplates.tsx', 'utf8');

// Replace duplicate lang
code = code.replace(/lang = "pt" \}: any\) => \{\s*const lang = \(arguments\[0\] && arguments\[0\]\.lang\) \? arguments\[0\]\.lang : 'pt';/g, 'lang = "pt" }: any) => {');
code = code.replace(/lang = "en" \}: any\) => \{\s*const lang = \(arguments\[0\] && arguments\[0\]\.lang\) \? arguments\[0\]\.lang : 'pt';/g, 'lang = "en" }: any) => {');
code = code.replace(/\(\{([^}]+)\}: any\) => \{\s*const lang = \(arguments\[0\] && arguments\[0\]\.lang\) \? arguments\[0\]\.lang : 'pt';/g, '({$1}: any) => {\n  const lang = (arguments[0] && arguments[0].lang) ? arguments[0].lang : "pt";');

fs.writeFileSync('src/emails/GlamzoTemplates.tsx', code);
