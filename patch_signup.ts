import fs from 'fs';
let content = fs.readFileSync('src/pages/Signup.tsx', 'utf-8');

const targetGoogleLogin = `      const savedRedirect = sessionStorage.getItem('post_login_redirect');
      const redirectTo = savedRedirect 
        ? \`\${window.location.origin}\${savedRedirect}\`
        : \`\${window.location.origin}/account\`;`;

const replacementGoogleLogin = `      const savedRedirect = sessionStorage.getItem('post_login_redirect');
      const returnTo = localStorage.getItem('returnTo');
      const redirectTo = returnTo 
        ? \`\${window.location.origin}\${returnTo}\`
        : savedRedirect 
          ? \`\${window.location.origin}\${savedRedirect}\`
          : \`\${window.location.origin}/account\`;`;

content = content.replace(targetGoogleLogin, replacementGoogleLogin);
fs.writeFileSync('src/pages/Signup.tsx', content);
