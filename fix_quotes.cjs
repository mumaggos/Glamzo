const fs = require('fs');

const fixFile = (path) => {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/'Utilizamos cookies essenciais para o funcionamento seguro da plataforma. Poderemos usar também cookies analíticos para melhorar a sua experiência.\s*Consulte a nossa'/g, 
    "'Utilizamos cookies essenciais para o funcionamento seguro da plataforma. Poderemos usar também cookies analíticos para melhorar a sua experiência. Consulte a nossa'");
  fs.writeFileSync(path, content);
}

fixFile('src/components/CookieBanner.tsx');

