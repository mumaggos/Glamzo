import fs from 'fs';
let content = fs.readFileSync('src/pages/Login.tsx', 'utf-8');

content = content.replace(
  ': \`\${window.location.origin}/account\`;',
  ': \`\${window.location.origin}/\`;'
);

fs.writeFileSync('src/pages/Login.tsx', content);

let content2 = fs.readFileSync('src/pages/Signup.tsx', 'utf-8');

content2 = content2.replace(
  ': \`\${window.location.origin}/account\`;',
  ': \`\${window.location.origin}/\`;'
);

fs.writeFileSync('src/pages/Signup.tsx', content2);
