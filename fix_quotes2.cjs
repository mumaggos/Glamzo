const fs = require('fs');

const path = 'src/pages/legal/Seguranca.tsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/'A informa.*?superfície\)\.'/gs, 
  "'A informação na nossa gestão de Base de Dados utiliza protocolos e arquiteturas fortes implementados pelo padrão \"Row Level Security\" (Segurança ao nível do registo). O que quer dizer que por concepção matriz do servidor: um cliente, ou um atacante com posse à autenticação desse cliente só lhe será respondido, via API, aos registos (marcações, saldo, cartões) cujo ID em específico se relacione à conta logada (criptografia de controlo de permissões isolado e não de software lógico de superfície).'");
fs.writeFileSync(path, content);

