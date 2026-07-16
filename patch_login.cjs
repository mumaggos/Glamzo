const fs = require('fs');
let code = fs.readFileSync('src/pages/Login.tsx', 'utf8');
code = code.replace(
  /\/\/ Não navegamos aqui manualmente\. O useEffect ali de cima \(Passo 2\) apanha a mudança do `user` \n\s*\/\/ e envia o utilizador para a loja automaticamente \(lendo do sessionStorage\)!/g,
  `navigate('/account', { replace: true });`
);
fs.writeFileSync('src/pages/Login.tsx', code);
