import fs from 'fs';
let content = fs.readFileSync('src/pages/Login.tsx', 'utf-8');

const targetGoogleLogin = `      // O Supabase tem uma propriedade nativa para redirecionar após OAuth
      const savedRedirect = sessionStorage.getItem('post_login_redirect');
      const redirectTo = savedRedirect 
        ? \`\${window.location.origin}\${savedRedirect}\`
        : \`\${window.location.origin}/account\`;`;

const replacementGoogleLogin = `      // O Supabase tem uma propriedade nativa para redirecionar após OAuth
      const savedRedirect = sessionStorage.getItem('post_login_redirect');
      const returnTo = localStorage.getItem('returnTo');
      const redirectTo = returnTo 
        ? \`\${window.location.origin}\${returnTo}\`
        : savedRedirect 
          ? \`\${window.location.origin}\${savedRedirect}\`
          : \`\${window.location.origin}/account\`;`;

content = content.replace(targetGoogleLogin, replacementGoogleLogin);
fs.writeFileSync('src/pages/Login.tsx', content);
